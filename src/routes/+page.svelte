<script lang="ts">
  import { MOCK_BOOKS, WELCOME_MESSAGES } from '$lib/mock';
  import { Search, Menu, ChevronLeft, ChevronRight, Play } from 'lucide-svelte';
  import { Canvas } from '@threlte/core';
  import HeroScene from '$lib/components/HeroScene.svelte';
  import { isSidebarOpen } from '$lib/stores/ui';
  import { fly, fade } from 'svelte/transition';
  import { cubicInOut } from 'svelte/easing';

  const welcomeMessage = WELCOME_MESSAGES[Math.floor(Math.random() * WELCOME_MESSAGES.length)];
  
  let currentIndex = $state(0);
  let featuredBook = $derived(MOCK_BOOKS[currentIndex]);
  let direction = $state(1); // 1 = slide right (next), -1 = slide left (prev)

  // Helper to get previous/next books with wrap-around logic
  let prevBook = $derived(MOCK_BOOKS[(currentIndex - 1 + MOCK_BOOKS.length) % MOCK_BOOKS.length]);
  let nextBook = $derived(MOCK_BOOKS[(currentIndex + 1) % MOCK_BOOKS.length]);

  function next() {
    direction = 1;
    currentIndex = (currentIndex + 1) % MOCK_BOOKS.length;
  }

  function prev() {
    direction = -1;
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
    <!-- Left Navigation -->
    <button onclick={prev} class="hidden md:flex absolute left-0 z-30 size-12 items-center justify-center rounded-full bg-black/10 hover:bg-black/30 backdrop-blur-md text-ivory/60 hover:text-ivory transition-all border border-white/5 shadow-lg cursor-pointer">
      <ChevronLeft size={24} strokeWidth={1.5} />
    </button>

    <!-- Adjacent Book Placeholder (Left) -->
    <div class="hidden xl:block relative w-32 h-52 rotate-[-5deg]">
      {#key prevBook.id}
        <div 
          in:fade={{ duration: 800, easing: cubicInOut }}
          out:fade={{ duration: 800, easing: cubicInOut }}
          class="absolute inset-0 w-full h-full opacity-20 grayscale blur-[2px] transition-all duration-500 transform hover:scale-105 hover:opacity-30"
        >
          <img src={prevBook.coverUrl} alt="Previous" class="w-full h-full object-cover rounded-sm shadow-2xl" />
        </div>
      {/key}
    </div>

    <!-- Active Book (Featured) -->
    <div class="grid grid-cols-1 md:grid-cols-[320px_auto] items-center gap-8 md:gap-6 z-20 justify-center pr-0 md:pr-20">
      <!-- 3D Book Scene -->
      <div class="relative group perspective-1000 flex justify-center md:justify-end">
        <div class="hero-glow"></div>
        <div class="relative w-52 md:w-[320px] h-[22rem] md:h-[32rem]">
          <Canvas>
            <HeroScene coverUrl={featuredBook.coverUrl} />
          </Canvas>
        </div>
      </div>

      <!-- Book Info -->
      <div class="grid grid-cols-1 grid-rows-1 w-min min-h-[400px] items-center justify-center">
        {#key featuredBook.id}
          <div 
            in:fade={{ duration: 800, easing: cubicInOut }} 
            out:fade={{ duration: 800, easing: cubicInOut }}
            class="col-start-1 row-start-1 flex flex-col items-center md:items-start text-center md:text-left w-max"
          >
            <!-- Flexible Content: w-0 removes it from width calc, min-w-full makes it fill the container -->
            <div class="w-0 min-w-full">
              <h2 class="text-4xl md:text-5xl font-serif font-bold text-ivory leading-tight mb-3 tracking-tight drop-shadow-lg break-words">
                {featuredBook.title}
              </h2>
              <!-- Explicit border color and opacity to fix visibility issue -->
              <p class="text-[10px] md:text-xs font-sans uppercase tracking-[0.4em] text-ivory/80 mb-8 border-l-2 border-[#d4b483] pl-4">
                {featuredBook.author}
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
                  {featuredBook.timeRemaining} remaining
                </p>
              </div>
            </div>

            <!-- Anchor Row: The only element with intrinsic width -->
            <div class="flex items-center gap-8 whitespace-nowrap">
              <button class="bg-ivory text-background hover:bg-white text-base font-bold tracking-wide py-4 px-10 rounded-sm transition-all duration-300 shadow-xl shadow-black/20 hover:shadow-white/20 flex items-center gap-3 group/btn cursor-pointer">
                <span>Resume</span>
                <Play size={20} fill="currentColor" class="group-hover/btn:translate-x-1 transition-transform" />
              </button>
              <span class="text-base tracking-wide text-ivory/40 hover:text-ivory/80 transition-colors cursor-pointer font-normal">
                Mark as finished
              </span>
            </div>
          </div>
        {/key}
      </div>
    </div>

    <!-- Adjacent Book Placeholder (Right) -->
    <div class="hidden xl:block relative w-32 h-52 rotate-[5deg]">
      {#key nextBook.id}
        <div 
          in:fade={{ duration: 800, easing: cubicInOut }}
          out:fade={{ duration: 800, easing: cubicInOut }}
          class="absolute inset-0 w-full h-full opacity-20 grayscale blur-[2px] transition-all duration-500 transform hover:scale-105 hover:opacity-30"
        >
          <img src={nextBook.coverUrl} alt="Next" class="w-full h-full object-cover rounded-sm shadow-2xl" />
        </div>
      {/key}
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