# Database Schema & Helpers

**Location:** `src/lib/db.ts`

## Overview
We use SQLite via `tauri-plugin-sql`. The database connection is a singleton initialized in `src/routes/+layout.svelte`.

## Tables

### `books`
- `id`: TEXT (UUID)
- `title`: TEXT
- `author`: TEXT
- `local_path`: TEXT (UNIQUE)
- `cover_blob`: BLOB
- `metadata`: TEXT (JSON)
- `created_at`: TEXT

### `annotations`
- `id`: TEXT (UUID)
- `book_id`: TEXT (FK -> books.id)
- `cfi_range`: TEXT (Canonical Fragment Identifier)
- `highlighted_text`: TEXT
- `color`: TEXT

### `threads`
- `id`: TEXT (UUID)
- `parent_id`: TEXT (FK -> threads.id, Nullable)
- `annotation_id`: TEXT (FK -> annotations.id)
- `content`: TEXT
- `role`: TEXT (user/assistant)
- `is_synthesis`: INTEGER (Boolean)
- `created_at`: TEXT

## Helpers
**Always use these helpers instead of raw SQL.**

- `fetchBooks()` → `Promise<BookRecord[]>`
- `fetchBookById(id)` → `Promise<BookRecord | null>`
- `fetchBookByPath(path)` → `Promise<BookRecord | null>`
- `insertBookRecord(input)` → `Promise<BookRecord>`
- `deleteBook(id)` → `Promise<boolean>`
- `insertAnnotationRecord(input)` → `Promise<AnnotationRecord>`
- `insertThreadRecord(input)` → `Promise<ThreadRecord>`

## Migrations
To change the schema:
1. Open `src/lib/db.ts`.
2. Add a new SQL string to the `MIGRATIONS` array.
3. The app handles versioning automatically on startup.
