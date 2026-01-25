# Bug Report: Reader View Empty Content

**Date:** January 26, 2026
**Status:** ✅ Resolved - Code Cleanup Complete
**Component:** Reader Engine (foliate-js integration)

## 1. Issue Description
When opening a book (EPUB/KEPUB) from the library, the application navigates to the reader page (`/book/[id]`). The reader component initializes without throwing visible errors in the console, but the view remains completely empty (blank screen). No text or book content is rendered.

## 2. Environment
- **OS:** macOS (Darwin)
- **Framework:** Tauri v2, SvelteKit (Svelte 5)
- **Reader Library:** `foliate-js` v1.0.1
- **File System:** Local files (including User's Home and External/Cloud storage paths)

## 3. History of Issues & Fixes
The following issues were encountered and resolved during the implementation process:

### 3.1. Test Configuration Failures
- **Issue:** `vitest` failed due to missing mocks for `$lib/db` and SvelteKit modules.
- **Fix:** Refactored `tests/reader-integration.test.ts` to properly mock `fetchBookById`, `readFile` (Tauri fs), and SvelteKit's `error` and `load` functions. Resolved Svelte 5 SSR vs JSDOM issues by configuring `vite.config.js` aliases/conditions.

### 3.2. Library Import Error
- **Issue:** `Failed to resolve entry for package "foliate-js"` because the package exports are not standard.
- **Fix:** Switched to a dynamic import of `foliate-js/view.js` inside `onMount`.

### 3.3. File Permission Error
- **Issue:** Tauri blocked access to the book file: `forbidden path: ...`.
- **Fix:** Updated `src-tauri/capabilities/default.json` to explicitly allow read access to `$HOME/**`.

### 3.4. File Format Detection Error
- **Issue:** `TypeError: undefined is not an object (evaluating 'name.endsWith')` inside `foliate-js`.
- **Cause:** `foliate.makeBook` was passed a `Blob` which lacks a `name` property, preventing the library from detecting the file type (EPUB).
- **Fix:** Switched to passing a `File` object created with the correct filename extracted from the path.

### 3.5. CSP / IPC Error
- **Issue:** `Refused to connect to ipc://...` and `IPC custom protocol failed`.
- **Fix:** Updated `src/app.html` meta tag to include `ipc:`, `ws:`, and `asset:` protocols in the `Content-Security-Policy`.

### 3.6. CSS / Sizing Issues (Attempted Fix)
- **Issue:** Suspected that the Custom Elements (`foliate-view`, `foliate-paginator`) had 0 height/width.
- **Attempted Fix:**
    - Added global CSS: `:global(foliate-view) { display: block; width: 100%; height: 100%; }`.
    - Added JS logic to explicitly set `width: 100%; height: 100%` on `view.renderer` (the internal paginator component).
- **Result:** The view is likely sized correctly now, but content is still not visible.

## 4. Current Situation
- **Behavior:** The user opens a book, the reader page loads, the toolbar is visible, but the main content area is empty.
- **Logs:** No errors in the console. `foliate-js` appears to initialize successfully (`makeBook` returns a book object, `view.open` completes).
- **Visuals:** The background is dark (from app styles), but no text or pages appear.

## 5. Hypotheses & Potential Causes

1.  **Shadow DOM Styling Isolation:**
    - `foliate-paginator` (inside `foliate-view`'s shadow DOM) might rely on specific styles that are not being loaded or injected. `foliate-js` v1.0 might expect a different setup than just `new View()`.

2.  **Renderer Implementation Details:**
    - `foliate-js` dynamically imports `paginator.js` or `fixed-layout.js`. While `view.renderer` is created, it might not be rendering the content immediately, or it might be waiting for a resize event or a specific "Go To" command.

3.  **Book Object Structure:**
    - The `book` object returned by `makeBook` might be technically valid but missing the actual section content or TOC for the specific file being tested (Anna Karenina).

4.  **Z-Index / Layering:**
    - The content might be rendered but hidden behind a background layer or text color matches the background (e.g., black text on black background).

## 6. Root Cause Analysis & Final Resolution

### 6.1. Primary Issue - Missing `view.init()` Call
- **Root Cause:** The `view.init()` method was never called after `view.open(book)`. Looking at foliate-js source:
  - `view.open(book)` creates the renderer and sets up book structure
  - `view.init({ lastLocation, showTextStart })` is required to actually navigate to and display content
- **Evidence:** Code had `view.open(book)` but no `view.init()` call
- **Impact:** Paginator component existed but was never told what content to display

### 6.2. Secondary Issues Resolved

#### CSP Blockade
- **Error:** `Refused to load blob:http://... because it appears in neither the frame-src directive`
- **Fix:** Added `frame-src 'self' blob:;` to Content Security Policy in `src/app.html`
- **Result:** Foliate-js iframes can now load book content

#### File Type Detection  
- **Error:** `TypeError: undefined is not an object (evaluating 'name.endsWith')`
- **Fix:** Pass `File` object instead of `Blob` to `foliate.makeBook()`
- **Result:** Proper EPUB format detection

### 6.3. Code Refactoring (2026-01-26)

The reader code was cleaned up and optimized with the following improvements:

#### Lifecycle Management
- Separated reader initialization into `initReader()` function
- Removed debug console.log statements
- Improved error handling with try-catch-finally pattern
- Proper state management for `view`, `error`, and `isLoading`
- Cleaned up keyboard event listeners using `AbortController`

#### Navigation Enhancements
- **RTL support:** Prefers `goLeft()`/`goRight()` for right-to-left books, falling back to `prev()`/`next()`
- **Keyboard safety:** Checks for modifier keys and input elements before hijacking keys
- **Focus management:** Calls `view.renderer.focusView()` to ensure keyboard events go to the right element
- **Buttons are now `<button type="button">`** for proper accessibility

#### Fixed Layout Improvements
- **Cover scaling:** Sets `zoom="fit-page"` attribute on `foliate-fxl` for fixed-layout EPUBs, preventing squished covers
- **CSS sizing:** Added explicit sizing for `foliate-paginator` and `foliate-fxl` global styles

#### TypeScript Configuration
- Updated `tsconfig.json` to explicitly include `src/**/*.d.ts` files
- Ensures `src/types/foliate-js.d.ts` is properly recognized

#### Current Status
- ✅ **Book loading and display:** Content renders correctly
- ✅ **File access:** Tauri permissions allow filesystem reads
- ✅ **CSP:** Blob URLs load in iframes
- ✅ **Navigation:** Keyboard and button navigation work smoothly
- ✅ **Layout:** Responsive with proper sizing for all renderer types
- ✅ **Accessibility:** Proper button elements and focus handling
- ✅ **Code quality:** Clean lifecycle, proper cleanup, no slop

### 6.4. Resolution Confirmation

The reader integration is now **functionally complete**. Books load and display with navigation capabilities. The original "empty content" issue was resolved by:

1. **Critical Fix:** Adding `await view.init({ lastLocation: null, showTextStart: true })`
2. **Enabling Fix:** CSP updates to allow `blob:` in `frame-src`
3. **Supporting Fixes:** Proper File object usage, keyboard navigation, visual buttons

## 7. Lessons Learned

1. **Library Integration Requires Complete Lifecycle:** Just instantiating and `open()`-ing isn't sufficient; must call `init()` for display
2. **Tauri WebView Context:** CSP requires explicit blob/iframe permissions for dynamic content  
3. **File API Usage:** Some libraries depend on File object properties (like `name`) for type detection
4. **Event Management:** Proper cleanup is essential for keyboard event listeners
