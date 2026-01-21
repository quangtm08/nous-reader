<script lang="ts">
  import { onMount } from 'svelte';
  import { getDb } from '$lib/db';
  import '../app.css';

  let { children } = $props();

  onMount(async () => {
    try {
      // Pre-warm the database connection
      await getDb();
    } catch (e) {
      console.error('Failed to initialize database:', e);
    }
  });
</script>

{@render children()}
