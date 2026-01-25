<script lang="ts">
  import { onMount } from 'svelte';
  import { WELCOME_MESSAGES } from '$lib/mock';
  import { Search, Menu, ChevronLeft, ChevronRight, Play, Plus, Ellipsis, Trash2, CheckCircle2 } from 'lucide-svelte';
  import Book3D from '$lib/components/Book3D.svelte';
  import { isSidebarOpen } from '$lib/stores/ui';
  import { libraryStore } from '$lib/stores/library';
  import { fly, fade } from 'svelte/transition';
  import { cubicInOut } from 'svelte/easing';
  import { confirm } from '@tauri-apps/plugin-dialog';

  const welcomeMessage = WELCOME_MESSAGES[Math.floor(Math.random() * WELCOME_MESSAGES.length)];
  
  let currentIndex = $state(0);
  let isMenuOpen = $state(false);
  
  // Use real books from the library store
  let books = $derived($libraryStore.books);
  let featuredBook = $derived(books[currentIndex]); 
  let direction = $state(1); // 1 = slide right (next), -1 = slide left (prev)
  let isNavigating = false; // Debounce flag

  // Helper to get previous/next books with wrap-around logic
  let prevBook = $derived(books[(currentIndex - 1 + books.length) % books.length] ?? featuredBook);
  let nextBook = $derived(books[(currentIndex + 1) % books.length] ?? featuredBook);

  function next() {
    if (isNavigating) return;
    isNavigating = true;
    
    direction = 1;
    currentIndex = (currentIndex + 1) % books.length;
    isMenuOpen = false;

    setTimeout(() => {
      isNavigating = false;
    }, 350);
  }

  function prev() {
    if (isNavigating) return;
    isNavigating = true;

    direction = -1;
    currentIndex = (currentIndex - 1 + books.length) % books.length;
    isMenuOpen = false;

    setTimeout(() => {
      isNavigating = false;
    }, 350);
  }

  // Ensure currentIndex is valid when books array changes (e.g. Mock -> Real)
  $effect(() => {
    if (currentIndex >= books.length) {
      currentIndex = Math.max(0, books.length - 1);
    }
  });

  onMount(() => {
    libraryStore.loadLibrary();
  });

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'ArrowRight') {
      next();
    } else if (event.key === 'ArrowLeft') {
      prev();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="min-h-screen flex flex-col p-8 md:p-12 max-w-[1600px] mx-auto relative">
  <!-- Header -->
  <header class="flex justify-between items-start mb-8 md:mb-16 z-30 relative">
    <button 
      onclick={() => isSidebarOpen.set(true)}
      class="size-12 flex items-center justify-center rounded-full text-ivory hover:bg-white/10 transition-colors duration-300 drop-shadow-md cursor-pointer"
    >
      <Menu size={28} strokeWidth={1.5} />
    </button>
    
    <div class="text-center absolute left-1/2 -translate-x-1/2 top-20 md:top-28 w-full pointer-events-none">
      <h1 class="text-3xl md:text-5xl font-serif font-light text-ivory/90 mb-4 tracking-wide drop-shadow-sm pointer-events-auto">
        {welcomeMessage}
      </h1>
      <div class="flex items-center justify-center space-x-8 text-[10px] tracking-[0.25em] text-ivory/80 font-medium uppercase pointer-events-auto">
        <span class="flex items-center gap-2">
          <span class="w-1.5 h-1.5 rounded-full bg-accent animate-pulse shadow-[0_0_8px_rgba(212,180,131,0.6)]"></span>
          12-Day Streak
        </span>
        <span class="flex items-center gap-2">
          <div class="relative w-4 h-4 flex items-center justify-center">
            <svg class="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" stroke-width="3" class="opacity-30" />
              <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="66, 100" stroke-linecap="round" />
            </svg>
          </div>
          <span>30 of 45 mins today</span>
        </span>
      </div>
    </div>

    <button class="size-12 flex items-center justify-center rounded-full text-ivory hover:bg-white/10 transition-colors duration-300 drop-shadow-md cursor-pointer">
      <Search size={28} strokeWidth={1.5} />
    </button>
  </header>

  <!-- Hero Section (Book Slider) -->
  <section class="flex-1 relative flex items-center justify-center gap-12 md:gap-20 py-4 pt-20">
    {#if featuredBook}
    <!-- Left Navigation -->
    <button onclick={prev} class="hidden md:flex absolute left-0 z-30 size-12 items-center justify-center rounded-full bg-black/10 hover:bg-black/30 backdrop-blur-md text-ivory/60 hover:text-ivory transition-all border border-white/5 shadow-lg cursor-pointer">
      <ChevronLeft size={24} strokeWidth={1.5} />
    </button>

    <!-- Adjacent Book Placeholder (Left) -->
    <div class="hidden xl:block relative w-32 h-52 rotate-[-5deg]">
      <div class="absolute inset-0 w-full h-full">
        <div class="w-full h-full opacity-20 grayscale blur-[2px] transition-[transform,opacity] duration-500 transform-gpu hover:scale-105 hover:opacity-30 will-change-transform cursor-pointer" onclick={prev}>
          <img src={prevBook?.coverUrl || 'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=400&auto=format&fit=crop'} alt="Previous" class="w-full h-full object-cover rounded-sm shadow-2xl" />
        </div>
      </div>
    </div>

    <!-- Active Book (Featured) -->
    <div class="grid grid-cols-1 md:grid-cols-[240px_auto] items-center gap-8 md:gap-16 z-20 justify-center pl-0 md:pl-10 pr-0 md:pr-6">
      <div class="relative group flex justify-center md:justify-end">
        <div class="hero-glow"></div>
        <!-- 1x1 Grid for stacking transitions -->
        <div class="grid grid-cols-1 grid-rows-1 relative items-center justify-center w-full h-[400px]">
          {#key featuredBook.id}
            <div 
              in:fade={{ duration: 350, easing: cubicInOut }}
              out:fade={{ duration: 350, easing: cubicInOut }}
              class="col-start-1 row-start-1"
            >
              <Book3D 
                coverUrl={featuredBook.coverUrl} 
                title={featuredBook.title} 
              />
            </div>
          {/key}
        </div>
      </div>

      <!-- Book Info -->
      <div class="flex flex-col items-center md:items-start text-center md:text-left w-max min-h-[400px] justify-center">
        <!-- Flexible Content: w-0 removes it from width calc, min-w-full makes it fill the container -->
        <div class="w-0 min-w-full">
          <h2 class="text-4xl md:text-5xl font-serif font-bold text-ivory leading-tight mb-3 tracking-tight drop-shadow-lg break-words">
            {featuredBook.title}
          </h2>
          <!-- Explicit border color and opacity to fix visibility issue -->
          <p class="text-[10px] md:text-xs font-sans uppercase tracking-[0.4em] text-ivory/80 mb-8 border-l-2 border-[#d4b483] pl-4">
            {featuredBook.author || 'Unknown Author'}
          </p>

          <div class="w-full mb-8">
            <div class="flex justify-between items-end text-[10px] uppercase tracking-widest text-ivory/90 mb-2 font-bold">
              <span>Progress</span>
              <span class="text-ivory">{featuredBook.progress}%</span>
            </div>
            <div class="h-1 w-full bg-ivory/20 rounded-full overflow-hidden backdrop-blur-sm">
              <div class="h-full bg-ivory shadow-[0_0_15px_rgba(255,255,255,0.5)] transition-all duration-1000" style="width: {featuredBook.progress}%"></div>
            </div>
            <p class="mt-2 text-[10px] text-ivory/60 tracking-wide">
              {featuredBook.timeRemaining}
            </p>
          </div>
        </div>

        <!-- Anchor Row: The only element with intrinsic width -->
        <div class="flex items-center gap-8 whitespace-nowrap relative">
          <button class="bg-ivory text-background hover:bg-white text-base font-bold tracking-wide py-4 px-12 rounded-sm transition-all duration-300 shadow-xl shadow-black/20 hover:shadow-white/20 flex items-center gap-3 group/btn cursor-pointer">
            <span>Continue reading</span>
            <Play size={20} fill="currentColor" class="group-hover/btn:translate-x-1 transition-transform" />
          </button>
          
          <div class="relative">
            <button 
              onclick={() => isMenuOpen = !isMenuOpen}
              class="size-10 flex items-center justify-center rounded-full text-ivory/40 hover:text-ivory hover:bg-white/5 transition-all cursor-pointer"
              aria-label="Book options"
            >
              <Ellipsis size={24} />
            </button>
            
            {#if isMenuOpen}
              <div 
                transition:fade={{ duration: 150 }}
                class="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 bg-[#211311] border border-white/10 rounded-lg shadow-2xl py-2 min-w-[200px] z-50 overflow-hidden backdrop-blur-xl"
              >
                <button 
                  class="w-full text-left px-4 py-3 text-sm text-ivory/80 hover:bg-white/5 hover:text-ivory transition-colors flex items-center gap-3 cursor-pointer"
                  onclick={() => {
                    // TODO: Implement mark as finished
                    isMenuOpen = false;
                  }}
                >
                  <CheckCircle2 size={16} class="text-accent" />
                  Mark as finished
                </button>
                <div class="h-px bg-white/5 mx-2 my-1"></div>
                <button 
                  class="w-full text-left px-4 py-3 text-sm text-red-400/80 hover:bg-red-500/10 hover:text-red-400 transition-colors flex items-center gap-3 cursor-pointer"
                  onclick={async () => {
                    const confirmed = await confirm('Are you sure you want to delete this book?', {
                      title: 'Delete Book',
                      kind: 'warning'
                    });
                    
                    if (confirmed) {
                      libraryStore.removeBook(featuredBook.id);
                    }
                    isMenuOpen = false;
                  }}
                >
                  <Trash2 size={16} />
                  Delete Book
                </button>
              </div>
            {/if}
          </div>
        </div>
      </div>
    </div>

    <!-- Adjacent Book Placeholder (Right) -->
    <div class="hidden xl:block relative w-32 h-52 rotate-[5deg]">
      <div class="absolute inset-0 w-full h-full">
        <div class="w-full h-full opacity-20 grayscale blur-[2px] transition-[transform,opacity] duration-500 transform-gpu hover:scale-105 hover:opacity-30 will-change-transform cursor-pointer" onclick={next}>
          <img src={nextBook?.coverUrl || 'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=400&auto=format&fit=crop'} alt="Next" class="w-full h-full object-cover rounded-sm shadow-2xl" />
        </div>
      </div>
    </div>

    <!-- Right Navigation -->
    <button onclick={next} class="hidden md:flex absolute right-0 z-30 size-12 items-center justify-center rounded-full bg-black/10 hover:bg-black/30 backdrop-blur-md text-ivory/60 hover:text-ivory transition-all border border-white/5 shadow-lg cursor-pointer">
      <ChevronRight size={24} strokeWidth={1.5} />
    </button>
    {/if}
  </section>

  <!-- Slider Dots (Footer) -->
  <footer class="relative z-20 w-full py-8 flex justify-center items-center gap-4">
    {#each books as _, i}
      <button 
        onclick={() => currentIndex = i}
        class="rounded-full transition-all duration-300 {i === currentIndex ? 'size-2 bg-ivory shadow-[0_0_10px_rgba(255,255,255,0.8)] scale-150' : 'size-1.5 bg-ivory/30 hover:bg-ivory/50 cursor-pointer'}"
        aria-label="Go to slide {i + 1}"
      ></button>
    {/each}
  </footer>
</div>