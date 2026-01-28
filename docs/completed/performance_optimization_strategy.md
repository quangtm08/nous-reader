# Performance Optimization Plan (COMPLETED)

**Project:** *nous* (Tauri EPUB Reader)  
**Date:** 2026-01-26  
**Status:** ✅ **COMPLETED**

---

## 1. Final Architecture

| Layer                          | Responsibility                                     |
| ------------------------------ | -------------------------------------------------- |
| **Rust (Tauri backend)**       | EPUB import, metadata extraction, cover processing |
| **SQLite**                     | Metadata only (text, numbers, paths)               |
| **Filesystem**                 | Cover images (processed & optimized)               |
| **Frontend (Svelte)**          | Rendering & Reading UI (foliate.js)                |

**Strict Rule:** JavaScript never unzips EPUBs or handles large binary buffers. All I/O heavy tasks are offloaded to Rust.

---

## 2. Completed Implementation

### Phase 1: Rust Backend (The Heavy Lifter) ✅
- **Crates:** Added `epub`, `image`, and `uuid`.
- **Command:** Implemented `import_book(file_path)` and `process_cover_blob` in Rust.
- **Optimization:** Rust now resizes covers to **600px height** and converts them to **WebP** before they ever touch the frontend.
- **Storage:** Covers are saved to the local app data directory (`covers/<uuid>.webp`).

### Phase 2: Database & Storage ✅
- **Schema:** Added `cover_path` column to `books` table.
- **Migration:** Implemented background migration logic that moves legacy `cover_blob` data to the filesystem and clears the database blobs.

### Phase 3: Frontend Integration ✅
- **Cleanup:** Removed `zip.js` and the client-side `metadata.ts` parser.
- **Asset Protocol:** Configured Tauri v2 `asset:` protocol with proper CSP and scoping.
- **Fast Rendering:** The UI now uses `convertFileSrc()` to load images directly from disk, bypassing the memory-heavy `URL.createObjectURL` path.

---

## 3. Results
- **Zero UI Freeze:** Import and migration happen entirely off the main thread.
- **Minimal Startup Cost:** Library loading is limited to a lightweight SQL query.
- **Efficient Memory:** Only the images currently visible in the webview are decoded by the browser.
