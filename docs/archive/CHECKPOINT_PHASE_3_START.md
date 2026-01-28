# PROMPT: Nous Project Checkpoint (Phase 3 Start)

## 1. Project Overview
**Nous** is a local-first, high-performance desktop e-book reader built for "recursive reading" (deep comprehension via threaded annotations). 

**Tech Stack:**
- **Core:** Tauri v2 (Rust)
- **Frontend:** Svelte 5 (Runes mode), TypeScript, TailwindCSS v4
- **Database:** SQLite (via `tauri-plugin-sql`)
- **Rendering:** `foliate-js` (EPUB engine), Pure CSS 3D Transforms (Library UI)

## 2. Implementation Status (What Works)

### A. The "Sanctuary" (Library View)
- **Location:** `src/routes/+page.svelte`, `src/lib/components/Book3D.svelte`
- **Features:** 
  - Pure CSS 3D book carousel with physics-based floating animations.
  - High-performance grid view (`/library`).
  - Rust-based file import (EPUB parsing, cover resizing, WebP optimization).

### B. The Reader
- **Location:** `src/routes/book/[id]/+page.svelte`
- **Engine:** `foliate-js` running inside a custom container.
- **Features:**
  - **Custom Focus Handling:** Fixed keyboard navigation loss when clicking internal links (via `relocate` event).
  - **Highlighting:** 
    - Captures text selection -> Extracts CFI (Canonical Fragment Identifier).
    - Persists to SQLite (`annotations` table).
    - Re-renders highlights on book load (Gold accent color).
  - **UI:** Custom floating toolbar, hover-based page turn arrows.

### C. Data Layer
- **Location:** `src/lib/db.ts`
- **Schema:**
  - `books`: Metadata + `cover_path` (local FS path).
  - `annotations`: `cfi_range`, `highlighted_text`, `color`, foreign key to `books`.
  - `threads`: (Prepared but not UI-implemented yet) for recursive notes.
- **Asset Protocol:** Covers are loaded via `convertFileSrc` (asset protocol) for performance.

## 3. Key Files for Review
- **Global Styles:** `src/app.css` (Tailwind @theme, CSS variables for theming).
- **UI Components:** `src/lib/components/ui/` (Button.svelte, Input.svelte).
- **Type Definitions:** `src/types/foliate-js.d.ts` (Manually augmented types for the 3rd party library).
- **State Management:** `src/lib/stores/library.ts` (Svelte runes/stores).

## 4. Current Task & Context
We have just completed the **Highlighting Core** (Capture + Save). 
The next immediate step is building the **Annotation Sidebar** to view/manage these highlights.

## 5. Future Roadmap & Architectural Constraints
**IMPORTANT:** Review your optimizations with these future goals in mind. Do NOT introduce constraints (e.g., rigid data structures or UI layouts) that would make the following features difficult to implement:

- **Phase 3b: Annotation Sidebar (List View):** A slide-out panel showing all highlights for a book.
- **Phase 3c: Recursive Threading (The "Core" of Nous):** 
    - Every highlight is the "root" of a conversation.
    - Users can reply to a highlight, and then reply to those replies (infinitely nested trees).
    - Architecture must support a **Tree Data Structure** where each node is a note/thought.
- **Phase 4: Local Intelligence:** AI agents will "read" these threads to synthesize summaries. The data structure must be clean and queryable for LLM context windows.

## 6. Issues & Optimizations Identified

**Note:** Early development stage - aggressive cleanup encouraged. Remove dead code, simplify where possible, but verify functionality after each change.

### CRITICAL Issues (Memory & Performance)

**1. Remove Entire Legacy Blob Handling** (`src/lib/stores/library.ts:51-65`)
- Database migration moved covers to filesystem → blob handling vestigial
- `URL.createObjectURL()` calls dead code creating memory leaks
- **Action:** Remove entire `else if (record.cover_blob)` block lines 54-65
- **Action:** Remove `getMimeType()` function lines 17-27
- **Action:** Remove `blobToUint8Array` import
- **Result:** Cleaner code, eliminates memory leak源头

**2. Refactor Stores to Svelte 5 Full Runes Pattern** (`src/lib/stores/library.ts`, `src/lib/stores/ui.ts`)
- Both use Svelte 4 `writable` instead of modern `$state` runes
- **Decision:** Full runes pattern recommended for:
  - Better performance (no subscription overhead)
  - Cleaner, more idiomatic Svelte 5 code
  - Consistent with `$derived` usage elsewhere in codebase
- **Fix:** Convert stores to:
  ```typescript
  let books = $state<UIBook[]>([]);
  let isLoading = $state(false);
  let error = $state<string | null>(null);
  // Return { get books() { return books }, ... }
  ```
- **Update Consumers:** Change `$libraryStore.books` to `$libraryStore.books` (same syntax), update direct state access

### TYPE SAFETY (Remove Technical Debt)

**3. Eliminate All @ts-expect-error** (`src/routes/book/[id]/+page.svelte:5 instances`)
- foliate-js types incomplete → 5 suppressions at lines 53, 58, 117, 147, 169
- **Fix:** Expand `src/types/foliate-js.d.ts` View interface with:
  ```typescript
  export class View extends HTMLElement {
    renderer: HTMLElement | null;
    book: any;
    open(book: any): Promise<void>;
    init(options: { lastLocation?: string | null; showTextStart?: boolean }): Promise<void>;
    close(): void;
    destroy(): void;
    goTo(target: any): Promise<any>;
    prev(distance?: number): Promise<void>;
    next(distance?: number): Promise<void>;
    goLeft?(): Promise<void>;
    goRight?(): Promise<void>;
    isFixedLayout?: boolean;
    focusView?(): void;
    addAnnotation(annotation: any): void;
    deleteAnnotation(annotation: any): void;
    getSelection(): any;
  }
  ```
- Remove all `// @ts-expect-error` comments and unnecessary `@ts-expect-error` lines

**4. Dead Placeholder Comment** (`src/lib/db.ts:33`)
- Line 33: `// ... (AnnotationRecord, AnnotationInsert, ThreadRecord, ThreadInsert remain the same) ...`
- All interfaces actually defined below - vestigial comment
- **Action:** Delete line 33

**5. Unused fflate Import?** → Keep it
- foliate-js depends on fflate internally for EPUB decompression
- Not explicitly imported anywhere but required by dependency
- **Decision:** Keep in package.json, add inline comment why needed

### AGGRESSIVE CLEANUP (Full Cleanup Approved)

**6. Delete Over-Engineered Blob Utils** (`src/lib/utils.ts`)
- `blobToUint8Array` has 7 type transformations, analysis shows only 2-3 needed
- Legacy blob handling being removed, so this utility dead code
- **Action:** Delete entire `src/lib/utils.ts` file
- **Action:** Remove import from `src/lib/stores/library.ts`

**7. Remove Error Fallback** (`src/lib/services/library.ts:88-95`)
- `importBook()` fallback logic inserts incomplete records on failure
- Better UX: surface error to user instead of creating bad data
- **Action:** Delete try/catch fallback block lines 86-95, rethrow error

**8. Full Codebase Cleanup**
- Check for unused imports across all files
- Remove unused variables and dead code
- Search for TODO/FIXME comments, resolve or mark as won't fix

### BUG FIXES

**9. Race Condition in Reader** (`src/routes/book/[id]/+page.svelte:176-202`)
- `onMount` returns cleanup before async `initReader()` completes
- `onDestroy` tries `view?.close()` during in-progress operations
- **Fix:** Add initialization flag:
  ```typescript
  let isInitializing = $state(false);
  onMount(async () => {
    isInitializing = true;
    try { await initReader(); } finally { isInitializing = false; }
    return () => { if (!isInitializing) view?.close(); };
  });
  ```

**10. Missing Validation** (`src/routes/book/[id]/+page.svelte:152`)
- `saveHighlight()` accepts empty/whitespace selections
- **Fix:** Add guard at line 155:
  ```typescript
  async function saveHighlight() {
    if (!view || !selectionMenu) return;
    if (!selectionMenu.text.trim()) {
      selectionMenu = null;
      return;
    }
  ```

**11. Database Annotation Ordering** (`src/lib/db.ts:299`)
- `ORDER BY rowid ASC` → should be `ORDER BY cfi_range ASC` for logical reading order
- **Fix:** Line 299: `ORDER BY cfi_range ASC`

## 7. Store Refactor Decision: Full Runes

**Why Full Runes Over Backward Compatibility:**

| Aspect | Subscribe Pattern | Full Runes Pattern | Winner |
|--------|-------------------|---------------------|--------|
| Performance | Subscription tracking overhead | No subscription tracking | **Runes** |
| Simplicity | More boilerplate (get/set/writable) | Direct state access | **Runes** |
| Consistency | Mix of patterns in codebase | Matches $derived usage elsewhere | **Runes** |
| Future-proof | Svelte 4 legacy pattern | Svelte 5 intended pattern | **Runes** |
| API Surface | Keep subscribe() method | Object with getters | **Runes** |

**Recommended Pattern:**
```typescript
export function createLibraryStore() {
  let books = $state<UIBook[]>([]);
  let isLoading = $state(false);
  
  return {
    get books() { return books; },
    get isLoading() { return isLoading; },
    loadLibrary: async () => { ... }
  };
}

export const libraryStore = createLibraryStore();
```

**Consumer Usage:**
```svelte
<script>
  let { books } = $props(); // or let books = libraryStore.books
  
  // Both work same way with runes
</script>

{#each books as book} ... {/each}
```

**Migration Path:**
1. Keep function wrapper for extensibility
2. Use getters (read-only public API)
3. No subscribe() needed - Svelte 5 runs `$effect` automatically
4. Minimal code changes in consumers

## 8. Action Checklist

### Performance (Do First)
- [ ] Remove entire legacy blob handling block (library.ts:54-65)
- [ ] Remove `getMimeType()` function (library.ts:17-27)
- [ ] Delete `src/lib/utils.ts` entirely
- [ ] Refactor library store to full `$state` runes pattern
- [ ] Refactor ui store to full `$state` runes pattern
- [ ] Update all store consumers (routes, components)

### Code Cleanup (Do Second)
- [ ] Remove dead placeholder comment (db.ts:33)
- [ ] Remove error fallback in importBook (library.ts:88-95)
- [ ] Scan codebase for unused imports, remove them
- [ ] Remove unused variables across all files

### Type Safety (Do Third)
- [ ] Expand foliate-js.d.ts with all View interface methods
- [ ] Remove all 5 @ts-expect-error comments
- [ ] Run `npm run check` - ensure zero TypeScript errors

### Bug Fixes (Do Last)
- [ ] Add initialization flag for reader cleanup race
- [ ] Add highlight validation in saveHighlight
- [ ] Fix annotation ordering query

### Testing Workflow
After each change:
1. Import an EPUB book → verify covers load correctly (from filesystem)
2. Read book → verify foliate-js loads, navigate pages
3. Create highlight → verify color applied to text
4. Refresh page/switch views → verify no memory leaks
5. Run `npm run check` → verify zero TypeScript errors

