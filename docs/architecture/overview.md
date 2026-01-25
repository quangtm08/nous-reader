# Nous - Architecture Overview

## Project Overview

Desktop e-book reader for EPUB files with AI-assisted annotation features. Import books, manage library, and store annotations with threaded conversations for interactive reading.

## Tech Stack

- **Frontend:** SvelteKit 2 + Svelte 5 + TypeScript + Vite
- **3D Engine:** Pure CSS 3D Transforms (optimized for performance and stability)
- **Backend:** Tauri 2 (Rust) + SQLite (via `tauri-plugin-sql`)
- **Key libs:** `foliate-js` (Reader Engine), `@tauri-apps/plugin-*`, `lucide-svelte`, `zip.js`, `fflate`
- **Styling:** TailwindCSS v4 + Custom CSS variables (Dark Theme)

## File System Structure

```
nous/
├── src/
│   ├── lib/
│   │   ├── services/             # Business logic & External integrations
│   │   │   ├── library.ts        # Book import/management service
│   │   │   └── metadata.ts       # EPUB metadata parser
│   │   ├── db.ts                 # Database singleton & helpers
│   │   ├── stores/               # Svelte stores (State Management)
│   │   └── components/           # UI Components
│   │       ├── Book3D.svelte     # Pure CSS 3D book model
│   │       └── Sidebar.svelte    # Main navigation drawer
│   ├── routes/
│   │   ├── +layout.svelte        # Root layout (DB init)
│   │   ├── +page.svelte          # Sanctuary (Home/Library view)
│   │   └── book/
│   │       └── [id]/             # Reader View (foliate-js integration)
│   └── app.css                   # Global styles
```

## Core Workflows

1. **Startup:** Tauri launches → loads SvelteKit → `+layout.svelte` initializes SQLite.
2. **Library:** `fetchBooks()` loads metadata from SQLite.
3. **Reader:** 
    - `/book/[id]` loads the book record.
    - `foliate-js` reads the file directly from the filesystem via Tauri.
    - Renders the EPUB in a custom view.

## Database

See [Database Guide](../guides/database.md) for schema and helpers.

## Critical Notes for Agents

- **Database:** Always call `getDb()` first. Use helper functions in `src/lib/db.ts`.
- **Reader Engine:** `foliate-js` is integrated in `src/routes/book/[id]`. It uses a dynamic import strategy.
- **UI Architecture:** 
    - **Sanctuary (Home):** Uses CSS 3D Transforms for the carousel. 
    - **Transitions:** Use Svelte 5 runes and `{#key}` blocks for state-driven animations.

## Development

```bash
npm run dev          # SvelteKit dev
npm run check        # Type check
npm run tauri dev    # Full app dev
npm run tauri build  # Build desktop app
```
