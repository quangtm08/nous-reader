<script lang="ts">
  let { 
    value = $bindable(), 
    placeholder = '', 
    class: className = '',
    ...rest 
  }: {
    value?: string;
    placeholder?: string;
    class?: string;
    [key: string]: any;
  } = $props();
</script>

<input
  bind:value
  {placeholder}
  class="bg-transparent border-b border-white/10 text-ivory placeholder-white/30 px-2 py-1 focus:outline-none focus:border-accent transition-colors duration-300 w-full font-serif {className}"
  {...rest}
/>