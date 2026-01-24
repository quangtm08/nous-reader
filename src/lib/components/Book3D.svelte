<script lang="ts">
  import { T } from '@threlte/core';
  import { ContactShadows, Float, HTML } from '@threlte/extras';
  import { spring } from 'svelte/motion';
  import { TextureLoader, Texture } from 'three';
  import { useLoader } from '@threlte/core';

  let { coverUrl, thickness = 0.5 } = $props();

  // Load texture (Note: non-reactive here, rely on parent keying if url changes)
  const texture = useLoader(TextureLoader).load(coverUrl);

  // Animation springs
  const scale = spring(1);
  const rotationY = spring(0);

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
      {#if $texture}
        <T.MeshStandardMaterial map={$texture as Texture} />
      {:else}
        <T.MeshStandardMaterial color="#333" />
      {/if}
      <!-- 5: Back (Cover Color) -->
      <T.MeshStandardMaterial color="#2c2420" />
    </T.Mesh>
  </Float>
</T.Group>
