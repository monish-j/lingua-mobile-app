# Vision Agent - AI Language Teacher

This service is a real-time voice-first AI Language Teacher built using [Vision Agents](https://visionagents.ai), OpenAI Realtime API (`gpt-realtime-2`), and GetStream Edge (`getstream.Edge`).

## Features
- **Voice-Only Interaction:** Designed for natural real-time spoken language lessons and conversation practice.
- **English-Guided Teaching:** The teacher always speaks English as the primary instructional language to teach the target language (Spanish, French, German, Japanese, etc.).
- **Interactive & Encouraging:** Step-by-step vocabulary explanation, pronunciation coaching, gentle corrections, and roleplay.

## Prerequisites & Configuration
Create a `.env` file in `vision-agent/` (or reuse root `.env`):
```env
STREAM_API_KEY=your_stream_api_key
STREAM_API_SECRET=your_stream_api_secret
OPENAI_API_KEY=your_openai_api_key
```

## Running the Agent

### Console Mode (Development & Testing)
```bash
python agent.py run
# or with uv
uv run agent.py run
```

### HTTP Server Mode (Production / Session Management)
```bash
python agent.py serve --host 0.0.0.0 --port 8000
# or with uv
uv run agent.py serve --host 0.0.0.0 --port 8000
```
