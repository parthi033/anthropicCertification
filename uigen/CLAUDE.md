# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run setup          # Install deps + generate Prisma client + run migrations
npm run dev            # Start dev server with Turbopack (http://localhost:3000)
npm run build          # Production build
npm run test           # Run all tests with vitest
npx vitest run <file>  # Run a single test file
npm run db:reset       # Reset database (destructive)
npx prisma studio      # Open Prisma DB GUI
```

## Architecture Overview

UIGen is an AI-powered React component generator. Users describe components in natural language, Claude generates code via tool-calling, and the result renders live in a sandboxed iframe — all without writing files to disk.

### Core Flow

1. User types a prompt in `ChatInterface`
2. `ChatProvider` (Vercel AI SDK `useChat`) sends `POST /api/chat` with the current virtual file system serialized as JSON
3. The API route streams Claude's response; Claude calls `str_replace_editor` and `file_manager` tools to create/edit files
4. Tool results update the `VirtualFileSystem` (in-memory) via `FileSystemContext`
5. `PreviewFrame` compiles files with Babel (JSX → ES modules), generates an import map (packages resolved via esm.sh CDN), and renders in a sandboxed `<iframe>`
6. On completion, if the user is authenticated and a `projectId` exists, messages + file system are persisted to SQLite

### Virtual File System

`src/lib/file-system.ts` — `VirtualFileSystem` class manages all files in memory. No disk I/O. Serialized as JSON and sent with every chat request, returned in tool call results, and saved to the `Project.data` column as a JSON string.

### AI Tools (Tool-Calling)

Defined in `src/lib/tools/`:
- **`str_replace_editor`** — Creates new files or performs string-replacement edits on existing files
- **`file_manager`** — Renames or deletes files

The API route in `src/app/api/chat/route.ts` uses `streamText()` from the Vercel AI SDK with `maxSteps: 40` (real) or `4` (mock), allowing multi-turn tool use in a single request.

### Code Transformation & Preview

`src/lib/transform/jsx-transformer.ts` uses `@babel/standalone` to transform JSX files into ES module-compatible JavaScript at runtime. It generates an import map so `import React from 'react'` resolves to the esm.sh CDN version. `PreviewFrame` creates a blob URL from the generated HTML and loads it in an `<iframe sandbox>`.

### Authentication

JWT-based, cookie-only auth (`auth-token`, HTTP-only, 7-day expiry).
- `src/lib/auth.ts` — `createSession()`, `verifySession()`, `deleteSession()`
- `src/actions/index.ts` — `signUp`, `signIn`, `signOut`, `getUser` server actions
- `src/middleware.ts` — Protects `/api/projects/*` and `/api/filesystem/*` routes; returns 401 if no valid JWT

Anonymous users can use the app; work is tracked via `sessionStorage` (`src/lib/anon-work-tracker.ts`). Projects only persist to the DB for authenticated users.

### Database

SQLite via Prisma. Two models: `User` (email + bcrypt password) and `Project` (stores `messages` and `data` as JSON strings). The Prisma client is generated to `src/generated/prisma/`.

### Key Context Providers

Both wrap the app at the layout level:
- `FileSystemContext` (`src/lib/contexts/file-system-context.tsx`) — Owns `VirtualFileSystem` state; exposes file CRUD and a `refreshTrigger` for the preview
- `ChatContext` (`src/lib/contexts/chat-context.tsx`) — Wraps Vercel AI SDK `useChat`; serializes the file system into each request body

### Mock Mode

If `ANTHROPIC_API_KEY` is absent or empty, `src/lib/provider.ts` falls back to a mock provider that returns static code without calling the Anthropic API.
