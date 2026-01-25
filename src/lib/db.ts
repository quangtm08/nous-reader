import Database from '@tauri-apps/plugin-sql';

export type SQLiteDatabase = Database;

export interface BookRecord {
  id: string;
  title: string;
  author: string | null;
  local_path: string;
  /** 
   * BLOB from SQLite - tauri-plugin-sql returns this as number[] (byte array).
   * Use blobToUint8Array() in stores/library.ts to safely convert.
   */
  cover_blob: number[] | null;
  metadata: string | null;
  created_at: string;
}

export interface BookInsert {
  id?: string;
  title: string;
  author?: string | null;
  local_path: string;
  cover_blob?: number[] | null;
  metadata?: string | null;
}

export interface AnnotationRecord {
  id: string;
  book_id: string;
  cfi_range: string;
  highlighted_text: string;
  color: string | null;
}

export interface AnnotationInsert {
  id?: string;
  book_id: string;
  cfi_range: string;
  highlighted_text: string;
  color?: string | null;
}

export interface ThreadRecord {
  id: string;
  parent_id: string | null;
  annotation_id: string;
  content: string;
  role: 'User' | 'System' | 'Assistant';
  is_synthesis: 0 | 1;
  created_at: string;
}

export interface ThreadInsert {
  id?: string;
  parent_id?: string | null;
  annotation_id: string;
  content: string;
  role: ThreadRecord['role'];
  is_synthesis?: boolean;
}

type Migration = {
  version: number;
  description: string;
  statements: string[];
};

const SCHEMA_VERSION = 1;

const MIGRATIONS: Migration[] = [
  {
    version: 1,
    description: 'Initial books + annotations + threads tables',
    statements: [
      `CREATE TABLE IF NOT EXISTS schema_meta (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );`,
      `CREATE TABLE IF NOT EXISTS books (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        author TEXT,
        local_path TEXT NOT NULL UNIQUE,
        cover_blob BLOB,
        metadata TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );`,
      `CREATE TABLE IF NOT EXISTS annotations (
        id TEXT PRIMARY KEY,
        book_id TEXT NOT NULL,
        cfi_range TEXT NOT NULL,
        highlighted_text TEXT NOT NULL,
        color TEXT,
        FOREIGN KEY (book_id) REFERENCES books (id) ON DELETE CASCADE
      );`,
      `CREATE TABLE IF NOT EXISTS threads (
        id TEXT PRIMARY KEY,
        parent_id TEXT,
        annotation_id TEXT NOT NULL,
        content TEXT NOT NULL,
        role TEXT CHECK(role IN ('User', 'System', 'Assistant')) NOT NULL,
        is_synthesis BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_id) REFERENCES threads (id) ON DELETE CASCADE,
        FOREIGN KEY (annotation_id) REFERENCES annotations (id) ON DELETE CASCADE
      );`,
      `CREATE INDEX IF NOT EXISTS idx_annotations_book ON annotations(book_id);`,
      `CREATE INDEX IF NOT EXISTS idx_threads_annotation ON threads(annotation_id);`
    ]
  }
];

// ... (rest of file)

let dbInstance: SQLiteDatabase | null = null;
let initPromise: Promise<SQLiteDatabase> | null = null;

export async function getDb(): Promise<SQLiteDatabase> {
  if (dbInstance) return dbInstance;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      const instance = await Database.load('sqlite:nous.db');
      await instance.execute('PRAGMA foreign_keys = ON;');
      await applyMigrations(instance);
      dbInstance = instance;
      return instance;
    } catch (error) {
      console.error('Database initialization failed:', error);
      initPromise = null;
      throw error;
    }
  })();

  return initPromise;
}

async function applyMigrations(db: SQLiteDatabase) {
  const metaTableStatement = `CREATE TABLE IF NOT EXISTS schema_meta (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );`;
  await db.execute(metaTableStatement);

  const currentRow = await db.select<{ value: string }[]>(
    `SELECT value FROM schema_meta WHERE key = 'schema_version'`
  );
  let currentVersion = currentRow[0]?.value ? Number(currentRow[0].value) : 0;

  const sortedMigrations = [...MIGRATIONS].sort((a, b) => a.version - b.version);

  for (const migration of sortedMigrations) {
    if (migration.version > currentVersion) {
      for (const statement of migration.statements) {
        await db.execute(statement);
      }
      currentVersion = migration.version;
    }
  }

  await db.execute(
    `INSERT OR REPLACE INTO schema_meta (key, value) VALUES ('schema_version', ?)`,
    [String(currentVersion)]
  );
}

export async function fetchBooks(): Promise<BookRecord[]> {
  const db = await getDb();
  return db.select<BookRecord[]>(
    `SELECT * FROM books ORDER BY created_at DESC`
  );
}

export async function fetchBookById(id: string): Promise<BookRecord | null> {
  const db = await getDb();
  const rows = await db.select<BookRecord[]>(
    `SELECT * FROM books WHERE id = ? LIMIT 1`,
    [id]
  );
  return rows[0] ?? null;
}

export async function fetchBookByPath(path: string): Promise<BookRecord | null> {
  const db = await getDb();
  const rows = await db.select<BookRecord[]>(
    `SELECT * FROM books WHERE local_path = ? LIMIT 1`,
    [path]
  );
  return rows[0] ?? null;
}

export async function insertBookRecord(input: BookInsert): Promise<BookRecord> {
  const db = await getDb();
  const id = input.id ?? crypto.randomUUID();
  const payload: Required<BookInsert> = {
    id,
    title: input.title.trim(),
    author: input.author?.trim() ?? null,
    local_path: input.local_path,
    cover_blob: input.cover_blob ?? null,
    metadata: input.metadata ?? null
  };

  await db.execute(
    `INSERT INTO books (id, title, author, local_path, cover_blob, metadata)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      payload.id,
      payload.title,
      payload.author,
      payload.local_path,
      payload.cover_blob,
      payload.metadata
    ]
  );

  const inserted = await fetchBookById(id);
  if (!inserted) {
    throw new Error('Failed to retrieve newly inserted book');
  }
  return inserted;
}

export async function insertAnnotationRecord(input: AnnotationInsert): Promise<AnnotationRecord> {
  const db = await getDb();
  const id = input.id ?? crypto.randomUUID();
  const payload = {
    id,
    book_id: input.book_id,
    cfi_range: input.cfi_range,
    highlighted_text: input.highlighted_text,
    color: input.color ?? null
  };

  await db.execute(
    `INSERT INTO annotations (id, book_id, cfi_range, highlighted_text, color)
     VALUES (?, ?, ?, ?, ?)`,
    [payload.id, payload.book_id, payload.cfi_range, payload.highlighted_text, payload.color]
  );

  const rows = await db.select<AnnotationRecord[]>(
    `SELECT * FROM annotations WHERE id = ? LIMIT 1`,
    [payload.id]
  );
  return rows[0];
}

export async function insertThreadRecord(input: ThreadInsert): Promise<ThreadRecord> {
  const db = await getDb();
  const id = input.id ?? crypto.randomUUID();
  const payload = {
    id,
    parent_id: input.parent_id ?? null,
    annotation_id: input.annotation_id,
    content: input.content,
    role: input.role,
    is_synthesis: input.is_synthesis ? 1 : 0
  };

  await db.execute(
    `INSERT INTO threads (id, parent_id, annotation_id, content, role, is_synthesis)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      payload.id,
      payload.parent_id,
      payload.annotation_id,
      payload.content,
      payload.role,
      payload.is_synthesis
    ]
  );

  const rows = await db.select<ThreadRecord[]>(
    `SELECT * FROM threads WHERE id = ? LIMIT 1`,
    [payload.id]
  );
  return rows[0];
}

export async function fetchAnnotationsForBook(bookId: string): Promise<AnnotationRecord[]> {
  const db = await getDb();
  return db.select<AnnotationRecord[]>(
    `SELECT * FROM annotations WHERE book_id = ? ORDER BY rowid ASC`,
    [bookId]
  );
}

export async function fetchThreadsForAnnotation(annotationId: string): Promise<ThreadRecord[]> {
  const db = await getDb();
  return db.select<ThreadRecord[]>(
    `SELECT * FROM threads WHERE annotation_id = ? ORDER BY created_at ASC`,
    [annotationId]
  );
}

export async function deleteBook(id: string): Promise<void> {
  const db = await getDb();
  await db.execute(`DELETE FROM books WHERE id = ?`, [id]);
}
