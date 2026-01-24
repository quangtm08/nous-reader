<script lang="ts">
  import { MOCK_BOOKS, WELCOME_MESSAGES } from '$lib/mock';
  import { Search, Menu, ChevronLeft, ChevronRight, Play } from 'lucide-svelte';
  import { Canvas } from '@threlte/core';
  import HeroScene from '$lib/components/HeroScene.svelte';
  import { isSidebarOpen } from '$lib/stores/ui';

  const welcomeMessage = WELCOME_MESSAGES[Math.floor(Math.random() * WELCOME_MESSAGES.length)];
  
  let currentIndex = $state(0);
  let featuredBook = $derived(MOCK_BOOKS[currentIndex]);

  // Helper to get previous/next books with wrap-around logic
  let prevBook = $derived(MOCK_BOOKS[(currentIndex - 1 + MOCK_BOOKS.length) % MOCK_BOOKS.length]);
  let nextBook = $derived(MOCK_BOOKS[(currentIndex + 1) % MOCK_BOOKS.length]);

  function next() {
    currentIndex = (currentIndex + 1) % MOCK_BOOKS.length;
  }

  function prev() {
    currentIndex = (currentIndex - 1 + MOCK_BOOKS.length) % MOCK_BOOKS.length;
  }
</script>

<div class="min-h-screen flex flex-col p-8 md:p-12 max-w-[1600px] mx-auto relative">
  <!-- Header -->
  <header class="flex justify-between items-start mb-8 md:mb-16 z-30 relative">
    <button 
      onclick={() => isSidebarOpen.set(true)}
      class="size-12 flex items-center justify-center rounded-full text-ivory hover:bg-white/10 transition-colors duration-300 drop-shadow-md cursor-pointer"
    >
      <Menu size={28} strokeWidth={1.5} />
    </button>
    
    <div class="text-center absolute left-1/2 -translate-x-1/2 top-0 w-full pointer-events-none">
      <h1 class="text-4xl md:text-6xl font-serif font-light text-ivory/90 mb-6 tracking-wide drop-shadow-sm pointer-events-auto">
        {welcomeMessage}
      </h1>
      <div class="flex items-center justify-center space-x-12 text-xs tracking-[0.2em] text-ivory/90 font-medium uppercase pointer-events-auto">
        <span class="flex items-center gap-3">
          <span class="w-2 h-2 rounded-full bg-accent animate-pulse shadow-[0_0_8px_rgba(212,180,131,0.6)]"></span>
          12-Day Streak
        </span>
        <span class="flex items-center gap-3">
          <div class="relative w-5 h-5 flex items-center justify-center">
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
  <section class="flex-1 relative flex items-center justify-center gap-4 md:gap-8 py-4">
    <!-- Left Navigation -->
    <button onclick={prev} class="hidden md:flex absolute left-0 z-30 size-12 items-center justify-center rounded-full bg-black/10 hover:bg-black/30 backdrop-blur-md text-ivory/60 hover:text-ivory transition-all border border-white/5 shadow-lg cursor-pointer">
      <ChevronLeft size={24} strokeWidth={1.5} />
    </button>

    <!-- Adjacent Book Placeholder (Left) -->
    <div class="hidden xl:block w-36 h-56 opacity-20 grayscale blur-[2px] rotate-[-5deg] transition-all duration-500 transform hover:scale-105 hover:opacity-30 mix-blend-plus-lighter">
      <img src={prevBook.coverUrl} alt="Previous" class="w-full h-full object-cover rounded-sm shadow-2xl" />
    </div>

    <!-- Active Book (Featured) -->
    <div class="flex flex-col md:flex-row items-center gap-8 md:gap-16 z-20 w-full max-w-5xl justify-center">
      <!-- 3D Book Scene -->
      {#key featuredBook.id}
        <div class="relative group perspective-1000">
          <div class="hero-glow"></div>
          <div class="relative w-56 md:w-[360px] h-[20rem] md:h-[32rem]">
            <Canvas>
              <HeroScene coverUrl={featuredBook.coverUrl} />
            </Canvas>
          </div>
        </div>
      {/key}

      <!-- Book Info -->
      <div class="flex flex-col items-center md:items-start text-center md:text-left max-w-md">
        <h2 class="text-4xl md:text-5xl font-serif font-bold text-ivory leading-tight mb-3 tracking-tight drop-shadow-lg">
          {featuredBook.title}
        </h2>
        <!-- Explicit border color and opacity to fix visibility issue -->
        <p class="text-[10px] md:text-xs font-sans uppercase tracking-[0.4em] text-ivory/80 mb-8 border-l-2 border-[#d4b483] pl-4">
          {featuredBook.author}
        </p>

        <div class="w-full max-w-[200px] md:max-w-[300px] mb-8">
          <div class="flex justify-between items-end text-[10px] uppercase tracking-widest text-ivory/90 mb-2 font-bold">
            <span>Progress</span>
            <span class="text-ivory">{featuredBook.progress}%</span>
          </div>
          <div class="h-1 w-full bg-ivory/20 rounded-full overflow-hidden backdrop-blur-sm">
            <div class="h-full bg-ivory shadow-[0_0_15px_rgba(255,255,255,0.5)] transition-all duration-1000" style="width: {featuredBook.progress}%"></div>
          </div>
          <p class="mt-2 text-[10px] text-ivory/60 tracking-wide">
            {featuredBook.timeRemaining} remaining
          </p>
        </div>

        <div class="flex items-center gap-4">
          <button class="bg-ivory text-background hover:bg-white text-sm font-bold tracking-wide py-3.5 px-8 rounded-sm transition-all duration-300 shadow-xl shadow-black/20 hover:shadow-white/20 flex items-center gap-3 group/btn cursor-pointer">
            <span>Resume</span>
            <Play size={18} fill="currentColor" class="group-hover/btn:translate-x-1 transition-transform" />
          </button>
          <button class="size-12 flex items-center justify-center rounded-sm border border-ivory/20 bg-ivory/5 text-ivory hover:text-white hover:bg-ivory/10 transition-colors backdrop-blur-sm cursor-pointer">
            <Search size={20} />
          </button>
        </div>
      </div>
    </div>

    <!-- Adjacent Book Placeholder (Right) -->
    <div class="hidden xl:block w-36 h-56 opacity-20 grayscale blur-[2px] rotate-[5deg] transition-all duration-500 transform hover:scale-105 hover:opacity-30 mix-blend-plus-lighter">
      <img src={nextBook.coverUrl} alt="Next" class="w-full h-full object-cover rounded-sm shadow-2xl" />
    </div>

    <!-- Right Navigation -->
    <button onclick={next} class="hidden md:flex absolute right-0 z-30 size-12 items-center justify-center rounded-full bg-black/10 hover:bg-black/30 backdrop-blur-md text-ivory/60 hover:text-ivory transition-all border border-white/5 shadow-lg cursor-pointer">
      <ChevronRight size={24} strokeWidth={1.5} />
    </button>
  </section>

  <!-- Slider Dots (Footer) -->
  <footer class="relative z-20 w-full py-8 flex justify-center items-center gap-4">
    {#each MOCK_BOOKS as _, i}
      <button 
        onclick={() => currentIndex = i}
        class="rounded-full transition-all duration-300 {i === currentIndex ? 'size-2 bg-ivory shadow-[0_0_10px_rgba(255,255,255,0.8)] scale-150' : 'size-1.5 bg-ivory/30 hover:bg-ivory/50 cursor-pointer'}"
        aria-label="Go to slide {i + 1}"
      ></button>
    {/each}
  </footer>
</div>