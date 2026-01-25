# Nous - E-Book Reader Project

## Project Overview

Desktop e-book reader for EPUB files with AI-assisted annotation features. Import books, manage library, and store annotations with threaded conversations for interactive reading.

## Tech Stack

- **Frontend:** SvelteKit 2 + Svelte 5 + TypeScript + Vite
- **3D Engine:** Pure CSS 3D Transforms (optimized for performance and stability)
- **Backend:** Tauri 2 (Rust) + SQLite (via `tauri-plugin-sql`)
- **Key libs:** foliate-js (pending), @tauri-apps/plugin-*, lucide-svelte, zip.js, fflate
- **Styling:** TailwindCSS v4 + Custom CSS variables (Dark Theme)

## File System

```
nous/
├── src/
│   ├── lib/
│   │   ├── db.ts                 # Database singleton, migrations, helpers
│   │   ├── library.ts            # Book import/management
│   │   ├── metadata.ts           # EPUB metadata parser
│   │   ├── mock.ts               # Placeholder data for UI dev
│   │   ├── stores/               # Svelte stores (e.g., library.ts, ui.ts)
│   │   └── components/           # Reusable components
│   │       ├── Book3D.svelte     # Pure CSS 3D book model
│   │       └── Sidebar.svelte    # Main navigation drawer
│   ├── routes/
│   │   ├── +layout.svelte        # Root layout (DB init + Background layers)
│   │   └── +page.svelte          # Sanctuary (Home/Library view)
│   └── app.css                   # Global styles + Background layer system
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
- `fetchBookByPath(path)` → `BookRecord | null`
- `insertBookRecord(input)` → `BookRecord`
- `deleteBook(id)` → `boolean`
- `insertAnnotationRecord(input)` → `AnnotationRecord`
- `insertThreadRecord(input)` → `ThreadRecord`

**Schema Changes:** Add migrations to `MIGRATIONS` array, increment version. Current: v1.

**Types:** `BookRecord`, `AnnotationRecord`, `ThreadRecord` (DB rows); `BookInsert`, etc. (input types)

## Critical Notes for Agents

- **Database:** Always call `getDb()` first. Use helper functions, not raw SQL.
- **Duplicates:** Check `fetchBookByPath()` before importing - `local_path` is UNIQUE.
- **EPUB:** foliate-js installed but not integrated yet.
- **UI Architecture:** 
    - **Sanctuary (Home):** Uses CSS 3D Transforms for the carousel. 
    - **Transitions:** Use `{#key}` blocks for cross-fades on the cover. Text updates should be instant for performance.
    - **Performance:** Use `transform-gpu` and `will-change` sparingly but effectively for complex filters (blur/grayscale) to prevent rendering flashes.

## Development

```bash
npm run dev          # SvelteKit dev
npm run check        # Type check
npm run tauri dev    # Full app dev
npm run tauri build  # Build desktop app
```