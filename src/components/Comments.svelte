<script>
  import { onMount } from 'svelte';
  import { dark } from '../stores/theme';

  export let repo = '';
  export let repoId = '';
  export let category = '';
  export let categoryId = '';
  export let term = 'pathname';

  let container;
  let isDark = false;
  const unsub = dark.subscribe(v => (isDark = v));

  const configured = repo && repoId && category && categoryId;

  onMount(() => {
    if (configured && container) {
      const script = document.createElement('script');
      script.src = 'https://giscus.app/client.js';
      script.setAttribute('data-repo', repo);
      script.setAttribute('data-repo-id', repoId);
      script.setAttribute('data-category', category);
      script.setAttribute('data-category-id', categoryId);
      script.setAttribute('data-mapping', term);
      script.setAttribute('data-strict', '0');
      script.setAttribute('data-reactions-enabled', '1');
      script.setAttribute('data-emit-metadata', '0');
      script.setAttribute('data-input-position', 'top');
      script.setAttribute('data-theme', isDark ? 'dark' : 'light');
      script.setAttribute('data-lang', 'en');
      script.setAttribute('data-loading', 'lazy');
      script.crossOrigin = 'anonymous';
      script.async = true;
      container.appendChild(script);
    }

    return () => unsub();
  });

  $: if (typeof window !== 'undefined') {
    window.postMessage(
      { giscus: { setConfig: { theme: isDark ? 'dark' : 'light' } } },
      window.location.origin,
    );
  }
</script>

<div class="comments-section">
  <div class="comments-header">
    <iconify-icon icon="material-symbols:chat-bubble-outline" width="16"></iconify-icon>
    Comments
  </div>

  {#if configured}
    <div bind:this={container} class="giscus-container"></div>
  {:else}
    <div class="comments-setup card">
      <div class="setup-icon">💬</div>
      <div class="setup-title">Comments not configured</div>
      <div class="setup-body">
        To enable comments, set up <a href="https://giscus.app" target="_blank" rel="noopener">giscus</a>
        and fill in <code>GISCUS</code> in <code>src/config.ts</code>.
      </div>
      <ol class="setup-steps">
        <li>Enable GitHub Discussions on your repo</li>
        <li>Install the <a href="https://github.com/apps/giscus" target="_blank" rel="noopener">giscus app</a> on your repo</li>
        <li>Visit <a href="https://giscus.app" target="_blank" rel="noopener">giscus.app</a> and get your <code>repo-id</code> and <code>category-id</code></li>
        <li>Fill in the four <code>GISCUS</code> fields in <code>src/config.ts</code></li>
      </ol>
    </div>
  {/if}
</div>

<style>
  .comments-section { margin-top: 48px; }
  .comments-header {
    display: flex; align-items: center; gap: 8px;
    font-family: var(--font-display); font-weight: 700; font-size: 20px;
    color: var(--fg-1); margin-bottom: 20px;
  }
  .giscus-container { min-height: 80px; }

  .comments-setup {
    padding: 32px; text-align: center;
    border: 1px dashed var(--border);
    background: var(--btn-regular-bg);
  }
  .setup-icon { font-size: 32px; margin-bottom: 12px; }
  .setup-title { font-family: var(--font-display); font-weight: 700; font-size: 18px; color: var(--fg-1); margin-bottom: 8px; }
  .setup-body { font-size: 14px; color: var(--fg-2); line-height: 1.6; margin-bottom: 16px; }
  .setup-body a { color: var(--primary); }
  .setup-steps {
    text-align: left; display: inline-block;
    font-size: 13px; color: var(--fg-2); line-height: 2;
    padding-left: 20px; margin: 0;
  }
  .setup-steps a { color: var(--primary); }
  .setup-steps code {
    font-family: var(--font-mono); font-size: 12px;
    background: var(--inline-code-bg); color: var(--inline-code-color);
    padding: 1px 5px; border-radius: 4px;
  }
</style>
