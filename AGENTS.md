# AGENTS.md

> **Purpose** \
> This file gives OpenAI Codex (and any Agents SDK‑compatible LLM) the context it needs to operate safely and effectively in **unified‑app‑final**. Treat it as the project “operating manual” for autonomous or semi‑autonomous agents.

---

## 1. Global Guidance

- **Branching model:** `main` is the source‑of‑truth branch. Use feature branches + PRs; linear history via squash‑merge.
- **Framework:** Next.js 15.2 (App Router + React 19) for all new pages and server components. ([nextjs.org](https://nextjs.org/blog/next-15?utm_source=chatgpt.com))
- **Package manager:** `npm`. Run `npm install` before any build/test. Keep lockfile committed.
- **Language:** TypeScript 5 in strict mode. Prefer `tsx` server components when possible.
- **Styling:** Tailwind CSS tokens under `design/`. Use the provided `generate-css-vars.ts` script after editing theme files.
- **State management:** Zustand stores under `stores/`.
- **Database:** Postgres via Drizzle ORM + Neon driver. Don’t run migrations outside CI without user confirmation. ([orm.drizzle.team](https://orm.drizzle.team/docs/get-started-postgresql?utm_source=chatgpt.com), [github.com](https://github.com/drizzle-team/drizzle-orm?utm_source=chatgpt.com))
- **Vector store:** Use OpenAI Vector Store API wrappers in `app/api/vector_stores/*`. Agents **must** avoid uploading non‑public data without explicit approval. ([community.openai.com](https://community.openai.com/t/vector-store-for-assistants/828921?utm_source=chatgpt.com), [community.openai.com](https://community.openai.com/t/supported-file-formats-vector-store/1150431?utm_source=chatgpt.com))
- Ask before adding new runtime dependencies; prefer dev‑only packages.
- Destructive shell commands (`rm -rf`, db resets) require a `--yes-i-understand` flag in the command or explicit user chat confirmation.

---

## 2. Features & Functionality

- **Modern UI with Dark/Light Mode** – Theme‑switching for optimal readability.
- **Multi‑turn Conversation** – Maintains dialogue context across messages.
- **Vector Store Integration** – Upload & search docs ≤ 25 MB (PDF, code, text) across multiple vector stores.
- **Web Search Tool** – Augments answers with live internet results.
- **File Search & Processing** – Assistant can analyze user‑uploaded files inside the chat flow.
- **Custom Function Calling** – Tools like `weatherLookup` or `jokeFetch`; extend via `config/functions.ts`.
- **Streaming Responses** – AI replies render token‑by‑token for real‑time feel.
- **Rich Content Display** – Markdown, code blocks, and annotations rendered cleanly.
- **Mobile‑Friendly Design** – Responsive layout & touch‑optimized controls.
- **Advanced Prompt Management** – Create, edit, categorize, and analyze prompts; filter by category/date; dashboard visualizations.

These capabilities make **unified‑app‑final** a highly adaptable AI assistant platform that can be customized with new tools and specialized workflows.

---

## 3. Project Structure Cheatsheet

```
.
├── app/                # Next.js App Router
│   ├── actions/        # Server Actions
│   ├── api/            # API Route Handlers (chat, vector, etc.)
│   ├── chat/           # Client UI for conversations
│   └── prompts/        # Prompt dashboard pages
├── components/         # Reusable UI components (tailwind‑styled)
│   └── ui/             # Primitive UI building blocks
├── config/             # Constants, tools schemas, function metadata
├── design/             # Theme tokens & Tailwind config helpers
├── docs/               # Architecture & UI inventory docs
├── lib/                # Server‑side helpers (OpenAI, DB, tools)
│   ├── db/             # Drizzle schema & migrations
│   └── tools/          # Custom tool implementations
├── scripts/            # One‑off dev & CI scripts
├── stores/             # Zustand stores (client‑only)
└── tests/              # Jest unit tests
```

Agents **must not** edit `public/`, `.next/`, or generated artifacts.

---

## 4. Coding Conventions

1. **React & Next.js**: Use Server Components for data‑fetching, Client Components for interactivity. Follow the official App Router patterns. ([nextjs.org](https://nextjs.org/docs/app?utm_source=chatgpt.com))
2. **Type Safety**: All exports and tool schemas use Zod for runtime validation.
3. **Styling**: Tailwind class order enforced by `headwind` ESLint plugin.
4. **Testing**: Jest with 90 % coverage threshold. Place mocks in `tests/__mocks__/`.
5. **Commits**: Conventional Commit prefixes (`feat:`, `fix:`, `docs:` …). CI blocks non‑conforming messages.

---

## 5. Running Checks Locally

```bash
npm install          # install deps
npm run lint         # eslint + prettier
npm run type-check   # tsc --noEmit
npm test             # jest
npm run build        # next build
```

Agents should run the full sequence before opening or merging a PR.

---

## 6. Environment Variables

| Variable               | Purpose                                |
| ---------------------- | -------------------------------------- |
| `OPENAI_API_KEY`       | Access OpenAI models                   |
| `VECTOR_STORE_ID`      | Target Vector Store for embeddings     |
| `DATABASE_URL`         | Postgres (Neon) connection string      |
| `NEXT_PUBLIC_API_BASE` | Public API endpoint exposed to browser |

Do **not** commit real secrets. Use `.env.example` with placeholders.

---

## 7. Safety & Autonomy Ladder

- **suggest** 🔒 – agent proposes edits/commands, user approves.
- **auto‑edit** 🛠 – agent may run shell, write files, and commit, but destructive commands require confirmation flags.
- **full‑auto** 🚀 – CI‑sandbox only; network disabled; agent responsible for its own test‑pass before pushing.

Promote agents gradually based on reliability.

---

## 8. How to Add / Update an Agent

1. Copy the Agents table row and adjust fields.
2. Use **kebab‑case** for the `Name`.
3. List tools with `prefix:` (`shell:`, `http:`, `fs.`).
4. Open a `docs:` PR with reasoning in the description.

---

## 9. Maintenance Checklist

- Review AGENTS.md each sprint retro.
- Prune unused agents & tools.
- Verify CI test suite ≥ 90 % coverage.
- Update environment variable docs when adding integrations.

---

## 10. References

- Next.js 15 release notes – App Router & React 19 ([nextjs.org](https://nextjs.org/blog/next-15?utm_source=chatgpt.com))
- Next.js App Router docs ([nextjs.org](https://nextjs.org/docs/app?utm_source=chatgpt.com))
- Deep dive on Next.js 15 new features ([medium.com](https://medium.com/%40dmostoller/next-js-15-new-features-breaking-changes-and-improvements-you-need-to-know-ac98fa6f0c2d?utm_source=chatgpt.com))
- Drizzle ORM Postgres guide ([orm.drizzle.team](https://orm.drizzle.team/docs/get-started-postgresql?utm_source=chatgpt.com))
- Drizzle ORM GitHub README ([github.com](https://github.com/drizzle-team/drizzle-orm?utm_source=chatgpt.com))
- Drizzle + Next.js tutorial ([refine.dev](https://refine.dev/blog/drizzle-react/?utm_source=chatgpt.com))
- OpenAI Vector Store API discussion ([community.openai.com](https://community.openai.com/t/vector-store-for-assistants/828921?utm_source=chatgpt.com))
- Vector Store file limits post ([community.openai.com](https://community.openai.com/t/increasing-the-number-of-files-in-the-file-search-vector-store/886686?utm_source=chatgpt.com))
- OpenAI vector store file formats FAQ ([community.openai.com](https://community.openai.com/t/supported-file-formats-vector-store/1150431?utm_source=chatgpt.com))
- Next.js 13/14 background (App Router history) ([nextjs.org](https://nextjs.org/blog?utm_source=chatgpt.com))

---

*Last updated: 2025‑06‑20*

