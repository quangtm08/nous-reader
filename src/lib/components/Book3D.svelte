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
    animation: float 6s ease-in-out infinite;
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
    transition: 1.6s cubic-bezier(0.23, 1, 0.32, 1);
    animation: 0.78s ease 0s 1 initAnimation;
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
    border-radius: 0 3px 3px 0;
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
    top: 4px; /* Inset slightly */
    width: 46px; /* Reduced to fit better inside cover */
    height: 352px; /* Height - 8px */
    transform: translateX(216px) rotateY(90deg);
    
    /* Paper Texture - Reduced aliasing and irregular intervals */
    background-color: #fdfbf7;
    background-image: 
      /* 1. Irregular horizontal 'cuts' (Masks) to create varied page lengths
         Using prime numbers and random offsets to break the pattern */
      linear-gradient(to bottom, 
        transparent 0%, 
        transparent 5%, rgba(253, 251, 247, 0.7) 5%, rgba(253, 251, 247, 0.7) 6%, transparent 6%,
        transparent 15%, rgba(253, 251, 247, 0.6) 15%, rgba(253, 251, 247, 0.6) 17%, transparent 17%,
        transparent 23%, rgba(253, 251, 247, 0.7) 23%, rgba(253, 251, 247, 0.7) 23.5%, transparent 23.5%,
        transparent 38%, rgba(253, 251, 247, 0.6) 38%, rgba(253, 251, 247, 0.6) 39%, transparent 39%,
        transparent 52%, rgba(253, 251, 247, 0.7) 52%, rgba(253, 251, 247, 0.7) 54%, transparent 54%,
        transparent 67%, rgba(253, 251, 247, 0.6) 67%, rgba(253, 251, 247, 0.6) 67.5%, transparent 67.5%,
        transparent 84%, rgba(253, 251, 247, 0.7) 84%, rgba(253, 251, 247, 0.7) 85%, transparent 85%
      ),
      /* 2. Edge shading (Shadows at top/bottom of block) */
      linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, transparent 10%, transparent 90%, rgba(0,0,0,0.05) 100%),
      /* 3. Side shading (Shadows near covers) */
      linear-gradient(90deg, rgba(0,0,0,0.12) 0%, transparent 8%, transparent 92%, rgba(0,0,0,0.12) 100%),
      /* 4. Signatures (The main "chunks" of paper) - Thicker, softer lines to reduce shimmering */
      repeating-linear-gradient(90deg, 
        transparent 0px, 
        transparent 12px, 
        rgba(0,0,0,0.06) 12px, 
        rgba(0,0,0,0.06) 13px
      ),
      /* 5. Base grain - Reduced contrast to prevent Moiré/Flipping illusion */
      repeating-linear-gradient(90deg, 
        transparent 0px, 
        transparent 2px, 
        rgba(0,0,0,0.04) 2px, 
        rgba(0,0,0,0.04) 3px
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
    border-radius: 0 3px 3px 0;
    box-shadow: -10px 0 50px 10px rgba(0,0,0,0.5);
  }

  /* Spine (Left Edge) */
  .book-spine {
    position: absolute;
    top: 0;
    left: 0;
    width: 50px; /* Thickness */
    height: 360px;
    transform: translateX(-25px) rotateY(-90deg);
    background: #111; /* Darker base */
    /* Stronger gradient for deep curvature effect */
    background-image: linear-gradient(90deg, 
      rgba(255,255,255,0.05) 0%, 
      rgba(0,0,0,0.4) 15%, 
      rgba(0,0,0,0.6) 50%,
      rgba(0,0,0,0.4) 85%,
      rgba(255,255,255,0.05) 100%
    );
    border-radius: 3px 0 0 3px;
  }
</style>