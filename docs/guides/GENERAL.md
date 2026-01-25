# UI Design System: "Nous"

## 1. Core Philosophy
The interface aims for a **"Digital Sanctuary"** aesthetic. It blends the intellectual weight of a classical library with the ethereal lightness of modern glassmorphism. It is dark, warm, and spacious.

*   **Keywords**: Atmospheric, Spacious, Intellectual, Tactile, Fluid.
*   **Interaction Model**: Heavy use of "opt-in" UI. Controls (like sidebars) are hidden until needed. Focus is always on the book content.

## 2. Typography

### A. Serif: **Francisco Serial** (Local)
*   **Usage**: High-impact headings, Book Titles, Greetings.
*   **Characteristics**: High contrast, crisp serifs, academic feel.
*   **Weights**: Light (300) for elegance, Bold (700) for emphasis.

### B. Sans-Serif: **Helvetica Neue** (System)
*   **Usage**: UI elements, Metadata, Buttons, Author Names, Navigation.
*   **Characteristics**: Neutral, clean, highly legible at small sizes.
*   **Styling**: Often uppercase with wide tracking (`tracking-[0.2em]` or wider).

## 3. Color Palette

### Primary Colors
| Variable | Hex | Description |
| :--- | :--- | :--- |
| `--color-background` | `#171211` | Deep warm charcoal (Base). |
| `--color-surface` | `#211311` | Slightly lighter warm dark (Cards/Drawers). |
| `--color-ivory` | `#FDFBF7` | Primary text, glowing elements. |
| `--color-accent` | `#d4b483` | **Gold/Paper**. Active states, progress, glows. |

### Supporting Palette (Atmosphere)
| Hex | Description |
| :--- | :--- |
| `#e86854` | **Terracotta**. Used subtly in background radiant gradients. |
| `#9CA3AF` | **Muted**. Secondary text. |

## 4. Layer Architecture (Z-Index)
To maintain the "Atmospheric" feel, we strictly manage depth:

1.  **Layer 0 (Background)**:
    *   Base Image (Library, blur-2xl)
    *   3x Gradient Overlays (Soft light, Overlay, Bottom Shadow)
    *   Noise Texture (`mix-blend-overlay`)
2.  **Layer 10 (Content)**: The main scrollable area.
3.  **Layer 20 (Hero Elements)**: The active book cover, 3D Canvas.
4.  **Layer 30 (HUD)**: Header (Greeting), Floating Action Buttons, Footer Dots.
5.  **Layer 40 (Overlays)**: Backdrops for modals/drawers.
6.  **Layer 50 (Drawers)**: The Sidebar navigation.

## 5. Common Component Patterns

### Glassmorphism
*   Do not use heavy borders. Use thin, translucent white borders (`border-white/5` or `border-white/10`).
*   Backgrounds should be `bg-black/10` or `bg-white/5` with `backdrop-blur-md` where performance allows.
*   *Performance Note*: Avoid animating `backdrop-filter`. Use opacity fades on pre-blurred elements if possible.

### Buttons (Round)
*   **Icon-only**: `size-12` or `size-14`, rounded-full.
*   **Style**: Ivory text on transparent background, hover `bg-white/10`.
*   **Shadows**: `drop-shadow-md`.

### Metadata Labels
*   **Font**: Sans-serif, Uppercase.
*   **Size**: Tiny (`text-[10px]` or `text-xs`).
*   **Tracking**: Extreme (`tracking-[0.25em]`).
*   **Color**: `text-ivory/80` or `text-ivory/60`.
