# TubeDigest Local — Multi-Provider AI Edition

A self-hosted YouTube video summarizer powered by your choice of AI provider. Runs on your machine — your YouTube history stays private, only the transcript is sent to the AI for summarization.

## Supported AI Providers

| Provider | Models | Setup |
|----------|--------|-------|
| **OpenAI** | GPT-4o, GPT-4o-mini, GPT-4-turbo, GPT-3.5-turbo | API key from [platform.openai.com](https://platform.openai.com) |
| **DeepSeek** | deepseek-chat, deepseek-reasoner | API key from [platform.deepseek.com](https://platform.deepseek.com) |
| **Anthropic** | Claude 3.5 Sonnet, Claude 3 Opus, Claude 3 Haiku | API key from [console.anthropic.com](https://console.anthropic.com) |
| **Google Gemini** | Gemini 1.5 Pro, Gemini 1.5 Flash, Gemini 2.0 Flash | API key from [aistudio.google.com](https://aistudio.google.com) |
| **Ollama** | llama3.2, llama3.1, mistral, phi4 | [ollama.com](https://ollama.com) — runs locally, no API key needed |

## How It Works

```
You paste a YouTube URL
         ↓
Backend extracts the video transcript (locally)
         ↓
Transcript is sent to your chosen AI provider
         ↓
AI generates structured summary:
  • TL;DR — ultra-concise summary
  • Simple Summary — easy-to-understand explanation
  • Deep Summary — comprehensive analysis
  • Analogies & Visuals — mental models for retention
  • Key Takeaways — actionable insights
         ↓
Beautiful summary displayed in your browser
```

**Privacy note:** Only the video transcript text is sent to the AI provider. Your YouTube viewing history, personal data, and identity stay on your machine.

---

## Architecture

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Frontend** | React + Vite + Tailwind CSS | Beautiful UI for input & summary display |
| **Backend** | Node.js + Express | YouTube transcript extraction, AI provider routing |
| **AI** | Configurable (OpenAI, DeepSeek, Anthropic, Google, Ollama) | Cloud or local LLM for summarization |

---

## Prerequisites

| Requirement | How to Get It |
|-------------|--------------|
| **Node.js 18+** | [nodejs.org](https://nodejs.org) |
| **AI Provider API Key** | See supported providers table above (choose one) |

---

## Quick Start (3 Steps)

### Step 1: Choose an AI Provider

Pick a provider from the table above and get your API key (or install Ollama for local use).

### Step 2: Run Setup

```bash
cd tubedigest-local
bash setup.sh
```

The script will:
- Install backend & frontend dependencies
- Build the frontend

### Step 3: Start the App

```bash
bash start.sh
```

Then open **http://localhost:5173** in your browser.

### Step 4: Configure Your Provider

1. Click the **settings (gear) icon** in the top-right corner
2. Select your AI provider
3. Choose a model
4. Paste your API key
5. Click **Save**

Your key is stored **locally in your browser** and sent only to your local backend.

---

## Manual Setup

If the automated setup doesn't work:

### 1. Install & Start Backend

```bash
cd backend
npm install
npm start          # Runs on port 3001
```

### 2. Install & Start Frontend (new terminal)

```bash
cd frontend
npm install
npm run dev        # Runs on port 5173
```

### 3. Configure Provider in App

Open http://localhost:5173, click the gear icon, and enter your provider details.

---

## Project Structure

```
tubedigest-local/
│
├── backend/                          # Express API server
│   ├── src/
│   │   ├── index.js                  # Server entry point
│   │   ├── routes/
│   │   │   ├── transcript.js       # POST /api/transcript
│   │   │   ├── summarize.js        # POST /api/summarize
│   │   │   ├── chat.js             # POST /api/chat/ask
│   │   │   └── providers.js        # GET /api/providers
│   │   └── services/
│   │       ├── transcript.js       # YouTube transcript extraction
│   │       ├── ai-provider.js      # Multi-provider AI routing
│   │       └── deepseek.js         # Legacy DeepSeek service
│   ├── .env                          # Optional legacy config
│   └── package.json
│
├── frontend/                         # React SPA
│   ├── src/
│   │   ├── services/
│   │   │   ├── localAIService.ts  # Local API client
│   │   │   ├── aiProviderService.ts # Provider config management
│   │   │   └── mockAIService.ts  # Fallback demo data
│   │   ├── components/
│   │   │   └── ProviderSettings.tsx # Provider config UI
│   │   └── pages/
│   │       └── Home.tsx            # Main app page
│   └── ...
│
├── setup.sh                          # One-click setup
├── start.sh                          # Start both services
└── README.md                         # This file
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/transcript` | Extract transcript from YouTube URL |
| POST | `/api/summarize` | Full pipeline: transcript → AI → summary |
| POST | `/api/summarize/text` | Summarize provided text directly |
| GET | `/api/summarize/status` | Check AI provider configuration |
| GET | `/api/providers` | List available AI providers |
| POST | `/api/providers/validate` | Validate a provider config |
| POST | `/api/chat/ask` | Ask a follow-up question |
| POST | `/api/chat/suggest` | Generate suggested questions |

---

## Legacy Environment Configuration

For backward compatibility, you can still set a DeepSeek API key via `backend/.env`:

```bash
DEEPSEEK_API_KEY=sk-your-key-here
DEEPSEEK_MODEL=deepseek-chat
```

When no provider is selected in the app UI, the backend will fall back to these environment variables.

---

## Cost Comparison

| Provider | ~Cost per 10-min video | Free Tier |
|----------|----------------------|-----------|
| **DeepSeek** | ~$0.001 | Yes (signup credits) |
| **OpenAI** (GPT-4o-mini) | ~$0.003 | Yes ($5 starter) |
| **Anthropic** (Claude Haiku) | ~$0.002 | Yes ($5 starter) |
| **Google Gemini** (Flash) | ~$0.001 | Yes (generous) |
| **Ollama** (Local) | Free | Always free |

---

## Requirements

| Software | Minimum Version | Download |
|----------|----------------|----------|
| Node.js | 18+ | [nodejs.org](https://nodejs.org) |
| AI Provider Key | — | See providers table |

---

## Troubleshooting

### "AI provider not configured"
Open the app settings (gear icon) and select a provider, model, and API key.

### "Invalid API key" (401)
Your API key is wrong or expired. Generate a new one at your provider's platform.

### "Rate limit exceeded" (429)
Too many requests. Wait a moment and try again.

### "Insufficient balance" (402)
Your free credits are used up. Add credit to your provider account.

### "No transcript found"
The video may not have captions/subtitles. Try a different video that has captions enabled.

### Frontend shows "demo mode"
The frontend can't reach the backend. Make sure the backend is running on port 3001.

---

## Provider Comparison

| Factor | Cloud AI (OpenAI/DeepSeek/Anthropic/Google) | Local LLM (Ollama) |
|--------|---------------------------------------------|---------------------|
| **Setup** | API key only | Install Ollama + download model |
| **Quality** | Excellent | Good |
| **Speed** | Fast (API call) | Slower (depends on hardware) |
| **Cost** | ~$0.001-0.003/video | Free (electricity only) |
| **Privacy** | Transcript sent to provider | Everything stays local |
| **Internet** | Required | Only for YouTube fetch |
| **RAM Needed** | Minimal | 8GB+ |

**Choose Cloud AI** if you want the best quality with minimal setup.
**Choose Ollama** if you want maximum privacy and zero ongoing cost.

---

## License

MIT — Free for personal and commercial use.
