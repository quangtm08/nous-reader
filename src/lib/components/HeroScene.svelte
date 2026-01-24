<script lang="ts">
  import { T } from '@threlte/core';
  import { ContactShadows } from '@threlte/extras';
  import Book3D from './Book3D.svelte';
  
  let { coverUrl } = $props();
</script>

<T.PerspectiveCamera
  makeDefault
  position={[0, 0, 8]}
  fov={45}
>
  <!-- OrbitControls for debugging if needed, but we want fixed view -->
</T.PerspectiveCamera>

<T.AmbientLight intensity={0.6} />
<T.DirectionalLight 
  position={[5, 5, 5]} 
  intensity={1.5} 
  castShadow 
/>
<T.PointLight position={[-5, 5, -5]} intensity={0.5} color="#d4b483" />

<Book3D {coverUrl} />

<ContactShadows 
  opacity={0.4} 
  scale={20} 
  blur={2.5} 
  far={4} 
  resolution={256} 
  color="#000000" 
/>
