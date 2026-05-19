<script>
  import { onMount } from 'svelte';
  import { dark, hue } from '../stores/theme';
  import { NAV_LINKS, SITE, AUTHOR } from '../config';

  let huePop = false;
  let mobileOpen = false;
  let mediaOpen = false;
  let mobileMediaOpen = false;
  let currentHue = 30;
  let isDark = false;
  let currentPath = '/';

  const unsub1 = hue.subscribe(v => (currentHue = v));
  const unsub2 = dark.subscribe(v => (isDark = v));

  onMount(() => {
    currentPath = window.location.pathname;

    function onBodyClick(e) {
      if (!e.target.closest('.nav-dropdown')) mediaOpen = false;
      if (!e.target.closest('.hue-pop') && !e.target.closest('.icon-btn[title="Pick accent hue"]')) huePop = false;
    }
    document.addEventListener('click', onBodyClick);
    return () => {
      unsub1();
      unsub2();
      document.removeEventListener('click', onBodyClick);
    };
  });

  $: isActive = (path) => {
    if (path === '/') return currentPath === '/' || currentPath.startsWith('/posts');
    return currentPath.startsWith(path);
  };

  $: isDropdownActive = (children) => children.some(c => currentPath.startsWith(c.path));

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
      {#if link.children}
        <div class="nav-dropdown" style="position:relative">
          <button
            class="nav-link nav-dropdown-btn {isDropdownActive(link.children) ? 'active' : ''}"
            aria-expanded={mediaOpen}
            aria-haspopup="true"
            on:click|stopPropagation={() => (mediaOpen = !mediaOpen)}
          >
            <iconify-icon icon={link.icon} width="16" aria-hidden="true"></iconify-icon>
            {link.label}
            <iconify-icon
              icon="material-symbols:keyboard-arrow-down"
              width="14"
              class="dropdown-chevron {mediaOpen ? 'open' : ''}"
              aria-hidden="true"
            ></iconify-icon>
          </button>
          {#if mediaOpen}
            <div class="nav-dropdown-panel" role="menu">
              {#each link.children as child}
                <a
                  href={child.path}
                  class="nav-dropdown-item {isActive(child.path) ? 'active' : ''}"
                  role="menuitem"
                  on:click={() => (mediaOpen = false)}
                >
                  <iconify-icon icon={child.icon} width="14" aria-hidden="true"></iconify-icon>
                  {child.label}
                </a>
              {/each}
            </div>
          {/if}
        </div>
      {:else}
        <a
          href={link.path}
          class="nav-link {isActive(link.path) ? 'active' : ''}"
          data-route={link.path.replace('/', '') || 'home'}
        >
          <iconify-icon icon={link.icon} width="16" aria-hidden="true"></iconify-icon>
          {link.label}
        </a>
      {/if}
    {/each}
  </div>

  <div class="nav-tools" style="position:relative">
    <button class="icon-btn" title="Search (⌘K)" aria-label="Open search" on:click={openSearch}>
      <iconify-icon icon="material-symbols:search" aria-hidden="true"></iconify-icon>
    </button>
    <button class="icon-btn" title="Toggle theme" aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'} on:click={switchTheme}>
      <iconify-icon icon={isDark ? 'material-symbols:light-mode' : 'material-symbols:dark-mode'} aria-hidden="true"></iconify-icon>
    </button>
    <button class="icon-btn" title="Pick accent hue" aria-label="Pick accent hue" aria-expanded={huePop} on:click|stopPropagation={() => (huePop = !huePop)}>
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
      {#if link.children}
        <button
          class="mobile-nav-link {isDropdownActive(link.children) ? 'active' : ''}"
          on:click={() => (mobileMediaOpen = !mobileMediaOpen)}
        >
          <iconify-icon icon={link.icon} width="18" aria-hidden="true"></iconify-icon>
          {link.label}
          <iconify-icon
            icon="material-symbols:keyboard-arrow-down"
            width="14"
            class="dropdown-chevron {mobileMediaOpen ? 'open' : ''}"
            aria-hidden="true"
            style="margin-left:auto"
          ></iconify-icon>
        </button>
        {#if mobileMediaOpen}
          {#each link.children as child}
            <button
              class="mobile-nav-link mobile-nav-child {isActive(child.path) ? 'active' : ''}"
              on:click={() => navTo(child.path)}
            >
              <iconify-icon icon={child.icon} width="16" aria-hidden="true"></iconify-icon>
              {child.label}
            </button>
          {/each}
        {/if}
      {:else}
        <button class="mobile-nav-link {isActive(link.path) ? 'active' : ''}" on:click={() => navTo(link.path)}>
          <iconify-icon icon={link.icon} width="18" aria-hidden="true"></iconify-icon>
          {link.label}
        </button>
      {/if}
    {/each}
    <button class="mobile-nav-link" on:click={openSearch}>
      <iconify-icon icon="material-symbols:search" width="18" aria-hidden="true"></iconify-icon>
      Search
    </button>
  </div>
{/if}

<style>
  .nav-dropdown-btn {
    background: none;
    border: none;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    font-family: inherit;
  }

  .dropdown-chevron {
    transition: transform 0.18s ease;
    display: inline-flex;
  }
  .dropdown-chevron.open {
    transform: rotate(180deg);
  }

  .nav-dropdown-panel {
    position: absolute;
    top: calc(100% + 10px);
    left: 50%;
    transform: translateX(-50%);
    background: var(--card-bg);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 6px;
    min-width: 150px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.1);
    z-index: 60;
    display: flex;
    flex-direction: column;
    gap: 2px;
    animation: dropdown-in 0.15s ease;
  }

  @keyframes dropdown-in {
    from { opacity: 0; transform: translateX(-50%) translateY(-4px); }
    to   { opacity: 1; transform: translateX(-50%) translateY(0); }
  }

  .nav-dropdown-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 13.5px;
    color: var(--fg-2);
    text-decoration: none;
    transition: background 0.12s, color 0.12s;
    white-space: nowrap;
  }
  .nav-dropdown-item:hover {
    background: var(--hover);
    color: var(--fg-1);
  }
  .nav-dropdown-item.active {
    color: var(--primary);
    background: var(--primary-soft);
  }

  .mobile-nav-child {
    padding-left: 40px !important;
    font-size: 13.5px;
    opacity: 0.9;
  }
</style>
