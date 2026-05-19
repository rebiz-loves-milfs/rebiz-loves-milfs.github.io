<script>
  import { onMount, onDestroy } from 'svelte';

  export let posts = [];

  let open = false;
  let query = '';
  let inputEl;

  $: results = query.trim().length < 2
    ? []
    : posts.filter(p => {
        const q = query.toLowerCase();
        return (
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.tags.some(t => t.toLowerCase().includes(q))
        );
      }).slice(0, 10);

  function openModal() {
    open = true;
    query = '';
    requestAnimationFrame(() => inputEl?.focus());
  }

  function closeModal() {
    open = false;
    query = '';
  }

  function onKey(e) {
    if (e.key === 'Escape') closeModal();
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      open ? closeModal() : openModal();
    }
  }

  onMount(() => {
    window.addEventListener('keydown', onKey);
    window.addEventListener('open-search', openModal);
  });
  onDestroy(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('open-search', openModal);
    }
  });

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function highlight(text, q) {
    if (!q || !text) return escapeHtml(text);
    const safe = escapeHtml(text);
    const safeQ = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(${safeQ})`, 'gi');
    return safe.replace(re, '<mark>$1</mark>');
  }
</script>

{#if open}
  <div class="search-backdrop" on:click={closeModal} role="presentation"></div>
  <div class="search-modal" role="dialog" aria-label="Search">
    <div class="search-bar">
      <iconify-icon icon="material-symbols:search" width="20" class="search-icon"></iconify-icon>
      <input
        bind:this={inputEl}
        bind:value={query}
        placeholder="Search posts…"
        class="search-input"
        type="text"
        autocomplete="off"
        spellcheck="false"
      />
      {#if query}
        <button class="search-clear" on:click={() => (query = '')} title="Clear">
          <iconify-icon icon="material-symbols:close" width="16"></iconify-icon>
        </button>
      {/if}
      <button class="search-esc" on:click={closeModal} aria-label="Close search">esc</button>
    </div>

    <div class="search-results">
      {#if query.trim().length > 0 && query.trim().length < 2}
        <div class="search-hint">Keep typing…</div>
      {:else if results.length === 0 && query.trim().length >= 2}
        <div class="search-hint">No results for "<strong>{query}</strong>"</div>
      {:else if results.length > 0}
        {#each results as post}
          <a href={`/posts/${post.id}`} class="search-result" on:click={closeModal}>
            <div class="sr-title">{@html highlight(post.title, query)}</div>
            {#if post.description}
              <div class="sr-desc">{@html highlight(post.description, query)}</div>
            {/if}
            <div class="sr-meta">
              {#if post.category}<span class="sr-cat">{post.category}</span>{/if}
              {#each post.tags.slice(0, 3) as tag}
                <span class="sr-tag">#{tag}</span>
              {/each}
            </div>
          </a>
        {/each}
      {:else}
        <div class="search-hint">Type to search posts by title, tag, or category</div>
      {/if}
    </div>

    <div class="search-footer">
      <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
      <span><kbd>↵</kbd> open</span>
      <span><kbd>esc</kbd> close</span>
      <span><kbd>⌘K</kbd> toggle</span>
    </div>
  </div>
{/if}

<style>
  .search-backdrop {
    position: fixed; inset: 0; z-index: 900;
    background: rgb(0 0 0 / 0.5);
    backdrop-filter: blur(4px);
    animation: fade-in 150ms ease;
  }
  @keyframes fade-in { from { opacity: 0; } }

  .search-modal {
    position: fixed; top: 15vh; left: 50%; transform: translateX(-50%);
    z-index: 901;
    width: min(640px, calc(100vw - 32px));
    background: var(--card-bg);
    border: 1px solid var(--border);
    border-radius: var(--radius-large);
    box-shadow: 0 24px 64px rgba(0,0,0,0.22), 0 4px 16px rgba(0,0,0,0.10);
    overflow: hidden;
    animation: modal-in 160ms cubic-bezier(.34,1.56,.64,1);
  }
  @keyframes modal-in {
    from { opacity: 0; transform: translateX(-50%) translateY(-12px) scale(0.96); }
  }

  .search-bar {
    display: flex; align-items: center; gap: 10px;
    padding: 14px 16px;
    border-bottom: 1px solid var(--border);
  }
  .search-icon { color: var(--fg-3); flex-shrink: 0; }
  .search-input {
    flex: 1; border: 0; outline: 0; background: transparent;
    font-family: var(--font-display); font-size: 16px; color: var(--fg-1);
  }
  .search-input::placeholder { color: var(--fg-4); }
  .search-clear {
    border: 0; background: none; cursor: pointer; color: var(--fg-3);
    display: flex; align-items: center;
    padding: 4px; border-radius: 4px;
  }
  .search-clear:hover { color: var(--fg-1); background: var(--btn-plain-bg-hover); }
  .search-esc {
    font-family: var(--font-mono); font-size: 11px; color: var(--fg-3);
    background: var(--btn-regular-bg); border-radius: 4px;
    padding: 2px 8px; cursor: pointer; border: 1px solid var(--border);
    white-space: nowrap; line-height: 1.6;
  }
  .search-esc:hover { color: var(--primary); background: var(--btn-regular-bg-hover); }

  .search-results {
    max-height: 420px; overflow-y: auto;
    padding: 8px;
  }
  .search-hint {
    padding: 24px; text-align: center;
    font-size: 14px; color: var(--fg-3);
  }
  .search-result {
    display: block; padding: 12px 14px; border-radius: 0.6rem;
    cursor: pointer; text-decoration: none;
    transition: background 120ms;
  }
  .search-result:hover { background: var(--btn-plain-bg-hover); }
  .sr-title {
    font-family: var(--font-display); font-weight: 700; font-size: 15px;
    color: var(--fg-1); margin-bottom: 3px;
  }
  .sr-desc {
    font-size: 13px; color: var(--fg-2); line-height: 1.4;
    display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden;
    margin-bottom: 5px;
  }
  .sr-meta { display: flex; flex-wrap: wrap; gap: 4px; }
  .sr-cat {
    font-size: 11px; padding: 2px 8px; border-radius: 999px;
    background: var(--primary-soft); color: var(--primary); font-weight: 600;
  }
  .sr-tag {
    font-size: 11px; padding: 2px 8px; border-radius: 999px;
    background: var(--btn-regular-bg); color: var(--btn-content);
  }

  .search-results :global(mark) {
    background: oklch(0.92 0.12 var(--hue)); color: var(--primary);
    border-radius: 2px; padding: 0 1px;
  }

  .search-footer {
    display: flex; gap: 16px; padding: 8px 16px;
    border-top: 1px solid var(--border);
    font-size: 11px; color: var(--fg-3);
  }
  .search-footer kbd {
    font-family: var(--font-mono); font-size: 10px;
    background: var(--btn-regular-bg); border: 1px solid var(--border);
    border-radius: 3px; padding: 1px 5px; margin-right: 3px;
  }
</style>
