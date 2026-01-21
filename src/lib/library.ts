import { open } from '@tauri-apps/plugin-dialog';
import { getDb } from './db';

export interface Book {
  id: string;
  title: string;
  author?: string;
  local_path: string;
  cover_blob?: Uint8Array;
  metadata?: string; // JSON string
}

/**
 * Opens a system dialog to select an EPUB file and adds it to the library.
 * Currently uses the filename as the title.
 * @returns {Promise<Book | null>} The imported book object or null if cancelled.
 */
export async function importBook(): Promise<Book | null> {
  const selected = await open({
    multiple: false,
    filters: [{
      name: 'EPUB',
      extensions: ['epub']
    }]
  });

  if (!selected || Array.isArray(selected)) return null;

  const path = selected;
  
  // TODO: Extract actual metadata from the EPUB file using foliate-js later.
  // For now, fall back to the filename.
  const filename = path.split(/[/\\]/).pop() || 'Unknown Book'; // Handle both / and \ paths
  const id = crypto.randomUUID();

  const db = await getDb();
  await db.execute(
    'INSERT INTO books (id, title, local_path) VALUES (?, ?, ?)',
    [id, filename, path]
  );

  return {
    id,
    title: filename,
    local_path: path
  };
}

/**
 * Retrieves all books from the library.
 * @returns {Promise<Book[]>} List of books.
 */
export async function getBooks(): Promise<Book[]> {
  const db = await getDb();
  return await db.select<Book[]>('SELECT * FROM books');
}