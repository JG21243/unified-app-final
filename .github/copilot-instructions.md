# GitHub Copilot Instructions — unified-app-final

## Repository Summary (What this repo does)
- **Purpose:** AI assistant web app that blends a chat experience with prompt management, vector store document search, and custom function tools. It merges openai-responses-starter-app with a legal-prompts management UI.
- **Project type:** Next.js 15 App Router web app (React 19 + TypeScript).
- **Languages:** TypeScript/TSX, JavaScript (scripts), CSS.
- **Runtime & tooling (validated):** Node.js **v24.13.0**, npm **11.6.2**, TypeScript **5.8.3**. CI pins Node **18.17.0** (see CI note below).
- **Repo size:** mid-sized (~2000+ files; many UI components and scripts).

## Always-Validated Commands (run in this order)
> **Always run `npm install` before any other command.** Most scripts fail or emit missing module errors otherwise.

### Bootstrap
1. `npm install`  
   - **Took ~2 minutes.** Emits deprecation warnings and reports **42 vulnerabilities**.  
   - Updates `package-lock.json` when npm version differs; revert if you don’t intend to update the lockfile.

### Lint / Format / Type-check
2. `npm run lint`  
   - ✅ Passed. Runs `next lint` (Next telemetry notice appears).
3. `npm run type-check`  
   - ❌ **Fails** with many TypeScript errors (primarily in `app/actions.ts`, multiple components, and OpenAI typings).  
   - **CI continues on error** for this step.
4. `npx prettier --check .`  
   - ❌ **Fails** with formatting warnings in ~200 files.  
   - Prettier is **not** a devDependency, so `npx` downloads **prettier@3.8.1** each run.  
   - **CI continues on error** for this step.

### Tests
5. `npm test -- --watchAll=false`  
   - ✅ Passed. Emits console warnings from `lib/prompt-metadata.ts` and `components/assistant.tsx` (`act(...)` warning).

### Build / Run
6. `OPENAI_API_KEY=dummy-key DATABASE_URL=postgresql://dummy:dummy@localhost:5432/dummy npm run build`  
   - ✅ Build succeeds on Node 24.  
   - Logs **Neon DB connection failures** during page data collection; app falls back to bundled prompts.  
   - `next.config.mjs` skips lint/type-check during build.
7. `OPENAI_API_KEY=dummy-key DATABASE_URL=postgresql://dummy:dummy@localhost:5432/dummy npm run dev`  
   - ✅ Dev server starts in ~1.2s at `http://localhost:3000`.  
8. `npm run start` (after a successful build)  
   - Runs `next start`.

### Utility Scripts (run only when needed)
9. `npm run generate:ui-inventory`  
   - ✅ Generates `docs/ui-inventory.md`.  
   - Node warns about module type; output is still generated.
10. `npm run generate:css-vars`  
   - ✅ Writes `styles/theme-vars.css`.

### Dependency Checks (CI)
11. `npm audit --audit-level=moderate`  
   - ❌ Fails with multiple vulnerabilities (includes **1 critical**).  
   - CI runs this with `continue-on-error`.
12. `npm outdated`  
   - ❌ Exits with code 1 (lists many outdated packages).  
   - CI runs this with `continue-on-error`.

### Clean/Reset Notes
- There is **no clean script**. If you need a clean slate, delete `node_modules/` and `.next/` manually (or use `git clean -fdx` with caution).

## CI / Workflow Notes (GitHub Actions)
File: `.github/workflows/ci.yml`
- **Jobs:** `code-quality`, `build`, `dependency-check`, `commit-convention`.
- **Code-quality job** runs: `npm ci`, `npm run lint`, `npm run type-check`, `npx prettier --check .`, `npm test -- --coverage --watchAll=false` (all **continue-on-error**).
- **Build job** runs `npm ci` + `npm run build` with dummy env vars.
- **Dependency-check** runs `npm audit --audit-level=moderate` + `npm outdated` (continue-on-error).
- **Commit convention** enforces conventional commit types via commitlint.
**Known CI failure:** Build job uses **Node 18.17.0**, but Next 15 requires **>=18.18.0**. CI logs show:  
`You are using Node.js 18.17.0. For Next.js, Node.js version "^18.18.0 || ^19.8.0 || >= 20.0.0" is required.`

## Project Layout & Architecture
- **App Router entrypoints:**  
  - `app/layout.tsx` (Root layout with ThemeProvider + GlobalHeader/Footer)  
  - `app/page.tsx` (redirects `/` → `/prompts`)  
  - `app/chat/page.tsx` (loads a prompt by ID then renders `ChatPageClient`)
- **Server actions:** `app/actions.ts`, `app/actions/ai-actions.ts`
- **API routes:** `app/api/*` (chat, vector store, tools, prompts)
- **UI components:** `components/` + primitives in `components/ui/`
- **Database:** Drizzle in `lib/db/`, config in `drizzle.config.json`
- **AI tooling:** `lib/tools/`, `config/functions.ts`, `config/tools-list.ts`
- **Styles:** `styles/`, Tailwind config in `tailwind.config.ts`, tokens in `design/`
- **State:** Zustand stores in `stores/`
- **Tests:** Jest in `tests/` (config: `jest.config.js`, `tsconfig.jest.json`)

### Key configuration files
`eslint.config.mjs`, `.prettierrc`, `.prettierignore`, `next.config.mjs`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs`, `commitlint.config.js`, `.hintrc`

## README Highlights (compressed)
- Features: multi-turn chat, vector store upload/search (≤25MB), web search, function calling, streaming responses, prompt management UI, mobile-friendly.
- Tech: Next.js 15.2.x, React 19, TailwindCSS, OpenAI API, Zustand, Drizzle/Neon.
- Setup: `npm install`, create `.env.local` with `OPENAI_API_KEY` + `DATABASE_URL`, run `npm run dev`.
- Notes: `docs/ui-inventory.md` is generated by `npm run generate:ui-inventory`.

## Root Files (repo top-level)
```
.cursorrules  .github/  .vscode/  AGENTS.md  README.md  app/  components/  config/  design/
docs/  hooks/  lib/  scripts/  stores/  tests/  styles/  public/  package.json
package-lock.json  next.config.mjs  tailwind.config.ts  tsconfig*.json  jest.config.js  drizzle.config.json
```

## Next-Level Directory Snapshot (most important folders)
- `app/`: `actions/`, `api/`, `chat/`, `prompts/`, `categories/`, `layout.tsx`, `page.tsx`
- `app/api/`: `ai/`, `functions/`, `prompts/`, `turn_response/`, `vector_stores/`
- `components/`: feature components + `layout/`, `theme/`, `ui/`
- `lib/`: `db/`, `server/`, `tools/`, `validation.ts`, `utils.ts`
- `docs/`: `AI_CODING_GUIDE.md`, `api-documentation.md`, `codebase-guide.md`, `ui-inventory.md`

## Trust These Instructions
These instructions were validated in this environment. **Trust them and only search if the instructions are incomplete or incorrect.**
