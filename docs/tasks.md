# Nous Project Tracking

## 📋 Roadmap & TODOs

### Phase 1: Foundation & Library Management ✅
- [x] Project scaffolding (Tauri v2 + Svelte 5)
- [x] SQLite Database integration and schema design
- [x] File System permissions and Dialog setup
- [x] **Optimized Library Logic**: Rust-based EPUB parsing and metadata extraction.
- [x] **High-Performance Assets**: File-based cover storage with `asset:` protocol.
- [x] **Migration Tooling**: Background migration of legacy blobs to optimized WebP files.

### Phase 2: UI Shell & Design System 🏗️ (IN PROGRESS)
- [x] **Sanctuary (Home)**: High-fidelity CSS-based 3D Carousel with realistic textures, organic floating animations, and keyboard navigation. (DONE)
- [x] **Desktop Layout**: Implemented Sidebar and Main Content structure with unified background layer system. (DONE)
- [x] **Global Styling**: Refine design tokens and typography.
- [x] **Polished Library**: High-quality static Book Cards for the "All Books" view with dense grid layout. (DONE)
- [x] **Component Library**: Create reusable buttons, inputs, and icons. (DONE)
- [x] **Code Review**: Review the implementation of the Library page and Book3D component refinements (dynamic sizing, static mode, CSS variable integration).

### Phase 3: The Reading Experience
- [x] **Metadata Extraction**: Robust Rust-based parsing (Title, Author, Cover). (DONE)
- [x] **Reader Engine Integration**: Implement `foliate-js` to render EPUBs (DONE)
- [x] **Book Viewer Route**: Create a dynamic route (`/book/[id]`) to open and read specific books. (DONE)

## Current Focus: Phase 3b - Annotation Sidebar

See [Plan 008: Annotation Sidebar](plans/008_annotation_sidebar.md) for implementation details.

Phase 3 Complete (Core):
- [x] **Highlighting**: Ability to select text and save CFI ranges
- [x] **CFI Persistence**: Save annotations to SQLite database
- [ ] **Annotation Sidebar**: View all highlights for a book (NEXT)
- [ ] **Recursive Threading**: Implement the logic to "reply" to highlights
- [ ] **Thread Visualization**: UI for nesting and navigating deep conversations

### Phase 4: Local Intelligence (Future) 🧠
- [ ] Local LLM integration via Ollama or similar
- [ ] Automatic synthesis of annotation threads

---

## 🛠️ Codebase Status

### System Architecture
- **Frontend**: Svelte 5 (Runes: `$state`, `$derived`, `$effect`)
- **Backend**: Tauri v2 (Rust)
- **Database**: SQLite (via `tauri-plugin-sql`)
- **Storage**: Hybrid; metadata in SQLite, optimized assets in app data folder.

### Important Files
- `src-tauri/src/lib.rs`: Rust commands for EPUB import and image processing.
- `src/lib/db.ts`: Database schema, migrations, and query helpers.
- `src/lib/services/library.ts`: Library management and background migrations.
- `src/lib/stores/library.ts`: Svelte store for reactive library state.
- `src/lib/components/Book3D.svelte`: Pure CSS 3D book model.

### Known Issues / Technical Debt
- [ ] **Virtualization**: As the library exceeds 100 books, the 3D carousel may require virtualization to maintain 60fps.