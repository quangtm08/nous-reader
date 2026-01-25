import { writable, derived } from 'svelte/store';
import { fetchBooks, insertBookRecord, type BookRecord } from '../db';
import { importBook as tauriImportBook } from '../library';

export interface UIBook extends BookRecord {
  coverUrl: string | null;
  progress: number;
  timeRemaining: string;
}

function createLibraryStore() {
  const { subscribe, set, update } = writable<{
    books: UIBook[];
    isLoading: boolean;
    error: string | null;
  }>({
    books: [],
    isLoading: false,
    error: null
  });

  return {
    subscribe,
    loadLibrary: async () => {
      update(s => ({ ...s, isLoading: true, error: null }));
      try {
        const records = await fetchBooks();
        console.log('📚 Library loaded from DB:', records); // Debug log
        
        const uiBooks: UIBook[] = records.map(record => {
          let coverUrl: string | null = null;
          if (record.cover_blob) {
            const blob = new Blob([new Uint8Array(record.cover_blob)], { type: 'image/jpeg' });
            coverUrl = URL.createObjectURL(blob);
          }
          
          return {
            ...record,
            coverUrl,
            progress: 0, // TODO: Persistent progress
            timeRemaining: 'Unknown'
          };
        });

        set({ books: uiBooks, isLoading: false, error: null });
      } catch (e) {
        console.error('❌ Library load failed:', e); // Debug log
        update(s => ({ ...s, isLoading: false, error: e instanceof Error ? e.message : 'Unknown error' }));
      }
    },
    addBook: async () => {
      try {
        console.log('➕ Import initiated...'); // Debug log
        const imported = await tauriImportBook();
        console.log('✅ Book imported:', imported); // Debug log
        if (imported) {
          // The importBook in library.ts already inserts into DB,
          // but we reload to get the consistent UI shape.
          await libraryStore.loadLibrary();
        }
      } catch (e) {
        console.error('❌ Import failed:', e); // Debug log
        update(s => ({ ...s, error: e instanceof Error ? e.message : 'Import failed' }));
      }
    },
    removeBook: async (id: string) => {
      try {
        const { deleteBook } = await import('../db');
        await deleteBook(id);
        await libraryStore.loadLibrary();
      } catch (e) {
        console.error('❌ Delete failed:', e);
        update(s => ({ ...s, error: e instanceof Error ? e.message : 'Delete failed' }));
      }
    }
  };
}

export const libraryStore = createLibraryStore();
