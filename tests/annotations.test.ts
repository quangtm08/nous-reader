import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  getDb, 
  insertBookRecord, 
  insertAnnotationRecord, 
  fetchAnnotationsForBook, 
  clearLibrary 
} from '../src/lib/db';

// Mock Database State
let mockBooks: any[] = [];
let mockAnnotations: any[] = [];

// Mock the Tauri SQL Plugin
vi.mock('@tauri-apps/plugin-sql', () => {
  return {
    default: {
      load: async () => ({
        execute: async (query: string, params: any[] = []) => {
          query = query.trim().toUpperCase();
          if (query.startsWith('INSERT INTO BOOKS')) {
            mockBooks.push({ id: params[0], title: params[1], local_path: params[3] });
          } else if (query.startsWith('INSERT INTO ANNOTATIONS')) {
            mockAnnotations.push({
              id: params[0],
              book_id: params[1],
              cfi_range: params[2],
              highlighted_text: params[3],
              color: params[4]
            });
          } else if (query.startsWith('DELETE FROM BOOKS')) {
            // Simulate cascade
            const bookId = params[0];
            mockBooks = mockBooks.filter(b => b.id !== bookId);
            mockAnnotations = mockAnnotations.filter(a => a.book_id !== bookId);
          } else if (query.startsWith('DELETE FROM BOOKS') && params.length === 0) {
            mockBooks = [];
            mockAnnotations = [];
          }
          return { lastInsertId: 1, rowsAffected: 1 };
        },
        select: async (query: string, params: any[] = []) => {
          query = query.trim().toUpperCase();
          if (query.includes('FROM BOOKS WHERE ID = ?')) {
            return mockBooks.filter(b => b.id === params[0]);
          }
          if (query.includes('FROM ANNOTATIONS WHERE ID = ?')) {
            return mockAnnotations.filter(a => a.id === params[0]);
          }
          if (query.includes('FROM ANNOTATIONS WHERE BOOK_ID = ?')) {
            return mockAnnotations.filter(a => a.book_id === params[0]);
          }
          if (query.includes('FROM BOOKS WHERE LOCAL_PATH = ?')) {
             return mockBooks.filter(b => b.local_path === params[0]);
          }
          if (query.includes('SELECT VALUE FROM SCHEMA_META')) {
             return [{ value: '2' }]; // Simulate migration applied
          }
          return [];
        }
      })
    }
  };
});

describe('Annotation System', () => {
  const testBookId = 'test-book-123';
  const testBook = {
    id: testBookId,
    title: 'Test Book',
    local_path: '/tmp/test.epub'
  };

  beforeEach(async () => {
    // Reset mock state
    mockBooks = [];
    mockAnnotations = [];
    
    // We need a book to attach annotations to (FK constraint logic is manually mocked above)
    await insertBookRecord(testBook);
  });

  afterEach(async () => {
    mockBooks = [];
    mockAnnotations = [];
  });


  it('should allow creating a valid annotation', async () => {
    const annotationData = {
      book_id: testBookId,
      cfi_range: 'epubcfi(/6/4!/4/2/1:0,/4/2/1:10)',
      highlighted_text: 'Call me Ishmael',
      color: 'yellow'
    };

    const record = await insertAnnotationRecord(annotationData);

    expect(record).toBeDefined();
    expect(record.id).toBeDefined(); // UUID should be generated
    expect(record.book_id).toBe(testBookId);
    expect(record.highlighted_text).toBe('Call me Ishmael');
  });

  it('should retrieve all annotations for a specific book', async () => {
    // Insert two annotations
    await insertAnnotationRecord({
      book_id: testBookId,
      cfi_range: 'cfi-1',
      highlighted_text: 'Text 1',
      color: 'red'
    });

    await insertAnnotationRecord({
      book_id: testBookId,
      cfi_range: 'cfi-2',
      highlighted_text: 'Text 2',
      color: 'blue'
    });

    const results = await fetchAnnotationsForBook(testBookId);

    expect(results).toHaveLength(2);
    // SQLite return order isn't guaranteed without sort, but our query sorts by rowid
    expect(results[0].highlighted_text).toBe('Text 1');
    expect(results[1].highlighted_text).toBe('Text 2');
  });

  it('should enforce foreign key constraints (cascading delete)', async () => {
    // Insert annotation
    await insertAnnotationRecord({
      book_id: testBookId,
      cfi_range: 'cfi-1',
      highlighted_text: 'Will be deleted'
    });

    // Delete the parent book
    const db = await getDb();
    await db.execute('DELETE FROM books WHERE id = ?', [testBookId]);

    // Check if annotation is gone
    const annotations = await fetchAnnotationsForBook(testBookId);
    expect(annotations).toHaveLength(0);
  });
});
