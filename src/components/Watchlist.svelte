<script>
  import { onMount } from 'svelte';
  import { WATCHLIST, posterUrl, fetchWatchlistFromSimkl } from '../data/watchlist';
  import { SIMKL } from '../config';

  const STATUS_COLOR = {
    watching:  'oklch(0.62 0.18 200)',
    completed: 'oklch(0.60 0.15 145)',
    plan:      'oklch(0.65 0.14 85)',
    hold:      'oklch(0.60 0.07 60)',
    dropped:   'oklch(0.55 0.20 25)',
  };

  const TABS = [
    { id: 'all',       label: 'All'      },
    { id: 'movie',     label: 'Movies'   },
    { id: 'tv',        label: 'TV Shows' },
  ];

  const STATUS_TABS = [
    { id: 'all',       label: 'All'       },
    { id: 'watching',  label: 'Watching'  },
    { id: 'completed', label: 'Completed' },
    { id: 'plan',      label: 'Plan'      },
    { id: 'hold',      label: 'On Hold'   },
    { id: 'dropped',   label: 'Dropped'   },
  ];

  let typeFilter   = 'all';
  let statusFilter = 'all';
  let sliderEl;
  let entries = WATCHLIST;

  // Fetch real data from SIMKL on mount
  onMount(async () => {
    if (SIMKL.user && SIMKL.clientId) {
      try {
        const simklData = await fetchWatchlistFromSimkl(SIMKL.user, SIMKL.clientId);
        if (simklData && simklData.length > 0) {
          entries = simklData;
        }
      } catch (err) {
        console.warn('Failed to fetch SIMKL data, using fallback:', err);
      }
    }
  });

  $: watching  = entries.filter(e => e.status === 'watching');
  $: featured  = watching[0] ?? null;

  $: filtered = entries.filter(e => {
    const typeOk   = typeFilter   === 'all' || e.type   === typeFilter;
    const statusOk = statusFilter === 'all' || e.status === statusFilter;
    return typeOk && statusOk;
  });

  $: counts = entries.reduce((a, e) => {
    a[e.type]   = (a[e.type]   ?? 0) + 1;
    a[e.status] = (a[e.status] ?? 0) + 1;
    return a;
  }, /** @type {Record<string,number>} */({ all: entries.length }));

  function pct(watched, total) {
    return total > 0 ? Math.min(100, Math.round((watched / total) * 100)) : 0;
  }

  function letter(t) {
    return (t || '').replace(/[^A-Za-z]/g, '').charAt(0).toUpperCase() || '?';
  }

  function slide(dir) {
    sliderEl?.scrollBy({ left: dir * (160 + 10) * 3, behavior: 'smooth' });
  }

  function gradientFor(hue = 30) {
    return `linear-gradient(160deg,oklch(0.72 0.18 ${hue}),oklch(0.38 0.22 ${hue}))`;
  }
</script>

<!-- ── Filter bar ─────────────────────────────────── -->
<div class="wl-bar">
  <nav class="wl-tabs" role="tablist">
    {#each TABS as { id, label }}
      <button
        role="tab"
        aria-selected={typeFilter === id}
        class="wl-tab"
        class:active={typeFilter === id}
        on:click={() => typeFilter = id}
      >
        {label}
        {#if counts[id]}
          <sup class="wl-sup">{counts[id]}</sup>
        {/if}
      </button>
    {/each}
  </nav>

  <nav class="wl-status-tabs" role="tablist">
    {#each STATUS_TABS as { id, label }}
      {#if counts[id] || id === 'all'}
        <button
          role="tab"
          aria-selected={statusFilter === id}
          class="wl-stab"
          class:active={statusFilter === id}
          on:click={() => statusFilter = id}
        >
          {label}
          {#if id !== 'all' && counts[id]}
            <sup class="wl-sup">{counts[id]}</sup>
          {/if}
        </button>
      {/if}
    {/each}
  </nav>
</div>

<!-- ── Currently watching hero ───────────────────── -->
{#if watching.length > 0 && (typeFilter === 'all' || watching.some(e => e.type === typeFilter)) && (statusFilter === 'all' || statusFilter === 'watching')}
  {#if featured && (typeFilter === 'all' || featured.type === typeFilter)}
    {@const p = featured.type === 'tv' ? pct(featured.episodesWatched ?? 0, featured.episodesTotal ?? 0) : 0}
    <a
      href={`https://www.themoviedb.org/${featured.type}/${featured.id}`}
      target="_blank" rel="noopener noreferrer"
      class="wl-hero"
    >
      <div class="wl-hero-bg"
        style={featured.poster
          ? `background-image:url(${posterUrl(featured.poster, 'w780')})`
          : `background:${gradientFor(featured.hue)}`}>
      </div>
      <div class="wl-hero-scrim"></div>
      <div class="wl-hero-body">
        <div class="wl-hero-poster"
          style={featured.poster
            ? `background-image:url(${posterUrl(featured.poster)})`
            : `background:${gradientFor(featured.hue)}`}>
          {#if !featured.poster}<span class="wl-big-letter">{letter(featured.title)}</span>{/if}
        </div>
        <div class="wl-hero-info">
          <span class="wl-hero-eyebrow">
            <span class="wl-live-dot pulse"></span>
            Currently {featured.type === 'tv' ? 'watching' : 'watching'}
            · <span class="wl-type-badge">{featured.type === 'tv' ? 'TV' : 'Movie'}</span>
          </span>
          <h2 class="wl-hero-title">{featured.title}{featured.year ? ` (${featured.year})` : ''}</h2>
          {#if featured.type === 'tv' && featured.episodesWatched != null}
            <div class="wl-hero-meta">
              <span class="wl-hero-ep">Ep {featured.episodesWatched} / {featured.episodesTotal ?? '?'}</span>
              {#if featured.seasons}<span class="wl-hero-seasons">{featured.seasons} seasons</span>{/if}
              {#if featured.score}<span class="wl-hero-score">★ {featured.score}/10</span>{/if}
            </div>
            <div class="wl-hero-track">
              <div class="wl-hero-fill" style="width:{p}%"></div>
            </div>
            <span class="wl-hero-pct">{p}% complete</span>
          {:else if featured.score}
            <div class="wl-hero-meta">
              <span class="wl-hero-score">★ {featured.score}/10</span>
            </div>
          {/if}
          {#if featured.note}
            <p class="wl-hero-note">"{featured.note}"</p>
          {/if}
        </div>
      </div>
    </a>
  {/if}

  {#if watching.length > 1}
    <div class="wl-slider-head">
      <span class="wl-section-title">All watching <em class="wl-count-em">{watching.length}</em></span>
      <div class="wl-arrows">
        <button class="wl-arrow" on:click={() => slide(-1)} aria-label="Scroll left">‹</button>
        <button class="wl-arrow" on:click={() => slide(1)}  aria-label="Scroll right">›</button>
      </div>
    </div>
    <div class="wl-slider-viewport">
      <div class="wl-slider" bind:this={sliderEl}>
        {#each watching as e, i (e.id)}
          {@const ep = pct(e.episodesWatched ?? 0, e.episodesTotal ?? 0)}
          <a href={`https://www.themoviedb.org/${e.type}/${e.id}`} target="_blank" rel="noopener noreferrer"
             class="wl-slide" style="--i:{i}">
            <div class="wl-poster"
              style={e.poster
                ? `background-image:url(${posterUrl(e.poster)})`
                : `background:${gradientFor(e.hue)}`}>
              {#if !e.poster}<span class="wl-big-letter sm">{letter(e.title)}</span>{/if}
              <div class="wl-poster-veil"></div>
              <div class="wl-poster-overlay">
                <span class="wl-ov-title">{e.title}</span>
                <span class="wl-ov-ep">{e.type === 'tv' ? `Ep ${e.episodesWatched ?? 0}/${e.episodesTotal ?? '?'}` : (e.year ?? '')}</span>
              </div>
              {#if e.type === 'tv' && e.episodesTotal}
                <div class="wl-pbar"><div class="wl-pfill" style="width:{ep}%"></div></div>
              {/if}
            </div>
          </a>
        {/each}
      </div>
    </div>
  {/if}

  {#if statusFilter === 'all'}
    <div class="wl-divider"><span class="wl-divider-label">All titles</span></div>
  {/if}
{/if}

<!-- ── Poster grid ─────────────────────────────────── -->
{#if filtered.length > 0}
  <div class="wl-grid">
    {#each filtered as e, i (e.id)}
      {@const ep = pct(e.episodesWatched ?? 0, e.episodesTotal ?? 0)}
      {@const sc = e.score ?? null}
      <a
        href={`https://www.themoviedb.org/${e.type}/${e.id}`}
        target="_blank" rel="noopener noreferrer"
        class="wl-poster-wrap"
        style="--i:{i}; --sc:{STATUS_COLOR[e.status]}"
      >
        <div class="wl-poster"
          style={e.poster
            ? `background-image:url(${posterUrl(e.poster)})`
            : `background:${gradientFor(e.hue)}`}>
          {#if !e.poster}<span class="wl-big-letter sm">{letter(e.title)}</span>{/if}
          <div class="wl-poster-veil"></div>

          <!-- type badge -->
          <span class="wl-type-pill">{e.type === 'tv' ? 'TV' : '🎬'}</span>

          {#if sc}
            <span class="wl-score-badge">★{sc}</span>
          {/if}

          {#if e.type === 'tv' && e.episodesTotal}
            <div class="wl-pbar"><div class="wl-pfill" style="width:{ep}%"></div></div>
          {/if}
        </div>

        <div class="wl-card-label">
          <span class="wl-card-title">{e.title}</span>
          <span class="wl-card-sub">
            {e.year ?? ''}
            {e.type === 'tv' && e.seasons ? ` · S${e.seasons}` : ''}
            {e.type === 'tv' && e.episodesWatched != null ? ` · Ep ${e.episodesWatched}/${e.episodesTotal ?? '?'}` : ''}
          </span>
        </div>
      </a>
    {/each}
  </div>
{:else}
  <div class="wl-empty">
    <iconify-icon icon="material-symbols:movie-outline" width="32"></iconify-icon>
    <span>Nothing here yet.</span>
  </div>
{/if}

<style>
/* ── Filter bar ─────────────────────────────────── */
.wl-bar {
  display: flex; align-items: center;
  justify-content: space-between; gap: 12px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 24px; flex-wrap: wrap;
}
.wl-tabs, .wl-status-tabs { display: flex; }
.wl-tab, .wl-stab {
  position: relative;
  padding: 10px 14px;
  font-family: var(--font-display); font-size: 13px; font-weight: 600;
  color: var(--fg-3); background: none; border: none; cursor: pointer;
  transition: color 150ms; white-space: nowrap;
}
.wl-tab::after, .wl-stab::after {
  content: ''; position: absolute; bottom: -1px; left: 0; right: 0;
  height: 2px; background: var(--primary);
  transform: scaleX(0); transition: transform 200ms cubic-bezier(.4,0,.2,1);
  border-radius: 2px 2px 0 0;
}
.wl-tab.active, .wl-stab.active { color: var(--fg-1); }
.wl-tab.active::after, .wl-stab.active::after { transform: scaleX(1); }
.wl-tab:hover:not(.active), .wl-stab:hover:not(.active) { color: var(--fg-2); }
.wl-sup { font-size: 9px; font-family: var(--font-mono); color: var(--fg-4); vertical-align: super; margin-left: 1px; font-weight: 700; }

/* ── Hero ─────────────────────────────────────────── */
.wl-hero {
  display: block; position: relative;
  border-radius: var(--radius-large); overflow: hidden;
  margin-bottom: 20px; text-decoration: none;
  min-height: 200px; transition: transform 200ms;
}
.wl-hero:hover { transform: scale(1.005); }
.wl-hero-bg {
  position: absolute; inset: 0;
  background-size: cover; background-position: center 30%;
  filter: blur(18px) saturate(1.4); transform: scale(1.08);
}
.wl-hero-scrim {
  position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.4) 100%);
}
.wl-hero-body {
  position: relative; z-index: 1;
  display: flex; align-items: flex-end; gap: 20px; padding: 24px;
}
.wl-hero-poster {
  width: 110px; height: 155px; flex-shrink: 0;
  border-radius: 8px; background-size: cover; background-position: center top;
  box-shadow: 0 8px 32px rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center; overflow: hidden;
}
.wl-hero-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 6px; }
.wl-hero-eyebrow {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 10px; font-weight: 800; letter-spacing: 0.12em;
  text-transform: uppercase; color: oklch(0.62 0.18 200); font-family: var(--font-mono);
}
.wl-type-badge {
  background: rgba(255,255,255,0.15); color: white;
  padding: 1px 7px; border-radius: 999px; font-size: 9px; font-weight: 700;
  letter-spacing: 0.06em;
}
.wl-live-dot {
  width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0;
  background: oklch(0.62 0.18 200);
}
.wl-live-dot.pulse { animation: wl-ring 2s ease-out infinite; }
@keyframes wl-ring {
  0%  { box-shadow: 0 0 0 0 oklch(0.62 0.18 200 / 0.5); }
  70% { box-shadow: 0 0 0 6px oklch(0.62 0.18 200 / 0); }
  100%{ box-shadow: 0 0 0 0 oklch(0.62 0.18 200 / 0); }
}
.wl-hero-title {
  font-family: var(--font-display); font-weight: 800;
  font-size: clamp(18px, 2.5vw, 26px); line-height: 1.15;
  color: white; margin: 0; text-shadow: 0 2px 12px rgba(0,0,0,0.5);
}
.wl-hero-meta { display: flex; align-items: center; gap: 10px; }
.wl-hero-ep { font-size: 13px; font-family: var(--font-mono); color: rgba(255,255,255,0.65); }
.wl-hero-seasons { font-size: 12px; font-family: var(--font-mono); color: rgba(255,255,255,0.45); }
.wl-hero-score {
  font-size: 12px; font-weight: 700; font-family: var(--font-mono);
  color: oklch(0.85 0.18 80); background: oklch(0.85 0.18 80 / 0.15);
  padding: 2px 8px; border-radius: 999px;
}
.wl-hero-track {
  width: 100%; max-width: 280px; height: 3px;
  background: rgba(255,255,255,0.15); border-radius: 999px; overflow: hidden;
}
.wl-hero-fill {
  height: 100%; border-radius: 999px;
  background: linear-gradient(90deg, oklch(0.62 0.18 200), oklch(0.75 0.18 220));
  transition: width 800ms cubic-bezier(.4,0,.2,1);
}
.wl-hero-pct { font-size: 11px; font-family: var(--font-mono); color: rgba(255,255,255,0.4); }
.wl-hero-note { font-size: 13px; font-style: italic; color: rgba(255,255,255,0.6); margin: 0; }

/* ── Slider ───────────────────────────────────────── */
.wl-slider-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.wl-section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--fg-3); font-family: var(--font-mono); }
.wl-count-em { font-style: normal; background: var(--primary-soft); color: var(--primary); padding: 1px 7px; border-radius: 999px; font-size: 10px; margin-left: 4px; }
.wl-arrows { display: flex; gap: 4px; }
.wl-arrow { width: 28px; height: 28px; border-radius: 50%; border: 1px solid var(--border); background: var(--card-bg); color: var(--fg-2); font-size: 16px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background 120ms, color 120ms, transform 100ms; }
.wl-arrow:hover { background: var(--primary); color: white; border-color: transparent; }
.wl-arrow:active { transform: scale(0.9); }
.wl-slider-viewport { overflow: hidden; margin-bottom: 28px; }
.wl-slider { display: flex; gap: 10px; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; padding-bottom: 4px; }
.wl-slider::-webkit-scrollbar { display: none; }
.wl-slide { flex: 0 0 150px; scroll-snap-align: start; text-decoration: none; display: block; animation: wl-in 200ms cubic-bezier(.4,0,.2,1) calc(var(--i)*22ms) both; }
.wl-slide .wl-poster { border-radius: var(--radius-large); border: 1px solid oklch(0 0 0 / 0.08); }

/* ── Poster (shared) ──────────────────────────────── */
.wl-poster {
  aspect-ratio: 2 / 3; background-size: cover; background-position: center top;
  position: relative; overflow: hidden;
  transition: transform 250ms cubic-bezier(.4,0,.2,1), box-shadow 250ms;
  box-shadow: 0 2px 10px rgba(0,0,0,0.10);
  display: flex; align-items: center; justify-content: center;
}
.wl-poster-wrap:hover .wl-poster, .wl-slide:hover .wl-poster {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 16px 36px rgba(0,0,0,0.22), 0 4px 8px rgba(0,0,0,0.10);
}
.wl-big-letter { font-family: var(--font-display); font-weight: 900; font-size: 64px; color: white; opacity: 0.45; line-height: 1; user-select: none; }
.wl-big-letter.sm { font-size: 44px; }
.wl-poster-veil { position: absolute; inset: 0; pointer-events: none; background: linear-gradient(to bottom, transparent 45%, rgba(0,0,0,0.72) 100%); }

.wl-type-pill {
  position: absolute; top: 7px; left: 7px; z-index: 3;
  font-size: 9px; font-weight: 800; font-family: var(--font-mono);
  background: oklch(0.10 0.02 var(--hue) / 0.75); color: rgba(255,255,255,0.85);
  padding: 2px 6px; border-radius: 999px;
  backdrop-filter: blur(4px);
}
.wl-score-badge {
  position: absolute; top: 7px; right: 7px; z-index: 3;
  font-size: 10px; font-weight: 800; font-family: var(--font-mono);
  background: oklch(0.92 0.18 85 / 0.95); color: oklch(0.22 0.06 60);
  padding: 2px 6px; border-radius: 999px; box-shadow: 0 2px 6px rgba(0,0,0,0.25);
}
.wl-poster-overlay {
  position: absolute; bottom: 0; left: 0; right: 0; z-index: 4;
  padding: 10px 10px 12px;
  display: flex; flex-direction: column; gap: 2px;
  transform: translateY(6px); opacity: 0; transition: transform 200ms, opacity 200ms;
}
.wl-slide:hover .wl-poster-overlay { transform: none; opacity: 1; }
.wl-ov-title { font-family: var(--font-display); font-weight: 700; font-size: 11.5px; color: white; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-shadow: 0 1px 4px rgba(0,0,0,0.8); }
.wl-ov-ep { font-size: 10px; font-family: var(--font-mono); color: rgba(255,255,255,0.55); }
.wl-pbar { position: absolute; bottom: 0; left: 0; right: 0; height: 2px; background: rgba(255,255,255,0.12); z-index: 3; }
.wl-pfill { height: 100%; background: linear-gradient(90deg, oklch(0.62 0.18 200), oklch(0.76 0.18 220)); transition: width 600ms cubic-bezier(.4,0,.2,1); }

/* ── Grid ─────────────────────────────────────────── */
.wl-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 16px; }
.wl-poster-wrap { display: flex; flex-direction: column; gap: 7px; text-decoration: none; animation: wl-in 200ms cubic-bezier(.4,0,.2,1) calc(var(--i)*12ms) both; }
.wl-poster-wrap .wl-poster { border-radius: var(--radius-large); }
.wl-card-label { display: flex; flex-direction: column; gap: 2px; padding: 0 2px; }
.wl-card-title { font-family: var(--font-display); font-size: 12.5px; font-weight: 600; color: var(--fg-1); line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.wl-card-sub { font-size: 10.5px; font-family: var(--font-mono); color: var(--fg-3); }

@keyframes wl-in { from { opacity: 0; transform: translateY(10px) scale(0.97); } to { opacity: 1; transform: none; } }

/* ── Divider ──────────────────────────────────────── */
.wl-divider { display: flex; align-items: center; gap: 12px; margin: 4px 0 20px; }
.wl-divider::before, .wl-divider::after { content: ''; flex: 1; height: 1px; background: var(--border); }
.wl-divider-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.10em; color: var(--fg-4); font-family: var(--font-mono); white-space: nowrap; }

/* ── Empty ────────────────────────────────────────── */
.wl-empty { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 56px; color: var(--fg-3); font-size: 14px; }
</style>
