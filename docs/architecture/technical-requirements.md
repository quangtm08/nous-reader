# **Technical Requirements & Design**

**Version:** 1.2 (Optimization Iteration)

**Project Name:** Nous

**Core Concept:** A high-performance, local-first desktop e-book reader where reading is a deep, recursive conversation.

---

## **1. Executive Summary**

**Nous** is a desktop e-book reader designed for deep comprehension and research. It features a high-performance Rust processing pipeline to ensure a fluid experience even with large libraries.

The architecture emphasizes **Zero-JS-Overhead** for heavy I/O and binary tasks, offloading metadata extraction and image processing to the native Rust layer.

---

## **2. Strategic Vision**

* **Performance-First:** Instant startup and smooth animations (60fps) are non-negotiable.
* **Local Ownership:** User data stays local. Metadata in SQLite, processed assets on disk.
* **Distraction-Free:** Premium, minimal UI focused on the text.

---

## **3. Technical Stack**

| Layer | Technology | Implementation Detail |
| --- | --- | --- |
| **Framework** | **Tauri (v2)** | Rust-based core; Webview for the UI layer. |
| **Frontend** | **Svelte 5** | Runes-based reactivity for ultra-fast UI updates. |
| **Reader Engine** | **foliate-js** | Industry-standard EPUB rendering and CFI management. |
| **Binary Processing**| **Rust (epub, image)** | Native metadata extraction and WebP image optimization. |
| **Database** | **SQLite** | Managed via `tauri-plugin-sql`. |
| **Asset Loading** | **Asset Protocol** | High-speed native file serving via `asset:` protocol. |

---

## **4. Data Architecture**

* **Metadata:** Stored in SQLite (`books` table).
* **Covers:** Stored as optimized WebP files in the App Local Data directory.
* **Reading Progress:** Persisted in SQLite.

---

## **5. Functional Requirements**

### **5.1 The Reader (Foliate Integration)**
* ✅ Implement a contained `foliate-js` instance within the Tauri webview.
* ✅ **File Access:** Map local filesystem EPUBs into the app securely.

### **5.2 Library & Optimization**
* ✅ **Rust Pre-processing:** EPUBs are parsed in Rust to avoid main-thread blocking.
* ✅ **Image Optimization:** Covers are resized to 600px height and converted to WebP.
* ✅ **Lazy Assets:** Images are served via `convertFileSrc` to leverage native browser decoding.

---

## **6. Implementation Status**

### Completed
- ✅ Rust-based EPUB processing pipeline
- ✅ SQLite schema with file-based cover tracking
- ✅ Background migration tool for legacy blob data
- ✅ `foliate-js` integration and reader route
- ✅ Pure CSS 3D "Sanctuary" carousel

### In Progress / Next Steps
- 🚧 Selection event capture (text selection → annotation)
- 🚧 CFI-based annotation persistence to SQLite
- 🚧 Recursive threading UI
