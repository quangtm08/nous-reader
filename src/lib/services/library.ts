import { open } from '@tauri-apps/plugin-dialog';
import { invoke } from '@tauri-apps/api/core';
import { insertBookRecord, type BookRecord, fetchBooks, updateBookCover } from '../db';
import { blobToUint8Array } from '../utils';

interface RustBook {
  id: string;
  title: string;
  author: string | null;
  description: string | null;
  cover_path: string | null;
}

/**
 * Checks for books with legacy blob covers and migrates them to the filesystem.
 * This should be called on app startup.
 */
export async function checkAndMigrateLegacyCovers(): Promise<void> {
  try {
    const books = await fetchBooks();
    const legacyBooks = books.filter(b => b.cover_blob && !b.cover_path);
    
    if (legacyBooks.length === 0) return;
    
    console.log(`🔄 Migrating ${legacyBooks.length} legacy book covers...`);
    
    for (const book of legacyBooks) {
      try {
        const uint8Array = blobToUint8Array(book.cover_blob);
        if (!uint8Array) {
          console.warn(`Skipping migration for ${book.title}: Invalid blob data`);
          continue;
        }
        
        const coverPath = await invoke<string>('process_cover_blob', {
          id: book.id,
          blob: Array.from(uint8Array)
        });
        
        await updateBookCover(book.id, coverPath);
        console.log(`✅ Migrated cover for: ${book.title}`);
      } catch (e) {
        console.error(`❌ Failed to migrate cover for ${book.title}:`, e);
      }
    }
    
    console.log('✨ Legacy cover migration complete.');
  } catch (e) {
    console.error('Migration check failed:', e);
  }
}

/**
 * Opens a system dialog to select an EPUB file and adds it to the library.
 * Offloads parsing and processing to the Rust backend.
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
    // Invoke Rust command to parse EPUB and process cover
    console.log('📚 Invoking import_book for:', path);
    const rustBook = await invoke<RustBook>('import_book', { filePath: path });
    console.log('✅ Rust processing complete:', rustBook);

    return await insertBookRecord({
      id: rustBook.id,
      title: rustBook.title,
      author: rustBook.author,
      local_path: path,
      cover_path: rustBook.cover_path,
      metadata: JSON.stringify({ description: rustBook.description })
    });
    
  } catch (error) {
    console.error('Failed to import book:', error);
    // Fallback: insert just the filename if Rust parsing fails
    // This allows the user to still open the book even if metadata extraction failed
    const filename = path.split(/[/\\]/).pop()?.replace(/\.epub$/i, '') || 'Unknown Book';
    return await insertBookRecord({
      title: filename,
      local_path: path
    });
  }
}