<script lang="ts">
  import { onMount } from 'svelte';
  import { Menu, Search, Plus } from 'lucide-svelte';
  import { isSidebarOpen } from '$lib/stores/ui';
  import { libraryStore } from '$lib/stores/library';
  import Book3D from '$lib/components/Book3D.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import { goto } from '$app/navigation';

  let books = $derived($libraryStore.books);

  onMount(() => {
    libraryStore.loadLibrary();
  });

  async function handleImport() {
    await libraryStore.addBook();
  }
</script>

<div class="min-h-screen flex flex-col p-8 md:p-12 max-w-[1600px] mx-auto relative">
  <!-- Header -->
  <header class="flex justify-between items-center mb-12 z-30 relative">
    <div class="flex items-center gap-6">
      <Button 
        variant="icon" 
        size="icon"
        onclick={() => isSidebarOpen.set(true)}
      >
        <Menu size={28} strokeWidth={1.5} />
      </Button>
      <h1 class="text-3xl font-serif font-light text-ivory/90 tracking-wide">
        Library
      </h1>
    </div>

    <div class="flex items-center gap-4">
      <Button 
        variant="primary" 
        size="md"
        onclick={handleImport}
        class="gap-2"
      >
        <Plus size={20} />
        <span>Import</span>
      </Button>
      <Button variant="icon" size="icon">
        <Search size={28} strokeWidth={1.5} />
      </Button>
    </div>
  </header>

  <!-- Books Grid -->
  <main class="flex-1">
    {#if books.length === 0}
      <div class="h-[60vh] flex flex-col items-center justify-center text-ivory/40 space-y-4">
        <div class="p-8 rounded-full bg-white/5">
          <Plus size={48} strokeWidth={1} />
        </div>
        <p class="text-lg font-serif italic">Your library is empty</p>
        <Button 
          variant="ghost" 
          onclick={handleImport}
          class="text-accent hover:text-accent/80 tracking-widest uppercase text-xs"
        >
          Import your first book
        </Button>
      </div>
    {:else}
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 gap-x-1 gap-y-6">
        {#each books as book}
          <div class="flex flex-col items-center group">
            <button 
              onclick={() => goto(`/book/${book.id}`)}
              class="relative transition-transform duration-500 transform-gpu cursor-pointer active:scale-95"
            >
              <Book3D 
                coverUrl={book.coverUrl} 
                title={book.title} 
                rotated={false}
                width={200}
                height={300}
              />
            </button>
            <div class="mt-5 text-center w-full px-2">
              <h3 class="text-ivory/90 font-serif text-sm font-medium line-clamp-2 mb-2 group-hover:text-white transition-colors duration-300">
                {book.title}
              </h3>
              <p class="text-ivory/40 text-[10px] uppercase tracking-[0.2em] truncate">
                {book.author || 'Unknown Author'}
              </p>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </main>
</div>

<style>
  /* We can add specific library styles here if needed */
</style>
