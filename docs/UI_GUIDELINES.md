# UI Design Guidelines & Architecture

## 1. Tech Stack & Styling Strategy

To achieve the "polished, glassmorphism, high-fidelity" look requested:

-   **CSS Framework**: **Tailwind CSS**
    -   *Why*: Rapid styling, standard in Svelte ecosystem, easy handling of blurs/opacity/gradients (`backdrop-blur`, `bg-opacity`).
-   **Icons**: **Lucide Svelte** (Already installed).
-   **3D Rendering**: **Threlte** (`@threlte/core`, `@threlte/extras`)
    -   *Why*: The user requested "3D animated covers". Threlte is the Svelte-native wrapper for Three.js. It allows declarative 3D scenes inside Svelte components.
    -   *Fallback*: Pure CSS 3D Transforms (`transform: rotateY(...) preserve-3d`) if WebGL proves too heavy for simple cover interactions.

## 2. Typography

Based on the "Classic/Academic" aesthetic of the design references:

-   **Headlines (Serif)**: **Newsreader** (Google Font)
    -   *Usage*: Book titles, "Welcome back" greetings, major section headers.
    -   *Why*: Variable font, high legibility, beautiful italic styles, fits the "book" vibe perfectly.
-   **UI / Body (Sans-Serif)**: **Inter** (Google Font)
    -   *Usage*: Navigation, buttons, metadata (progress, dates), small labels.
    -   *Why*: Clean, neutral, high readability at small sizes.

## 3. Color Palette (Dark Mode)

Extracted from the "Nature of Things" design:

| Name | Hex | Usage |
| :--- | :--- | :--- |
| **Background** | `#1a1614` | Main app background (Deep Warm Brown/Black) |
| **Surface** | `#2c2420` | Cards, sidebars, modal backgrounds |
| **Accent** | `#d4b483` | Primary actions, "Resume" buttons, progress bars (Gold/Paper) |
| **Text Primary** | `#f3f4f6` | High emphasis text |
| **Text Muted** | `#9ca3af` | Secondary info, "reading time remaining" |

## 4. Component Architecture

### A. Layout (`src/routes/+layout.svelte`)
-   **Sidebar (Left)**: Collapsible navigation.
-   **Top Bar**: "Welcome" message (dynamic) + Search.
-   **Main Content**: Dynamic slot.

### B. Home Page (`src/routes/+page.svelte`)
-   **Hero Section**: Large "Current Read" or "Welcome".
-   **Book Slider**: A horizontal carousel.
    -   *Behavior*: As you swipe, the central book scales up.
    -   *Component*: `BookCarousel.svelte`

### C. 3D Book Component (`src/lib/components/Book3D.svelte`)
-   **Tech**: Threlte.
-   **Props**: `coverUrl`, `spineUrl` (optional), `thickness`.
-   **Interaction**:
    -   Idle: Slowly floating/rotating.
    -   Hover: Rotates to face user, maybe opens slightly.
    -   Click: Transition to reading view.

## 5. Mock Data Strategy (Blocking Issue Resolution)

Since backend metadata extraction is TODO, UI development **must** use a strict Mock Data interface.

**File**: `src/lib/mock.ts`

```typescript
export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl: string; // URL to local asset or placeholder
  progress: number; // 0-100
  totalMinutes: number; // Estimated reading time
  lastRead: Date;
}

export const MOCK_BOOKS: Book[] = [
  {
    id: '1',
    title: 'The Nature of Things',
    author: 'Lucretius',
    coverUrl: '/covers/nature-of-things.jpg',
    progress: 74,
    totalMinutes: 340,
    lastRead: new Date()
  },
  // ... more items
];
```

## 6. Implementation Plan (Next Steps)

1.  **Setup**: Verify Tailwind & Font integration.
2.  **Scaffold**: Create `src/lib/mock.ts` and download placeholder covers.
3.  **Layout**: Build the Sidebar and Header shell.
4.  **Components**: Build `BookCard.svelte` (2D first) -> `Book3D.svelte` (Integration).
5.  **Page**: Assemble the Home Dashboard.
