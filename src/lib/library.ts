import { open } from '@tauri-apps/plugin-dialog';
import { insertBookRecord, type BookRecord } from './db';

/**
 * Opens a system dialog to select an EPUB file and adds it to the library.
 * @returns {Promise<BookRecord | null>} The imported book object or null if cancelled.
 */
export async function importBook(): Promise<BookRecord | null> {
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
  const filename = path.split(/[/\\]/).pop()?.replace(/\.epub$/i, '') || 'Unknown Book';
  
  return await insertBookRecord({
    title: filename,
    local_path: path
  });
}

/**
 * Retrieves all books from the library.
 * MOVED: Use fetchBooks() from db.ts directly.
 */