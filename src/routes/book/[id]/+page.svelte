<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { readFile } from '@tauri-apps/plugin-fs';
  import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-svelte';
  import type { PageData } from './$types';

  type FoliateModule = typeof import('foliate-js/view.js');
  type FoliateView = import('foliate-js/view.js').View;

  let { data }: { data: PageData } = $props();

  let container: HTMLElement;
  let view: FoliateView | null = $state(null);
  let error: string | null = $state(null);
  let isLoading = $state(true);

  function goPrev() {
    // Prefer goLeft/goRight for RTL books when available.
    // @ts-expect-error foliate-js types are partial.
    return view?.goLeft?.() ?? view?.prev();
  }

  function goNext() {
    // @ts-expect-error foliate-js types are partial.
    return view?.goRight?.() ?? view?.next();
  }

  function shouldHandleKeydown(e: KeyboardEvent) {
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return false;
    const target = e.target as HTMLElement | null;
    if (!target) return true;
    // Avoid hijacking typing in inputs/textareas.
    if (target.closest('input, textarea, [contenteditable="true"]')) return false;
    return true;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (!view || !shouldHandleKeydown(e)) return;

    switch (e.key) {
      case 'ArrowLeft':
      case 'PageUp':
        e.preventDefault();
        void goPrev();
        break;
      case 'ArrowRight':
      case 'PageDown':
      case ' ':
        e.preventDefault();
        void goNext();
        break;
      case 'Home':
        e.preventDefault();
        void view.goTo(0);
        break;
    }
  }

  async function initReader() {
    const foliate: FoliateModule = await import('foliate-js/view.js');

    const fileData = await readFile(data.book.local_path);
    const filename = data.book.local_path.split(/[\\/]/).pop() || 'book.epub';
    const file = new File([fileData], filename);

    const book = await foliate.makeBook(file);

    const nextView = new foliate.View();
    container.appendChild(nextView);

    await nextView.open(book);

    // CRITICAL: foliate-js requires `init()` to navigate and render.
    // `showTextStart` attempts to skip cover/frontmatter when possible.
    try {
      await nextView.init({ showTextStart: true });
    } catch {
      await nextView.init({ showTextStart: false });
    }

    // Improve fixed-layout (cover-heavy) rendering: keep aspect ratio and fit page.
    // `foliate-fxl` supports a `zoom` attribute.
    // @ts-expect-error foliate-js types are partial.
    if (nextView.isFixedLayout && nextView.renderer) {
      nextView.renderer.setAttribute('zoom', 'fit-page');
    }

    // Prefer focusing the internal view for keyboard navigation.
    // `foliate-paginator` exposes `focusView()`.
    // @ts-expect-error foliate-js types are partial.
    queueMicrotask(() => nextView.renderer?.focusView?.());

    view = nextView;
  }

  onMount(() => {
    const controller = new AbortController();

    window.addEventListener('keydown', handleKeydown, {
      signal: controller.signal
    });

    (async () => {
      try {
        await initReader();
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        console.error('Error initializing reader:', e);
        error = `Error opening book: ${message}`;
      } finally {
        isLoading = false;
      }
    })();

    return () => controller.abort();
  });

  onDestroy(() => {
    try {
      view?.close();
    } finally {
      view = null;
    }
  });
</script>

<div class="w-screen h-screen bg-[#1a1a1a] text-ivory flex flex-col overflow-hidden">
  <!-- Toolbar -->
  <header class="h-12 border-b border-white/10 flex items-center px-4 gap-4 bg-[#211311] shrink-0">
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
  <main class="flex-1 relative min-h-0" bind:this={container}>
    {#if isLoading}
      <div class="absolute inset-0 flex items-center justify-center bg-[#1a1a1a]">
        <div class="animate-pulse text-gold/60">Loading book...</div>
      </div>
    {/if}
    
    {#if error}
      <div class="absolute inset-0 flex items-center justify-center p-8 text-center text-red-400 bg-black/50 z-10">
        <div class="bg-[#211311] p-6 rounded-lg border border-red-900/50 shadow-xl max-w-md">
          <h2 class="text-xl font-serif mb-2 text-red-300">Could not open book</h2>
          <p class="text-sm opacity-80">{error}</p>
        </div>
      </div>
    {/if}
    <!-- Foliate View will be injected here -->
    
    <!-- Navigation buttons (visible on hover) -->
    <button 
      onclick={goPrev}
      class="nav-button left-2"
      title="Previous page (←)"
      type="button"
    >
      <ChevronLeft size={32} />
    </button>
    <button 
      onclick={goNext}
      class="nav-button right-2"
      title="Next page (→)"
      type="button"
    >
      <ChevronRight size={32} />
    </button>
  </main>
</div>

<style>
  /* Foliate view custom element needs explicit sizing */
  :global(foliate-view) {
    display: block;
    width: 100%;
    height: 100%;
    background-color: #faf9f6;
  }

  /* Ensure the renderer fills available space */
  :global(foliate-paginator),
  :global(foliate-fxl) {
    display: block;
    width: 100%;
    height: 100%;
  }

  /* Navigation buttons */
  .nav-button {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 20;
    padding: 1rem 0.5rem;
    background: rgba(0, 0, 0, 0.3);
    color: white;
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  .nav-button:hover {
    background: rgba(0, 0, 0, 0.5);
  }

  main:hover .nav-button {
    opacity: 1;
  }

  /* Also show on focus for accessibility */
  .nav-button:focus {
    opacity: 1;
    outline: 2px solid rgba(212, 180, 131, 0.5);
    outline-offset: 2px;
  }
</style>
