# UI Screen: Sanctuary (Home/Base)

## 1. Overview
The **Sanctuary** is the default landing screen for existing users. It acts as a "Recent Reads" carousel but is styled as a heroic presentation of the current book.

**Route**: `/` (`src/routes/+page.svelte`)

## 2. Key Layout Sections

### A. Header (Top)
*   **Position**: `top-20` to `top-32` (Desktop). Floating, centered.
*   **Elements**:
    *   **Greeting**: "Welcome back, [Name]". Serif, Light, Large.
    *   **Tracking**: Streak (with pulsing Gold dot) + Daily Goal (with circular progress SVG).
    *   **Action Buttons**: Menu (Left), Search (Right). Absolute positioning.

### B. Hero Carousel (Center)
The core interaction area.
*   **Layout Strategy**:
    *   **Grid**: Two columns. Column 1 (Book) is fixed `320px`. Column 2 (Info) is `auto`.
    *   **Intrinsic Sizing**: The Info column width is strictly determined by the **Bottom Action Row** ("Resume" + "Mark as finished").
    *   **Wrapping**: The Title and Progress sections are constrained (`w-0 min-w-full`) to wrap perfectly at the edge of the action row.
    *   **Alignment**: The entire grid has right-padding (`pr-20`) to optically center the active content relative to the side previews.
*   **3D Book**:
    *   Uses `@threlte/core`.
    *   **Dimensions**: `w-[320px] h-[32rem]` (Desktop).
    *   **Interaction**: Floats on idle (sine wave), rotates on hover, "breathes" (soft scale) on texture swap.
    *   **Glow**: A `hero-glow` div behind the book (`bg-accent/20`, `blur-[100px]`, `mix-blend-screen`).
*   **Book Info**:
    *   **Title**: Serif, Bold, `text-5xl`. Drop shadow. Wraps dynamically.
    *   **Author**: Sans, Uppercase, Tracking `0.4em`. **Gold Border Left** (`border-[#d4b483]`).
    *   **Progress**: Thin `2px` line, gold fill. Matches the container width.
    *   **Actions**:
        *   **Resume**: Large Ivory button, rounded-sm, shadow-xl.
        *   **Mark as finished**: Subtle text link (`text-base`, `text-ivory/40`), sentence case.
*   **Navigation**:
    *   **Previous/Next Placeholders**: Absolutely positioned, blurred, angled, grayscale.
    *   **Controls**: Chevron buttons on far edges.

### C. Footer (Bottom)
*   **Pagination Dots**:
    *   **Active**: `size-2`, `scale-150`, `bg-ivory`, glowing shadow.
    *   **Inactive**: `size-1.5`, `bg-ivory/30`.

## 3. Specific Styling Rules

### The "Atmosphere"
The Sanctuary relies heavily on the **Background Layer System** defined in `GENERAL.md`.
*   The background is NOT black. It is a blurred, warm library image with specific blending modes.
*   This creates the "Golden Hour" lighting effect behind the book.

### Spacing & Proportions
*   **Gap**: The Book and Info section are tight (`gap-6`) to feel like a cohesive unit.
*   **Carousel Gap**: Wide spacing (`gap-20` or more) between the active unit and side previews.
*   **Negative Space**: Massive margins on top/bottom/sides to frame the content like a piece of art.

## 4. Animation Guidelines
*   **Text Transition (Grid Stacking)**:
    *   The "Book Info" container is a 1x1 Grid.
    *   Entering/Leaving text blocks occupy `col-start-1 row-start-1`.
    *   This forces them to overlap perfectly during the `crossfade` (800ms, `cubicInOut`), preventing layout jumps.
*   **Preview Transition (Absolute Stacking)**:
    *   Side previews use `relative` container + `absolute inset-0` images.
    *   Transitions use `fade` (800ms).
*   **3D Book**:
    *   Texture swaps trigger a soft "breathing" spring animation (`stiffness: 0.03`).
    *   No scene remounting (persistent Canvas).