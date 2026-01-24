<script lang="ts">
  import { Library, BookOpen, Settings, Search, PlusCircle, X } from 'lucide-svelte';
  import { isSidebarOpen } from '$lib/stores/ui';
  
  function close() {
    isSidebarOpen.set(false);
  }
</script>

<!-- Backdrop -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div 
  class="fixed inset-0 z-40 bg-black/60 transition-opacity duration-300 will-change-[opacity]"
  class:opacity-100={$isSidebarOpen}
  class:opacity-0={!$isSidebarOpen}
  class:pointer-events-none={!$isSidebarOpen}
  onclick={close}
></div>

<!-- Drawer -->
<aside 
  class="fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-surface/95 backdrop-blur-xl border-r border-white/5 shadow-2xl transition-transform duration-300 ease-out will-change-transform"
  class:translate-x-0={$isSidebarOpen}
  class:-translate-x-full={!$isSidebarOpen}
>
  <div class="p-6 flex justify-between items-center mb-4">
    <div class="w-10 h-10 bg-accent rounded-lg flex items-center justify-center text-background font-bold text-xl">
      N
    </div>
    <button onclick={close} class="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer">
      <X size={20} />
    </button>
  </div>

  <nav class="flex-1 px-4 space-y-2">
    <a href="/" onclick={close} class="flex items-center space-x-3 p-3 rounded-xl bg-white/10 text-white group transition-all">
      <Library size={20} class="text-accent" />
      <span class="font-medium">Library</span>
    </a>
    <button class="w-full flex items-center space-x-3 p-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white group transition-all cursor-pointer">
      <Search size={20} />
      <span class="font-medium">Browse</span>
    </button>
    <button class="w-full flex items-center space-x-3 p-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white group transition-all cursor-pointer">
      <BookOpen size={20} />
      <span class="font-medium">Current Reads</span>
    </button>
  </nav>

  <div class="p-4 mt-auto border-t border-white/5 space-y-2">
    <button class="w-full flex items-center space-x-3 p-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all cursor-pointer">
      <PlusCircle size={20} />
      <span class="font-medium">Import</span>
    </button>
    <button class="w-full flex items-center space-x-3 p-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all cursor-pointer">
      <Settings size={20} />
      <span class="font-medium">Settings</span>
    </button>
  </div>
</aside>
