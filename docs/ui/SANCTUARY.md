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
*   **3D Book**:
    *   Uses `@threlte/core`.
    *   **Dimensions**: `w-[320px] h-[32rem]` (Desktop).
    *   **Interaction**: Floats on idle, rotates on hover.
    *   **Glow**: A `hero-glow` div behind the book (`bg-accent/20`, `blur-[100px]`, `mix-blend-screen`).
*   **Book Info**:
    *   Located to the right of the book (Desktop) or below (Mobile).
    *   **Title**: Serif, Bold, `text-5xl`. Drop shadow.
    *   **Author**: Sans, Uppercase, Tracking `0.4em`. **Gold Border Left** (`border-[#d4b483]`).
    *   **Progress**: Thin `2px` line, gold fill.
*   **Navigation**:
    *   **Previous/Next Placeholders**: Blurred, angled, grayscale, low opacity (`opacity-20`).
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
*   **Gap**: The Book and Info section are tight (`gap-6` to `gap-10`) to feel like a cohesive unit.
*   **Negative Space**: Massive margins on top/bottom/sides to frame the content like a piece of art.

## 4. Animation Guidelines
*   **Carousel Transition**:
    *   When changing books, the 3D scene re-mounts (keyed by ID).
    *   Text elements should fade in/out (TODO).
*   **Hover**:
    *   Adjacent blurred books scale up slightly (`scale-105`) and brighten on hover.
    *   Resume button icon slides right (`translate-x-1`).
