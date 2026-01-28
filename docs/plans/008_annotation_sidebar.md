# Plan: Annotation Sidebar

## Objective
Create a sidebar in the Reader view that displays all annotations (highlights) for the current book. Clicking an annotation should navigate the reader to that location.

## 1. UI Component (`src/lib/components/AnnotationSidebar.svelte`)
- **Structure:**
  - Slide-out panel (right side).
  - List of annotations (cards).
  - Each card shows: `highlighted_text` (truncated), `color` indicator, and a delete button.
- **Interactions:**
  - Click card -> Emit `jump` event with CFI.
  - Click delete -> Emit `delete` event with ID.

## 2. Integration (`src/routes/book/[id]/+page.svelte`)
- **State:** Add `showSidebar` state variable.
- **Button:** Add a "List" or "Highlighter" icon to the top toolbar to toggle the sidebar.
- **Logic:**
  - Pass the list of loaded `annotations` to the sidebar.
  - Handle `jump`: Call `view.goTo(cfi)`.
  - Handle `delete`: Call `deleteAnnotation(id)`, remove from DB, and remove from `view`.

## 3. Refinement
- Ensure the sidebar matches the "Sanctuary" aesthetic (dark theme, glassmorphism).
- Update the `annotations` list reactively when a new highlight is created.

## 4. Verification
- Open book -> Highlight text.
- Open Sidebar -> Verify new highlight is there.
- Click highlight -> Verify reader jumps to location.
- Delete highlight -> Verify it disappears from sidebar and book.
