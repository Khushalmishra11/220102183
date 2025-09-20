# Blink.ai — React URL Shortener

A beautiful, production-ready React + Express URL shortener with smart (AI-like) slug suggestions, Tailwind theming, and modern UX.

## Tech Stack
- React 18 + Vite + TypeScript + TailwindCSS
- Express (integrated with Vite in dev)

## Requirements
- Node.js 18+
- pnpm (recommended). Enable via: `corepack enable` (Node 16.13+) or `npm i -g pnpm`

## Setup (Windows/macOS)
```sh
pnpm install
pnpm dev   # http://localhost:8080
```

## Build & Run (Production)
```sh
pnpm build        # builds SPA and server
pnpm start        # serves built server on the configured port
```

## API
- POST /api/shorten
  - Body (JSON): { "url": "https://example.com", "slug": "my-link" (optional), "expireAt": "2026-01-01T00:00:00.000Z" (optional) }
  - Returns: { code, shortUrl, url, createdAt, expiresAt }
- POST /api/preview
  - Body (JSON): { "url": "https://example.com" }
  - Returns: { title?, suggestions: string[] }
- GET /r/:code — Redirects to the original URL

Data is stored in-memory (Map). For persistence, integrate a database (e.g., Neon Postgres, Supabase) and swap `server/routes/store.ts`.

## Postman Quick Start
1. Base URL: http://localhost:8080
2. Create request: POST /api/shorten
   - Headers: Content-Type: application/json
   - Body (raw JSON):
```json
{
  "url": "https://example.com/very/long/path",
  "slug": "my-link",
  "expireAt": "2026-01-01T00:00:00.000Z"
}
```
3. Open GET /r/my-link to test redirect.
4. Optional: POST /api/preview with {"url":"https://example.com"} to get slug suggestions.

