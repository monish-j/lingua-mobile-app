import os
from pathlib import Path
from dotenv import load_dotenv

from vision_agents.core import Agent, AgentLauncher, Runner, User
from vision_agents.core.instructions import Instructions
from vision_agents.plugins import getstream, openai, gemini

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


async def create_agent(**kwargs) -> Agent:
    """Factory function to instantiate the AI Language Teacher Agent."""
    gemini_key = os.getenv("GEMINI_API_KEY")

    llm = gemini.Realtime(
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


from lessons_data import get_lesson_context

async def join_call(agent: Agent, call_type: str, call_id: str) -> None:
    """Lifecycle handler for joining and finishing a call."""
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
