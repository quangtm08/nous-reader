# Plan: Fix Reader Focus Loss on Navigation

## Problem
When clicking internal links (Table of Contents) in the Reader view, keyboard navigation (Left/Right arrows) stops working. This is because focus shifts into the internal `foliate-js` renderer (iframe/shadow DOM), bypassing the global `window` keydown listener.

## Solution
We need to ensure the main application window (or the specific `container` element) retains or regains focus after navigation events.

## Steps
1.  **Modify `src/routes/book/[id]/+page.svelte`**:
    - In `initReader()`, add an event listener for the `relocate` event on the `foliate-js` view.
    - Inside the `relocate` handler, programmatically call `container.focus()`.
    - This ensures that whenever the page changes (via arrow keys OR link clicks), focus is brought back to the element that captures keyboard inputs.

2.  **Verify**:
    - Open a book.
    - Click a chapter in the TOC (if available) or any internal link.
    - Immediately press "Right Arrow". It should turn the page.
