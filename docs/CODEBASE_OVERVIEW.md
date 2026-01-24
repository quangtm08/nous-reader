# Nous - E-Book Reader Project

## Project Overview

Desktop e-book reader for EPUB files with AI-assisted annotation features. Import books, manage library, and store annotations with threaded conversations for interactive reading.

## Tech Stack

- **Frontend:** SvelteKit 2 + Svelte 5 + TypeScript + Vite
- **3D Engine:** Three.js + @threlte/core (Svelte wrapper)
- **Backend:** Tauri 2 (Rust) + SQLite (via `tauri-plugin-sql`)
- **Key libs:** foliate-js, @tauri-apps/plugin-*, lucide-svelte, zip.js, fflate
- **Styling:** TailwindCSS v4 + Custom CSS variables (Dark Theme)

## File System

```
nous/
├── src/
│   ├── lib/
│   │   ├── db.ts                 # Database singleton, migrations, helpers
│   │   ├── library.ts            # Book import/management
│   │   ├── mock.ts               # Placeholder data for UI dev
│   │   ├── stores/               # Svelte stores (e.g., ui.ts)
│   │   └── components/           # Reusable components
│   │       ├── Book3D.svelte     # Threlte 3D book model
│   │       ├── HeroScene.svelte  # 3D Lighting & Camera setup
│   │       └── Sidebar.svelte    # Main navigation drawer
│   ├── routes/
│   │   ├── +layout.svelte        # Root layout (DB init on mount)
│   │   └── +page.svelte          # Sanctuary (Home/Library view)
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
3. Library page loads → `fetchBooks()` displays imported books (currently using `MOCK_BOOKS` for UI dev)
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
- **UI Architecture:** 
    - **Sanctuary (Home):** Uses a persistent 3D Canvas. Do not unmount/remount the Canvas during slide transitions.
    - **Transitions:** Use `crossfade` (grid-stacking) for text and `absolute` positioning for images to prevent layout shifts.

## Development

```bash
npm run dev          # SvelteKit dev
npm run check        # Type check
npm run tauri dev    # Full app dev
npm run tauri build  # Build desktop app
```