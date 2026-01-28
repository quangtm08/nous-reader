# Plan: Highlighting & CFI Persistence

## Objective
Implement the core functionality of the "Annotations" phase: capturing text selections as Canonical Fragment Identifiers (CFIs), saving them to the SQLite database, and rendering them persistently in the reader.

## 1. Database Schema (`src/lib/db.ts`)
Create a new table `annotations` to store highlights.

```sql
CREATE TABLE IF NOT EXISTS annotations (
  id TEXT PRIMARY KEY,
  book_id TEXT NOT NULL,
  cfi TEXT NOT NULL,         -- The range identifier
  text_content TEXT,         -- Selected text (for search/display)
  color TEXT DEFAULT 'yellow',
  note TEXT,                 -- Optional user note (future proofing)
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(book_id) REFERENCES books(id) ON DELETE CASCADE
);
```

Add helper functions:
- `addAnnotation(bookId, cfi, text, color)`
- `getAnnotations(bookId)`
- `deleteAnnotation(id)`

## 2. Reader Integration (`src/routes/book/[id]/+page.svelte`)

### A. Rendering Highlights (Load)
- On `initReader`, fetch annotations for the current book from `db`.
- Use the `foliate-js` View API to add these annotations.
  - *Note:* We need to verify if `view.addAnnotation(annotation)` is the correct API or if we inject a custom overlay. Foliate usually expects an array of annotation objects.

### B. Capturing Selections (Create)
- The `foliate-js` view is an `HTMLElement`. We need to handle selection events.
- **Mechanism:**
  1. Listen for the `mouseup` or custom `selection` event inside the view.
  2. Retrieve the CFI of the selection using `view.getSelection()` (or equivalent API).
  3. Show a lightweight UI (floating button) to "Highlight".
  4. On click:
     - Save to DB.
     - Add visual highlight to `view`.

## 3. Type Definitions (`src/types/foliate-js.d.ts`)
- Update type definitions to include `addAnnotation`, `removeAnnotation`, and selection-related methods if missing.

## 4. Verification
- Open a book.
- Select text -> "Highlight" -> Verify visual change.
- Reload app -> Open same book -> Verify highlight persists.
