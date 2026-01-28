import { open } from '@tauri-apps/plugin-dialog';
import { invoke } from '@tauri-apps/api/core';
import { insertBookRecord, type BookRecord } from '../db';

interface RustBook {
  id: string;
  title: string;
  author: string | null;
  description: string | null;
  cover_path: string | null;
}

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
    throw error;
  }
}