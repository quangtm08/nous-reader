# Execution Plan: Connect Sanctuary UI to Real Database (COMPLETED)

**Status:** ✅ Completed on 2026-01-25
**Goal:** Replace the hardcoded `MOCK_BOOKS` in the Sanctuary (Home) screen with real data fetched from the local SQLite database.

## 1. Analysis & Gaps

| Feature | Mock Data (`UI`) | Real Data (`DB`) | Gap |
| :--- | :--- | :--- | :--- |
| **Title** | `title` | `title` | None (Direct Map) |
| **Author** | `author` | `author` (optional) | Need fallback (e.g., "Unknown Author") |
| **Cover** | `coverUrl` (String URL) | `cover_blob` (Uint8Array) | Need `URL.createObjectURL(blob)` conversion |
| **Progress** | `progress` (0-100) | **Missing** | Default to `0` or calculate from `annotations` later |
| **Time** | `timeRemaining` | **Missing** | Default to "Unknown" or hidden |
| **Source** | Static Array | Async SQLite | Need Svelte Store + Async Loader |

## 2. Implementation Steps

### Step 1: Create Library Store (`src/lib/stores/library.ts`) ✅
Create a reactive Svelte store to manage the application's book state.
- **State:** `books` (Array of UI-ready objects), `isLoading` (Boolean), `error` (String | null).
- **Actions:**
    - `loadLibrary()`: Fetches from DB, transforms Blob -> URL, updates state.
    - `addBook()`: Wraps `importBook`, reloads library on success.

### Step 2: Update `src/lib/library.ts` ✅
- Ensure `getBooks()` returns the raw DB shape correctly.
- (Optional) Add a simple `deleteBook(id)` helper for cleanup during dev.

### Step 3: Integrate with `+page.svelte` ✅
- Remove `MOCK_BOOKS` import.
- Import the new `libraryStore`.
- Use `$effect` or `onMount` to trigger `libraryStore.loadLibrary()`.
- **Refactor Template:**
    - Use `$libraryStore.books` instead of `MOCK_BOOKS`.
    - Handle `isLoading` state (e.g., show a spinner or skeleton).
    - Handle `empty` state (Show "Import your first book" UI if 0 books).

### Step 4: Wire up the Sidebar ✅
- Modify `src/lib/components/Sidebar.svelte`.
- Import `libraryStore`.
- Bind the "Import" button to `libraryStore.addBook()`.

### Step 5: Placeholder Assets ✅
- Since the DB currently imports books without parsing metadata (just filename), the `cover_blob` will be null.
- Create a **Generated Placeholder Cover** utility:
    - If `coverUrl` is null, render a CSS/Canvas cover with the Book Title + Random Gradient.
    - OR use a default static asset from `src/lib/assets`.

## 3. Verification
- [x] Launch App.
- [x] Home screen shows "No books found" (or similar).
- [x] Click "Import" -> Select EPUB.
- [x] New book appears in the carousel immediately.
- [x] "Resume" button works (conceptually - just logs for now).

## 4. Future Considerations (Post-Plan)
- We still need `foliate-js` to actually *read* the file and extract real metadata/covers. This plan simply connects the pipes.