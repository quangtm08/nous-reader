<script lang="ts">
  import { T } from '@threlte/core';
  import { ContactShadows, Float, HTML } from '@threlte/extras';
  import { spring } from 'svelte/motion';
  import { TextureLoader, Texture, SRGBColorSpace } from 'three';

  let { coverUrl, thickness = 0.5 } = $props();

  let texture = $state<Texture | null>(null);

  $effect(() => {
    if (!coverUrl) return;
    
    // Animate out (shrink slightly) to indicate change
    scale.set(0.9);

    const loader = new TextureLoader();
    loader.load(coverUrl, (t) => {
      t.colorSpace = SRGBColorSpace;
      texture = t;
      // Animate in (restore scale)
      scale.set(1);
    });
  });

  // Animation springs - heavily softened for a 'lazy' luxurious feel
  const scale = spring(1, {
    stiffness: 0.03,
    damping: 0.6
  });
  const rotationY = spring(0, {
    stiffness: 0.03,
    damping: 0.6
  });

  function onPointerEnter() {
    scale.set(1.1);
    rotationY.set(0.3);
  }

  function onPointerLeave() {
    scale.set(1);
    rotationY.set(0);
  }
</script>

<T.Group
  scale={$scale}
  rotation.y={$rotationY}
  onpointerenter={onPointerEnter}
  onpointerleave={onPointerLeave}
>
  <Float
    floatIntensity={1}
    rotationIntensity={0.5}
    speed={2}
  >
    <!-- Book Mesh -->
    <T.Mesh>
      <T.BoxGeometry args={[3, 4.5, thickness]} />
      
      <!-- Materials Array -->
      <!-- 0: Right (Pages) -->
      <T.MeshStandardMaterial color="#fdfbf7" />
      <!-- 1: Left (Spine) -->
      <T.MeshStandardMaterial color="#2c2420" />
      <!-- 2: Top (Pages) -->
      <T.MeshStandardMaterial color="#fdfbf7" />
      <!-- 3: Bottom (Pages) -->
      <T.MeshStandardMaterial color="#fdfbf7" />
      <!-- 4: Front (Cover) -->
      {#if texture}
        <T.MeshStandardMaterial map={texture} />
      {:else}
        <T.MeshStandardMaterial color="#333" />
      {/if}
      <!-- 5: Back (Cover Color) -->
      <T.MeshStandardMaterial color="#2c2420" />
    </T.Mesh>
  </Float>
</T.Group>
