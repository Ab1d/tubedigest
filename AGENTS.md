# TubeDigest — Agent Guidelines

This file documents the conventions, best practices, and guardrails for anyone working on TubeDigest (AI agents included).

## Project Overview

TubeDigest Local is a self-hosted YouTube video summarizer. The user pastes a YouTube URL, the backend extracts the transcript locally, sends the transcript to a configurable AI provider, and the frontend displays a structured summary.

- **Frontend:** React + Vite + TypeScript + Tailwind CSS + shadcn/ui
- **Backend:** Node.js + Express + ES modules
- **AI:** Multi-provider routing (OpenAI, DeepSeek, Anthropic, Google Gemini, Ollama)
- **Data:** Optional PostgreSQL for summary history
- **Browser extension:** Manifest v3 popup for one-click summarization

## Repository Layout

```
├── backend/                 # Express API server
│   ├── src/
│   │   ├── index.js         # Server entry point
│   │   ├── routes/          # Express route modules
│   │   ├── services/        # Business logic (transcript, AI providers)
│   │   ├── utils/           # Shared helpers
│   │   └── db.js            # PostgreSQL layer
│   ├── .env                 # Optional legacy / local config
│   └── package.json
├── frontend/                # React SPA
│   ├── src/
│   │   ├── pages/           # Top-level page components
│   │   ├── sections/        # Summary display sections
│   │   ├── components/      # Reusable components + shadcn/ui
│   │   ├── services/        # API clients and provider config
│   │   ├── contexts/        # React context providers
│   │   ├── hooks/           # Custom hooks
│   │   └── lib/             # Utilities (cn, etc.)
│   └── package.json
├── extension/               # Chrome/Firefox extension
├── setup.sh                 # One-click local setup
├── start.sh                 # Start backend + frontend together
├── railway.json             # Railway deployment config
└── package.json             # Root workspace orchestration
```

## Tech Stack & Versions

- Node.js >= 20 (root `engines` requirement)
- Backend: Express 4, `cors`, `pg`, `youtube-transcript`, `dotenv`
- Frontend: React 19, Vite 7, TypeScript ~5.9, Tailwind CSS 3.4, shadcn/ui "new-york", Radix UI primitives
- State: React hooks + localStorage for provider config
- Animation: Framer Motion
- Icons: Lucide React
- Forms/validation: React Hook Form + Zod

## Development Workflow

### Setup

```bash
bash setup.sh       # Installs deps, builds frontend, creates backend/.env
bash start.sh       # Starts backend (port 3001) and frontend dev server (port 5173)
```

### Manual Start

```bash
# Terminal 1 — backend
cd backend && npm install && npm start

# Terminal 2 — frontend
cd frontend && npm install && npm run dev
```

### Build & Lint

```bash
# Root build (used by Railway)
npm run build

# Frontend only
cd frontend && npm run build && npm run lint

# Backend dev/watch mode
cd backend && npm run dev
```

## Backend Conventions

### Language & Modules

- Use **ES modules** (`"type": "module"`).
- Prefer `async/await` over raw promises.
- Use `fetch` (Node 20 native) for external HTTP calls.

### Route Structure

- Mount routes in `src/index.js` under `/api/<resource>`.
- Each route module exports a single `Router()` from `express`.
- Route handlers must use `try/catch` and forward errors via `next(error)`.
- Validate request bodies early and return `400` for missing/invalid input.

### Services

- Keep route handlers thin; put business logic in `services/`.
- `services/ai-provider.js` is the single source of truth for provider registries, prompts, request building, response parsing, and error mapping.
- `services/transcript.js` handles YouTube URL parsing, transcript extraction, duration detection, and timestamp formatting.
- Reuse existing helpers (e.g., `sanitizeJsonString`) before parsing LLM output.

### Error Handling

- Use the centralized Express error handler in `src/index.js`.
- Map provider HTTP status codes to user-friendly messages:
  - `401` → invalid API key
  - `429` → rate limit
  - `402/403` → insufficient balance or access denied
- Never leak raw API keys or full stack traces to the frontend.

### Environment Variables

- Backend reads from `backend/.env` (legacy DeepSeek support) and `process.env`.
- Optional variables:
  - `PORT` — server port (default `3001`)
  - `DATABASE_URL` — PostgreSQL connection string
  - `DEEPSEEK_API_KEY`, `DEEPSEEK_API_URL`, `DEEPSEEK_MODEL` — legacy fallback
- The server **must start even if `DATABASE_URL` is missing**; history is disabled gracefully.

### Database

- PostgreSQL is optional. The `db.js` layer guards with `checkDb()`.
- Schema bootstraps automatically in `initDb()` via `CREATE TABLE IF NOT EXISTS`.
- History persistence is fire-and-forget in the summarize route; do not block the response on DB writes.

## Frontend Conventions

### Language & Tooling

- TypeScript strict mode is enabled.
- Use ES modules (`"type": "module"`).
- Path alias `@/` maps to `frontend/src`.
- `verbatimModuleSyntax` is enabled — use `import type` for type-only imports.

### Component Style

- Use **functional components** with hooks.
- Styling uses Tailwind CSS + custom theme variables.
- Use `cn()` from `@/lib/utils` to merge classes conditionally.
- Custom brand colors: `burgundy`, `charcoal`, `parchment`, `gold`, `grey-*`, `burgundyRed`.
- Dark mode is supported via `dark:` variants and CSS variables.

### shadcn/ui

- The `components/ui/` folder is generated/managed by shadcn/ui.
- Do not hand-edit shadcn internals unless absolutely necessary; prefer wrapping them in project components.
- New shadcn components should be installed via the CLI when possible.

### API Calls

- All backend communication goes through `services/localAIService.ts`.
- Use `AbortSignal.timeout(...)` for network timeouts.
- Use `withProviderCredentials(...)` from `services/aiProviderService.ts` to inject the user's selected provider, model, and API key into request bodies.
- The frontend **never sends API keys anywhere except the local backend**.

### Provider Settings

- Provider config (provider, model, API key) is stored in `localStorage` under `tubedigest_provider_config`.
- UI validation mirrors backend validation.
- Use `fetchAvailableProviders()` and `validateProviderWithBackend()` for dynamic provider lists.

### State Management

- Local component state with `useState`/`useCallback` is preferred.
- History is loaded on mount and kept in sync manually after summarize/refresh/delete.

## AI Provider Conventions

### Adding a New Provider

1. Add an entry to `PROVIDER_REGISTRY` in `backend/src/services/ai-provider.js`:
   - `name`, `baseUrl`, `models[]`, `authType` (`bearer`, `anthropic`, `none`)
   - `openaiCompatible: true` if it supports the OpenAI chat-completions shape
2. If not OpenAI-compatible, add a request builder and response parser.
3. Add status-code-to-message mapping in `handleProviderError()` if needed.
4. Add the provider + models to `BUILT_IN_PROVIDERS` in `frontend/src/services/aiProviderService.ts`.

### Prompts

- Keep the system prompt in `services/ai-provider.js` as the single source of truth.
- The summary must return strict JSON with these fields:
  - `tldr`, `simpleSummary`, `deepSummary`, `sections`, `analogies`, `keyTakeaways`
- JSON mode is enabled for cloud providers; it is disabled for Ollama because its OpenAI compatibility may not support `response_format`.
- Always sanitize LLM output with `sanitizeJsonString()` before `JSON.parse()`.

### Transcript Handling

- Transcripts are truncated server-side to ~30,000 characters to fit token limits.
- Timestamps are embedded as `[MM:SS]` or `[H:MM:SS]` in the transcript sent to the LLM.

## Security Best Practices

- **API keys live in the browser's `localStorage` and are sent only to the local backend.**
- Do not log API keys. Do not commit `.env` files.
- The backend should never return the API key to the frontend.
- Validate all user-supplied URLs before passing them to transcript or fetch helpers.
- Use parameterized queries (`$1`, `$2`, ...) in `db.js`; no string concatenation for SQL.

## Browser Extension

- Located in `extension/`.
- Manifest v3 with minimal permissions (`activeTab`).
- Host permissions include YouTube domains and `localhost` backend ports.
- The popup passes the current YouTube URL to the frontend via `?url=...` query parameter.

## Deployment

- `railway.json` builds the root project with `npm run build` and starts it with `npm start`.
- `npm start` at the root runs only the backend (`npm --prefix backend start`), which serves the built frontend from `frontend/dist`.
- Frontend must be built before deployment.

## Code Style

- 2-space indentation everywhere.
- Use single quotes in JSX/TSX unless the string contains single quotes.
- Prefer named exports for utilities; default exports for page and route components.
- Keep functions small and focused. Avoid nested ternaries.
- Use descriptive variable names; avoid abbreviations except well-known ones (`err`, `req`, `res`).

## Testing Expectations

- Run `npm run lint` in `frontend/` before finishing frontend changes.
- Run `npm run build` in `frontend/` to catch TypeScript errors.
- Run `npm start` in `backend/` and hit `/api/health` to verify the backend starts.
- If you touch the AI provider routing, validate with `/api/providers/validate`.

## Common Pitfalls

- **Do not change the summary JSON schema** without updating both the backend prompt and the frontend `SummaryData` type / transforms.
- **Do not make the database required.** Keep `checkDb()` guards and graceful degradation.
- **Do not expose the user's API key** in logs, errors, or network responses.
- **Do not hardcode the backend URL in production.** Use `import.meta.env.PROD` / `VITE_API_URL` pattern in the frontend.
- Frontend dev server runs on port `5173`; backend runs on port `3001` by default.
