<script>
  import { onMount } from 'svelte';
  import { LASTFM } from '../config';

  const TABS = [
    { id: 'recent',  label: 'Recent'      },
    { id: 'tracks',  label: 'Top Tracks'  },
    { id: 'artists', label: 'Top Artists' },
    { id: 'albums',  label: 'Top Albums'  },
  ];
  const PERIODS = [
    { id: '7day',    label: '7 days'  },
    { id: '1month',  label: '1 month' },
    { id: '6month',  label: '6 months'},
    { id: '12month', label: '1 year'  },
    { id: 'overall', label: 'All time'},
  ];

  let tab    = 'recent';
  let period = 'overall';
  let state  = 'loading'; // loading | ok | error
  let recent  = [];
  let tracks  = [];
  let artists = [];
  let albums  = [];

  $: nowPlaying = recent.find(t => t.nowPlaying) ?? null;
  $: hero = nowPlaying ?? recent[0] ?? null;

  function rel(uts) {
    const d = Math.floor(Date.now() / 1000 - uts);
    if (d < 60)    return 'just now';
    if (d < 3600)  return `${Math.floor(d/60)}m ago`;
    if (d < 86400) return `${Math.floor(d/3600)}h ago`;
    if (d < 86400*2) return 'yesterday';
    return `${Math.floor(d/86400)}d ago`;
  }

  const BASE = 'https://ws.audioscrobbler.com/2.0/';
  const LFM_PLACEHOLDER = '2a96cbd8b46e442fc41c2b86b821562f';
  const RECENT_CACHE_KEY = `lfm-recent-${LASTFM.user}`;
  const RECENT_TTL = 60 * 1000; // 1 min — recent tracks change fast

  function lfm(params) {
    const p = new URLSearchParams({ api_key: LASTFM.key, format: 'json', user: LASTFM.user, ...params });
    return fetch(`${BASE}?${p}`, { signal: AbortSignal.timeout(8000) }).then(r => r.json());
  }

  function getRecentCache() {
    try {
      const raw = sessionStorage.getItem(RECENT_CACHE_KEY);
      if (!raw) return null;
      const { ts, data } = JSON.parse(raw);
      return Date.now() - ts < RECENT_TTL ? data : null;
    } catch { return null; }
  }
  function setRecentCache(data) {
    try { sessionStorage.setItem(RECENT_CACHE_KEY, JSON.stringify({ ts: Date.now(), data })); } catch {}
  }

  function lfmCover(images) {
    const img = images?.find(img => img.size === 'extralarge')?.['#text']
             || images?.find(img => img.size === 'large')?.['#text'];
    return img && !img.includes(LFM_PLACEHOLDER) ? img : null;
  }

  async function loadRecent() {
    const cached = getRecentCache();
    if (cached) { recent = cached; state = 'ok'; }
    else state = 'loading';

    try {
      const json = await lfm({ method: 'user.getrecenttracks', limit: '30', extended: '1' });
      if (json.error) throw new Error(json.message);
      recent = (json.recenttracks?.track ?? []).map(t => ({
        title:      t.name,
        artist:     t.artist?.name ?? t.artist?.['#text'] ?? 'Unknown',
        album:      t.album?.['#text'] ?? '',
        cover:      lfmCover(t.image),
        url:        t.url ?? null,
        nowPlaying: t['@attr']?.nowplaying === 'true',
        when:       t['@attr']?.nowplaying === 'true' ? 'now' : rel(Number(t.date?.uts)),
        loved:      t.loved === '1',
      }));
      setRecentCache(recent);
      state = 'ok';
    } catch {
      if (!cached) state = 'error';
    }
  }

  async function loadTopTracks() {
    state = 'loading';
    try {
      const json = await lfm({ method: 'user.gettoptracks', limit: '30', period });
      if (json.error) throw new Error(json.message);
      tracks = (json.toptracks?.track ?? []).map((t, idx) => ({
        rank:   idx + 1,
        title:  t.name,
        artist: t.artist?.name ?? 'Unknown',
        plays:  Number(t.playcount),
        cover:  lfmCover(t.image),
        url:    t.url ?? null,
      }));
      state = 'ok';
    } catch {
      state = 'error';
    }
  }

  async function loadTopArtists() {
    state = 'loading';
    try {
      const json = await lfm({ method: 'user.gettopartists', limit: '30', period });
      if (json.error) throw new Error(json.message);
      artists = (json.topartists?.artist ?? []).map((a, idx) => ({
        rank:  idx + 1,
        name:  a.name,
        plays: Number(a.playcount),
        cover: lfmCover(a.image),
        url:   a.url ?? null,
      }));
      state = 'ok';
    } catch {
      state = 'error';
    }
  }

  async function loadTopAlbums() {
    state = 'loading';
    try {
      const json = await lfm({ method: 'user.gettopalbums', limit: '30', period });
      if (json.error) throw new Error(json.message);
      albums = (json.topalbums?.album ?? []).map((a, idx) => ({
        rank:   idx + 1,
        title:  a.name,
        artist: a.artist?.name ?? 'Unknown',
        plays:  Number(a.playcount),
        cover:  lfmCover(a.image),
        url:    a.url ?? null,
      }));
      state = 'ok';
    } catch {
      state = 'error';
    }
  }

  function load() {
    if (tab === 'recent')  return loadRecent();
    if (tab === 'tracks')  return loadTopTracks();
    if (tab === 'artists') return loadTopArtists();
    if (tab === 'albums')  return loadTopAlbums();
  }

  $: if (typeof window !== 'undefined') load(); // reactive re-fetch on tab/period change

  onMount(load);
</script>

<!-- ── Tabs ─────────────────────────────────────── -->
<div class="mf-bar">
  <nav class="mf-tabs" role="tablist">
    {#each TABS as t}
      <button
        role="tab"
        class="mf-tab"
        class:active={tab === t.id}
        aria-selected={tab === t.id}
        on:click={() => { tab = t.id; }}
      >{t.label}</button>
    {/each}
  </nav>

  <div class="mf-right">
    {#if tab !== 'recent'}
      <div class="mf-periods">
        {#each PERIODS as p}
          <button
            class="mf-period"
            class:active={period === p.id}
            on:click={() => { period = p.id; }}
          >{p.label}</button>
        {/each}
      </div>
    {/if}

    <span class="mf-status">
      {#if state === 'loading'}
        <span class="mf-spinner"></span>
      {:else if state === 'ok'}
        <span class="mf-dot" class:live={tab === 'recent'}></span>
        {#if tab === 'recent'}Live{:else}Last.fm{/if}
      {:else}
        <span style="color:var(--fg-4)">offline</span>
      {/if}
    </span>
  </div>
</div>

<!-- ── Content ───────────────────────────────────── -->

{#if tab === 'recent'}

  <!-- hero: now playing or most recent -->
  {#if hero}
    <a href={hero.url ?? undefined} target="_blank" rel="noopener noreferrer" class="mf-hero">
      <div class="mf-hero-bg" style={hero.cover ? `background-image:url(${hero.cover})` : 'background:var(--primary-soft)'}></div>
      <div class="mf-hero-scrim"></div>
      <div class="mf-hero-body">
        <div class="mf-hero-cover" style={hero.cover ? `background-image:url(${hero.cover})` : ''}></div>
        <div class="mf-hero-info">
          <span class="mf-hero-eyebrow">
            {#if hero.nowPlaying}
              <span class="mf-dot live pulse"></span> Now playing
            {:else}
              <span class="mf-dot"></span> Most recent
            {/if}
          </span>
          <h2 class="mf-hero-title">{hero.title}</h2>
          <p class="mf-hero-artist">{hero.artist}</p>
          {#if hero.album}<p class="mf-hero-album">{hero.album}</p>{/if}
          <span class="mf-hero-when">{hero.when}</span>
        </div>
      </div>
    </a>
  {/if}

  <!-- track list -->
  <div class="mf-list">
    {#if state === 'loading'}
      {#each {length: 12} as _, i}
        <div class="mf-row mf-row-sk" style="--i:{i}">
          <div class="mf-cover sk"></div>
          <div class="mf-row-info">
            <div class="sk-line" style="width:65%"></div>
            <div class="sk-line" style="width:40%;height:9px;margin-top:4px"></div>
          </div>
        </div>
      {/each}
    {:else}
      {#each recent as t, i}
        {#if !t.nowPlaying || i > 0}
          <a
            href={t.url ?? undefined}
            target="_blank" rel="noopener noreferrer"
            class="mf-row"
            class:playing={t.nowPlaying}
            style="--i:{i}"
          >
            <div class="mf-cover" style={t.cover ? `background-image:url(${t.cover})` : ''}>
              {#if t.nowPlaying}
                <span class="mf-bars" aria-label="Now playing"><i></i><i></i><i></i></span>
              {:else if !t.cover}
                <iconify-icon icon="material-symbols:music-note" width="16"></iconify-icon>
              {/if}
            </div>
            <div class="mf-row-info">
              <span class="mf-row-title">{t.title}</span>
              <span class="mf-row-sub">{t.artist}{t.album ? ` · ${t.album}` : ''}</span>
            </div>
            <span class="mf-row-when">{t.when}</span>
            {#if t.loved}<iconify-icon icon="material-symbols:favorite" width="12" class="mf-loved"></iconify-icon>{/if}
          </a>
        {/if}
      {/each}
      {#if recent.length === 0 && state === 'ok'}
        <div class="mf-empty">No recent tracks found.</div>
      {/if}
    {/if}
  </div>

{:else if tab === 'tracks'}

  <div class="mf-rank-list">
    {#if state === 'loading'}
      {#each {length: 10} as _, i}
        <div class="mf-rank-row sk-row" style="--i:{i}">
          <div class="mf-cover sk" style="width:52px;height:52px"></div>
          <div class="mf-row-info">
            <div class="sk-line" style="width:60%"></div>
            <div class="sk-line" style="width:35%;height:9px;margin-top:5px"></div>
          </div>
        </div>
      {/each}
    {:else}
      {#each tracks as t, i}
        <a
          href={t.url ?? undefined}
          target="_blank" rel="noopener noreferrer"
          class="mf-rank-row"
          style="--i:{i}"
        >
          <span class="mf-rank-num">{t.rank}</span>
          <div class="mf-cover lg" style={t.cover ? `background-image:url(${t.cover})` : ''}>
            {#if !t.cover}<iconify-icon icon="material-symbols:music-note" width="20"></iconify-icon>{/if}
          </div>
          <div class="mf-row-info">
            <span class="mf-row-title">{t.title}</span>
            <span class="mf-row-sub">{t.artist}</span>
          </div>
          <span class="mf-plays">{t.plays.toLocaleString()} plays</span>
        </a>
      {/each}
      {#if tracks.length === 0 && state === 'ok'}
        <div class="mf-empty">No data for this period.</div>
      {/if}
    {/if}
  </div>

{:else if tab === 'artists'}

  <div class="mf-artist-grid">
    {#if state === 'loading'}
      {#each {length: 12} as _, i}
        <div class="mf-artist-card sk-card" style="--i:{i}">
          <div class="mf-artist-img sk"></div>
        </div>
      {/each}
    {:else}
      {#each artists as a, i}
        <a
          href={a.url ?? undefined}
          target="_blank" rel="noopener noreferrer"
          class="mf-artist-card"
          style="--i:{i}"
        >
          <div class="mf-artist-img" style={a.cover ? `background-image:url(${a.cover})` : ''}>
            {#if !a.cover}
              <iconify-icon icon="material-symbols:person" width="28"></iconify-icon>
            {/if}
            <div class="mf-artist-veil"></div>
            <div class="mf-artist-meta">
              <span class="mf-artist-name">{a.name}</span>
              <span class="mf-artist-plays">{a.plays.toLocaleString()} plays</span>
            </div>
          </div>
          <span class="mf-rank-badge">{a.rank}</span>
        </a>
      {/each}
      {#if artists.length === 0 && state === 'ok'}
        <div class="mf-empty" style="grid-column:1/-1">No data for this period.</div>
      {/if}
    {/if}
  </div>

{:else if tab === 'albums'}

  <div class="mf-rank-list">
    {#if state === 'loading'}
      {#each {length: 10} as _, i}
        <div class="mf-rank-row sk-row" style="--i:{i}">
          <div class="mf-cover sk" style="width:52px;height:52px"></div>
          <div class="mf-row-info">
            <div class="sk-line" style="width:60%"></div>
            <div class="sk-line" style="width:35%;height:9px;margin-top:5px"></div>
          </div>
        </div>
      {/each}
    {:else}
      {#each albums as a, i}
        <a
          href={a.url ?? undefined}
          target="_blank" rel="noopener noreferrer"
          class="mf-rank-row"
          style="--i:{i}"
        >
          <span class="mf-rank-num">{a.rank}</span>
          <div class="mf-cover lg" style={a.cover ? `background-image:url(${a.cover})` : ''}>
            {#if !a.cover}<iconify-icon icon="material-symbols:album" width="20"></iconify-icon>{/if}
          </div>
          <div class="mf-row-info">
            <span class="mf-row-title">{a.title}</span>
            <span class="mf-row-sub">{a.artist}</span>
          </div>
          <span class="mf-plays">{a.plays.toLocaleString()} plays</span>
        </a>
      {/each}
      {#if albums.length === 0 && state === 'ok'}
        <div class="mf-empty">No data for this period.</div>
      {/if}
    {/if}
  </div>

{/if}

<style>
/* ── Bar ──────────────────────────────────────── */
.mf-bar {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  border-bottom: 1px solid var(--border); margin-bottom: 24px; flex-wrap: wrap;
}
.mf-tabs { display: flex; gap: 0; }
.mf-tab {
  position: relative; padding: 10px 16px;
  font-family: var(--font-display); font-size: 13px; font-weight: 600;
  color: var(--fg-3); background: none; border: none; cursor: pointer;
  transition: color 150ms; white-space: nowrap;
}
.mf-tab::after {
  content: ''; position: absolute; bottom: -1px; left: 0; right: 0;
  height: 2px; background: var(--primary);
  transform: scaleX(0); transition: transform 200ms cubic-bezier(.4,0,.2,1);
  border-radius: 2px 2px 0 0;
}
.mf-tab.active { color: var(--fg-1); }
.mf-tab.active::after { transform: scaleX(1); }
.mf-tab:hover:not(.active) { color: var(--fg-2); }

.mf-right {
  display: flex; align-items: center; gap: 10px;
  flex-wrap: wrap; padding-bottom: 8px;
}
.mf-periods {
  display: flex; gap: 2px;
  background: var(--btn-regular-bg); border-radius: 999px; padding: 3px;
}
.mf-period {
  padding: 4px 10px; border-radius: 999px; border: none; cursor: pointer;
  font-size: 11px; font-weight: 500; font-family: var(--font-mono);
  background: none; color: var(--fg-3); transition: all 120ms;
}
.mf-period.active {
  background: var(--card-bg); color: var(--primary);
  box-shadow: 0 1px 2px rgba(0,0,0,0.06);
}

.mf-status {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 11px; font-family: var(--font-mono); color: var(--fg-3);
}
.mf-dot {
  width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0;
  background: var(--fg-4);
}
.mf-dot.live { background: oklch(0.62 0.18 145); }
.mf-dot.pulse { animation: live-ring 2s ease-out infinite; }
@keyframes live-ring {
  0%  { box-shadow: 0 0 0 0 oklch(0.62 0.18 145 / 0.6); }
  70% { box-shadow: 0 0 0 6px oklch(0.62 0.18 145 / 0); }
  100%{ box-shadow: 0 0 0 0 oklch(0.62 0.18 145 / 0); }
}
.mf-spinner {
  width: 12px; height: 12px;
  border: 2px solid var(--border); border-top-color: var(--primary);
  border-radius: 50%; animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Hero ─────────────────────────────────────── */
.mf-hero {
  display: block; position: relative; overflow: hidden;
  border-radius: var(--radius-large); margin-bottom: 20px;
  min-height: 180px; text-decoration: none;
  transition: transform 200ms;
}
.mf-hero:hover { transform: scale(1.005); }
.mf-hero-bg {
  position: absolute; inset: 0;
  background-size: cover; background-position: center;
  filter: blur(20px) saturate(1.2) brightness(0.45); transform: scale(1.08);
}
.mf-hero-scrim {
  position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.45) 100%);
}
.mf-hero-body {
  position: relative; z-index: 1;
  display: flex; align-items: flex-end; gap: 20px; padding: 24px;
}
.mf-hero-cover {
  width: 100px; height: 100px; flex-shrink: 0;
  border-radius: 10px;
  background: var(--hover) center/cover no-repeat;
  box-shadow: 0 8px 32px rgba(0,0,0,0.5);
}
.mf-hero-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
.mf-hero-eyebrow {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 10px; font-weight: 800; text-transform: uppercase;
  letter-spacing: 0.12em; color: oklch(0.62 0.18 145);
  font-family: var(--font-mono);
}
.mf-hero-title {
  font-family: var(--font-display); font-weight: 800;
  font-size: clamp(16px, 2.5vw, 24px); color: white; margin: 0;
  line-height: 1.2; text-shadow: 0 2px 12px rgba(0,0,0,0.4);
}
.mf-hero-artist, .mf-hero-album {
  margin: 0; font-size: 13px; color: rgba(255,255,255,0.7);
}
.mf-hero-album { font-size: 11px; color: rgba(255,255,255,0.45); }
.mf-hero-when {
  font-size: 11px; font-family: var(--font-mono); color: rgba(255,255,255,0.4);
}

/* ── Recent list ─────────────────────────────── */
.mf-list { display: flex; flex-direction: column; gap: 2px; }
.mf-row {
  display: flex; align-items: center; gap: 12px;
  padding: 8px 10px; border-radius: 10px;
  text-decoration: none; color: inherit;
  transition: background 120ms;
  animation: mf-in 150ms cubic-bezier(.4,0,.2,1) calc(var(--i, 0) * 16ms) both;
}
.mf-row:hover { background: var(--hover); }
.mf-row.playing { background: var(--primary-soft); }

.mf-cover {
  width: 42px; height: 42px; border-radius: 8px; flex-shrink: 0;
  background: var(--btn-regular-bg) center/cover no-repeat;
  display: flex; align-items: center; justify-content: center;
  color: var(--fg-3); overflow: hidden; position: relative;
}
.mf-cover.lg { width: 52px; height: 52px; }

/* animated bars for now-playing */
.mf-bars { display: flex; align-items: flex-end; gap: 2px; height: 16px; }
.mf-bars i {
  display: block; width: 3px; border-radius: 2px;
  background: var(--primary);
  animation: bar-bounce 0.8s ease-in-out infinite alternate;
}
.mf-bars i:nth-child(1) { height: 8px; animation-delay: 0s; }
.mf-bars i:nth-child(2) { height: 14px; animation-delay: 0.2s; }
.mf-bars i:nth-child(3) { height: 10px; animation-delay: 0.1s; }
@keyframes bar-bounce {
  from { transform: scaleY(0.4); }
  to   { transform: scaleY(1); }
}

.mf-row-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.mf-row-title {
  font-size: 13.5px; font-weight: 600; color: var(--fg-1);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.mf-row-sub {
  font-size: 11.5px; color: var(--fg-3);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.mf-row-when { font-size: 11px; font-family: var(--font-mono); color: var(--fg-4); flex-shrink: 0; }
.mf-loved { color: oklch(0.55 0.22 15); margin-left: 4px; flex-shrink: 0; }

/* ── Ranked list (top tracks / albums) ────────── */
.mf-rank-list { display: flex; flex-direction: column; gap: 2px; }
.mf-rank-row {
  display: flex; align-items: center; gap: 12px;
  padding: 8px 10px; border-radius: 10px;
  text-decoration: none; color: inherit;
  transition: background 120ms;
  animation: mf-in 160ms cubic-bezier(.4,0,.2,1) calc(var(--i, 0) * 20ms) both;
}
.mf-rank-row:hover { background: var(--hover); }
.mf-rank-num {
  width: 22px; font-size: 11px; font-family: var(--font-mono);
  color: var(--fg-4); text-align: right; flex-shrink: 0; font-weight: 700;
}
.mf-plays {
  font-size: 11px; font-family: var(--font-mono); color: var(--fg-4); flex-shrink: 0;
}

/* ── Artist grid ─────────────────────────────── */
.mf-artist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 14px;
}
.mf-artist-card {
  text-decoration: none; display: block; position: relative;
  animation: mf-in 180ms cubic-bezier(.4,0,.2,1) calc(var(--i, 0) * 14ms) both;
}
.mf-artist-img {
  aspect-ratio: 1;
  border-radius: 999px;
  background: var(--btn-regular-bg) center/cover no-repeat;
  display: flex; align-items: center; justify-content: center;
  color: var(--fg-3); overflow: hidden; position: relative;
  transition: transform 250ms cubic-bezier(.4,0,.2,1), box-shadow 250ms;
}
.mf-artist-card:hover .mf-artist-img {
  transform: translateY(-4px) scale(1.03);
  box-shadow: 0 14px 32px rgba(0,0,0,0.2);
}
.mf-artist-veil {
  position: absolute; inset: 0; border-radius: 999px;
  background: linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.68));
}
.mf-artist-meta {
  position: absolute; bottom: 0; left: 0; right: 0;
  padding: 8px 10px 10px;
  display: flex; flex-direction: column; gap: 1px;
}
.mf-artist-name {
  font-size: 12px; font-weight: 700; color: white;
  text-shadow: 0 1px 4px rgba(0,0,0,0.7);
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  line-height: 1.3;
}
.mf-artist-plays { font-size: 10px; color: rgba(255,255,255,0.55); font-family: var(--font-mono); }
.mf-rank-badge {
  position: absolute; top: 6px; right: 6px; z-index: 2;
  width: 20px; height: 20px; border-radius: 50%;
  background: var(--card-bg); color: var(--fg-1);
  font-size: 10px; font-weight: 800; font-family: var(--font-mono);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
}

/* ── Skeleton ─────────────────────────────────── */
.mf-row-sk { pointer-events: none; }
.sk-card { display: block; }
.sk-card .mf-artist-img.sk, .sk {
  background: linear-gradient(90deg,
    var(--btn-regular-bg) 0%,
    var(--btn-regular-bg-hover) 50%,
    var(--btn-regular-bg) 100%);
  background-size: 200% 100%;
  animation: skim 1s ease-in-out infinite;
}
.sk-row { pointer-events: none; }
.sk-line {
  height: 12px; border-radius: 999px;
  background: linear-gradient(90deg,
    var(--btn-regular-bg) 0%,
    var(--btn-regular-bg-hover) 50%,
    var(--btn-regular-bg) 100%);
  background-size: 200% 100%;
  animation: skim 1s ease-in-out infinite;
}
@keyframes skim { 0%{background-position:-100% 0} 100%{background-position:100% 0} }

/* ── Misc ─────────────────────────────────────── */
@keyframes mf-in {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: none; }
}
.mf-empty {
  padding: 48px 20px; text-align: center;
  font-size: 14px; color: var(--fg-3);
}
</style>
