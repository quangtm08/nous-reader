import Database from '@tauri-apps/plugin-sql';

let dbInstance: Database | null = null;
let initPromise: Promise<Database> | null = null;

/**
 * Returns a singleton instance of the SQLite database.
 * Initializes the schema (tables) on the first call.
 */
export async function getDb(): Promise<Database> {
  // Return cached instance if available
  if (dbInstance) return dbInstance;
  
  // Return existing initialization promise if in progress to prevent race conditions
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      const instance = await Database.load('sqlite:nous.db');
      
      // 1. Enable foreign keys enforcement
      await instance.execute('PRAGMA foreign_keys = ON;');

      // 2. Define Schema
      // Books: Stores metadata and file paths
      await instance.execute(`
        CREATE TABLE IF NOT EXISTS books (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          author TEXT,
          local_path TEXT NOT NULL,
          cover_blob BLOB,
          metadata TEXT
        );
      `);

      // Annotations: Highlights and anchors for threads
      await instance.execute(`
        CREATE TABLE IF NOT EXISTS annotations (
          id TEXT PRIMARY KEY,
          book_id TEXT NOT NULL,
          cfi_range TEXT NOT NULL,
          highlighted_text TEXT NOT NULL,
          color TEXT,
          FOREIGN KEY (book_id) REFERENCES books (id) ON DELETE CASCADE
        );
      `);

      // Threads: Recursive conversation nodes
      await instance.execute(`
        CREATE TABLE IF NOT EXISTS threads (
          id TEXT PRIMARY KEY,
          parent_id TEXT,
          annotation_id TEXT NOT NULL,
          content TEXT NOT NULL,
          role TEXT CHECK(role IN ('User', 'System', 'Assistant')) NOT NULL,
          is_synthesis BOOLEAN DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (parent_id) REFERENCES threads (id) ON DELETE CASCADE,
          FOREIGN KEY (annotation_id) REFERENCES annotations (id) ON DELETE CASCADE
        );
      `);

      dbInstance = instance;
      console.log('Database initialized successfully');
      return instance;
    } catch (error) {
      console.error('Database initialization failed:', error);
      initPromise = null; // Reset promise on failure so we can retry
      throw error;
    }
  })();

  return initPromise;
}