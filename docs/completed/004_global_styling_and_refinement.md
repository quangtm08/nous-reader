# Plan: Global Styling & Refinement

## Objective
Standardize design tokens (colors, typography) across the application and remove hardcoded values to ensure a cohesive "Sanctuary" aesthetic. This addresses the "Global Styling" and "Code Review" items in the roadmap.

## 1. Refactor `src/app.css`
- **Consolidate Theme:** Move all color definitions into the Tailwind v4 `@theme` block.
- **Define Semantic Colors:** Ensure variables like `--color-book-page`, `--color-book-cover-default` are available.
- **Typography:** Confirm `font-serif` and `font-sans` map correctly.

## 2. Refine `src/lib/components/Book3D.svelte`
- **Remove Hardcoded Colors:** Replace values like `#01060f` (cover bg), `#fdfbf7` (pages), and shadows with CSS variables.
- **Optimization:** Ensure the component respects the global theme.

## 3. Clean up `src/routes/library/+page.svelte`
- **Remove Redundancy:** Delete the `:global(body)` style block in favor of `app.css` global styles.
- **Standardize UI:** Ensure buttons and text use the defined design tokens.

## 4. Verification
- Check the Library view (`/library`) and Sanctuary view (`/`) to ensure no visual regressions.
- Verify that the "Gold" accent and "Charcoal" background are consistent.
