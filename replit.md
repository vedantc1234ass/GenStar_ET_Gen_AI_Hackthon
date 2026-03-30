# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Contains the GenStar Enterprise AI Workflow System — a full-stack multi-agent AI workflow platform.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite, Tailwind CSS, Recharts, Framer Motion, Lucide React

## Project: GenStar

GenStar is an Enterprise AI Workflow System with:
- Multi-page dashboard with real-time analytics
- 8-agent pipeline: Orchestrator → Decision → Data → Action → Verification → Recovery → Audit → Monitoring
- Workflow Manager (dynamic task/agent editing, execute workflows)
- Meeting Intelligence (transcript upload → AI extracts decisions/tasks → auto-creates workflows)
- Employee Performance Tracker with productivity scoring
- AI Chatbot panel
- Audit logs in structured JSON
- PostgreSQL database with full CRUD

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server (all routes)
│   └── genstar/            # React+Vite frontend
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts
│   └── src/seed-genstar.ts # DB seeding script
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## API Routes

All under `/api` prefix:
- `GET/POST /api/employees` — Employee management
- `GET/PUT/DELETE /api/employees/:id`
- `GET/POST /api/workflows` — Workflow management
- `GET/PUT/DELETE /api/workflows/:id`
- `POST /api/workflows/:id/execute` — Launch agent pipeline
- `GET/POST /api/tasks` — Task management
- `GET/PUT/DELETE /api/tasks/:id`
- `GET/POST /api/meetings` — Meeting intelligence
- `GET /api/analytics/dashboard` — Dashboard KPIs
- `GET /api/analytics/productivity` — Productivity metrics
- `GET /api/agents/activity` — Live agent activity
- `GET /api/audit/logs` — Audit log viewer
- `POST /api/chatbot/message` — AI chatbot

## Database Schema

- `employees` — Staff profiles with productivity metrics
- `workflows` — Workflow definitions with status/priority/risk
- `tasks` — Individual tasks linked to workflows and employees
- `meetings` — Meeting transcripts with AI-extracted intelligence
- `audit_logs` — Structured agent action/decision logs

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all lib packages as project references.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API client from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push schema to database
- `pnpm --filter @workspace/scripts run seed-genstar` — seed sample data
