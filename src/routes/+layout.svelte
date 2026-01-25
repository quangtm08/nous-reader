<script lang="ts">
  import { onMount } from 'svelte';
  import { getDb } from '$lib/db';
  import { getCurrentWindow } from '@tauri-apps/api/window';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import '../app.css';

  let { children } = $props();

  onMount(async () => {
    // Show the window immediately on mount to reveal the loading screen
    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      const appWindow = getCurrentWindow();
      await appWindow.show();
    } catch (e) {
      console.warn('Tauri API not available or window show failed:', e);
    }

    try {
      await getDb();
    } catch (e) {
      console.error('Failed to initialize database:', e);
    } finally {
      // Always fade out the loader eventually
      setTimeout(() => {
        document.body.classList.add('loaded');
      }, 800);
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
