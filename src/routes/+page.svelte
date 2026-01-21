<script lang="ts">
  import { importBook, getBooks, type Book } from '$lib/library';
  import { onMount } from 'svelte';

  let books = $state<Book[]>([]);
  let error = $state<string | null>(null);
  let loading = $state(false);

  async function handleImport() {
    try {
      loading = true;
      error = null;
      const book = await importBook();
      if (book) {
        // Refresh list to ensure sync with DB
        books = await getBooks();
      }
    } catch (e: any) {
      console.error('Import failed:', e);
      error = `Import failed: ${e.message || 'Unknown error'}`;
    } finally {
      loading = false;
    }
  }

  onMount(async () => {
    try {
      books = await getBooks();
    } catch (e: any) {
      console.error('Library load failed:', e);
      error = `Failed to load library: ${e.message}`;
    }
  });
</script>

<main class="container">
  <header>
    <h1>Nous Library</h1>
    <button onclick={handleImport} disabled={loading} class="primary-btn">
      {loading ? 'Importing...' : 'Import EPUB'}
    </button>
  </header>

  {#if error}
    <div class="error-banner">{error}</div>
  {/if}

  <div class="book-grid">
    {#each books as book (book.id)}
      <div class="book-card">
        <div class="book-cover-placeholder"></div>
        <div class="book-info">
          <h3>{book.title}</h3>
          <p class="path" title={book.local_path}>{book.local_path}</p>
        </div>
      </div>
    {:else}
      <div class="empty-state">
        <p>Your library is empty.</p>
        <p>Click "Import EPUB" to get started.</p>
      </div>
    {/each}
  </div>
</main>

<style>
  .container {
    padding: 2rem;
    max-width: 900px;
    margin: 0 auto;
    font-family: system-ui, sans-serif;
  }

  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }

  h1 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
  }

  .primary-btn {
    padding: 0.6rem 1.2rem;
    border-radius: 6px;
    border: none;
    background: #3b82f6;
    color: white;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
  }
  .primary-btn:hover {
    background: #2563eb;
  }
  .primary-btn:disabled {
    background: #4b5563;
    cursor: wait;
  }

  .error-banner {
    background: #fee2e2;
    color: #991b1b;
    padding: 1rem;
    border-radius: 6px;
    margin-bottom: 1.5rem;
    border: 1px solid #fecaca;
  }

  .book-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1.5rem;
  }

  .book-card {
    background: #1f2937;
    border: 1px solid #374151;
    border-radius: 8px;
    overflow: hidden;
    transition: transform 0.2s;
  }
  .book-card:hover {
    transform: translateY(-2px);
    border-color: #4b5563;
  }

  .book-cover-placeholder {
    height: 140px;
    background: #374151;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .book-info {
    padding: 1rem;
  }

  h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1rem;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .path {
    margin: 0;
    font-size: 0.75rem;
    color: #9ca3af;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .empty-state {
    grid-column: 1 / -1;
    text-align: center;
    padding: 4rem;
    color: #6b7280;
    border: 2px dashed #374151;
    border-radius: 8px;
  }
</style>