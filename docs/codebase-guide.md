# Codebase Guide

This document provides an overview of the `unified-app-final` project. It is intended for new contributors who need a quick reference on the layout, technologies and main features of the application.

## Project Tree

Below is a simplified view of the repository structure:

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

For a more detailed listing you can run `tree -L 2` (with `node_modules`, `.next`, and `public` ignored).

## Key Technologies and Packages

- **Next.js 15.2.3** with the App Router and React 19
- **TypeScript** in strict mode
- **TailwindCSS** using tokens defined in the `design/` folder
- **OpenAI API** for chat completions and vector store integration
- **Zustand** for state management on the client
- **Jest** for unit testing
- **Drizzle ORM** with Postgres (via the Neon driver) for database access

See `package.json` for the full list of dependencies.

## Backend Overview

Server functionality is built with Next.js API routes and server actions:

- API handlers live under `app/api/` and expose endpoints for chat, vector store management and function calling.
- Server actions in `app/actions/` fetch data or interact with the database via Drizzle ORM.
- Database schema and migration files reside in `lib/db/`.
- OpenAI helpers and custom tool implementations are in `lib/` and `lib/tools/`.

## Frontend Overview

The frontend uses React 19 components styled with Tailwind CSS. Key points:

- Pages and layouts live in the `app/` directory.
- Reusable UI components are located in `components/` with primitive building blocks under `components/ui/`.
- Client state is handled by stores in `stores/`.
- Styles are defined in `styles/` and generated theme variables in `design/`.

## Features and Functionality

The application includes the following capabilities:

- Modern UI with light & dark themes
- Multi‑turn conversation support
- Vector store integration for searching uploaded documents (≤25 MB)
- Web search tool for augmenting answers with live results
- File upload and processing inside the chat flow
- Custom function calling with examples such as weather lookup and joke retrieval
- Streaming responses with markdown and code rendering
- Mobile‑friendly responsive layouts
- Advanced prompt management, including creation, editing and analytics

These features make **unified-app-final** a flexible platform for building specialized AI assistants.

