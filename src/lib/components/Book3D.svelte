<script lang="ts">
  let { 
    coverUrl, 
    title = '', 
    rotated = true,
    width = 240,
    height = 360 
  } = $props();

  const thickness = $derived(Math.round(width * 0.1));
  const translateZ = $derived(Math.round(thickness / 2));
</script>

<div 
  class="book-container" 
  class:static={!rotated}
  style="--book-width: {width}px; --book-height: {height}px; --book-thickness: {thickness}px; --book-translate-z: {translateZ}px;"
>
  <div class="book-float" class:no-animation={!rotated}>
    <div class="book" class:no-rotation={!rotated}>
      <!-- Front Cover -->
      <div class="book-front">
        {#if coverUrl}
          <img src={coverUrl} alt={title} class="w-full h-full object-cover" />
        {:else}
          <div class="w-full h-full bg-[#01060f] flex items-center justify-center p-4 text-center font-serif text-ivory/50">
            {title}
          </div>
        {/if}
      </div>
      
      {#if rotated}
        <div class="book-spine"></div>
      {/if}
    </div>
  </div>
</div>

<style>
  .book-container {
    display: flex;
    align-items: center;
    justify-content: center;
    perspective: 1000px;
  }

  @keyframes float {
    0%, 100% { transform: translateY(0px) rotateX(0deg); }
    50% { transform: translateY(-8px) rotateX(1deg); }
  }

  .book-float {
    animation: float 6.5s ease-in-out infinite;
    will-change: transform;
  }

  .book-float.no-animation { animation: none; }

  @keyframes initAnimation {
    0% { transform: rotateY(0deg); }
    100% { transform: rotateY(-22deg); }
  }

  .book {
    width: var(--book-width);
    height: var(--book-height);
    position: relative;
    transform-style: preserve-3d;
    transform: rotateY(-22deg);
    transition: transform 0.6s cubic-bezier(0.23, 1, 0.32, 1);
    animation: 0.98s ease 0s 1 initAnimation;
    will-change: transform;
  }

  .book.no-rotation {
    transform: rotateY(0deg);
    animation: none;
  }

  .book-container:hover .book {
    transform: rotateY(0deg) scale(1.05);
  }

  .book-container.static:hover .book {
    transform: scale(1.04);
  }

  .book-front {
    position: absolute;
    inset: 0;
    transform: translateZ(var(--book-translate-z));
    background-color: #01060f;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E");
    border-radius: 0 4px 4px 0;
    box-shadow: 5px 5px 20px rgba(0,0,0,0.5);
    overflow: hidden;
    z-index: 2;
  }

  .static .book-front {
    transform: translateZ(0);
    box-shadow: 0 10px 30px rgba(0,0,0,0.4);
    border-radius: 4px;
  }

  .book-front::after {
    content: '';
    position: absolute;
    inset: 0;
    width: 20px;
    background: linear-gradient(to right, rgba(255,255,255,0.1) 0%, transparent 80%, rgba(0,0,0,0.15) 100%);
    pointer-events: none;
  }

  .book::before {
    position: absolute;
    content: ' ';
    left: 0;
    top: 4px;
    width: var(--book-thickness);
    height: calc(100% - 8px);
    transform: translateX(calc(var(--book-width) - (var(--book-thickness) / 2))) rotateY(90deg);
    background-color: #fdfbf7;
    background-image: 
      linear-gradient(90deg, rgba(0,0,0,0.25) 0%, transparent 15%, transparent 85%, rgba(0,0,0,0.1) 100%),
      repeating-linear-gradient(90deg, transparent 0px, transparent 12px, rgba(101, 67, 33, 0.15) 12px, rgba(101, 67, 33, 0.15) 13px);
    z-index: 1;
  }

  .book::after {
    position: absolute;
    inset: 0;
    content: ' ';
    transform: translateZ(calc(var(--book-translate-z) * -1));
    background-color: #01060f;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E");
    border-radius: 0 4px 4px 0;
    box-shadow: -10px 0 50px 10px rgba(0,0,0,0.5);
  }

  .no-rotation::before, .no-rotation::after { display: none; }

  .book-spine {
    position: absolute;
    top: 0;
    left: 0;
    width: var(--book-thickness);
    height: 100%;
    transform: translateX(calc(var(--book-thickness) / -2)) rotateY(-90deg);
    background: #111;
    background-image: 
      url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E"),
      linear-gradient(90deg, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0.4) 15%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.4) 85%, rgba(255,255,255,0.05) 100%);
    border-radius: 4px 0 0 4px;
  }
</style>