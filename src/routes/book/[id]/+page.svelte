<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import { readFile } from '@tauri-apps/plugin-fs';
  import { ArrowLeft } from 'lucide-svelte';
  import type { PageData } from './$types';

  // We need to import the view module to register the custom element.
  // Trying standard import path. If this fails, we might need to adjust based on the package structure.
  // Note: The npm package for foliate-js might not export 'view.js' directly.
  // If this causes issues, we will need to investigate the node_modules structure or use the classes directly.
  // For now, assuming we can access it or we need to roll our own simple renderer using the library.
  
  // Attempting to import the custom element definition if available
  // import 'foliate-js/view.js'; 
  
  // Since we are uncertain about the export, let's try a dynamic import in onMount or just rely on the fact 
  // that we might need to instantiate the view manually if the custom element isn't registered.
  
  let { data }: { data: PageData } = $props();

  let container: HTMLElement;
  let view: any; // Type as any for now since we don't have types for foliate-js

  onMount(async () => {
    try {
      // Dynamic import to handle potential path issues gracefully during dev
      // In a real scenario, we'd want a static import.
      // Checking if we can import the view. 
      // If the npm package is just the core, we might need to implement a basic viewer using the 'Book' class.
      const foliate = await import('foliate-js');
      
      // Load the file
      const fileData = await readFile(data.book.local_path);
      
      // Initialize the book
      // @ts-ignore - foliate types are missing
      const book = await foliate.makeBook(new Blob([fileData]));
      
      // Create a render target
      // If we don't have the <foliate-view> custom element, we might need to use the renderer directly.
      // Let's try to use the 'render' method if available or 'makeReader'
      
      // NOTE: foliate-js documentation (what exists of it) implies using the custom element or the View class.
      // Let's assume for a moment we can use the low-level rendering if the custom element isn't there.
      
      // However, the cleanest way if the custom element isn't available is to construct the View.
      // Let's look for a View class in the exports.
      
      // For this first pass, I'll log the exports to the console to help debug in the browser
      console.log('Foliate exports:', foliate);

      // Basic render attempt:
      // If foliate.View exists:
      if (foliate.View) {
          view = new foliate.View(book);
          container.appendChild(view.element);
      } else {
          // Fallback: Just display a message that we loaded the book but need to figure out rendering
          // or try to render a section.
          const section = book.sections[0];
          if (section) {
              const content = await section.load();
              // This is raw text/html, might be messy without styles
              // container.innerHTML = content;
          }
      }

    } catch (e) {
      console.error('Error initializing reader:', e);
    }
  });

  onDestroy(() => {
    if (view && view.destroy) {
      view.destroy();
    }
  });
</script>

<div class="w-screen h-screen bg-[#1a1a1a] text-ivory flex flex-col overflow-hidden">
  <!-- Toolbar -->
  <header class="h-14 border-b border-white/10 flex items-center px-4 gap-4 bg-[#211311]">
    <button 
      onclick={() => goto('/')}
      class="p-2 hover:bg-white/10 rounded-full transition-colors"
      title="Back to Library"
    >
      <ArrowLeft size={20} />
    </button>
    <h1 class="font-serif text-lg truncate flex-1">{data.book.title}</h1>
  </header>

  <!-- Reader Container -->
  <main class="flex-1 relative overflow-hidden" bind:this={container}>
    <!-- Foliate View will be injected here -->
  </main>
</div>

<style>
  /* Ensure the container allows the reader to fill it */
  main {
    width: 100%;
    height: 100%;
  }
</style>
