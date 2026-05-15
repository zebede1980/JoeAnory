# AI Story Writer

A web-based AI story writing application with support for SillyTavern character cards, lorebooks, synopsis-driven generation, and intelligent context summarization.

## Features

- **SillyTavern Character Cards**: Upload v2/v3 PNG character cards with embedded lorebooks
- **Story Synopsis/Memo**: Large text area to map out your story premise and plot points
- **AI-Powered Generation**: Uses any OpenAI-compatible API (OpenRouter, NanoGPT, local LLMs via Ollama/LM Studio)
- **Steering Instructions**: Guide the story without polluting the narrative text
- **Pause & Continue**: Generation produces chunks and pauses for your review
- **Inline Editing**: Edit any story segment directly
- **Smart Summarization**: Automatically summarizes older story segments to keep token usage manageable for long stories
- **Dockerized**: Single-command deployment with Docker Compose

## Quick Start

### Prerequisites

- Docker & Docker Compose
- An API key for your chosen AI provider

### Run with Docker Compose

```bash
docker-compose up --build
```

Then open http://localhost in your browser.

### Development (without Docker)

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

The frontend will proxy API requests to `http://localhost:8000`.

## Configuration

Go to **Settings** in the app to configure your AI provider:

| Setting | Description | Example |
|---------|-------------|---------|
| API Base URL | OpenAI-compatible endpoint | `https://api.openai.com/v1` |
| API Key | Your API key | `sk-...` |
| Model | Model identifier | `gpt-4o`, `claude-3-opus` |
| Max Tokens | Max tokens per generation | `2048` |
| Temperature | Creativity (0-2) | `0.8` |
| Context Window | Max context size | `8000` |
| Summary Threshold | Segments before auto-summarize | `10` |
| Chunk Size | Target tokens per chunk | `800` |

### Provider Examples

- **OpenAI**: `https://api.openai.com/v1` + `gpt-4o`
- **OpenRouter**: `https://openrouter.ai/api/v1` + `anthropic/claude-3.5-sonnet`
- **NanoGPT**: `https://nano-gpt.com/api/v1` + your model
- **Local (Ollama)**: `http://localhost:11434/v1` + `llama3.1`
- **Local (LM Studio)**: `http://localhost:1234/v1` + loaded model name

## Usage

1. **Upload Character Cards**: Go to the Cards tab and drop SillyTavern PNG cards
2. **Create a Story**: Click "New Story" and write your synopsis
3. **Attach Cards**: Add character cards to your story
4. **Generate**: Click "Generate Next" to produce the next story chunk
5. **Steer**: Enter instructions in the steering field (e.g., "Make the villain reveal their motive")
6. **Edit**: Click "Edit" on any segment to modify the story text
7. **Continue**: Keep generating to build a lengthy narrative

## Data Storage

Stories, cards, and settings are stored in SQLite (`data/storywriter.db`). Uploaded card images are saved to `uploads/cards/`. Both directories are mounted as Docker volumes for persistence.

## Architecture

- **Frontend**: React + Vite
- **Backend**: FastAPI + SQLAlchemy + SQLite
- **AI Layer**: OpenAI-compatible HTTP client with streaming support
- **Context Management**: Automatic summarization of old segments to manage token windows
