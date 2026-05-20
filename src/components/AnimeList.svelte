<script>
  import { onMount } from 'svelte';

  export let user = '';

  const QUERY = `query($u:String){MediaListCollection(userName:$u,type:ANIME){lists{status entries{status score progress media{id episodes title{english romaji}coverImage{large extraLarge}bannerImage}}}}}`;

  const STATUS_MAP = { CURRENT:'watching', COMPLETED:'completed', PLANNING:'planning', PAUSED:'paused', DROPPED:'dropped', REPEATING:'watching' };

  const FALLBACK = [
    { id:1,   title:"Spice and Wolf",                    cover:null, banner:null, hue:30,  ep:12, total:12, score:9.4, status:'completed' },
    { id:2,   title:"Frieren: Beyond Journey's End",     cover:null, banner:null, hue:160, ep:28, total:28, score:9.7, status:'completed' },
    { id:3,   title:"Violet Evergarden",                 cover:null, banner:null, hue:270, ep:13, total:13, score:9.6, status:'watching'  },
    { id:4,   title:"Mushishi",                          cover:null, banner:null, hue:100, ep:26, total:26, score:9.2, status:'completed' },
    { id:5,   title:"Bocchi the Rock!",                  cover:null, banner:null, hue:0,   ep:8,  total:12, score:9.0, status:'watching'  },
    { id:6,   title:"Aria the Animation",                cover:null, banner:null, hue:220, ep:13, total:13, score:9.0, status:'completed' },
    { id:7,   title:"Made in Abyss",                     cover:null, banner:null, hue:80,  ep:13, total:13, score:9.3, status:'completed' },
    { id:8,   title:"Apothecary Diaries",                cover:null, banner:null, hue:25,  ep:10, total:24, score:8.9, status:'planning'  },
    { id:9,   title:"Hyouka",                            cover:null, banner:null, hue:50,  ep:22, total:22, score:8.9, status:'completed' },
    { id:10,  title:"K-On!",                             cover:null, banner:null, hue:350, ep:13, total:13, score:9.1, status:'completed' },
    { id:11,  title:"Mononoke",                          cover:null, banner:null, hue:305, ep:12, total:12, score:8.8, status:'completed' },
    { id:12,  title:"A Place Further Than the Universe", cover:null, banner:null, hue:200, ep:13, total:13, score:9.8, status:'planning'  },
  ];

  const TABS = [
    { f:'all',       label:'All'       },
    { f:'watching',  label:'Watching'  },
    { f:'completed', label:'Completed' },
    { f:'planning',  label:'Planning'  },
    { f:'dropped',   label:'Dropped'   },
  ];

  const STATUS_COLOR = {
    watching:  'oklch(0.62 0.18 145)',
    completed: 'oklch(0.60 0.15 250)',
    planning:  'oklch(0.65 0.16 85)',
    paused:    'oklch(0.60 0.07 60)',
    dropped:   'oklch(0.55 0.20 25)',
  };

  let entries  = [];
  let loading  = true;
  let filter   = 'all';
  let sliderEl;

  $: counts   = entries.reduce((a,e)=>{ a.all=(a.all||0)+1; a[e.status]=(a[e.status]||0)+1; return a; },{});
  $: watching = entries.filter(e => e.status === 'watching');
  $: filtered = filter === 'all' ? entries : entries.filter(e => e.status === filter);
  $: featured = watching[0] ?? null;

  function pct(ep, total) { return total > 0 ? Math.min(100, Math.round(ep / total * 100)) : 0; }
  function letter(t) { return (t||'').replace(/[^A-Za-z]/g,'').charAt(0).toUpperCase()||'?'; }
  function aniUrl(id) { return id > 100 ? `https://anilist.co/anime/${id}` : '#'; }

  function slide(dir) {
    if (!sliderEl) return;
    sliderEl.scrollBy({ left: dir * (160 + 12) * 3, behavior: 'smooth' });
  }

  const CACHE_KEY = `anilist-list-${user}`;
  const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

  onMount(() => {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) { const { ts, data } = JSON.parse(raw); if (Date.now() - ts < CACHE_TTL) { entries = data; loading = false; } }
    } catch {}

    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), 9000);
    (async () => {
      try {
        const res = await fetch('https://graphql.anilist.co', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: QUERY, variables: { u: user } }),
          signal: controller.signal,
        });
        if (!res.ok) throw new Error();
        const json = await res.json();
        if (json.errors) throw new Error();
        const flat = [];
        for (const l of json.data?.MediaListCollection?.lists ?? []) {
          for (const e of l.entries ?? []) {
            if (!e.media?.id) continue;
            flat.push({
              id:     e.media.id,
              title:  e.media.title.english || e.media.title.romaji || '?',
              cover:  e.media.coverImage?.extraLarge ?? e.media.coverImage?.large ?? null,
              banner: e.media.bannerImage ?? null,
              hue:    30,
              ep:     e.progress ?? 0,
              total:  e.media.episodes ?? 0,
              score:  e.score > 0 ? e.score : null,
              status: STATUS_MAP[e.status] ?? 'completed',
            });
          }
        }
        const seen = new Set();
        entries = flat.filter(e => { if (seen.has(e.id)) return false; seen.add(e.id); return true; });
        try { localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: entries })); } catch {}
      } catch(err) {
        if (err.name === 'AbortError') return;
        if (!entries.length) entries = FALLBACK;
      } finally {
        clearTimeout(tid);
        loading = false;
      }
    })();
    return () => { clearTimeout(tid); controller.abort(); };
  });
</script>

<!-- ════════════════════════════════════════
     FILTER TABS — underline editorial style
════════════════════════════════════════ -->
<div class="al-bar">
  <nav class="al-tabs" role="tablist">
    {#each TABS as { f, label }}
      <button
        role="tab"
        aria-selected={filter === f}
        class="al-tab"
        class:active={filter === f}
        on:click={() => filter = f}
      >
        {label}
        {#if counts[f]}
          <sup class="al-sup">{counts[f]}</sup>
        {/if}
      </button>
    {/each}
  </nav>

  <span class="al-live-tag">
    {#if loading}
      <span class="al-spinner"></span>
    {:else}
      <span class="al-live-dot"></span>
      {entries.length} titles · @{user}
    {/if}
  </span>
</div>

<!-- ════════════════════════════════════════
     SKELETONS
════════════════════════════════════════ -->
{#if loading}
  <div class="al-grid">
    {#each {length: 20} as _, i}
      <div class="al-poster-wrap sk-wrap" style="--i:{i}">
        <div class="al-poster al-poster-sk"></div>
      </div>
    {/each}
  </div>

{:else}

<!-- ════════════════════════════════════════
     NOW WATCHING — featured hero + slider
════════════════════════════════════════ -->
{#if watching.length > 0 && (filter === 'all' || filter === 'watching')}

  <!-- cinematic hero strip for first watching entry -->
  {#if featured}
    <a href={aniUrl(featured.id)} target="_blank" rel="noopener noreferrer" class="al-hero">
      <!-- blurred backdrop -->
      <div class="al-hero-bg"
        style={featured.cover
          ? `background-image:url(${featured.banner || featured.cover})`
          : `background:linear-gradient(135deg,oklch(0.55 0.18 ${featured.hue}),oklch(0.30 0.22 ${featured.hue}))`}>
      </div>
      <div class="al-hero-scrim"></div>

      <!-- content -->
      <div class="al-hero-body">
        <!-- poster thumbnail -->
        <div class="al-hero-poster"
          style={featured.cover
            ? `background-image:url(${featured.cover})`
            : `background:linear-gradient(160deg,oklch(0.72 0.18 ${featured.hue}),oklch(0.38 0.22 ${featured.hue}))`}>
          {#if !featured.cover}<span class="al-big-letter">{letter(featured.title)}</span>{/if}
        </div>

        <!-- info -->
        <div class="al-hero-info">
          <span class="al-hero-eyebrow">
            <span class="al-live-dot pulse"></span>
            Currently watching
          </span>
          <h2 class="al-hero-title">{featured.title}</h2>
          <div class="al-hero-meta">
            <span class="al-hero-ep">Ep {featured.ep} / {featured.total || '?'}</span>
            {#if featured.score}
              <span class="al-hero-score">★ {(featured.score/10*5).toFixed(1)}</span>
            {/if}
          </div>
          <!-- progress -->
          <div class="al-hero-track">
            <div class="al-hero-fill" style="width:{pct(featured.ep, featured.total)}%"></div>
          </div>
          <span class="al-hero-pct">{pct(featured.ep, featured.total)}% complete</span>
        </div>
      </div>
    </a>
  {/if}

  <!-- slider row for all watching (skip featured if more than 1) -->
  {#if watching.length > 1}
    <div class="al-slider-head">
      <span class="al-section-title">All watching <em class="al-count-em">{watching.length}</em></span>
      <div class="al-arrows">
        <button class="al-arrow" on:click={() => slide(-1)} aria-label="Scroll left">‹</button>
        <button class="al-arrow" on:click={() => slide(1)}  aria-label="Scroll right">›</button>
      </div>
    </div>
    <div class="al-slider-viewport">
      <div class="al-slider" bind:this={sliderEl}>
        {#each watching as a, i (a.id)}
          {@const p = pct(a.ep, a.total)}
          <a href={aniUrl(a.id)} target="_blank" rel="noopener noreferrer"
             class="al-slide" style="--i:{i}">
            <div class="al-poster"
              style={a.cover
                ? `background-image:url(${a.cover})`
                : `background:linear-gradient(160deg,oklch(0.72 0.18 ${a.hue}),oklch(0.38 0.22 ${a.hue}))`}>
              {#if !a.cover}<span class="al-big-letter sm">{letter(a.title)}</span>{/if}
              <div class="al-poster-veil"></div>
              <div class="al-poster-overlay">
                <span class="al-ov-title">{a.title}</span>
                <span class="al-ov-ep">{a.ep}/{a.total||'?'} ep</span>
              </div>
              <!-- progress bar -->
              <div class="al-pbar"><div class="al-pfill" style="width:{p}%"></div></div>
            </div>
          </a>
        {/each}
      </div>
    </div>
  {/if}

  {#if filter === 'all'}
    <div class="al-divider">
      <span class="al-divider-label">All titles</span>
    </div>
  {/if}
{/if}

<!-- ════════════════════════════════════════
     MAIN POSTER GRID
════════════════════════════════════════ -->
{#if filtered.length > 0}
  <div class="al-grid">
    {#each filtered as a, i (a.id)}
      {@const p = pct(a.ep, a.total)}
      {@const sc = a.score ? (a.score/10*5).toFixed(1) : null}
      <a href={aniUrl(a.id)} target="_blank" rel="noopener noreferrer"
         class="al-poster-wrap" style="--i:{i}; --sc:{STATUS_COLOR[a.status]}" data-cursor-card>
        <div class="al-poster"
          style={a.cover
            ? `background-image:url(${a.cover})`
            : `background:linear-gradient(160deg,oklch(0.72 0.18 ${a.hue}) 0%,oklch(0.35 0.22 ${a.hue}) 100%)`}>

          {#if !a.cover}
            <span class="al-big-letter sm">{letter(a.title)}</span>
          {/if}

          <div class="al-poster-veil"></div>

          {#if sc}
            <span class="al-score-badge">★{sc}</span>
          {/if}

          {#if a.total > 0}
            <div class="al-pbar"><div class="al-pfill" style="width:{p}%"></div></div>
          {/if}
        </div>

        <!-- always-visible title below poster -->
        <div class="al-card-label">
          <span class="al-card-title">{a.title}</span>
          <span class="al-card-ep">{a.ep}/{a.total||'?'} ep</span>
        </div>
      </a>
    {/each}
  </div>
{:else}
  <div class="al-empty">
    <iconify-icon icon="material-symbols:tv-off-outline" width="32"></iconify-icon>
    <span>Nothing here yet.</span>
  </div>
{/if}

{/if}

<style>
/* ── Tabs ──────────────────────────────────────── */
.al-bar {
  display: flex; align-items: center;
  justify-content: space-between; gap: 12px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 24px;
  flex-wrap: wrap;
}
.al-tabs { display: flex; gap: 0; }
.al-tab {
  position: relative;
  padding: 10px 16px;
  font-family: var(--font-display); font-size: 13px; font-weight: 600;
  color: var(--fg-3); background: none; border: none; cursor: pointer;
  transition: color 150ms;
  white-space: nowrap;
}
.al-tab::after {
  content: ''; position: absolute; bottom: -1px; left: 0; right: 0;
  height: 2px; background: var(--primary);
  transform: scaleX(0); transition: transform 200ms cubic-bezier(.4,0,.2,1);
  border-radius: 2px 2px 0 0;
}
.al-tab.active { color: var(--fg-1); }
.al-tab.active::after { transform: scaleX(1); }
.al-tab:hover:not(.active) { color: var(--fg-2); }
.al-sup {
  font-size: 9px; font-family: var(--font-mono);
  color: var(--fg-4); vertical-align: super;
  margin-left: 1px; font-weight: 700;
}

.al-live-tag {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 11px; font-family: var(--font-mono); color: var(--fg-3);
  padding-bottom: 8px;
}
.al-live-dot {
  width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0;
  background: oklch(0.62 0.18 145);
}
.al-live-dot.pulse { animation: live-ring 2s ease-out infinite; }
@keyframes live-ring {
  0%  { box-shadow: 0 0 0 0 oklch(0.62 0.18 145 / 0.5); }
  70% { box-shadow: 0 0 0 6px oklch(0.62 0.18 145 / 0); }
  100%{ box-shadow: 0 0 0 0 oklch(0.62 0.18 145 / 0); }
}
.al-spinner {
  width: 12px; height: 12px;
  border: 2px solid var(--border);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Hero ──────────────────────────────────────── */
.al-hero {
  display: block; position: relative;
  border-radius: var(--radius-large); overflow: hidden;
  margin-bottom: 20px; text-decoration: none;
  min-height: 200px;
  transition: transform 200ms;
}
.al-hero:hover { transform: scale(1.005); }

.al-hero-bg {
  position: absolute; inset: 0;
  background-size: cover; background-position: center 30%;
  filter: blur(18px) saturate(1.4);
  transform: scale(1.08);
}
.al-hero-scrim {
  position: absolute; inset: 0;
  background: linear-gradient(135deg,
    rgba(0,0,0,0.82) 0%,
    rgba(0,0,0,0.55) 50%,
    rgba(0,0,0,0.4) 100%);
}
.al-hero-body {
  position: relative; z-index: 1;
  display: flex; align-items: flex-end; gap: 20px;
  padding: 24px;
}
.al-hero-poster {
  width: 110px; height: 155px; flex-shrink: 0;
  border-radius: 8px;
  background-size: cover; background-position: center top;
  box-shadow: 0 8px 32px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3);
  overflow: hidden;
  display: flex; align-items: center; justify-content: center;
}
.al-hero-info {
  flex: 1; min-width: 0;
  display: flex; flex-direction: column; gap: 6px;
}
.al-hero-eyebrow {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 10px; font-weight: 800; letter-spacing: 0.12em;
  text-transform: uppercase; color: oklch(0.62 0.18 145);
  font-family: var(--font-mono);
}
.al-hero-title {
  font-family: var(--font-display); font-weight: 800;
  font-size: clamp(18px, 2.5vw, 26px); line-height: 1.15;
  color: white; margin: 0;
  text-shadow: 0 2px 12px rgba(0,0,0,0.5);
}
.al-hero-meta {
  display: flex; align-items: center; gap: 10px;
}
.al-hero-ep {
  font-size: 13px; font-family: var(--font-mono);
  color: rgba(255,255,255,0.65);
}
.al-hero-score {
  font-size: 12px; font-weight: 700; font-family: var(--font-mono);
  color: oklch(0.85 0.18 80);
  background: oklch(0.85 0.18 80 / 0.15);
  padding: 2px 8px; border-radius: 999px;
}
.al-hero-track {
  width: 100%; max-width: 280px; height: 3px;
  background: rgba(255,255,255,0.15); border-radius: 999px; overflow: hidden;
}
.al-hero-fill {
  height: 100%; border-radius: 999px;
  background: linear-gradient(90deg, oklch(0.62 0.18 145), oklch(0.75 0.18 160));
  transition: width 800ms cubic-bezier(.4,0,.2,1);
}
.al-hero-pct {
  font-size: 11px; font-family: var(--font-mono);
  color: rgba(255,255,255,0.4);
}

/* ── Slider ────────────────────────────────────── */
.al-slider-head {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 10px;
}
.al-section-title {
  font-size: 11px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.08em; color: var(--fg-3);
  font-family: var(--font-mono);
}
.al-count-em {
  font-style: normal;
  background: var(--primary-soft); color: var(--primary);
  padding: 1px 7px; border-radius: 999px;
  font-size: 10px; margin-left: 4px;
}
.al-arrows { display: flex; gap: 4px; }
.al-arrow {
  width: 28px; height: 28px; border-radius: 50%;
  border: 1px solid var(--border);
  background: var(--card-bg); color: var(--fg-2);
  font-size: 16px; line-height: 1;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: background 120ms, color 120ms, transform 100ms;
}
.al-arrow:hover { background: var(--primary); color: white; border-color: transparent; }
.al-arrow:active { transform: scale(0.9); }

.al-slider-viewport {
  overflow: hidden; /* clip, no fake fade */
  margin-bottom: 28px;
  width: 100%; min-width: 0;
}
.al-slider {
  display: flex; gap: 10px;
  overflow-x: auto; scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  padding-bottom: 6px;
  scrollbar-width: none;
}
.al-slider::-webkit-scrollbar { display: none; }

.al-slide {
  flex: 0 0 150px;
  scroll-snap-align: start;
  text-decoration: none;
  display: block;
  animation: card-in 200ms cubic-bezier(.4,0,.2,1) calc(var(--i)*22ms) both;
}
.al-slide .al-poster {
  border-radius: var(--radius-large);
  border: 1px solid oklch(0 0 0 / 0.08);
}

/* ── Poster (shared) ───────────────────────────── */
.al-poster {
  aspect-ratio: 2 / 3;
  background-size: cover; background-position: center top;
  position: relative; overflow: hidden;
  transition: transform 250ms cubic-bezier(.4,0,.2,1), box-shadow 250ms;
  box-shadow: 0 2px 10px rgba(0,0,0,0.10);
  display: flex; align-items: center; justify-content: center;
}
.al-poster-wrap:hover .al-poster,
.al-slide:hover .al-poster {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 16px 36px rgba(0,0,0,0.22), 0 4px 8px rgba(0,0,0,0.10);
}
.al-big-letter {
  font-family: var(--font-display); font-weight: 900;
  font-size: 64px; color: white; opacity: 0.45;
  text-shadow: 0 4px 20px rgba(0,0,0,0.3);
  line-height: 1; user-select: none;
}
.al-big-letter.sm { font-size: 44px; }

/* veil — subtle bottom gradient always visible */
.al-poster-veil {
  position: absolute; inset: 0; pointer-events: none;
  background: linear-gradient(to bottom, transparent 45%, rgba(0,0,0,0.72) 100%);
}

/* score badge */
.al-score-badge {
  position: absolute; top: 7px; right: 7px; z-index: 3;
  font-size: 10px; font-weight: 800; font-family: var(--font-mono);
  background: oklch(0.92 0.18 85 / 0.95);
  color: oklch(0.22 0.06 60);
  padding: 2px 6px; border-radius: 999px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.25);
}

/* hover overlay — only on slider cards */
.al-poster-overlay {
  position: absolute; bottom: 0; left: 0; right: 0; z-index: 4;
  padding: 10px 10px 12px;
  display: flex; flex-direction: column; gap: 2px;
  transform: translateY(6px); opacity: 0;
  transition: transform 200ms, opacity 200ms;
}
.al-slide:hover .al-poster-overlay { transform: none; opacity: 1; }

.al-ov-title {
  font-family: var(--font-display); font-weight: 700;
  font-size: 11.5px; color: white; line-height: 1.3;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  text-shadow: 0 1px 4px rgba(0,0,0,0.8);
}
.al-ov-ep {
  font-size: 10px; font-family: var(--font-mono);
  color: rgba(255,255,255,0.55);
}


/* progress bar */
.al-pbar {
  position: absolute; bottom: 0; left: 0; right: 0;
  height: 2px; background: rgba(255,255,255,0.12); z-index: 3;
}
.al-pfill {
  height: 100%;
  background: linear-gradient(90deg, oklch(0.62 0.18 145), oklch(0.76 0.18 160));
  transition: width 600ms cubic-bezier(.4,0,.2,1);
}

/* ── Main grid ─────────────────────────────────── */
.al-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(155px, 1fr));
  gap: 16px;
}
.al-poster-wrap {
  display: flex; flex-direction: column; gap: 7px;
  text-decoration: none;
  animation: card-in 200ms cubic-bezier(.4,0,.2,1) calc(var(--i)*12ms) both;
}
.al-poster-wrap .al-poster { border-radius: var(--radius-large); }

/* card label */
.al-card-label {
  display: flex; flex-direction: column; gap: 2px;
  padding: 0 2px;
}
.al-card-title {
  font-family: var(--font-display); font-size: 12.5px; font-weight: 600;
  color: var(--fg-1); line-height: 1.3;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.al-card-ep {
  font-size: 10.5px; font-family: var(--font-mono); color: var(--fg-3);
}
@keyframes card-in {
  from { opacity: 0; transform: translateY(10px) scale(0.97); }
  to   { opacity: 1; transform: none; }
}

/* ── Divider ───────────────────────────────────── */
.al-divider {
  display: flex; align-items: center; gap: 12px;
  margin: 4px 0 20px;
}
.al-divider::before, .al-divider::after {
  content: ''; flex: 1; height: 1px; background: var(--border);
}
.al-divider-label {
  font-size: 10px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.10em; color: var(--fg-4);
  font-family: var(--font-mono); white-space: nowrap;
}

/* ── Skeleton ──────────────────────────────────── */
.sk-wrap { border-radius: var(--radius-large); overflow: hidden; }
.al-poster-sk {
  background: linear-gradient(90deg,
    var(--btn-regular-bg) 0%,
    var(--btn-regular-bg-hover) 50%,
    var(--btn-regular-bg) 100%);
  background-size: 200% 100%;
  animation: skim 1s ease-in-out infinite;
  box-shadow: none !important;
}
@keyframes skim { 0%{background-position:-100% 0} 100%{background-position:100% 0} }

/* ── Empty ─────────────────────────────────────── */
.al-empty {
  display: flex; flex-direction: column; align-items: center;
  gap: 10px; padding: 56px; color: var(--fg-3); font-size: 14px;
}
</style>
