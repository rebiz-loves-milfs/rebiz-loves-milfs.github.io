<script>
  import { onMount } from 'svelte';
  import { dark, hue } from '../stores/theme';
  import { NAV_LINKS, SITE, AUTHOR } from '../config';

  let huePop = false;
  let mobileOpen = false;
  let currentHue = 30;
  let isDark = false;
  let currentPath = '/';

  const unsub1 = hue.subscribe(v => (currentHue = v));
  const unsub2 = dark.subscribe(v => (isDark = v));

  onMount(() => {
    currentPath = window.location.pathname;
    return () => { unsub1(); unsub2(); };
  });

  $: isActive = (path) => {
    if (path === '/') return currentPath === '/' || currentPath.startsWith('/posts');
    return currentPath.startsWith(path);
  };

  function switchTheme() {
    if (document.startViewTransition) {
      document.startViewTransition(() => dark.update(d => !d));
    } else {
      dark.update(d => !d);
    }
  }

  function openSearch() {
    mobileOpen = false;
    window.dispatchEvent(new CustomEvent('open-search'));
  }

  function navTo(path) {
    mobileOpen = false;
    window.location.href = path;
  }
</script>

<nav class="nav" aria-label="Main navigation">
  <a class="nav-brand" href="/">
    <img src={AUTHOR.logo} alt={SITE.title} width="28" height="28" />
    <span>{SITE.title}</span>
  </a>

  <div class="nav-links" role="list">
    {#each NAV_LINKS as link}
      <a
        href={link.path}
        class="nav-link {isActive(link.path) ? 'active' : ''}"
        data-route={link.path.replace('/', '') || 'home'}
      >
        <iconify-icon icon={link.icon} width="16" aria-hidden="true"></iconify-icon>
        {link.label}
      </a>
    {/each}
  </div>

  <div class="nav-tools" style="position:relative">
    <button class="icon-btn" title="Search (⌘K)" aria-label="Open search" on:click={openSearch}>
      <iconify-icon icon="material-symbols:search" aria-hidden="true"></iconify-icon>
    </button>
    <button class="icon-btn" title="Toggle theme" aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'} on:click={switchTheme}>
      <iconify-icon icon={isDark ? 'material-symbols:light-mode' : 'material-symbols:dark-mode'} aria-hidden="true"></iconify-icon>
    </button>
    <button class="icon-btn" title="Pick accent hue" aria-label="Pick accent hue" aria-expanded={huePop} on:click={() => (huePop = !huePop)}>
      <iconify-icon icon="material-symbols:palette-outline" aria-hidden="true"></iconify-icon>
    </button>
    <button class="icon-btn nav-hamburger" title="Menu" aria-label={mobileOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileOpen} on:click={() => (mobileOpen = !mobileOpen)}>
      <iconify-icon icon={mobileOpen ? 'material-symbols:close' : 'material-symbols:menu'} aria-hidden="true"></iconify-icon>
    </button>

    {#if huePop}
      <div class="hue-pop" role="dialog" aria-label="Theme hue picker">
        <label for="hue-slider">Theme hue</label>
        <input
          id="hue-slider"
          class="hue-slider"
          type="range"
          min="0" max="360"
          value={currentHue}
          on:input={e => hue.set(Number(e.target.value))}
        />
        <div class="val">--hue: {currentHue}</div>
      </div>
    {/if}
  </div>
</nav>

{#if mobileOpen}
  <div class="mobile-nav" role="navigation" aria-label="Mobile navigation">
    {#each NAV_LINKS as link}
      <button class="mobile-nav-link {isActive(link.path) ? 'active' : ''}" on:click={() => navTo(link.path)}>
        <iconify-icon icon={link.icon} width="18" aria-hidden="true"></iconify-icon>
        {link.label}
      </button>
    {/each}
    <button class="mobile-nav-link" on:click={openSearch}>
      <iconify-icon icon="material-symbols:search" width="18" aria-hidden="true"></iconify-icon>
      Search
    </button>
  </div>
{/if}
