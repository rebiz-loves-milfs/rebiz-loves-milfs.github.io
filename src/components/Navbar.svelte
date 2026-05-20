<script>
  import { onMount } from 'svelte';
  import { theme } from '../stores/theme.svelte';
  import { NAV_LINKS, SITE, AUTHOR } from '../config';

  let huePop = $state(false);
  let mobileOpen = $state(false);
  let mediaOpen = $state(false);
  let mobileMediaOpen = $state(false);
  let currentPath = $state('/');

  onMount(() => {
    currentPath = window.location.pathname;

    function onBodyClick(e) {
      if (!e.target.closest('.nav-dropdown')) mediaOpen = false;
      if (!e.target.closest('.hue-pop') && !e.target.closest('.icon-btn[title="Pick accent hue"]')) huePop = false;
    }
    document.addEventListener('click', onBodyClick);
    return () => {
      document.removeEventListener('click', onBodyClick);
    };
  });

  function isActive(path) {
    if (path === '/') return currentPath === '/' || currentPath.startsWith('/posts');
    return currentPath.startsWith(path);
  }

  function isDropdownActive(children) {
    return children.some(c => currentPath.startsWith(c.path));
  }

  function switchTheme() {
    theme.dark = !theme.dark;
  }

  function openSearch() {
    mobileOpen = false;
    window.dispatchEvent(new CustomEvent('open-search'));
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
            onclick={(e) => { e.stopPropagation(); mediaOpen = !mediaOpen; }}
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
                  onclick={() => (mediaOpen = false)}
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
    <button class="icon-btn" title="Search (⌘K)" aria-label="Open search" onclick={openSearch}>
      <iconify-icon icon="material-symbols:search" aria-hidden="true"></iconify-icon>
    </button>
    <button class="icon-btn" title="Toggle theme" aria-label={theme.dark ? 'Switch to light mode' : 'Switch to dark mode'} onclick={switchTheme}>
      <iconify-icon icon={theme.dark ? 'material-symbols:light-mode' : 'material-symbols:dark-mode'} aria-hidden="true"></iconify-icon>
    </button>
    <button class="icon-btn" title="Pick accent hue" aria-label="Pick accent hue" aria-expanded={huePop} onclick={(e) => { e.stopPropagation(); huePop = !huePop; }}>
      <iconify-icon icon="material-symbols:palette-outline" aria-hidden="true"></iconify-icon>
    </button>
    <button class="icon-btn nav-hamburger" title="Menu" aria-label={mobileOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileOpen} onclick={() => (mobileOpen = !mobileOpen)}>
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
          value={theme.hue}
          oninput={e => (theme.hue = Number(e.target.value))}
        />
        <div class="val">--hue: {theme.hue}</div>
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
          onclick={() => (mobileMediaOpen = !mobileMediaOpen)}
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
            <a
              href={child.path}
              class="mobile-nav-link mobile-nav-child {isActive(child.path) ? 'active' : ''}"
              onclick={() => (mobileOpen = false)}
            >
              <iconify-icon icon={child.icon} width="16" aria-hidden="true"></iconify-icon>
              {child.label}
            </a>
          {/each}
        {/if}
      {:else}
        <a href={link.path} class="mobile-nav-link {isActive(link.path) ? 'active' : ''}" onclick={() => (mobileOpen = false)}>
          <iconify-icon icon={link.icon} width="18" aria-hidden="true"></iconify-icon>
          {link.label}
        </a>
      {/if}
    {/each}
    <button class="mobile-nav-link" onclick={openSearch}>
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
