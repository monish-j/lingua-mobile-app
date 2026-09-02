import asyncio
import os
import time
from pathlib import Path
from typing import Any, Optional
from dotenv import load_dotenv

from vision_agents.core import Agent, AgentLauncher, Runner, User
from vision_agents.core.instructions import Instructions
from vision_agents.plugins import getstream, openai, gemini
from lessons_data import get_lesson_context

# Load environment variables from local .env or parent directory .env
env_path = Path(__file__).resolve().parent / ".env"
parent_env_path = Path(__file__).resolve().parents[1] / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
elif parent_env_path.exists():
    load_dotenv(dotenv_path=parent_env_path)

TEACHER_INSTRUCTIONS = """You are a warm, energetic, and encouraging AI Language Teacher in a playful language-learning mobile app.

Core Persona & Rules:
1. Warm & Human Tone: Speak with vibrant, genuine human energy. Sound enthusiastic, friendly, and supportive, never robotic, stiff, or monotone. Use natural conversational English with frequent contractions (such as "let's", "I'm", "you're", "that's", "don't").
2. Conversational Brevity: Keep every response strictly to 1 or 2 short, natural conversational sentences. Never lecture or give long explanations. Leave plenty of room for the student to speak.
3. Strict Lesson & Language Scope: Act as a dedicated teacher for the currently selected language and lesson only. Stay strictly within that lesson's goals, vocabulary, phrases, and context. Do not teach unrelated topics, wander into trivia, or switch to other languages.
4. Instructional Base: Mostly speak English as your instructional language. When introducing target-language words or phrases, speak them slowly and clearly, immediately followed by their English translation.
5. Interactive Teaching Loop:
   - Introduce target words or phrases one step at a time.
   - Ask the student to repeat the word, translate a short phrase, or respond to a simple prompt.
   - Listen carefully to the student's spoken response and adapt your next explanation directly to what they said.
   - Celebrate progress with energetic, warm praise ("Spot on!", "Love that pronunciation!", "You nailed it!").
   - If they make a mistake or hesitate, offer warm, gentle encouragement, model the correct target word clearly, and ask them to try again.
6. Clean Spoken Audio: Never use markdown formatting, bullet points, asterisks, emojis, or special symbols that sound unnatural when spoken aloud.
"""


class CaptionedRealtime(gemini.Realtime):
    """Subclass of gemini.Realtime that broadcasts realtime live captions and speech turns to the Stream call."""

    def __init__(self, *args: Any, **kwargs: Any):
        super().__init__(*args, **kwargs)
        self.agent_ref: Optional[Agent] = None
        self._user_accumulated = ""
        self._agent_accumulated = ""

    def _broadcast_custom_event(self, data: dict[str, Any]) -> None:
        if not self.agent_ref:
            return
        try:
            loop = asyncio.get_running_loop()
            loop.create_task(self._safe_send_custom_event(data))
        except RuntimeError:
            pass

    async def _safe_send_custom_event(self, data: dict[str, Any]) -> None:
        if not self.agent_ref:
            return
        try:
            await self.agent_ref.send_custom_event(data)
        except Exception:
            # Drop silently if call connection is not ready or is closing
            pass

    def _emit_user_speech_transcription(self, text: str, *, mode: Any) -> None:
        super()._emit_user_speech_transcription(text, mode=mode)
        mode_str = str(mode) if not isinstance(mode, str) else mode
        if mode_str == "delta":
            self._user_accumulated += text
        else:
            self._user_accumulated = text or self._user_accumulated

        full_text = self._user_accumulated.strip()
        self._broadcast_custom_event({
            "type": "caption",
            "speaker": "user",
            "speaker_name": "Learner",
            "text": full_text,
            "delta": text,
            "mode": mode_str,
            "timestamp": int(time.time() * 1000),
        })

    def _emit_agent_speech_transcription(self, text: str, *, mode: Any) -> None:
        super()._emit_agent_speech_transcription(text, mode=mode)
        mode_str = str(mode) if not isinstance(mode, str) else mode
        if mode_str == "delta":
            self._agent_accumulated += text
        else:
            self._agent_accumulated = text or self._agent_accumulated

        full_text = self._agent_accumulated.strip()
        self._broadcast_custom_event({
            "type": "caption",
            "speaker": "teacher",
            "speaker_name": "AI Teacher",
            "text": full_text,
            "delta": text,
            "mode": mode_str,
            "timestamp": int(time.time() * 1000),
        })

    def _emit_user_speech_started(self) -> None:
        super()._emit_user_speech_started()
        self._user_accumulated = ""
        self._broadcast_custom_event({
            "type": "turn",
            "speaker": "user",
            "state": "started",
            "timestamp": int(time.time() * 1000),
        })

    def _emit_user_speech_ended(self) -> None:
        if hasattr(super(), "_emit_user_speech_ended"):
            getattr(super(), "_emit_user_speech_ended")()
        final_text = self._user_accumulated.strip()
        self._broadcast_custom_event({
            "type": "turn",
            "speaker": "user",
            "state": "ended",
            "final_text": final_text,
            "timestamp": int(time.time() * 1000),
        })
        self._user_accumulated = ""

    def _emit_agent_speech_started(self, response_id: Optional[str] = None) -> None:
        super()._emit_agent_speech_started(response_id=response_id)
        self._agent_accumulated = ""
        self._broadcast_custom_event({
            "type": "turn",
            "speaker": "teacher",
            "state": "started",
            "timestamp": int(time.time() * 1000),
        })

    def _emit_agent_speech_ended(
        self, response_id: Optional[str] = None, interrupted: bool = False
    ) -> None:
        super()._emit_agent_speech_ended(response_id=response_id, interrupted=interrupted)
        final_text = self._agent_accumulated.strip()
        self._broadcast_custom_event({
            "type": "turn",
            "speaker": "teacher",
            "state": "ended",
            "final_text": final_text,
            "interrupted": interrupted,
            "timestamp": int(time.time() * 1000),
        })
        self._agent_accumulated = ""


async def create_agent(**kwargs) -> Agent:
    """Factory function to instantiate the AI Language Teacher Agent."""
    gemini_key = os.getenv("GEMINI_API_KEY")

    llm = CaptionedRealtime(
        api_key=gemini_key,
    )

    return Agent(
        edge=getstream.Edge(),
        agent_user=User(
            id="ai-language-teacher",
            name="AI Language Teacher",
        ),
        instructions=TEACHER_INSTRUCTIONS,
        llm=llm,
    )


async def join_call(agent: Agent, call_type: str, call_id: str) -> None:
    """Lifecycle handler for joining and finishing a call."""
    if isinstance(agent.llm, CaptionedRealtime):
        agent.llm.agent_ref = agent

    call = await agent.create_call(call_type=call_type, call_id=call_id)

    # Deterministically resolve lesson metadata from call_id
    lesson_ctx = get_lesson_context(call_id)
    language_name = lesson_ctx.get("languageName", "Target Language")
    language_code = lesson_ctx.get("languageCode", "")
    lesson_title = lesson_ctx.get("title", "Language Lesson")
    welcome_message = lesson_ctx.get("welcomeMessage")
    system_prompt = lesson_ctx.get("systemPrompt")
    vocab = ", ".join(lesson_ctx.get("vocabulary", []))
    phrases = ", ".join(lesson_ctx.get("phrases", []))

    # Enrich instructions with exact lesson context
    context_addon = f"""
Current Lesson Details:
- Target Language: {language_name} ({language_code})
- Lesson Title: {lesson_title}
"""
    if system_prompt:
        context_addon += f"- Lesson Objectives & Teacher Persona:\n{system_prompt}\n"
    if vocab:
        context_addon += f"- Key Vocabulary:\n{vocab}\n"
    if phrases:
        context_addon += f"- Key Phrases:\n{phrases}\n"

    agent.instructions = Instructions(input_text=f"{TEACHER_INSTRUCTIONS}\n{context_addon}")

    async with agent.join(call):
        # Kick off the lesson warmly with the exact lesson greeting
        try:
            if welcome_message:
                prompt = (
                    f"Start the lesson warmly and enthusiastically! Speak this opening message clearly in 1 or 2 conversational sentences: \"{welcome_message}\""
                )
            else:
                prompt = (
                    f"Start the {language_name} lesson on '{lesson_title}' warmly and enthusiastically! Greet the student in English, introduce the lesson focus, and invite them to try the first target word or phrase. Keep it to 1 or 2 short, natural conversational sentences."
                )
            await agent.simple_response(prompt, interrupt=False)
        except Exception as e:
            print(f"[Agent Error in simple_response]: {e}")
            import traceback
            traceback.print_exc()

        # Keep agent alive in the call to listen and converse with the student
        try:
            if hasattr(agent, "_call_ended_event"):
                await agent._call_ended_event.wait()
            else:
                await asyncio.Event().wait()
        except asyncio.CancelledError:
            pass


def main() -> None:
    """CLI entrypoint for running or serving the agent."""
    launcher = AgentLauncher(
        create_agent=create_agent,
        join_call=join_call,
    )
    runner = Runner(launcher=launcher)
    runner.cli()


if __name__ == "__main__":
    main()
