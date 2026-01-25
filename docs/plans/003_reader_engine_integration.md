# Execution Plan: Reader Engine Integration (COMPLETED)

**Status:** ✅ Completed on 2026-01-26
**Goal:** Integrate `foliate-js` to render EPUB files within the application, allowing users to open and read books from their library.

## 1. Context & Objectives
Currently, the application allows importing books into the database and displaying them in the Sanctuary (Home) view. The next critical step is to provide the actual reading capability. We will use `foliate-js` as the rendering engine.

## 2. Technical Architecture

### Core Components
1.  **Route:** `src/routes/book/[id]/+page.svelte`
    - The dedicated page for reading a specific book.
    - Captures the `id` from the URL parameters.
2.  **Loader:** `src/routes/book/[id]/+page.ts` (or `+layout.ts`)
    - Fetches the `BookRecord` from SQLite using the `id`.
    - Passes the book data (specifically `local_path`) to the Svelte component.
3.  **Reader Component:**
    - A wrapper around `foliate-js`.
    - Likely uses a Custom Element (`<foliate-view>`) or direct module usage depending on the library's export structure.
    - Handles the loading of the EPUB file from the local filesystem.

### Data Flow
1.  User clicks "Continue reading" on the Home screen.
2.  Navigation to `/book/[book_id]`.
3.  Page loader calls `fetchBookById(book_id)` to get the file path.
4.  Component reads the file content (ArrayBuffer) using Tauri's `fs` plugin.
5.  File content is passed to `foliate-js` for rendering.

## 3. Implementation Steps

### Step 1: Investigation (Pre-requisite)
- Verify `foliate-js` export structure in `node_modules`.
- Determine the correct import strategy (ESM import of `view.js` vs. specific named exports).

### Step 2: Create the Reader Route
- Create `src/routes/book/[id]/+page.ts`:
    - Implement `load` function.
    - Fetch book details.
    - Handle 404 if book not found.
- Create `src/routes/book/[id]/+page.svelte`:
    - Basic scaffolding.
    - Receive `data.book`.

### Step 3: Implement the Reader Logic
- In `+page.svelte`:
    - Import `foliate-js` modules.
    - Use Tauri's `readFile` to load the EPUB binary.
    - Initialize the Foliate view/renderer.
    - Mount the renderer into a DOM container.
    - **Styling:** Ensure the reader takes up the full viewport (`100vh`, `100vw`).

### Step 4: Navigation Integration
- Update `src/routes/+page.svelte`:
    - Modify the "Continue reading" button to navigate to `/book/${featuredBook.id}`.
    - (Optional) Update the cover click action to do the same.

### Step 5: Basic Controls (MVP)
- Ensure basic pagination works (Next/Prev page).
- Add a "Back to Library" button (absolute positioned or simple toolbar).

## 4. Risks & Considerations
- **Asset Paths:** EPUBs contain internal paths (images, css). `foliate-js` typically handles this by virtualization or blob URLs, but we need to ensure it works within the Tauri/WebView environment.
- **Performance:** Loading large EPUBs into memory (ArrayBuffer) might be heavy.
- **State:** We are not yet saving progress (CFI) in this iteration. That is a future task.

## 5. Verification
- [x] Click a book in the library.
- [x] Application navigates to the new route.
- [x] EPUB content renders correctly (text, images).
- [x] Can turn pages.
- [x] Can return to the home screen.
