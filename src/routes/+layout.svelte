<script lang="ts">
  import { onMount } from 'svelte';
  import { getDb } from '$lib/db';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import '../app.css';

  let { children } = $props();

  onMount(async () => {
    try {
      await getDb();
    } catch (e) {
      console.error('Failed to initialize database:', e);
    }
  });
</script>

<Sidebar />



<div class="bg-layer-container">

  <div class="bg-base-image"></div>

  <div class="bg-overlay-1"></div>

  <div class="bg-overlay-2"></div>

  <div class="bg-overlay-3"></div>

  <div class="bg-texture"></div>

</div>



<main class="min-h-screen relative z-10">

  {@render children()}

</main>
