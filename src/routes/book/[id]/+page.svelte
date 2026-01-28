<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { goto } from '$app/navigation';
  import { readFile } from '@tauri-apps/plugin-fs';
  import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-svelte';
  import { fetchAnnotationsForBook, insertAnnotationRecord } from '$lib/db';
  import type { PageData } from './$types';

  type FoliateModule = typeof import('foliate-js/view.js');
  type FoliateView = import('foliate-js/view.js').View;

  let { data }: { data: PageData } = $props();

  let container: HTMLElement;
  let view: FoliateView | null = $state(null);
  let error: string | null = $state(null);
  let isLoading = $state(true);

  // Selection UI state
  let selectionMenu = $state<{ x: number, y: number, cfi: string, text: string } | null>(null);

  // UI State
  let showToolbar = $state(false);
  let showLeftArrow = $state(false);
  let showRightArrow = $state(false);
  let leftTimeout: ReturnType<typeof setTimeout>;
  let rightTimeout: ReturnType<typeof setTimeout>;

  function handleLeftEnter() {
    clearTimeout(leftTimeout);
    showLeftArrow = true;
  }

  function handleLeftLeave() {
    leftTimeout = setTimeout(() => {
      showLeftArrow = false;
    }, 2500);
  }

  function handleRightEnter() {
    clearTimeout(rightTimeout);
    showRightArrow = true;
  }

  function handleRightLeave() {
    rightTimeout = setTimeout(() => {
      showRightArrow = false;
    }, 2500);
  }

  function goPrev() {
    return view?.goLeft?.() ?? view?.prev();
  }

  function goNext() {
    return view?.goRight?.() ?? view?.next();
  }

  function shouldHandleKeydown(e: KeyboardEvent) {
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return false;
    const target = e.target as HTMLElement | null;
    if (!target) return true;
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

    try {
      await nextView.init({ showTextStart: true });
    } catch {
      await nextView.init({ showTextStart: false });
    }

    // Load annotations
    const annotations = await fetchAnnotationsForBook(data.book.id);
    for (const ann of annotations) {
      nextView.addAnnotation({
        value: ann.cfi_range,
        color: ann.color || 'var(--color-accent)'
      });
    }

    if (nextView.isFixedLayout && nextView.renderer?.setAttribute) {
      nextView.renderer.setAttribute('zoom', 'fit-page');
    }

    // Restore focus to container on every navigation event (relocate)
    nextView.addEventListener('relocate', () => {
      selectionMenu = null;
      setTimeout(() => {
        if (document.activeElement !== container) {
          container?.focus();
        }
      }, 10);
    });

    // Handle text selection
    nextView.addEventListener('mouseup', (e) => {
      const selection = nextView.getSelection();
      if (selection && selection.text) {
        selectionMenu = {
          x: e.clientX,
          y: e.clientY - 40,
          cfi: selection.value,
          text: selection.text
        };
      } else {
        selectionMenu = null;
      }
    });

    queueMicrotask(() => nextView.renderer?.focusView?.());
    view = nextView;
  }

  async function saveHighlight() {
    if (!view || !selectionMenu) return;
    if (!selectionMenu.text.trim()) {
      selectionMenu = null;
      return;
    }

    try {
      const ann = await insertAnnotationRecord({
        book_id: data.book.id,
        cfi_range: selectionMenu.cfi,
        highlighted_text: selectionMenu.text,
        color: 'var(--color-accent)'
      });

      view.addAnnotation({
        value: ann.cfi_range,
        color: ann.color || 'var(--color-accent)'
      });

      selectionMenu = null;
    } catch (e) {
      console.error('Failed to save highlight:', e);
    }
  }

  onMount(() => {
    const controller = new AbortController();
    if (container) container.focus();

    window.addEventListener('keydown', handleKeydown, {
      signal: controller.signal
    });

    initReader()
      .catch((e) => {
        const message = e instanceof Error ? e.message : String(e);
        console.error('Error initializing reader:', e);
        error = `Error opening book: ${message}`;
      })
      .finally(() => {
        isLoading = false;
        setTimeout(() => container?.focus(), 100);
      });

    return () => {
      controller.abort();
      clearTimeout(leftTimeout);
      clearTimeout(rightTimeout);
      if (view) {
        try {
          view.close();
          view.remove(); // Remove from DOM
        } catch (e) {
          // View may already be destroyed during navigation
        }
        view = null;
      }
    };
  });
</script>

<div 
  in:fade={{ duration: 300 }}
  class="w-screen h-screen bg-[#1a1a1a] text-ivory flex flex-col overflow-hidden relative"
>
  <!-- Top Trigger Zone -->
  <div 
    onmouseenter={() => showToolbar = true}
    class="absolute top-0 left-0 right-0 h-4 z-40"
  ></div>

  <!-- Toolbar (Drop down) -->
  <header 
    onmouseenter={() => showToolbar = true}
    onmouseleave={() => showToolbar = false}
    class="absolute top-0 left-0 right-0 h-12 border-b border-white/10 flex items-center px-4 gap-4 bg-[#211311] z-50 transition-transform duration-300 ease-in-out shadow-2xl"
    class:-translate-y-full={!showToolbar}
    class:translate-y-0={showToolbar}
  >
    <button 
      onclick={() => goto('/')}
      class="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
      title="Back to Library"
    >
      <ArrowLeft size={20} />
    </button>
    <h1 class="font-serif text-lg truncate flex-1 tracking-wide opacity-90">{data.book.title}</h1>
  </header>

  <!-- Reader Container -->
  <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
  <main 
    class="flex-1 relative min-h-0 bg-[#faf9f6] outline-none"
    bind:this={container}
    tabindex="-1"
    autofocus
  >
    {#if isLoading}
      <div transition:fade={{ duration: 200 }} class="absolute inset-0 flex flex-col items-center justify-center bg-[#1a1a1a] z-50">
        <div class="w-12 h-12 border-2 border-white/10 border-t-accent rounded-full animate-spin mb-4"></div>
        <div class="font-serif text-ivory/60 tracking-widest text-sm animate-pulse">OPENING BOOK...</div>
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
    
    <!-- Hover Zones for Navigation -->
    <button 
      onclick={goPrev}
      onmouseenter={handleLeftEnter}
      onmouseleave={handleLeftLeave}
      class="absolute left-0 top-0 bottom-0 w-24 z-20 flex items-center justify-start pl-4 cursor-pointer outline-none bg-transparent border-none hover:bg-gradient-to-r from-black/5 to-transparent transition-all duration-300"
      title="Previous page (←)"
      type="button"
      aria-label="Previous page"
    >
      <div 
        class="transition-all duration-500 ease-in-out text-black/40 transform"
        class:opacity-100={showLeftArrow}
        class:opacity-0={!showLeftArrow}
        class:-translate-x-2={!showLeftArrow}
        class:translate-x-0={showLeftArrow}
      >
        <ChevronLeft size={48} strokeWidth={1} />
      </div>
    </button>

    <button 
      onclick={goNext}
      onmouseenter={handleRightEnter}
      onmouseleave={handleRightLeave}
      class="absolute right-0 top-0 bottom-0 w-24 z-20 flex items-center justify-end pr-4 cursor-pointer outline-none bg-transparent border-none hover:bg-gradient-l from-black/5 to-transparent transition-all duration-300"
      title="Next page (→)"
      type="button"
      aria-label="Next page"
    >
      <div 
        class="transition-all duration-500 ease-in-out text-black/40 transform"
        class:opacity-100={showRightArrow}
        class:opacity-0={!showRightArrow}
        class:translate-x-2={!showRightArrow}
        class:translate-x-0={showRightArrow}
      >
        <ChevronRight size={48} strokeWidth={1} />
      </div>
    </button>

    <!-- Selection Menu -->
    {#if selectionMenu}
      <div 
        transition:fade={{ duration: 150 }}
        class="absolute z-50 flex items-center gap-1 bg-[#211311] border border-white/10 rounded-full shadow-2xl p-1 backdrop-blur-xl"
        style="left: {selectionMenu.x}px; top: {selectionMenu.y}px; transform: translateX(-50%);"
      >
        <button 
          onclick={saveHighlight}
          class="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-white/10 text-ivory/90 transition-colors group cursor-pointer"
        >
          <div class="size-4 rounded-full bg-accent shadow-[0_0_8px_rgba(212,180,131,0.6)]"></div>
          <span class="text-xs font-medium tracking-wide uppercase">Highlight</span>
        </button>
      </div>
    {/if}
  </main>
</div>

<style>
  :global(foliate-view) {
    display: block;
    width: 100%;
    height: 100%;
    background-color: #faf9f6;
  }
  /* Style the highlights added by foliate-js */
  :global(.foliate-highlight) {
    background-color: var(--color-accent) !important;
    opacity: 0.3;
    cursor: pointer;
  }
  :global(.foliate-highlight:hover) {
    opacity: 0.5;
  }
  :global(foliate-paginator),
  :global(foliate-fxl) {
    display: block;
    width: 100%;
    height: 100%;
  }
</style>