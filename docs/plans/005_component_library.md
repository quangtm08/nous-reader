# Plan: Component Library

## Objective
Create a set of reusable, accessible UI components (Button, Input, Icon Wrapper) to standardize the application's design language and speed up future development. This completes Phase 2 of the roadmap.

## 1. Analyze Usage
- **Buttons:** Identify styles used in `src/routes/library/+page.svelte` (e.g., "Import", "Menu").
- **Icons:** Standardize how Lucide icons are sized and styled.

## 2. Create Components
- **`src/lib/components/ui/Button.svelte`**:
  - Variants: `primary`, `ghost`, `icon` (circular).
  - Props: `variant`, `size`, `onclick`, `class`, `children` (snippet).
  - Styling: Use the new semantic CSS variables (`--color-accent`, etc.).
- **`src/lib/components/ui/Input.svelte`** (Proactive for search/filtering):
  - Styling: Minimal, borderless or bottom-border, matching the dark theme.
- **`src/lib/components/ui/Icon.svelte`** (Optional wrapper if needed, or just standardized usage patterns).

## 3. Refactor Existing Usage
- Update `src/routes/library/+page.svelte` to use the new `Button` component.
- Update `src/lib/components/Sidebar.svelte` if applicable.

## 4. Verification
- Verify the Library page still functions correctly (Import, Menu toggle).
- Check hover states and active states.
