# Nous - E-Book Reader Project

## Project Overview

Desktop e-book reader for EPUB files with AI-assisted annotation features. Import books, manage library, and store annotations with threaded conversations for interactive reading.

## Tech Stack

- **Frontend:** SvelteKit 2 + Svelte 5 + TypeScript + Vite
- **Backend:** Tauri 2 (Rust) + SQLite (via `tauri-plugin-sql`)
- **Key libs:** foliate-js, @tauri-apps/plugin-*, lucide-svelte, zip.js, fflate
- **Styling:** Custom CSS with dark theme

## File System

```
nous/
├── src/
│   ├── lib/
│   │   ├── db.ts                 # Database singleton, migrations, helpers (USE THIS)
│   │   ├── library.ts            # Book import/management
│   │   └── components/           # Reusable components (empty)
│   ├── routes/
│   │   ├── +layout.svelte        # Root layout (DB init on mount)
│   │   └── +page.svelte          # Library view
│   └── app.css                   # Global styles + design tokens
├── src-tauri/
│   ├── src/main.rs               # Entry point
│   └── src/lib.rs                # Tauri app builder (plugins: sql, dialog, fs)
└── docs/
    └── CODEBASE_OVERVIEW.md       # This file
```

## How It Works

1. Tauri launches → loads SvelteKit at `localhost:1420`
2. Layout mounts → `getDb()` initializes SQLite with migrations
3. Library page loads → `fetchBooks()` displays imported books
4. Import → File dialog → `insertBookRecord()` → refresh

## Database Schema & Helpers (`src/lib/db.ts`)

**Tables:**
- `books`: id, title, author, local_path (UNIQUE), cover_blob, metadata, created_at
- `annotations`: id, book_id (FK→books), cfi_range, highlighted_text, color
- `threads`: id, parent_id (FK→self), annotation_id (FK→annotations), content, role, is_synthesis, created_at

**Use These Helpers (not raw SQL):**
- `fetchBooks()` → `BookRecord[]`
- `fetchBookById(id)` → `BookRecord | null`
- `fetchBookByPath(path)` → `BookRecord | null` (check duplicates)
- `insertBookRecord(input)` → `BookRecord`
- `insertAnnotationRecord(input)` → `AnnotationRecord`
- `insertThreadRecord(input)` → `ThreadRecord`
- `fetchAnnotationsForBook(bookId)` → `AnnotationRecord[]`
- `fetchThreadsForAnnotation(annotationId)` → `ThreadRecord[]`

**Schema Changes:** Add migrations to `MIGRATIONS` array, increment version. Current: v1.

**Types:** `BookRecord`, `AnnotationRecord`, `ThreadRecord` (DB rows); `BookInsert`, etc. (input types)

## Critical Notes for Agents

- **Database:** Always call `getDb()` first. Use helper functions, not raw SQL.
- **Duplicates:** Check `fetchBookByPath()` before importing - `local_path` is UNIQUE.
- **Schema:** Use migration system for changes. Foreign keys cascade delete.
- **EPUB:** foliate-js installed but not integrated yet - currently only stores file paths.
- **No SSR:** Static adapter, all data fetching on client.
- **Tauri IPC:** No custom commands yet - uses plugins directly from TS.
- **Components:** `src/lib/components/` is empty - build reusable pieces here.
- **Styling:** Use design tokens from `app.css` (`--bg-primary`, `--accent`, etc.).

## Development

```bash
npm run dev          # SvelteKit dev
npm run check        # Type check
npm run tauri dev    # Full app dev
npm run tauri build  # Build desktop app
```
