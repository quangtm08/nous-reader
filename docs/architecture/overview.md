# Nous - Architecture Overview

## Project Overview

Desktop e-book reader for EPUB files with AI-assisted annotation features. Optimized for performance using a Rust-based processing pipeline and local-first storage.

## Tech Stack

- **Frontend:** SvelteKit 2 + Svelte 5 + TypeScript + Vite
- **3D Engine:** Pure CSS 3D Transforms (High performance, Zero WebGL overhead)
- **Backend:** Tauri 2 (Rust)
- **Database:** SQLite (via `tauri-plugin-sql`)
- **Image Processing:** Rust `image` crate (WebP conversion, Lanczos3 resizing)
- **Reader Engine:** `foliate-js`
- **Key libs:** `lucide-svelte`, `epub` (Rust), `uuid` (Rust), `fflate` (for foliate-js)
- **Styling:** TailwindCSS v4 + Custom CSS variables (Dark Theme)

## File System Structure

```
nous/
├── src/
│   ├── lib/
│   │   ├── services/             # Business logic & External integrations
│   │   │   └── library.ts        # Book import/management & migration logic
│   │   ├── db.ts                 # Database singleton, migrations & helpers
│   │   ├── stores/               # Svelte stores (State Management)
│   │   ├── utils.ts              # Shared utilities (blob conversion, etc.)
│   │   └── components/           # UI Components
│   │       ├── Book3D.svelte     # Pure CSS 3D book model
│   │       └── Sidebar.svelte    # Main navigation drawer
│   ├── routes/
│   │   ├── +layout.svelte        # Root layout
│   │   ├── +page.svelte          # Sanctuary (Home/Library view)
│   │   └── book/
│   │       └── [id]/             # Reader View (foliate-js integration)
```

## Core Workflows

1. **Startup:** Tauri launches → loads SvelteKit → `+layout.svelte` initializes SQLite.
2. **Library Loading:** `fetchBooks()` retrieves metadata. If `cover_path` exists, it uses `convertFileSrc()` for fast loading.
3. **Optimized Import:** 
    - Rust opens the EPUB, extracts metadata, and resizes the cover.
    - Cover is saved as a WebP file in the app data directory.
    - Only the path is stored in SQLite.
4. **Reader:** 
    - `/book/[id]` loads the book record.
    - `foliate-js` reads the file directly from the filesystem via Tauri.

## Database

See [Database Guide](../guides/database.md) for schema and helpers.

## Critical Notes for Agents

- **Performance:** Never perform heavy binary processing (Unzipping, Resizing) in JavaScript. Always use a Rust command.
- **Assets:** Use the `asset:` protocol (via `convertFileSrc`) to load images from disk.
- **Database:** Always call `getDb()` first. Use helper functions in `src/lib/db.ts`.

## Development

```bash
npm run dev          # SvelteKit dev
npm run tauri dev    # Full app dev
npm run tauri build  # Build desktop app
```