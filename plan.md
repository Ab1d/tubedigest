# TubeDigest — Product & Technical Plan

This document is the living roadmap for TubeDigest. It captures current capabilities, known gaps, and the planned path forward.

## Current State

TubeDigest Local already provides a complete end-to-end flow:

- YouTube URL parsing and transcript extraction.
- Multi-provider AI summarization (OpenAI, DeepSeek, Anthropic, Google Gemini, Ollama).
- Structured summaries with TL;DR, simple/deep summaries, sections, analogies, and key takeaways.
- Timestamp embedding and rendering.
- Follow-up chat and suggested questions.
- Optional PostgreSQL-based summary history.
- Chrome/Firefox extension for one-click summarization.
- Local-first setup with `setup.sh` and `start.sh`.
- Railway deployment config.

## Guiding Principles

1. **Privacy-first.** Only the transcript leaves the user's machine, and only for the AI provider they choose.
2. **Local-first.** The app must work fully offline with Ollama.
3. **Graceful degradation.** Features that require external services (cloud AI, database) must fail softly.
4. **Minimal friction.** Setup should remain one or two commands.
5. **Clean separation.** Backend handles AI/transcript logic; frontend handles UI state.

## Short-Term (Now — 4 Weeks)

### Quality & Reliability

- [ ] Add a lightweight test suite.
  - Backend: unit tests for URL parsing, transcript helpers, JSON sanitization, and provider request builders.
  - Frontend: component tests for `ProviderSettings`, URL validation, and summary transforms.
- [ ] Improve LLM JSON robustness.
  - Add retry logic with exponential backoff for transient provider errors.
  - Handle truncated JSON and common markdown-wrapping patterns.
- [ ] Standardize error handling across all backend routes.
  - Ensure every route returns `{ error, details?, fix? }` shape on failure.

### Developer Experience

- [ ] Add `npm run dev` at the root to start backend and frontend concurrently.
- [ ] Add a `Makefile` or root scripts for common tasks (`lint`, `build`, `test`).
- [ ] Add a pre-commit hook for linting the frontend.

### UX Polish

- [ ] Add loading skeletons for history items.
- [ ] Show provider/model badge in summary view.
- [ ] Add keyboard shortcut (`Ctrl/Cmd + Enter`) to submit a URL.
- [ ] Persist the last-summarized URL in `localStorage` for recovery after refresh.

## Mid-Term (1 — 3 Months)

### AI & Summarization

- [ ] Support custom system prompts per user.
- [ ] Add output length presets (concise, balanced, detailed).
- [ ] Add export options: Markdown, PDF, and copy-to-clipboard for the full summary.
- [ ] Support batch summarization of multiple URLs.
- [ ] Add transcript language auto-detection and multi-language summaries.

### History & Data

- [ ] Add pagination and search to the history drawer.
- [ ] Add tags/folders for organizing summaries.
- [ ] Add full-text search backend endpoint improvements (PostgreSQL `tsvector`).
- [ ] Support exporting/importing the history database.

### Extension

- [ ] Add a content script that injects a "Summarize" button on YouTube watch pages.
- [ ] Support opening results in a new tab or the popup itself.
- [ ] Publish the extension to the Chrome Web Store and Firefox Add-ons.

### Deployment & Ops

- [ ] Add a health-check endpoint that verifies provider connectivity.
- [ ] Add Docker support for one-command self-hosting.
- [ ] Add GitHub Actions CI for lint, build, and basic tests.

## Long-Term (3 — 12 Months)

### Platform

- [ ] Support account-free sync via peer-to-peer or encrypted cloud backup.
- [ ] Mobile-responsive PWA with offline summary reading.
- [ ] Add support for podcasts and local audio/video files.

### Intelligence

- [ ] Agentic summaries: ask clarifying questions before summarizing.
- [ ] Chapter generation with auto-titled timestamps.
- [ ] Speaker diarization for multi-speaker videos.
- [ ] Fact-check claims against the transcript.

### Community & Sharing

- [ ] Share summaries via public links (optional, user-controlled).
- [ ] Summary templates and community prompt library.

## Technical Debt

- `backend/src/services/deepseek.js` is legacy and mostly superseded by `ai-provider.js`; evaluate removal or deprecation.
- Frontend `mockAIService.ts` is only used for helper functions and types now; clarify its role or consolidate.
- The provider registry is duplicated between backend (`PROVIDER_REGISTRY`) and frontend (`BUILT_IN_PROVIDERS`). Consider a shared JSON schema or backend-driven provider list as the single source of truth.
- `plugin-inspect-react-code` is included as a Vite plugin; verify if it is still needed in production builds.

## Proposed Schema Additions

If adding new features, extend the summary JSON carefully:

```json
{
  "tldr": "string",
  "simpleSummary": "string",
  "deepSummary": "string",
  "sections": [
    { "number": 1, "title": "string", "summary": "string", "timestamp": "MM:SS" }
  ],
  "analogies": [
    { "concept": "string", "analogy": "string", "visualDescription": "string" }
  ],
  "keyTakeaways": [
    { "number": 1, "point": "string", "actionItem": "string" }
  ]
}
```

Any new top-level fields must be optional and handled defensively in `transformBackendResponse` and `rowToSummary`.

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| Initial | Multi-provider AI routing in a single service | Keeps provider-specific logic centralized and easy to extend. |
| Initial | Provider config stored in browser localStorage | Keeps setup friction low and API keys off the server disk by default. |
| Initial | PostgreSQL optional | Self-hosters should not be forced to run a database for basic summarization. |
| Initial | Built-in shadcn/ui component library | Accelerates UI development while maintaining accessibility and consistency. |

## How to Use This Plan

- Pick items from the short-term list first.
- Open focused PRs or branches per workstream.
- Update this file when decisions change or features ship.
- Before adding new AI providers or changing the summary schema, check `AGENTS.md` for the exact conventions.
