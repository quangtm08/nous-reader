import { open } from '@tauri-apps/plugin-dialog';
import { readFile } from '@tauri-apps/plugin-fs';
import { insertBookRecord, type BookRecord } from './db';
import { parseEpub } from './metadata';

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

  try {
    // Read the file from disk
    const fileData = await readFile(path);
    
    // Parse metadata
    const metadata = await parseEpub(fileData);
    
    return await insertBookRecord({
      title: metadata.title,
      author: metadata.author,
      local_path: path,
      cover_blob: metadata.coverBlob ? Array.from(metadata.coverBlob) : null,
      metadata: JSON.stringify({ description: metadata.description })
    });
    
  } catch (error) {
    console.error('Failed to import book:', error);
    // Fallback: insert just the filename if parsing fails
    const filename = path.split(/[/\\]/).pop()?.replace(/\.epub$/i, '') || 'Unknown Book';
    return await insertBookRecord({
      title: filename,
      local_path: path
    });
  }
}

/**
 * Retrieves all books from the library.
 * MOVED: Use fetchBooks() from db.ts directly.
 */