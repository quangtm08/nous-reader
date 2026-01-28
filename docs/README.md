# Nous - Documentation

Welcome to the documentation for **Nous**, a high-performance desktop e-book reader.

## 📚 Table of Contents

### 🏛️ Architecture
- [**System Overview**](architecture/overview.md) - Tech stack, file structure, and core workflows
- [**Technical Requirements**](architecture/technical-requirements.md) - Functional requirements and implementation status

### 🎨 Design Guides
- [**General UI**](guides/GENERAL.md) - Design principles and aesthetics
- [**Sanctuary UI**](guides/SANCTUARY.md) - Home/Library view specifics
- [**Book 3D Stability**](ui/3d_stability.md) - 3D carousel implementation notes

### 📅 Current Status
- [**Tasks & Roadmap**](tasks.md) - Phase tracking and next steps

### 📋 Implementation Plans
- See [plans/README.md](plans/README.md) for comprehensive plan tracking

### 🗄️ Reference
- [**Database Guide**](guides/database.md) - Schema, migrations, and query helpers

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run SvelteKit in dev mode
npm run dev

# Run Tauri app in dev mode
npm run tauri dev
```

## Current State (January 2026)

**Phase 3 Complete:** Core highlighting and annotation persistence working
- Reader engine integrated with `foliate-js`
- Text selection and CFI-based highlighting
- Annotation persistence to SQLite
- Focus handling for keyboard navigation
- Performance optimizations (Rust-based EPUB processing, WebP covers)

**Next Phase (3b):** Annotation Sidebar
- List view of all highlights for a book
- Jump to highlight locations
- Delete highlights

See [tasks.md](tasks.md) for full roadmap.