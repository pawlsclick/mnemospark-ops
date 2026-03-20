<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

### Project overview
This is the **MnemoSpark Internal Ops & Sales Dashboard** — a Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui frontend. The spec is in `dashboard_spec_v10_final.md` at the repo root.

### Stack
- **Next.js 16** (App Router, `src/` directory layout)
- **Tailwind CSS v4** with `@tailwindcss/postcss`
- **shadcn/ui** (initialized, components in `src/components/ui/`)
- **Recharts** for data visualization
- **AWS SDK v3** (`@aws-sdk/client-dynamodb`, `@aws-sdk/lib-dynamodb`) for DynamoDB access

### Key commands (run from `dashboard/`)
| Task | Command |
|------|---------|
| Dev server | `npm run dev` (serves on `localhost:3000`) |
| Lint | `npm run lint` |
| Type check | `npx tsc --noEmit` |
| Build | `npm run build` |
| Add shadcn component | `npx shadcn@latest add <component>` |

### Caveats
- **No `.env.local` yet.** The dashboard reads DynamoDB tables directly. When AWS credentials and table names are needed, create `dashboard/.env.local` with `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and the 6 `*_TABLE_NAME` vars (see spec §Actual Backend Resources).
- **No automated test framework configured yet.** The repo currently has no test runner; if tests are added, Jest or Vitest would be appropriate.
- **shadcn/ui uses CLI to add components.** Always use `npx shadcn@latest add <name>` rather than hand-creating component files.
- **The `CLAUDE.md` in this directory simply references `AGENTS.md`.** Treat `AGENTS.md` as the single source of agent instructions.
