<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { fade } from "svelte/transition";
  import { goto } from "$app/navigation";
  import { readFile } from "@tauri-apps/plugin-fs";
  import {
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    List,
    Trash2,
  } from "lucide-svelte";
  import {
    fetchAnnotationsForBook,
    insertAnnotationRecord,
    deleteAnnotation,
    type AnnotationRecord,
  } from "$lib/db";
  import AnnotationSidebar from "$lib/components/AnnotationSidebar.svelte";
  import type { PageData } from "./$types";

  type FoliateModule = typeof import("foliate-js/view.js");
  type FoliateView = import("foliate-js/view.js").View;

  let { data }: { data: PageData } = $props();

  let container: HTMLElement;
  let view: FoliateView | null = $state(null);
  let error: string | null = $state(null);
  let isLoading = $state(true);
  let annotations: AnnotationRecord[] = $state([]);
  let showSidebar = $state(false);

  // Selection UI state
  let selectionMenu = $state<{
    x: number;
    y: number;
    cfi: string;
    text: string;
  } | null>(null);

  // Annotation toolbar state (for clicking existing highlights)
  let annotationMenu = $state<{
    x: number;
    y: number;
    id: string;
    cfi: string;
  } | null>(null);

  // UI State
  let showToolbar = $state(false);
  let showLeftArrow = $state(false);
  let showRightArrow = $state(false);
  let leftTimeout: ReturnType<typeof setTimeout> | undefined;
  let rightTimeout: ReturnType<typeof setTimeout> | undefined;

  function handleLeftEnter() {
    clearTimeout(leftTimeout);
    showLeftArrow = true;
  }

  function handleLeftLeave() {
    showLeftArrow = false;
  }

  function handleRightEnter() {
    clearTimeout(rightTimeout);
    showRightArrow = true;
  }

  function handleRightLeave() {
    showRightArrow = false;
  }

  function goPrev() {
    return view?.goLeft?.() ?? view?.prev();
  }

  function goNext() {
    return view?.goRight?.() ?? view?.next();
  }

  function shouldHandleKeydown(e: KeyboardEvent) {
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return false;
    const target = e.target as HTMLElement | null;
    if (!target) return true;
    if (target.closest('input, textarea, [contenteditable="true"]'))
      return false;
    return true;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (!view || !shouldHandleKeydown(e)) return;

    switch (e.key) {
      case "ArrowLeft":
      case "PageUp":
        e.preventDefault();
        void goPrev();
        break;
      case "ArrowRight":
      case "PageDown":
      case " ":
        e.preventDefault();
        void goNext();
        break;
      case "Home":
        e.preventDefault();
        void view.goTo(0);
        break;
    }
  }

  /**
   * Calculate popup position in main window coordinates.
   * Converts iframe-relative coordinates to absolute window coordinates.
   */
  function getPopupPosition(
    range: Range,
    doc: Document,
  ): { x: number; y: number } {
    const iframe = doc.defaultView?.frameElement;
    const iframeRect = iframe?.getBoundingClientRect();
    const rect = range.getBoundingClientRect();

    const offsetX = iframeRect?.left ?? 0;
    const offsetY = iframeRect?.top ?? 0;

    return {
      x: rect.left + rect.width / 2 + offsetX,
      y: rect.top + offsetY - 10,
    };
  }

  async function initReader() {
    const foliate: FoliateModule = await import("foliate-js/view.js");
    const fileData = await readFile(data.book.local_path);
    const filename = data.book.local_path.split(/[\\/]/).pop() || "book.epub";
    const file = new File([fileData], filename);
    const book = await foliate.makeBook(file);
    const nextView = new foliate.View();
    container.appendChild(nextView);
    await nextView.open(book);

    try {
      await nextView.init({ showTextStart: true });
    } catch {
      await nextView.init({ showTextStart: false });
    }

    // Load annotations
    annotations = await fetchAnnotationsForBook(data.book.id);
    for (const ann of annotations) {
      nextView.addAnnotation({
        id: ann.id,
        value: ann.cfi_range,
        color: ann.color || "var(--color-accent)",
      });
    }

    // Handle annotation drawing - this is what actually renders the highlight
    nextView.addEventListener("draw-annotation", async (e: Event) => {
      const { draw, annotation } = (e as CustomEvent).detail;
      // @ts-ignore - foliate-js doesn't have type declarations
      const { Overlayer } = await import("foliate-js/overlayer.js");

      // Custom highlight function that adds the class for cursor pointer
      const customHighlight = (rects: any[], options: any) => {
        // Use the Overlayer.highlight from the library to get the base SVG
        const g = Overlayer.highlight(rects, options);
        // Add our class for styling (cursor: pointer)
        g.setAttribute("class", "foliate-highlight");
        return g;
      };

      draw(customHighlight, { color: annotation.color || "yellow" });
    });

    if (nextView.isFixedLayout && nextView.renderer?.setAttribute) {
      nextView.renderer.setAttribute("zoom", "fit-page");
    }

    // Restore focus to container on every navigation event (relocate)
    nextView.addEventListener("relocate", () => {
      selectionMenu = null;
      setTimeout(() => {
        if (document.activeElement !== container) {
          container?.focus();
        }
      }, 10);
    });

    let selectionTimeout: ReturnType<typeof setTimeout>;

    // Handle text selection
    nextView.addEventListener("load", (e: Event) => {
      const { doc, index } = (e as CustomEvent).detail;

      // Inject style for forced pointer cursor
      const style = doc.createElement("style");
      style.textContent = `
        .force-pointer, .force-pointer * {
          cursor: pointer !important;
        }
      `;
      doc.head.appendChild(style);

      // Handle mousemove for cursor hit-testing
      doc.addEventListener("mousemove", (e: MouseEvent) => {
        const renderer = nextView.renderer as any;
        const overlayer = renderer
          ?.getContents?.()
          ?.find((c: any) => c.doc === doc)?.overlayer;
        if (overlayer) {
          const [hit] = overlayer.hitTest({ x: e.clientX, y: e.clientY });
          if (hit) {
            doc.documentElement.classList.add("force-pointer");
          } else {
            doc.documentElement.classList.remove("force-pointer");
          }
        }
      });

      doc.addEventListener("mouseup", () => {
        // Debounce selection menu to avoid race condition with click on existing highlight
        clearTimeout(selectionTimeout);
        selectionTimeout = setTimeout(() => {
          const selection = doc.defaultView.getSelection();

          if (selection && !selection.isCollapsed && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const text = range.toString().trim();

            if (text) {
              // @ts-ignore - getCFI exists but may not be in types
              const cfi = nextView.getCFI(index, range);
              const pos = getPopupPosition(range, doc);

              selectionMenu = {
                x: pos.x,
                y: pos.y,
                cfi: cfi,
                text: text,
              };
              annotationMenu = null;
            }
          } else {
            selectionMenu = null;
            // Dismiss annotation menu if clicking elsewhere
            annotationMenu = null;
          }
        }, 50); // Small delay to let show-annotation fire first if needed
      });
    });

    // Handle clicks on existing highlights
    nextView.addEventListener("show-annotation", (e: Event) => {
      const { value, range } = (e as CustomEvent).detail;

      // Prioritize text selection: if user is selecting text, don't show annotation menu
      const doc = range.startContainer.ownerDocument;
      const selection = doc.defaultView?.getSelection();
      if (selection && !selection.isCollapsed) {
        // DO NOT cancel the selectionTimeout here if we are selecting text.
        // We want the selection menu to appear.
        return;
      }

      // If we are actually showing the annotation menu, THEN cancel selection menu
      clearTimeout(selectionTimeout);

      const annotation = annotations.find((a) => a.cfi_range === value);
      if (annotation) {
        const doc = range.startContainer.ownerDocument;
        const pos = getPopupPosition(range, doc);

        annotationMenu = {
          x: pos.x,
          y: pos.y,
          id: annotation.id,
          cfi: value,
        };
        selectionMenu = null;
      }
    });

    queueMicrotask(() => nextView.renderer?.focusView?.());
    view = nextView;
  }

  function handleJump(cfi: string) {
    if (view) {
      view.goTo(cfi);
    }
  }

  async function handleDelete(id: string) {
    const target = annotations.find((a) => a.id === id);
    if (!target) return;

    // 1. Remove from DB
    await deleteAnnotation(id);

    // 2. Remove from local state
    annotations = annotations.filter((a) => a.id !== id);

    // 3. Remove from view
    if (view) {
      // @ts-ignore
      view.deleteAnnotation({ value: target.cfi_range });
    }
  }

  /**
   * Parse CFI string to extract base path and character offsets.
   * CFI format: epubcfi(/6/8!/4/2[...],/1:startOffset,/1:endOffset)
   * @returns Parsed path and offsets, or null if parsing fails
   */
  function parseCfiOffsets(
    cfi: string,
  ): { path: string; start: number; end: number } | null {
    try {
      const match = cfi.match(/epubcfi\(([^,]+),([^,]+),([^)]+)\)/);
      if (!match) return null;

      const basePath = match[1];
      const startMatch = match[2].match(/:(\d+)$/);
      const endMatch = match[3].match(/:(\d+)$/);

      if (!startMatch || !endMatch) return null;

      return {
        path: basePath,
        start: parseInt(startMatch[1], 10),
        end: parseInt(endMatch[1], 10),
      };
    } catch {
      return null;
    }
  }

  /**
   * Check if two ranges intersect based on their character offsets.
   */
  function rangesIntersect(
    a: { start: number; end: number },
    b: { start: number; end: number },
  ): boolean {
    return a.start < b.end && a.end > b.start;
  }

  /**
   * Helper to clear text selection in all active reader documents.
   * This is needed because `window.getSelection().removeAllRanges()` only affects the main window,
   * but the reader content lives in iframes.
   */
  function clearSelection() {
    if (!view) return;

    // Clear in main window
    const mainSel = window.getSelection();
    if (mainSel) {
      mainSel.removeAllRanges();
      if (mainSel.empty) mainSel.empty(); // Chrome/Safari support
    }

    // Clear in all reader iframes
    // Use requestAnimationFrame to ensure we hit the frame when it's ready/active
    requestAnimationFrame(() => {
      // @ts-ignore
      const contents = view?.renderer?.getContents?.();
      if (contents) {
        for (const item of contents) {
          const doc = item.doc as Document;
          const win = doc?.defaultView;
          if (win) {
            const sel = win.getSelection();
            if (sel) {
              sel.removeAllRanges();
              if (sel.empty) sel.empty();
            }
          }
        }
      }
    });
  }

  /**
   * Save a new highlight, merging with any overlapping existing highlights.
   * Implements union merge: if new selection overlaps existing highlights,
   * the overlapping ones are deleted and replaced with a single merged highlight.
   * After saving, transitions to the annotation menu (Readwise-style UX).
   */
  async function saveHighlight() {
    if (!view || !selectionMenu) return;
    if (!selectionMenu.text.trim()) {
      selectionMenu = null;
      return;
    }

    const currentCfi = selectionMenu.cfi;
    let finalCfi = currentCfi;
    let finalText = selectionMenu.text;

    try {
      const newParsed = parseCfiOffsets(currentCfi);
      const toRemove: string[] = [];

      if (newParsed) {
        // Find overlapping annotations
        let unionStart = newParsed.start;
        let unionEnd = newParsed.end;

        for (const ann of annotations) {
          const oldParsed = parseCfiOffsets(ann.cfi_range);

          if (oldParsed && oldParsed.path === newParsed.path) {
            if (rangesIntersect(newParsed, oldParsed)) {
              toRemove.push(ann.id);
              unionStart = Math.min(unionStart, oldParsed.start);
              unionEnd = Math.max(unionEnd, oldParsed.end);
            }
          }
        }

        // Merge overlapping highlights into a union range
        if (toRemove.length > 0) {
          const resolved = await (view as any).resolveNavigation(currentCfi);
          if (resolved) {
            const contents = (view.renderer as any).getContents();
            const contentItem = contents.find(
              (c: any) => c.index === resolved.index,
            );

            if (contentItem?.doc) {
              const range = resolved.anchor(contentItem.doc) as Range;
              const textNode = range.startContainer;

              if (textNode.nodeType === Node.TEXT_NODE) {
                const unionRange = contentItem.doc.createRange();
                unionRange.setStart(textNode, unionStart);
                unionRange.setEnd(
                  textNode,
                  Math.min(unionEnd, (textNode as Text).length),
                );

                // @ts-ignore - getCFI exists but not in types
                finalCfi = view.getCFI(resolved.index, unionRange);
                finalText = unionRange.toString();
              }
            }
          }
        }
      }

      // Prevent exact duplicates
      if (annotations.some((a) => a.cfi_range === finalCfi)) {
        selectionMenu = null;
        setTimeout(clearSelection, 0);
        return;
      }

      // --- OPTIMISTIC UPDATE START ---

      // 1. Prepare new annotation data
      const newId = crypto.randomUUID();
      const newAnn = {
        id: newId,
        book_id: data.book.id,
        cfi_range: finalCfi,
        highlighted_text: finalText,
        color: "var(--color-accent)",
      };

      // 2. Remove overlapping annotations from View & State
      if (toRemove.length > 0) {
        // Get CFIs for view removal before filtering state
        const toRemoveCfis = annotations
          .filter((a) => toRemove.includes(a.id))
          .map((a) => a.cfi_range);

        toRemoveCfis.forEach((cfi) => {
          // @ts-ignore
          view.deleteAnnotation({ value: cfi });
        });

        annotations = annotations.filter((a) => !toRemove.includes(a.id));
      }

      // 3. Add new annotation to View & State
      view.addAnnotation({
        id: newAnn.id,
        value: newAnn.cfi_range,
        color: newAnn.color || "var(--color-accent)",
      });
      annotations = [...annotations, newAnn];

      // 4. Update UI: Clear selection & Hide menu immediately
      selectionMenu = null;
      clearSelection();

      // 5. Position the "Delete" menu immediately for the new highlight
      // Removed per user preference: menu should disappear after highlight.
      // User can click the highlight again to see the menu.

      // --- OPTIMISTIC UPDATE END ---

      // 6. Background Database Operations (Fire & Forget logic with error logging)
      const dbOperations = async () => {
        try {
          // Delete old ones
          if (toRemove.length > 0) {
            await Promise.all(toRemove.map((id) => deleteAnnotation(id)));
          }
          // Insert new one
          // We pass the ID we generated to ensure it matches local state
          await insertAnnotationRecord(newAnn);
        } catch (err) {
          console.error("Failed to sync highlights to DB:", err);
          // In a production app, we would show a toast or rollback state here.
        }
      };

      dbOperations();
    } catch (e) {
      console.error("Failed to save highlight:", e);
    }
  }

  onMount(() => {
    const controller = new AbortController();
    if (container) container.focus();

    window.addEventListener("keydown", handleKeydown, {
      signal: controller.signal,
    });

    initReader()
      .catch((e) => {
        const message = e instanceof Error ? e.message : String(e);
        console.error("Error initializing reader:", e);
        error = `Error opening book: ${message}`;
      })
      .finally(() => {
        isLoading = false;
        setTimeout(() => container?.focus(), 100);
      });

    return () => {
      controller.abort();
      clearTimeout(leftTimeout);
      clearTimeout(rightTimeout);
      if (view) {
        try {
          view.close();
          view.remove(); // Remove from DOM
        } catch (e) {
          // View may already be destroyed during navigation
        }
        view = null;
      }
    };
  });
</script>

<div
  in:fade={{ duration: 300 }}
  class="w-screen h-screen bg-[#1a1a1a] text-ivory flex flex-col overflow-hidden relative"
>
  <!-- Unified Top Control Zone -->
  <div
    class="absolute top-0 left-0 right-0 h-16 z-50 flex flex-col justify-start"
    onmouseenter={() => (showToolbar = true)}
    onmouseleave={() => (showToolbar = false)}
  >
    <!-- Header (Visual) -->
    <header
      class="h-12 border-b border-white/10 flex items-center justify-between px-4 bg-[#211311] transition-transform duration-300 ease-in-out shadow-2xl relative"
      class:-translate-y-full={!showToolbar}
      class:translate-y-0={showToolbar}
    >
      <button
        onclick={() => goto("/")}
        class="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer z-10"
        title="Back to Library"
      >
        <ArrowLeft size={16} />
      </button>

      <div
        class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none w-full"
      >
        <h1
          class="font-serif text-sm truncate tracking-wide opacity-90 max-w-[60%] text-center"
        >
          {data.book.title}
        </h1>
      </div>

      <button
        onclick={() => (showSidebar = !showSidebar)}
        class="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer z-10"
        class:text-accent={showSidebar}
        title="Toggle Annotations"
      >
        <List size={16} />
      </button>
    </header>

    <!-- Transparent filler to catch mouse events below the header -->
    <div class="flex-1 w-full bg-transparent"></div>
  </div>

  <AnnotationSidebar
    show={showSidebar}
    {annotations}
    onclose={() => (showSidebar = false)}
    onjump={handleJump}
    ondelete={handleDelete}
  />

  <!-- Reader Container -->
  <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
  <main
    class="flex-1 relative min-h-0 bg-[#faf9f6] outline-none py-4 transition-all duration-300"
    bind:this={container}
    tabindex="-1"
    autofocus
  >
    {#if isLoading}
      <div
        transition:fade={{ duration: 200 }}
        class="absolute inset-0 flex flex-col items-center justify-center bg-[#1a1a1a] z-50"
      >
        <div
          class="w-12 h-12 border-2 border-white/10 border-t-accent rounded-full animate-spin mb-4"
        ></div>
        <div
          class="font-serif text-ivory/60 tracking-widest text-sm animate-pulse"
        >
          OPENING BOOK...
        </div>
      </div>
    {/if}

    {#if error}
      <div
        class="absolute inset-0 flex items-center justify-center p-8 text-center text-red-400 bg-black/50 z-10"
      >
        <div
          class="bg-[#211311] p-6 rounded-lg border border-red-900/50 shadow-xl max-w-md"
        >
          <h2 class="text-xl font-serif mb-2 text-red-300">
            Could not open book
          </h2>
          <p class="text-sm opacity-80">{error}</p>
        </div>
      </div>
    {/if}

    <!-- Hover Zones for Navigation -->
    <button
      onclick={goPrev}
      onmouseenter={handleLeftEnter}
      onmouseleave={handleLeftLeave}
      class="absolute left-0 top-0 bottom-0 w-24 z-20 flex items-center justify-start pl-4 cursor-pointer outline-none bg-transparent border-none hover:bg-gradient-to-r from-black/3 to-transparent transition-all duration-300"
      title="Previous page (←)"
      type="button"
      aria-label="Previous page"
    >
      <div
        class="transition-all duration-500 ease-in-out text-black/40 transform"
        class:opacity-100={showLeftArrow}
        class:opacity-0={!showLeftArrow}
        class:-translate-x-2={!showLeftArrow}
        class:translate-x-0={showLeftArrow}
      >
        <ChevronLeft size={48} strokeWidth={1} />
      </div>
    </button>

    <button
      onclick={goNext}
      onmouseenter={handleRightEnter}
      onmouseleave={handleRightLeave}
      class="absolute right-0 top-0 bottom-0 w-24 z-20 flex items-center justify-end pr-4 cursor-pointer outline-none bg-transparent border-none hover:bg-gradient-l from-black/3 to-transparent transition-all duration-300"
      title="Next page (→)"
      type="button"
      aria-label="Next page"
    >
      <div
        class="transition-all duration-500 ease-in-out text-black/40 transform"
        class:opacity-100={showRightArrow}
        class:opacity-0={!showRightArrow}
        class:translate-x-2={!showRightArrow}
        class:translate-x-0={showRightArrow}
      >
        <ChevronRight size={48} strokeWidth={1} />
      </div>
    </button>

    <!-- Selection Menu -->
    {#if selectionMenu}
      <div
        transition:fade={{ duration: 150 }}
        class="absolute z-50 flex items-center gap-1 bg-[#211311] border border-white/10 rounded-full shadow-2xl p-1 backdrop-blur-xl"
        style="left: {selectionMenu.x}px; top: {selectionMenu.y}px; transform: translateX(-50%) translateY(-100%);"
      >
        <button
          onclick={saveHighlight}
          class="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-white/10 text-ivory/90 transition-colors group cursor-pointer"
        >
          <div
            class="size-4 rounded-full bg-accent shadow-[0_0_8px_rgba(212,180,131,0.6)]"
          ></div>
          <span class="text-xs font-medium tracking-wide uppercase"
            >Highlight</span
          >
        </button>
      </div>
    {/if}

    <!-- Annotation Toolbar (for existing highlights) -->
    {#if annotationMenu}
      <div
        transition:fade={{ duration: 150 }}
        class="absolute z-50 flex items-center gap-1 bg-[#211311] border border-white/10 rounded-full shadow-2xl p-1 backdrop-blur-xl"
        style="left: {annotationMenu.x}px; top: {annotationMenu.y}px; transform: translateX(-50%) translateY(-100%);"
      >
        <button
          onclick={async () => {
            if (annotationMenu) {
              await handleDelete(annotationMenu.id);
              annotationMenu = null;
              clearSelection();
            }
          }}
          class="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-red-500/20 text-red-300/90 transition-colors cursor-pointer"
        >
          <Trash2 size={14} />
          <span class="text-xs font-medium tracking-wide uppercase">Delete</span
          >
        </button>
      </div>
    {/if}
  </main>
</div>

<style>
  :global(foliate-view) {
    display: block;
    width: 100%;
    height: 100%;
    background-color: #faf9f6;
  }
  /* Style the highlights added by foliate-js */
  :global(.foliate-highlight) {
    fill: var(--color-accent) !important;
    cursor: pointer;
  }
  :global(.foliate-highlight:hover) {
    opacity: 0.5;
  }
  :global(foliate-paginator),
  :global(foliate-fxl) {
    display: block;
    width: 100%;
    height: 100%;
  }
</style>
