<script>
  import { onMount } from 'svelte';
  import { LASTFM, MUSIC_GENRES } from '../../config';

  // Only recognized genre tags — non-genre tags (e.g. "female vocalists", "seen live") are silently skipped
  const TAG_META = {
    'pop':              { icon: 'material-symbols:star-outline',      hue: 300 },
    'indie pop':        { icon: 'material-symbols:star-outline',      hue: 280 },
    'indie':            { icon: 'material-symbols:music-note',        hue: 130 },
    'alternative':      { icon: 'material-symbols:music-note',        hue: 150 },
    'alternative rock': { icon: 'material-symbols:music-note',        hue: 20  },
    'pop rock':         { icon: 'material-symbols:music-note',        hue: 15  },
    'rock':             { icon: 'material-symbols:music-note',        hue: 10  },
    'classic rock':     { icon: 'material-symbols:music-note',        hue: 5   },
    'acoustic':         { icon: 'material-symbols:music-note',        hue: 80  },
    'folk':             { icon: 'material-symbols:music-note',        hue: 110 },
    'electronic':       { icon: 'material-symbols:equalizer',         hue: 240 },
    'edm':              { icon: 'material-symbols:equalizer',         hue: 250 },
    'dance':            { icon: 'material-symbols:equalizer',         hue: 260 },
    'trap':             { icon: 'material-symbols:mic-outline',       hue: 270 },
    'ambient':          { icon: 'material-symbols:cloud-outline',     hue: 215 },
    'lo-fi':            { icon: 'material-symbols:coffee-outline',    hue: 200 },
    'lofi':             { icon: 'material-symbols:coffee-outline',    hue: 200 },
    'lo fi':            { icon: 'material-symbols:coffee-outline',    hue: 200 },
    'jazz':             { icon: 'material-symbols:piano-outline',     hue: 30  },
    'blues':            { icon: 'material-symbols:music-note',        hue: 220 },
    'soul':             { icon: 'material-symbols:favorite-outline',  hue: 15  },
    'r&b':              { icon: 'material-symbols:mic-outline',       hue: 280 },
    'rnb':              { icon: 'material-symbols:mic-outline',       hue: 280 },
    'hip-hop':          { icon: 'material-symbols:mic-outline',       hue: 260 },
    'hip hop':          { icon: 'material-symbols:mic-outline',       hue: 260 },
    'classical':        { icon: 'material-symbols:piano-outline',     hue: 40  },
    'metal':            { icon: 'material-symbols:bolt',              hue: 0   },
    'j-pop':            { icon: 'material-symbols:favorite-outline',  hue: 340 },
    'jpop':             { icon: 'material-symbols:favorite-outline',  hue: 340 },
    'j-rock':           { icon: 'material-symbols:music-note',        hue: 350 },
    'k-pop':            { icon: 'material-symbols:star-outline',      hue: 320 },
    'kpop':             { icon: 'material-symbols:star-outline',      hue: 320 },
    'city pop':         { icon: 'material-symbols:radio-outline',     hue: 160 },
    'anime':            { icon: 'material-symbols:animation',         hue: 60  },
    'anime ost':        { icon: 'material-symbols:animation',         hue: 60  },
    'vocaloid':         { icon: 'material-symbols:animation',         hue: 190 },
    'soundtrack':       { icon: 'material-symbols:movie-outline',     hue: 60  },
    'ost':              { icon: 'material-symbols:movie-outline',     hue: 60  },
    'synth rock':       { icon: 'material-symbols:equalizer',         hue: 230 },
    'synthwave':        { icon: 'material-symbols:equalizer',         hue: 225 },
  };

  const BASE      = 'https://ws.audioscrobbler.com/2.0/';
  const KEY       = LASTFM.key;
  const USER      = LASTFM.user;
  const CACHE_KEY = `lfm-genres-${USER}`;
  const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours

  let genres = [];
  let loading = true;

  function readCache() {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const { ts, data } = JSON.parse(raw);
      return Date.now() - ts < CACHE_TTL ? data : null;
    } catch { return null; }
  }

  function writeCache(data) {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data })); } catch {}
  }

  async function fetchGenres() {
    // 1. top artists
    const artistRes = await fetch(`${BASE}?method=user.getTopArtists&user=${USER}&api_key=${KEY}&format=json&limit=8&period=overall`);
    if (!artistRes.ok) throw new Error(`${artistRes.status}`);
    const artistData = await artistRes.json();
    const artists = (artistData?.topartists?.artist ?? []).map(a => a.name);
    if (!artists.length) return null;

    // 2. tags for each artist in parallel
    const tagLists = await Promise.all(
      artists.map(async name => {
        try {
          const r = await fetch(`${BASE}?method=artist.getTopTags&artist=${encodeURIComponent(name)}&api_key=${KEY}&format=json`);
          const d = await r.json();
          return (d?.toptags?.tag ?? []).slice(0, 5).map(t => t.name.toLowerCase());
        } catch { return []; }
      })
    );

    // 3. count + deduplicate
    const counts = {};
    for (const list of tagLists)
      for (const tag of list)
        if (TAG_META[tag]) counts[tag] = (counts[tag] ?? 0) + 1;

    const seen = new Set();
    const sorted = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([tag]) => ({ label: tag, ...TAG_META[tag] }))
      .filter(g => { if (seen.has(g.icon + g.hue)) return false; seen.add(g.icon + g.hue); return true; })
      .slice(0, 5);

    return sorted.length > 0 ? sorted : null;
  }

  onMount(async () => {
    // serve cache immediately — no skeleton flash on repeat visits
    const cached = readCache();
    if (cached) { genres = cached; loading = false; }

    try {
      const fresh = await fetchGenres();
      if (fresh) { genres = fresh; writeCache(fresh); }
      else if (!cached) genres = MUSIC_GENRES;
    } catch {
      if (!cached) genres = MUSIC_GENRES;
    } finally {
      loading = false;
    }
  });
</script>

<div class="widget-title">Favourite genres</div>
<div class="genre-list">
  {#if loading}
    {#each { length: 5 } as _, i}
      <div class="genre-row sk" style="--i:{i}">
        <span class="genre-dot"></span>
        <span class="sk-line" style="width:{50 + (i * 13) % 35}%"></span>
      </div>
    {/each}
  {:else}
    {#each genres as g}
      <div class="genre-row" style="--g-hue:{g.hue}">
        <span class="genre-dot"></span>
        <iconify-icon icon={g.icon} width="13"></iconify-icon>
        <span class="genre-label">{g.label}</span>
      </div>
    {/each}
  {/if}
</div>

<style>
  .widget-title {
    font-size: 10px; font-weight: 800; text-transform: uppercase;
    letter-spacing: 0.1em; color: var(--fg-3); margin-bottom: 10px;
    font-family: var(--font-mono);
  }
  .genre-list { display: flex; flex-direction: column; gap: 6px; }
  .genre-row {
    display: flex; align-items: center; gap: 7px;
    font-size: 13px; color: var(--fg-2);
  }
  .genre-dot {
    width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0;
    background: oklch(0.70 0.14 var(--g-hue, 30));
  }
  .genre-label { font-size: 12.5px; }

  .sk .genre-dot { background: var(--btn-regular-bg); }
  .sk-line {
    height: 10px; border-radius: 4px;
    background: linear-gradient(90deg, var(--btn-regular-bg) 25%, var(--hover) 50%, var(--btn-regular-bg) 75%);
    background-size: 200% 100%;
    animation: skim 1.2s ease-in-out calc(var(--i, 0) * 80ms) infinite;
  }
  @keyframes skim { 0%{background-position:-100% 0} 100%{background-position:100% 0} }
</style>
