import { describe, it, expect, vi, beforeEach } from 'vitest';
import { get } from 'svelte/store';

// Mocks must be defined before imports
vi.mock('@tauri-apps/plugin-dialog', () => ({
  open: vi.fn()
}));

vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
  convertFileSrc: vi.fn((path) => `asset://${path}`)
}));

vi.mock('../src/lib/db', () => ({
  insertBookRecord: vi.fn(),
  fetchBooks: vi.fn(),
  deleteBook: vi.fn()
}));

// Import modules after mocking
import { importBook } from '../src/lib/services/library';
import { libraryStore } from '../src/lib/stores/library';
import * as dialog from '@tauri-apps/plugin-dialog';
import * as tauri from '@tauri-apps/api/core';
import * as db from '../src/lib/db';

describe('Library Service - importBook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully import a book', async () => {
    // Setup Mocks
    const mockPath = '/path/to/book.epub';
    const mockRustBook = {
      id: '123-uuid',
      title: 'Test Book',
      author: 'Test Author',
      description: 'A test description',
      cover_path: '/path/to/cover.webp'
    };

    vi.mocked(dialog.open).mockResolvedValue(mockPath);
    vi.mocked(tauri.invoke).mockResolvedValue(mockRustBook);
    vi.mocked(db.insertBookRecord).mockResolvedValue({
      ...mockRustBook,
      local_path: mockPath,
      cover_blob: null,
      metadata: JSON.stringify({ description: mockRustBook.description }),
      created_at: new Date().toISOString()
    });

    // Execute
    const result = await importBook();

    // Verify
    expect(dialog.open).toHaveBeenCalledWith({
      multiple: false,
      filters: [{ name: 'EPUB', extensions: ['epub'] }]
    });

    expect(tauri.invoke).toHaveBeenCalledWith('import_book', { filePath: mockPath });

    expect(db.insertBookRecord).toHaveBeenCalledWith({
      id: mockRustBook.id,
      title: mockRustBook.title,
      author: mockRustBook.author,
      local_path: mockPath,
      cover_path: mockRustBook.cover_path,
      metadata: expect.stringContaining('A test description')
    });

    expect(result).toBeDefined();
    expect(result?.title).toBe('Test Book');
  });

  it('should return null if dialog is cancelled', async () => {
    vi.mocked(dialog.open).mockResolvedValue(null);

    const result = await importBook();

    expect(result).toBeNull();
    expect(tauri.invoke).not.toHaveBeenCalled();
  });

  it('should handle import errors gracefully', async () => {
    const mockPath = '/path/to/broken.epub';
    vi.mocked(dialog.open).mockResolvedValue(mockPath);
    vi.mocked(tauri.invoke).mockRejectedValue(new Error('Rust parsing failed'));
    
    // It should fallback to filename
    vi.mocked(db.insertBookRecord).mockResolvedValue({
      id: 'fallback-id',
      title: 'broken',
      author: null,
      local_path: mockPath,
      cover_path: null,
      cover_blob: null,
      metadata: null,
      created_at: new Date().toISOString()
    });

    const result = await importBook();

    expect(tauri.invoke).toHaveBeenCalled();
    expect(db.insertBookRecord).toHaveBeenCalledWith({
      title: 'broken',
      local_path: mockPath
    });
    expect(result?.title).toBe('broken');
  });
});

describe('Library Store', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store state logic if possible, but here we just test actions
  });

  it('should load books and process cover paths', async () => {
    const mockBooks = [
      {
        id: '1',
        title: 'Book 1',
        author: 'Author 1',
        local_path: '/p/1',
        cover_path: '/app/data/covers/1.webp',
        cover_blob: null,
        metadata: null,
        created_at: '2023-01-01'
      },
      {
        id: '2',
        title: 'Book 2',
        author: 'Author 2',
        local_path: '/p/2',
        cover_path: null,
        cover_blob: null, // Legacy case without blob
        metadata: null,
        created_at: '2023-01-02'
      }
    ];

    vi.mocked(db.fetchBooks).mockResolvedValue(mockBooks);

    await libraryStore.loadLibrary();

    const state = get(libraryStore);
    expect(state.isLoading).toBe(false);
    expect(state.books).toHaveLength(2);

    // Verify coverUrl generation via convertFileSrc mock
    expect(state.books[0].coverUrl).toBe('asset:///app/data/covers/1.webp');
    expect(state.books[1].coverUrl).toBeNull();
  });
});
