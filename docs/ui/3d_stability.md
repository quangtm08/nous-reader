# 3D Component Stability Guide

## Problem: Sub-pixel Drift and "Settling" Pages
During 3D CSS rotations (e.g., returning from a hover state), child elements like book pages can appear to "move," "slide," or "settle" slightly after the parent rotation finishes. This is caused by three factors:
1.  **Coordinate Drift:** Browser sub-pixel rendering calculates the position of the 3D children slightly after the parent.
2.  **Animation Overlap:** If a `float` animation (looping) and a `rotate` transition (triggered) happen at the same time, their perspective calculations conflict.
3.  **Floating Tilt:** Using `rotateX` in a loop causes the vertical lines of pages to "shear" relative to the camera as the rotation changes.

## The Solution

To achieve a "locked" state where pages never move independently of the cover:

### 1. Freeze Animation State
Pause the looping `float` animation the moment the user interacts with the object. This provides a stable baseline for the rotation transition.
```css
.container:hover .float-layer {
  animation-play-state: paused;
}
```

### 2. Hardware Acceleration Layers
Use `will-change: transform` on both the floating container and the 3D object itself. This forces the browser to promote the entire "book block" to a single GPU layer, ensuring the cover and pages are moved as a single texture.
```css
.object {
  will-change: transform;
  transform-style: preserve-3d;
}
```

### 3. Stable Rotation Origin
Explicitly define `transform-origin: center center`. Without this, the browser may use an implicit origin that shifts slightly during the transition, causing the pages to "orbit" the cover rather than rotating with it.

### 4. Snap Transition
Use a snappy `cubic-bezier` curve and a consistent duration (e.g., 1.4s) to ensure the movement is fluid enough to mask minor rendering discrepancies but slow enough to feel premium.
```css
transition: transform 1.4s cubic-bezier(0.22, 1, 0.36, 1);
```
