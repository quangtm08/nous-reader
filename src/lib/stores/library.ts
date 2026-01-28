import { writable } from 'svelte/store';
import { fetchBooks } from '../db';
import { importBook as tauriImportBook } from '../services/library';
import { convertFileSrc } from '@tauri-apps/api/core';

export interface UIBook {
  id: string;
  title: string;
  author: string | null;
  coverUrl: string | null;
  progress: number;
  timeRemaining: string;
  local_path: string;
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
        console.log('📚 Library loaded from DB:', records.length, 'books');
        
        const uiBooks = records.map((record) => {
          let coverUrl: string | null = null;
          
          if (record.cover_path) {
            coverUrl = convertFileSrc(record.cover_path);
          }

          return {
            id: record.id,
            title: record.title,
            author: record.author,
            local_path: record.local_path,
            coverUrl,
            progress: 0,
            timeRemaining: 'Unknown'
          };
        });

        set({ books: uiBooks, isLoading: false, error: null });
      } catch (e) {
        console.error('❌ Library load failed:', e);
        update(s => ({ ...s, isLoading: false, error: e instanceof Error ? e.message : 'Unknown error' }));
      }
    },
    addBook: async () => {
      try {
        const imported = await tauriImportBook();
        if (imported) {
          await libraryStore.loadLibrary();
        }
      } catch (e) {
        console.error('❌ Import failed:', e);
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
    },
    clearLibrary: async () => {
      try {
        const { clearLibrary } = await import('../db');
        await clearLibrary();
        await libraryStore.loadLibrary();
      } catch (e) {
        console.error('❌ Clear failed:', e);
        update(s => ({ ...s, error: e instanceof Error ? e.message : 'Clear failed' }));
      }
    }
  };
}

export const libraryStore = createLibraryStore();
