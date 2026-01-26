# Execution Plan: EPUB Metadata Extraction (SUPERSEDED)

> [!WARNING]
> **This document is for historical reference only.**
> The implementation described below (using JS-based `zip.js`) has been **superseded** by a high-performance Rust implementation using the `epub` and `image` crates. 
> Refer to [Performance Optimization Strategy](./performance_optimization_strategy.md) for the current architecture.

**Status:** ⏩ Superseded by Rust implementation
**Goal:** Implement real parsing of EPUB files during import to extract the **Title**, **Author**, and **Cover Image**. This replaces the current filename-based fallback and provides a rich UI experience.

## 1. Prerequisites & Dependencies

We need to read the internal `content.opf` file inside the EPUB (which is a ZIP archive).
*   **Libraries:** `zip.js` and `fflate` (already installed).
*   **Strategy:** We will write a lightweight custom parser using `zip.js` to avoid the heavy overhead of loading a full rendering engine (like `epub.js` or `foliate`) just for metadata extraction.

## 2. Implementation Steps

### Step 1: Create Metadata Utility (`src/lib/metadata.ts`)
Write a focused utility to parse EPUBs.
- **Function:** `parseEpub(file: File | Blob): Promise<EpubMetadata>`
- **Logic:**
    1.  Unzip the file using `zip.js`.
    2.  Find `META-INF/container.xml` to locate the rootfile (usually `content.opf`).
    3.  Parse `content.opf` (XML) to extract:
        -   `<dc:title>`
        -   `<dc:creator>` (Author)
    4.  Locate the Cover Image:
        -   Find the `<meta name="cover" content="...">` item.
        -   Resolve the href to the actual image file in the zip.
        -   Extract that image file as a `Uint8Array` (Blob).

### Step 2: Update `importBook` in `src/lib/library.ts`
Modify the import flow to read the file before saving.
- **Current:** Get path -> Save Path -> Return.
- **New Flow:**
    1.  Get path from dialog.
    2.  **Read the file** into memory (using Tauri `fs` plugin).
    3.  Pass the buffer to `parseEpub()`.
    4.  Receive `{ title, author, coverBlob }`.
    5.  Call `insertBookRecord` with this rich data.

### Step 3: Handle Tauri File Reading
- Ensure `tauri.conf.json` allows reading binary files from the user's selected path.
- Use `readBinaryFile` from `@tauri-apps/plugin-fs`.

### Step 4: UI Updates
- The Home screen (`+page.svelte`) and Library Store (`stores/library.ts`) are already built to handle real data.
- **Verify:** Once the DB has `cover_blob`, the existing `URL.createObjectURL` logic in the store should automatically render the real cover.

## 3. Technical Challenges

- **XML Parsing:** EPUB OPF files can be messy. We need a robust XML parser (browser built-in `DOMParser` is perfect).
- **Path Resolution:** Relative paths inside the ZIP (e.g., `OEBPS/images/cover.jpg`) need to be resolved correctly relative to the OPF file.
- **Memory:** Reading large EPUBs into RAM might be heavy. We should ensure we only read the necessary chunks if possible, or just accept the cost for V1 since most EPUBs are <5MB.

## 4. Verification

- [x] Import a known EPUB (e.g., "Moby Dick").
- [x] Check DB: `title` should be "Moby Dick" (not "moby-dick.epub").
- [x] Check DB: `author` should be "Herman Melville".
- [x] Check UI: The Home screen should display the real book cover art.
