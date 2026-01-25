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

## 5. Implementation Results & Key Fixes

### Issues Resolved During Implementation

#### 5.1. Core Initialization Issue - Missing `view.init()`
- **Problem:** Reader created but no content displayed because `view.init()` was never called after `view.open()`
- **Root Cause:** `foliate-js` requires both `open(book)` to set up the renderer AND `init()` to navigate to and display content
- **Solution:** Added `await view.init({ lastLocation: null, showTextStart: true })` after `view.open(book)`

#### 5.2. Content Security Policy Blocking 
- **Problem:** `Refused to load blob:http://... because it appears in neither the frame-src directive nor the default-src directive`
- **Root Cause:** Foliate-js loads book content in iframes using blob URLs, but CSP blocked `frame-src`
- **Solution:** Updated CSP in `src/app.html`:
  ```html
  <meta http-equiv="Content-Security-Policy" content="... frame-src 'self' blob:; script-src 'self' 'unsafe-inline' blob:; style-src 'self' 'unsafe-inline' blob:;">
  ```

#### 5.3. File Format Detection
- **Problem:** `TypeError: undefined is not an object (evaluating 'name.endsWith')`
- **Root Cause:** `foliate.makeBook()` expects a `File` object with `name` property, not `Blob`
- **Solution:** Pass `new File([fileData], filename)` instead of raw fileData

#### 5.4. Reader Interface & Navigation
- **Added keyboard navigation:** Arrow keys, PageUp/Down, Spacebar for page turning
- **Added visual navigation buttons:** Hover-activated prev/next buttons with chevron icons
- **Added loading states:** Visual feedback while book loads
- **Proper cleanup:** Event listeners and view cleanup in `onDestroy()`

#### 5.5. Styling & Visibility
- **Background color:** Set light background (#faf9f6) for contrast against black text
- **Responsive layout:** Fixed toolbar height and container sizing with `min-h-0`
- **Focus management:** Attempted to focus view for keyboard events

### Current Status
- **Working:** Book content loads and displays, CSP issues resolved, file access working
- **Partial:** Navigation buttons and keyboard shortcuts implemented, navigation quality depends on book structure
- **Open Issues:** Some books may show cover pages initially; `showTextStart` behavior varies by book structure

## 6. Verification
- [x] Click a book in the library.
- [x] Application navigates to the new route.
- [x] EPUB content loads and displays (text, images visible).
- [x] Basic pagination works via keyboard and buttons.
- [x] Can return to the home screen.
- [x] Content Security Policy allows blob iframe loading.
- [x] File permissions allow reading from local filesystem.

## 7. Code Architecture & Best Practices

### Reader Lifecycle (Critical Pattern)
```typescript
// 1. Load file with proper typing
const file = new File([fileData], filename);

// 2. Create book and view
const book = await foliate.makeBook(file);
const view = new foliate.View();
container.appendChild(view);

// 3. Open book
await view.open(book);

// 4. CRITICAL: Initialize and navigate to content
await view.init({ showTextStart: true });

// 5. For fixed-layout EPUBs, set zoom mode
if (view.isFixedLayout && view.renderer) {
  view.renderer.setAttribute('zoom', 'fit-page');
}
```

### Event Listener Cleanup
```typescript
const controller = new AbortController();
window.addEventListener('keydown', handler, { signal: controller.signal });
// use return () => controller.abort() in onMount cleanup
```

### Keyboard Input Safety
```typescript
function shouldHandleKeydown(e: KeyboardEvent) {
  if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return false;
  const target = e.target as HTMLElement | null;
  if (!target) return true;
  // Avoid hijacking typing in inputs
  if (target.closest('input, textarea, [contenteditable="true"]')) return false;
  return true;
}
```

### Navigation for RTL/LTR Books
```typescript
function goPrev() {
  // Prefer goLeft/goRight for RTL
  return view?.goLeft?.() ?? view?.prev();
}

function goNext() {
  return view?.goRight?.() ?? view?.next();
}
```

## 8. Future Enhancements
- Save and restore reading position (CFI)
- Chapter/TOC navigation
- Settings for font size, line height, themes
- Reading progress tracking
- Search functionality
- Selection capture and annotations
- Highlighting colors
