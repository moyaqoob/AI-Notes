# Backend API

Express API server for AI Notes. Runs on [Bun](https://bun.sh).

## Scripts

| Script | Description |
|--------|-------------|
| `bun run dev` | Start dev server with hot reload |
| `bun run build` | Bundle to `dist/` for production |
| `bun run start` | Run production build (`dist/index.js`) |
| `bun run check-types` | TypeScript check |
| `bun run db:migrate` | Apply database migrations |

## Environment

Copy `.env.example` to `.env` and set:

- `POSTGRES` — PostgreSQL connection string
- `JWT_SECRET` — JWT signing secret
- `GEMINI_API_KEY` — Google Gemini API key
- `CORS_ORIGIN` — Frontend URL (e.g. `https://your-app.vercel.app`)
- `PORT` — Server port (default `4000`)

Optional: `GEMINI_MODEL`, `RUN_MIGRATIONS_ON_START=false` (if you run migrations separately).

## Deploy

```bash
# From repo root
bun install
bun run db:migrate
cd apps/backend
bun run build
bun run start
```

Set all env vars on your host (Railway, Fly.io, Render, etc.). Use `bun run db:migrate` as a release/pre-deploy command.
