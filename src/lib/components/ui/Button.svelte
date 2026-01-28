<script lang="ts">
  import { type Snippet } from 'svelte';

  type ButtonVariant = 'primary' | 'ghost' | 'icon';
  type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

  let { 
    variant = 'primary', 
    size = 'md', 
    children, 
    onclick, 
    class: className = '',
    ...rest 
  }: {
    variant?: ButtonVariant;
    size?: ButtonSize;
    children: Snippet;
    onclick?: (e: MouseEvent) => void;
    class?: string;
    [key: string]: any;
  } = $props();

  const baseStyles = "inline-flex items-center justify-center rounded-lg transition-all duration-300 font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/50";
  
  const variants = {
    primary: "bg-white/5 text-ivory/80 hover:bg-white/10 hover:text-ivory border border-white/5 shadow-sm",
    ghost: "text-ivory/60 hover:text-ivory hover:bg-white/5",
    icon: "rounded-full text-ivory hover:bg-white/10 drop-shadow-md",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
    icon: "size-12",
  };

  const classes = $derived(`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`);
</script>

<button class={classes} {onclick} {...rest}>
  {@render children()}
</button>