import { writable } from 'svelte/store';
import { fetchBooks } from '../db';
import { importBook as tauriImportBook, checkAndMigrateLegacyCovers } from '../services/library';
import { convertFileSrc } from '@tauri-apps/api/core';
import { blobToUint8Array } from '../utils';

export interface UIBook {
  id: string;
  title: string;
  author: string | null;
  coverUrl: string | null;
  progress: number;
  timeRemaining: string;
  local_path: string;
}

function getMimeType(data: Uint8Array): string {
  if (data.length < 4) return 'image/jpeg';
  const header = data.slice(0, 4);
  const hex = Array.from(header).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
  if (hex.startsWith('FFD8FF')) return 'image/jpeg';
  if (hex.startsWith('89504E47')) return 'image/png';
  if (hex.startsWith('47494638')) return 'image/gif';
  if (hex.startsWith('424D')) return 'image/bmp';
  if (hex.startsWith('52494646') && data.slice(8, 12).toString() === 'WEBP') return 'image/webp';
  return 'image/jpeg';
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
          else if (record.cover_blob) {
            try {
              const data = blobToUint8Array(record.cover_blob);
              if (data && data.length > 0) {
                const type = getMimeType(data);
                const blob = new Blob([data], { type });
                coverUrl = URL.createObjectURL(blob);
              }
            } catch (e) {
              console.warn('Legacy blob conversion failed:', e);
            }
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
        
        checkAndMigrateLegacyCovers();
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
