<script>
  import { onMount } from 'svelte';

  export let slug = '';

  let count = null;
  let loading = true;

  const NAMESPACE = 'rebiz-blog';

  onMount(() => {
    if (!slug) {
      loading = false;
      return;
    }

    const storageKey = `viewed-${slug}`;
    const alreadyViewed = typeof localStorage !== 'undefined'
      ? localStorage.getItem(storageKey)
      : null;

    const endpoint = alreadyViewed
      ? `https://api.countapi.xyz/get/${NAMESPACE}/${slug}`
      : `https://api.countapi.xyz/hit/${NAMESPACE}/${slug}`;

    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), 5000);

    fetch(endpoint, { signal: controller.signal })
      .then(r => r.json())
      .then(data => {
        if (typeof data.value === 'number') {
          count = data.value;
          if (!alreadyViewed && typeof localStorage !== 'undefined') {
            localStorage.setItem(storageKey, '1');
          }
        }
      })
      .catch(() => {
        // fail silently
      })
      .finally(() => {
        clearTimeout(tid);
        loading = false;
      });

    return () => { clearTimeout(tid); controller.abort(); };
  });
</script>

{#if loading}
  <span class="view-counter view-counter-loading">
    <iconify-icon icon="material-symbols:visibility-outline" width="11"></iconify-icon>
    — views
  </span>
{:else if count !== null}
  <span class="view-counter">
    <iconify-icon icon="material-symbols:visibility-outline" width="11"></iconify-icon>
    {count.toLocaleString()} {count === 1 ? 'view' : 'views'}
  </span>
{/if}

<style>
  .view-counter {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--fg-4);
  }

  .view-counter-loading {
    opacity: 0.5;
  }
</style>
