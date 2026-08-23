<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project memory

- At the beginning of every task, read `.agent-memory/project-log.md` if it exists.
- Treat the log as working context, not unquestionable truth; verify important facts against the repository or current external state.
- Before finishing work that materially changes code, configuration, infrastructure, launch status, decisions, or blockers, update the log's current-state sections and append a concise dated entry.
- Keep the log useful and compact. Record decisions, outcomes, blockers, and next actions; omit routine command output and transient debugging details.
- Never store passwords, API keys, tokens, connection strings, environment-variable values, or other secrets in the log.
- The log is intentionally gitignored and local to this workspace. If it is absent in another checkout, continue without it and create a fresh one only when asked.
