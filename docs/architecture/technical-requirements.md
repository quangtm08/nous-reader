# **Technical Requirements & Design**

**Version:** 1.1 (Phase 2: UI & Reader Engine)

**Project Name:** Nous

**Core Concept:** A high-performance, local-first desktop e-book reader where reading is a deep, recursive conversation.

---

## **1. Executive Summary**

**Nous** is a desktop e-book reader designed for deep comprehension and research. It transforms the solitary act of reading into an interactive dialogue through a unique **Recursive Threading** architecture.

Phase 1 focuses on building a "Steel Frame": a world-class EPUB reading environment that is functional offline, synced via the cloud, and architected to support deep AI integration in the future without requiring a structural refactor.

---

## **2. Strategic Vision**

* **Depth over Surface:** Every highlight is the "Root" of a branch. Users can create infinite sub-discussions (manual now, AI-assisted later) to synthesize complex ideas.
* **Reading First:** The AI is a "Companion with Depth," not a UI distraction. The core experience must remain a premium, distraction-free reader.
* **Local-First, Cloud-Synced:** Users own their data. The app is instant and functional offline, utilizing Supabase as a background synchronization layer.

---

## **3. Technical Stack**

| Layer | Technology | Implementation Detail |
| --- | --- | --- |
| **Framework** | **Tauri (v2)** | Rust-based core for performance; Webview for the UI layer. |
| **Frontend** | **Svelte** | High-performance, reactive UI with a minimal footprint. |
| **Reader Engine** | **foliate-js** | Industry-standard EPUB rendering and CFI management. |
| **Compression** | **zip.js & fflate** | Standards-compliant EPUB unzipping and decompression. |
| **Database (Local)** | **SQLite** | Managed via `tauri-plugin-sql` for instant local persistence. |
| **Database (Sync)** | **Supabase** | PostgreSQL for metadata/note sync and cloud backup. |
| **Icons/UI** | **Lucide Svelte** | Minimalist, professional iconography. |

---

## **4. Data Architecture (AI-Ready Schema)**

See [Database Guide](../guides/database.md) for full schema details.

The database supports an **Adjacency List** model to allow for the future "Recursive Branching" of thoughts.

---

## **5. Functional Requirements**

### **5.1 The Reader (Foliate Integration)**

* ✅ Implement a contained `foliate-js` instance within the Tauri webview.
* ✅ **File Access:** Map local filesystem EPUBs into the app securely.
* **CFI Stability:** Ensure highlights persist across font resizing or window scaling using Canonical Fragment Identifiers.
* **IPC Bridge:** Establish a Tauri `emit/listen` protocol to pass selection data from the reader to the main UI.

### **5.2 Library & Storage Management**

* ✅ **Local Import:** Import EPUBs from the local filesystem.
* ✅ **Persistence:** Store book metadata in SQLite.
* **Offline Persistence:** Every highlight and note must be written to the local SQLite database immediately.
* **Cloud Sync:** Sync changes to Supabase when a connection is detected.

### **5.3 The Recursive Sidebar**

* A right-pane UI that displays the "Thread" associated with a specific highlight.
* **Visual Hierarchy:** Use indentation or Miller Column-style transitions to show parent/child relationships in notes.
* **Manual Synthesis:** Allow users to flag a specific note as a "Synthesis" to roll up insights from a branch.

---

## **6. Implementation Status**

### Completed
- ✅ Tauri v2 project initialized with Svelte
- ✅ `foliate-js` integration via `foliate-js/view.js` dynamic import
- ✅ `zip.js` and `fflate` working (bundled with foliate-js)
- ✅ Local EPUB file loading using `@tauri-apps/plugin-fs`
- ✅ Content Security Policy configured for blob iframe loading
- ✅ Navigation system (keyboard + buttons)
- ✅ Fixed-layout EPUB support (cover scaling)
- ✅ TypeScript declarations for foliate-js
- ✅ Database Schema & Helpers (SQLite)

### In Progress / Next Steps
- 🚧 Selection event capture (text selection → annotation)
- 🚧 CFI-based annotation persistence to SQLite
- 🚧 Reading position (CFI) save/restore
- 🚧 Recursive threading UI

### Not Started
- ⏳ Cloud sync to Supabase
- ⏳ AI-assisted conversation features