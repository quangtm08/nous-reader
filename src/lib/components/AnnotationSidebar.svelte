<script lang="ts">
    import { fly } from "svelte/transition";
    import { X, Trash2, Quote } from "lucide-svelte";

    let {
        show = false,
        annotations = [],
        onclose,
        onjump,
        ondelete,
    } = $props<{
        show: boolean;
        annotations: {
            id: string;
            highlighted_text: string;
            color: string | null;
            cfi_range: string;
        }[];
        onclose: () => void;
        onjump: (cfi: string) => void;
        ondelete: (id: string) => void;
    }>();
</script>

{#if show}
    <!-- Backdrop -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
        class="absolute inset-0 bg-black/50 backdrop-blur-sm z-[60]"
        onclick={onclose}
        transition:fly={{ duration: 200, opacity: 0 }}
    ></div>

    <!-- Sidebar -->
    <aside
        class="absolute top-0 right-0 bottom-0 w-80 bg-[#1a1a1a]/95 border-l border-white/10 shadow-2xl z-[70] flex flex-col backdrop-blur-xl"
        transition:fly={{ x: 320, duration: 300, opacity: 1 }}
    >
        <!-- Header -->
        <header
            class="h-16 flex items-center justify-between px-6 border-b border-white/10 shrink-0"
        >
            <h2 class="font-serif text-lg text-ivory tracking-wide">
                Annotations
            </h2>
            <button
                onclick={onclose}
                class="p-2 -mr-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
                <X size={20} />
            </button>
        </header>

        <!-- List -->
        <div class="flex-1 overflow-y-auto p-4 space-y-3">
            {#if annotations.length === 0}
                <div
                    class="h-full flex flex-col items-center justify-center text-white/30 text-center px-8"
                >
                    <Quote size={48} class="mb-4 opacity-20" />
                    <p class="font-serif italic text-sm">No highlights yet.</p>
                    <p class="text-xs mt-2 opacity-60">
                        Select text to add a note.
                    </p>
                </div>
            {:else}
                {#each annotations as ann (ann.id)}
                    <div
                        class="group relative bg-white/5 border border-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors cursor-pointer"
                        onclick={() => onjump(ann.cfi_range)}
                        role="button"
                        tabindex="0"
                        onkeydown={(e) =>
                            e.key === "Enter" && onjump(ann.cfi_range)}
                    >
                        <!-- Colored accent line -->
                        <div
                            class="absolute left-0 top-3 bottom-3 w-1 rounded-r-full"
                            style="background-color: {ann.color}"
                        ></div>

                        <p
                            class="text-sm text-ivory/90 font-serif leading-relaxed line-clamp-4 pl-3"
                        >
                            {ann.highlighted_text}
                        </p>

                        <div
                            class="mt-3 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <button
                                onclick={(e) => {
                                    e.stopPropagation();
                                    ondelete(ann.id);
                                }}
                                class="p-1.5 text-red-300/70 hover:text-red-300 hover:bg-red-500/20 rounded transition-colors"
                                title="Delete highlight"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                {/each}
            {/if}
        </div>
    </aside>
{/if}
