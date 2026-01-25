# Nous Project Tracking

## 📋 Roadmap & TODOs

### Phase 1: Foundation & Library Management ✅
- [x] Project scaffolding (Tauri v2 + Svelte 5)
- [x] SQLite Database integration and schema design
- [x] File System permissions and Dialog setup
- [x] Basic Library logic: Importing and DB storage
- [x] **Connect DB to UI**: Home screen now reads from real database (with MOCK fallback)

### Phase 2: UI Shell & Design System 🏗️ (IN PROGRESS)
- [x] **Sanctuary (Home)**: 3D Carousel, Intrinsic Layout, Smooth Transitions (DONE)
- [ ] **Desktop Layout**: Implement Sidebar and Main Content area
- [ ] **Global Styling**: Define color palette (Dark Mode) and typography
- [ ] **Polished Library**: High-quality Book Cards with hover effects and status indicators
- [ ] **Component Library**: Create reusable buttons, inputs, and icons

### Phase 3: The Reading Experience
- [x] **Metadata Extraction**: Parse EPUBs for real covers and titles (DONE)
- [ ] **Reader Engine Integration**: Implement `foliate-js` to render EPUBs (NEXT PRIORITY)
- [ ] **Book Viewer Route**: Create a dynamic route to open specific books

### Phase 3: Annotations & Recursive Threads 🧪
- [ ] **Highlighting**: Ability to select text and save CFI ranges
- [ ] **Annotation Sidebar**: View all highlights for a book
- [ ] **Recursive Threading**: Implement the logic to "reply" to highlights and notes
- [ ] **Thread Visualization**: UI for nesting and navigating deep conversations

### Phase 4: Local Intelligence (Future) 🧠
- [ ] Local LLM integration via Ollama or similar
- [ ] Automatic synthesis of annotation threads

---

## 🛠️ Codebase Status

### System Architecture
- **Frontend**: Svelte 5 (using Runes like `$state`, `$derived`)
- **Backend**: Tauri v2 (Rust)
- **Database**: SQLite (via `tauri-plugin-sql`)
- **Storage**: Local-first; files remain on user's disk, metadata in SQLite

### Important Files
- `src/lib/db.ts`: Database singleton and schema definitions.
- `src/lib/library.ts`: Logic for importing and retrieving books.
- `src/lib/metadata.ts`: EPUB parser (Title, Author, Cover Extraction).
- `src/lib/stores/library.ts`: Reactive store for managing book state.
- `src/routes/+page.svelte`: Main library dashboard (Sanctuary).
- `src/lib/components/Book3D.svelte`: 3D book model with spring animations.
- `src-tauri/capabilities/default.json`: Security permissions for the app.

### Known Issues / Technical Debt
- [ ] **Regex fix**: Path splitting in `library.ts` is basic; might need more robust handling for varied OS paths.
- [ ] **Performance**: 3D Texture swapping is optimized, but large libraries might need virtualization in the future.
