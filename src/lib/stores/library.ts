import { writable, derived } from 'svelte/store';
import { fetchBooks, insertBookRecord, type BookRecord } from '../db';
import { importBook as tauriImportBook } from '../library';

export interface UIBook extends BookRecord {
  coverUrl: string | null;
  progress: number;
  timeRemaining: string;
}

function getMimeType(data: Uint8Array): string {
  if (data.length < 4) return 'image/jpeg';
  
  // Check magic bytes
  const header = data.slice(0, 4);
  const hex = Array.from(header).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
  
  if (hex.startsWith('FFD8FF')) return 'image/jpeg';
  if (hex.startsWith('89504E47')) return 'image/png';
  if (hex.startsWith('47494638')) return 'image/gif';
  if (hex.startsWith('424D')) return 'image/bmp';
  if (hex.startsWith('52494646') && data.slice(8, 12).toString() === 'WEBP') return 'image/webp';
  
  return 'image/jpeg'; // Default fallback
}

/**
 * Converts a cover_blob from the database to a Uint8Array.
 * tauri-plugin-sql returns BLOBs in various formats depending on version.
 * This handles all known formats.
 */
function blobToUint8Array(blob: unknown): Uint8Array | null {
  if (!blob) return null;
  
  // Debug: log the actual type and structure
  console.log('🔍 Blob type:', typeof blob, 'isArray:', Array.isArray(blob), 'constructor:', blob?.constructor?.name);
  if (typeof blob === 'string') {
    console.log('🔍 Blob string length:', blob.length, 'first 100 chars:', blob.substring(0, 100));
  } else if (Array.isArray(blob)) {
    console.log('🔍 Blob array length:', blob.length, 'first 10 elements:', blob.slice(0, 10));
  }
  
  // If it's already a Uint8Array
  if (blob instanceof Uint8Array) {
    return blob;
  }
  
  // If it's an ArrayBuffer
  if (blob instanceof ArrayBuffer) {
    return new Uint8Array(blob);
  }
  
  // If it's a number array (expected from tauri-plugin-sql)
  if (Array.isArray(blob) && blob.every(item => typeof item === 'number')) {
    return new Uint8Array(blob);
  }
  
  // If it's a string, try multiple decode strategies
  if (typeof blob === 'string') {
    // Strategy 1: It might be a JSON-stringified array like "[255,216,255,...]"
    if (blob.startsWith('[') && blob.endsWith(']')) {
      try {
        const parsed = JSON.parse(blob);
        if (Array.isArray(parsed) && parsed.every(item => typeof item === 'number')) {
          console.log('✅ Parsed JSON array from string');
          return new Uint8Array(parsed);
        }
      } catch (e) {
        console.warn('Failed to parse as JSON array:', e);
      }
    }
    
    // Strategy 2: Standard base64
    try {
      const binary = atob(blob);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      console.log('✅ Decoded as base64');
      return bytes;
    } catch (e) {
      // Not valid base64, try next strategy
    }
    
    // Strategy 3: Hex string (e.g., "ffd8ffe0...")
    if (/^[0-9a-fA-F]+$/.test(blob) && blob.length % 2 === 0) {
      try {
        const bytes = new Uint8Array(blob.length / 2);
        for (let i = 0; i < blob.length; i += 2) {
          bytes[i / 2] = parseInt(blob.substring(i, i + 2), 16);
        }
        console.log('✅ Decoded as hex string');
        return bytes;
      } catch (e) {
        console.warn('Failed to parse as hex:', e);
      }
    }
    
    console.error('❌ Could not decode string blob with any strategy');
    return null;
  }
  
  // If it's an object with numeric keys (like {0: 255, 1: 216, ...})
  if (typeof blob === 'object' && blob !== null) {
    const keys = Object.keys(blob);
    if (keys.length > 0 && keys.every(k => /^\d+$/.test(k))) {
      const maxIndex = Math.max(...keys.map(Number));
      const arr = new Uint8Array(maxIndex + 1);
      for (const key of keys) {
        arr[Number(key)] = (blob as Record<string, number>)[key];
      }
      console.log('✅ Converted object with numeric keys to Uint8Array');
      return arr;
    }
  }
  
  console.warn('Unknown blob format:', typeof blob, blob);
  return null;
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
            const data = blobToUint8Array(record.cover_blob);
            if (data && data.length > 0) {
              const type = getMimeType(data);
              console.log(`🖼️ Generating URL for book ${record.id}: ${type}, Size: ${data.length}, First bytes: ${Array.from(data.slice(0, 8)).map(b => b.toString(16).padStart(2, '0')).join(' ')}`);
              
              const blob = new Blob([data], { type });
              coverUrl = URL.createObjectURL(blob);
            } else {
              console.warn(`⚠️ Failed to convert cover blob for book ${record.title}`);
            }
          } else {
            console.log(`⚠️ No cover blob for book ${record.title}`);
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
