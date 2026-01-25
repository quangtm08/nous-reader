# Bug Report: 3D Book Cover Not Rendering

**Date:** 2026-01-25
**Status:** Deferred
**Severity:** Low (Feature Not Implemented)
**Last Updated:** 2026-01-25 (Replaced 3D with 2D image)

## 1. the Issue
The 3D Book Cover (Threlte/Three.js) could not display the front face texture. The texture loaded successfully, but the mesh showed the back face instead.

**Workaround Applied:**
- Replaced the center 3D book with a 2D `<img>` element
- All other features work correctly (EPUB import, cover extraction, preview images)
- 3D rendering is **deferred** until a dedicated 3D iteration

## 2. Technical Context

### Architecture
1.  **Extraction:** `src/lib/metadata.ts` uses `zip.js` to extract the cover image bytes from the EPUB. ✅ **Working**
2.  **Storage:** The bytes (`Uint8Array`) are stored in SQLite (`books.cover_blob`). ✅ **Working**
3.  **State:** `src/lib/stores/library.ts` reads the DB, detects the MIME type via magic bytes, creates a `Blob`, and generates a URL via `URL.createObjectURL()`. ✅ **Working**
4.  **Rendering:** `src/routes/+page.svelte` now uses a simple `<img>` tag for the center book. ✅ **Working**

### What's Working
- EPUB cover extraction ✅
- SQLite BLOB storage ✅
- Blob URL generation (handles JSON-stringified arrays from `tauri-plugin-sql`) ✅
- 2D cover images (center, left preview, right preview) ✅
- Library store and navigation ✅

### What's Deferred
- **3D Book Cover rendering** - The Threlte component loaded textures successfully but showed the back face instead of the front face. Postponed for a dedicated 3D iteration.

## 3. What Was Attempted

1.  **Fixed Blob Handling:** Added robust parsing in `src/lib/stores/library.ts` to handle JSON-stringified arrays from `tauri-plugin-sql`. ✅ **RESOLVED**
2.  **Fixed Texture Flickering:** Removed `texture = null` from cleanup function in `$effect` that was causing texture to reset. ✅ **RESOLVED**
3.  **Three.js Reactivity:** Fixed `$effect` in `Book3D.svelte` to properly track `coverUrl` changes.
4.  **Face Order Debug:** Added 6 different face colors to verify which face was being displayed (back face/face 5 was visible instead of front/face 4).
5.  **Rotation Attempted:** Rotated the mesh 180° around Y-axis to try to show the front face.

## 4. Root Cause (Unconfirmed)

The issue is likely related to how Threlte's material array order maps to Three.js's geometry faces. The texture was loading on the correct Three.js face (index 4 - Front), but the camera was looking at a different face (index 5 - Back). Possible causes:

1.  **Materials Order Mismatch:** Threlte may use [Front, Back, Right, Left, Top, Bottom] while Three.js uses [Right, Left, Top, Bottom, Front, Back].
2.  **Geometry Normals:** The BoxGeometry might be built with different face normals than expected.
3.  **Camera Perspective:** The camera looks down negative Z, but the mesh may be facing in a different direction.

## 5. Future Work (Dedicated 3D Iteration)

To properly fix the 3D book cover rendering (when we return to it):

1.  **Threlte Docs Review:** Study Threlte's material array and face mapping conventions.
2.  **Geometry Inspection:** Log the `BoxGeometry`'s normal for each face to verify which direction each faces.
3.  **Camera/Scene Debug:** Use OrbitControls to manually rotate the scene and confirm which faces are where.
4.  **Material Array Testing:** Systematically test each material position with different colors to map the array order.
5.  **Simplify:** Consider a single texture on a plane first, then a full Box, to isolate the issue.

## 6. Relevant Files
- `src/lib/metadata.ts` (EPUB cover extraction - CLEANED UP)
- `src/lib/stores/library.ts` (Blob handling - RESOLVED)
- `src/lib/components/Book3D.svelte` (3D component - DEFERRED)
- `src/routes/+page.svelte` (Now uses 2D `<img>` for center book)
- `src/lib/components/HeroScene.svelte` (3D scene - NOT CURRENTLY USED)
