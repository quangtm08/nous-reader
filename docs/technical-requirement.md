
# **System Design Document: Nous**

**Version:** 1.0 (Phase 1: The Foundation)

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

## **4. Critical Dependencies**

To handle EPUB files (which are specialized ZIP archives), the coding agent must implement the following:

* **zip.js (BSD-3-Clause):** Used for navigating the internal structure of the EPUB archive.
* **fflate (MIT):** Used as the high-speed decompression engine for zip.js.
* **Reasoning:** These libraries are the standard "glue" for `foliate-js`. Do not attempt to replace them with native APIs unless specifically instructed, to ensure maximum compatibility with reflowable EPUB layouts.

---

## **5. Data Architecture (AI-Ready Schema)**

The database must support an **Adjacency List** model to allow for the future "Recursive Branching" of thoughts.

### **Core Schema Logic**

1. **`books`**:
* `id` (UUID), `title`, `author`, `local_path`, `cover_blob`, `metadata` (JSONB).


2. **`annotations`**:
* `id` (UUID) - The Anchor.
* `book_id` (FK), `cfi_range` (String), `highlighted_text` (Text), `color`.


3. **`threads`**:
* `id` (UUID), `parent_id` (FK to self, Nullable).
* `annotation_id` (FK), `content` (Markdown Text), `role` (User/System/Assistant).
* `is_synthesis` (Boolean): Marks a node that summarizes its child branches.



---

## **6. Phase 1: Functional Requirements**

### **6.1 The Reader (Foliate Integration)**

* Implement a contained `foliate-js` instance within the Tauri webview.
* **CFI Stability:** Ensure highlights persist across font resizing or window scaling using Canonical Fragment Identifiers.
* **IPC Bridge:** Establish a Tauri `emit/listen` protocol to pass selection data from the reader to the main UI.

### **6.2 Library & Storage Management**

* **Local Import:** Map local filesystem EPUBs into the app.
* **Offline Persistence:** Every highlight and note must be written to the local SQLite database immediately.
* **Cloud Sync:** Sync changes to Supabase when a connection is detected.

### **6.3 The Recursive Sidebar**

* A right-pane UI that displays the "Thread" associated with a specific highlight.
* **Visual Hierarchy:** Use indentation or Miller Column-style transitions to show parent/child relationships in notes.
* **Manual Synthesis:** Allow users to flag a specific note as a "Synthesis" to roll up insights from a branch.

---

## **7. Guardrails & Development Principles**

* **No Cloning:** Do not copy the proprietary UI/CSS of existing readers (e.g., Readest). All components must be original Svelte implementations.
* **AI-Native Hook:** The `threads` table must treat "User" and "Assistant" roles as first-class citizens, even before the AI is integrated.
* **Performance:** All library views must be virtualized to handle 500+ books without UI lag.

---

## **8. Immediate Coding Prompt for Agents**

> "Initialize a Tauri v2 project with Svelte. Integrate `foliate-js` using `zip.js` and `fflate`. Create a command to load a local EPUB file and a listener that captures 'selection' events. When text is selected, save the `highlighted_text` and `cfi_range` into a local SQLite table named `annotations` using the `tauri-plugin-sql` plugin."

---