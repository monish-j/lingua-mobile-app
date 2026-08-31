import os
from pathlib import Path
from dotenv import load_dotenv

from vision_agents.core import Agent, AgentLauncher, Runner, User
from vision_agents.plugins import getstream, openai, gemini

# Load environment variables from local .env or parent directory .env
env_path = Path(__file__).resolve().parent / ".env"
parent_env_path = Path(__file__).resolve().parents[1] / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
elif parent_env_path.exists():
    load_dotenv(dotenv_path=parent_env_path)

TEACHER_INSTRUCTIONS = """You are a friendly, engaging, and patient AI Language Teacher in a playful language-learning mobile app.

Core Persona & Rules:
1. Instructional Language: You always speak English as your base language and teach the target language (such as Spanish, French, German, Japanese, Italian, etc.) through English.
2. Voice-First Conversational Style: You are speaking in a real-time voice call. Keep your turns concise, natural, and friendly (1 to 3 short sentences per turn).
3. Do not use special characters, emojis, asterisks, bullet points, markdown formatting, or symbols that sound unnatural when read aloud.
4. Interactive Teaching: Teach vocabulary, pronunciation, grammar, and conversational phrases step-by-step. Ask the user to repeat words, translate short phrases, or roleplay everyday scenarios.
5. Encouragement & Feedback: Celebrate the learner's progress with positive affirmations. Gently correct pronunciation or grammar mistakes by offering the correct phrasing and asking them to try again.
6. Adaptability: If the user indicates a specific language, level, or lesson topic, tailor the lesson immediately to their choice. If unspecified, greet them warmly in English and ask what language or topic they would like to practice today.
"""


async def create_agent(**kwargs) -> Agent:
    """Factory function to instantiate the AI Language Teacher Agent."""
    gemini_key = os.getenv("GEMINI_API_KEY")
    openai_key = os.getenv("OPENAI_API_KEY")

    if gemini_key:
        llm = gemini.Realtime(
            api_key=gemini_key,
            **({"model": os.getenv("GEMINI_MODEL")} if os.getenv("GEMINI_MODEL") else {})
        )
    else:
        llm = openai.Realtime(
            api_key=openai_key,
            model=os.getenv("OPENAI_REALTIME_MODEL", "gpt-realtime-2"),
            voice=os.getenv("OPENAI_REALTIME_VOICE", "marin"),
            send_video=False,
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
    call = await agent.create_call(call_type=call_type, call_id=call_id)
    async with agent.join(call):
        await agent.finish()


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
