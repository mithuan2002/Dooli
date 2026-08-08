# Dooli

Dooli is a lightweight founder diary for capturing product-building moments and turning authentic notes into build-in-public posts.

## Run & Operate

- `PORT=5173 BASE_PATH=/ pnpm --filter @workspace/dooli run dev` — run the frontend preview
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- API/database setup requires `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/dooli` — React/Vite frontend; currently supports localStorage mode
- `artifacts/api-server` — Express API server with Clerk middleware
- `lib/db` — Drizzle schema and database package
- `lib/api-spec/openapi.yaml` — API contract source of truth

## Architecture decisions

_Populate as you build — non-obvious choices a reader couldn't infer from the code (3-5 bullets)._

## Product

The frontend provides authenticated diary entry capture, categories, tags, attachments, and build-in-public post preparation. The current MVP stores diary data in browser localStorage.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- The frontend workflow must provide both `PORT` and `BASE_PATH`.
- The API server and database are optional for the current localStorage-only frontend preview.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
