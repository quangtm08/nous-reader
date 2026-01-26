# Nous

**Nous** is a high-performance, local-first desktop e-book reader designed for deep reading and recursive thinking. Built with Tauri v2 and Svelte 5, it prioritizes speed, data ownership, and a premium aesthetic experience.

## 🌟 Features

- **Sanctuary**: A high-fidelity, CSS-based 3D carousel for your featured books, featuring realistic textures and organic animations.
- **Optimized Pipeline**: Rust-powered EPUB processing that extracts metadata and optimizes cover images (WebP) off the main thread.
- **Zero-Latency UI**: Native file serving via the `asset:` protocol ensures instant image loading without memory bloat.
- **Integrated Reader**: Powered by `foliate-js`, providing a world-class reading experience with CFI-based highlight support.
- **Local-First Database**: All metadata and annotations are stored in a local SQLite database for instant offline access.

## 🛠️ Tech Stack

### Frontend
- **Svelte 5**: Utilizing the latest Runes (`$state`, `$derived`, `$effect`) for efficient reactivity.
- **SvelteKit**: Routing and application framework.
- **TailwindCSS v4**: Modern, utility-first styling.
- **Lucide Svelte**: Professional iconography.

### Backend
- **Tauri v2**: Rust-based core providing native performance and security.
- **SQLite**: Local relational storage via `tauri-plugin-sql`.
- **Rust Crates**:
  - `epub`: Native EPUB parsing and metadata extraction.
  - `image`: High-performance image processing and WebP conversion.
  - `uuid`: Unique identifier generation for assets and records.

### Reading Engine
- **foliate-js**: Industry-standard EPUB rendering and navigation.
- **fflate**: High-speed compression library (required by the reader engine).

## 🚀 Future Roadmap

- **Recursive Threading**: Deep, nested conversations attached to book highlights.
- **Local Intelligence**: Integration with **Ollama** for local AI synthesis of your notes and annotations.
- **Cloud Sync**: Optional background synchronization via **Supabase**.

## 📦 Development

### Prerequisites
- [Rust](https://www.rust-lang.org/)
- [Node.js](https://nodejs.org/)

### Setup
```bash
# Install dependencies
npm install

# Run in development mode
npm run tauri dev

# Run tests
npm test

# Build for production
npm run tauri build
```

## 📜 License
This project is licensed under the ISC License.