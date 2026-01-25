<script lang="ts">
  let { coverUrl, title = '' } = $props();
</script>

<div class="book-container">
  <div class="book-float">
    <div class="book">
      <!-- Front Cover -->
      <div class="book-front">
        {#if coverUrl}
          <img
            src={coverUrl}
            alt={title}
            class="w-full h-full object-cover"
          />
        {:else}
          <div class="w-full h-full bg-[#01060f] flex items-center justify-center p-4 text-center font-serif text-ivory/50">
            {title}
          </div>
        {/if}
      </div>
      
      <!-- Spine (Left Edge) -->
      <div class="book-spine"></div>
    </div>
  </div>
</div>

<style>
  .book-container {
    display: flex;
    align-items: center;
    justify-content: center;
    perspective: 1000px;
    margin-top: 12px;
  }

  /* Floating Animation */
  @keyframes float {
    0% { transform: translateY(0px) rotateX(0deg); }
    50% { transform: translateY(-8px) rotateX(1deg); }
    100% { transform: translateY(0px) rotateX(0deg); }
  }

  .book-float {
    animation: float 6.5s ease-in-out infinite;
  }

  @keyframes initAnimation {
    0% { transform: rotateY(0deg); }
    100% { transform: rotateY(-22deg); } /* Reduced to 22 degrees */
  }

  .book {
    width: 240px;
    height: 360px;
    position: relative;
    transform-style: preserve-3d;
    transform: rotateY(-22deg); /* Match animation end */
    transition: 2s cubic-bezier(0.23, 1, 0.32, 1);
    animation: 0.98s ease 0s 1 initAnimation;
  }

  .book-container:hover .book, 
  .book-container:focus .book {
    transform: rotateY(-8deg) scale(1.05); /* Adjusted hover angle */
  }

  /* Front Cover */
  .book-front {
    position: absolute;
    top: 0;
    left: 0;
    width: 240px;
    height: 360px;
    transform: translateZ(25px); /* Thickness/2 */
    background-color: #01060f;
    /* High-visibility grain texture */
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E");
    border-radius: 0 4px 4px 0;
    box-shadow: 5px 5px 20px rgba(0,0,0,0.5);
    overflow: hidden;
    z-index: 2;
  }

  /* Hinge/Sheen Overlay on Front */
  .book-front::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: 20px; /* Hinge area */
    background: linear-gradient(to right, 
      rgba(255,255,255,0.15) 0%, 
      rgba(255,255,255,0) 80%,
      rgba(0,0,0,0.2) 100%);
    pointer-events: none;
  }

  /* Right Edge (Pages) */
  .book::before {
    position: absolute;
    content: ' ';
    left: 0;
    top: 4px;
    width: 46px;
    height: 352px;
    transform: translateX(216px) rotateY(90deg);
    
    background-color: #fdfbf7;
    background-image: 
      /* 1. Page Stack Outlines */
      linear-gradient(to bottom, 
        transparent 0%, 
        transparent 5%, rgba(0, 0, 0, 0.05) 5.1%, transparent 5.2%
      ),
      /* 2. Ambient Occlusion (Shadow at binding) */
      linear-gradient(90deg, rgba(0,0,0,0.25) 0%, transparent 15%, transparent 85%, rgba(0,0,0,0.1) 100%),
      /* 3. Signatures (Warm sepia shadows) */
      repeating-linear-gradient(90deg, 
        transparent 0px, 
        transparent 12px, 
        rgba(101, 67, 33, 0.15) 12px, 
        rgba(101, 67, 33, 0.15) 13px
      ),
      /* 4. Fine Grain */
      repeating-linear-gradient(90deg, 
        transparent 0px, 
        transparent 2px, 
        rgba(101, 67, 33, 0.08) 2px, 
        rgba(101, 67, 33, 0.08) 3px
      );
    z-index: 1;
  }

  /* Back Cover */
  .book::after {
    position: absolute;
    top: 0;
    left: 0;
    content: ' ';
    width: 240px;
    height: 360px;
    transform: translateZ(-25px);
    background-color: #01060f;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E");
    border-radius: 0 4px 4px 0;
    box-shadow: -10px 0 50px 10px rgba(0,0,0,0.5);
  }

  /* Spine (Left Edge) */
  .book-spine {
    position: absolute;
    top: 0;
    left: 0;
    width: 50px;
    height: 360px;
    transform: translateX(-25px) rotateY(-90deg);
    background: #111;
    background-image: 
      url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E"),
      linear-gradient(90deg, 
        rgba(255,255,255,0.05) 0%, 
        rgba(0,0,0,0.4) 15%, 
        rgba(0,0,0,0.6) 50%,
        rgba(0,0,0,0.4) 85%,
        rgba(255,255,255,0.05) 100%
      );
    border-radius: 4px 0 0 4px;
  }
</style>