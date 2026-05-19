<script>
  import { onMount } from 'svelte';
  import { LASTFM } from '../../config';

  let state = 'loading'; // loading | live | offline
  let tracks = [];

  const fallback = [
    { artist: 'Aimer',         title: 'Brave Shine',      url: 'https://www.last.fm/music/Aimer/_/Brave+Shine',              nowPlaying: true,  when: 'now' },
    { artist: 'Kenshi Yonezu', title: 'Lemon',            url: 'https://www.last.fm/music/Kenshi+Yonezu/_/Lemon',            nowPlaying: false, when: '2h ago' },
    { artist: 'YOASOBI',       title: 'Idol',             url: 'https://www.last.fm/music/YOASOBI/_/Idol',                   nowPlaying: false, when: 'yesterday' },
    { artist: 'Eve',           title: 'Kaikai Kitan',     url: 'https://www.last.fm/music/Eve/_/Kaikai+Kitan',               nowPlaying: false, when: '2d ago' },
    { artist: 'Vaundy',        title: 'Kaiju no Hanauta', url: 'https://www.last.fm/music/Vaundy/_/Kaiju+no+Hanauta',        nowPlaying: false, when: '3d ago' },
  ];

  function relativeTime(uts) {
    const diff = Math.floor((Date.now() / 1000) - uts);
    if (diff < 3600)       return `${Math.max(1, Math.floor(diff / 60))}m ago`;
    if (diff < 86400)      return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 86400 * 2)  return 'yesterday';
    return `${Math.floor(diff / 86400)}d ago`;
  }

  const CACHE_KEY = `lfm-widget-${LASTFM.user}`;
  const CACHE_TTL = 90 * 1000; // 90 seconds
  const LFM_PLACEHOLDER = '2a96cbd8b46e442fc41c2b86b821562f';

  onMount(() => {
    try {
      const raw = sessionStorage.getItem(CACHE_KEY);
      if (raw) { const { ts, data } = JSON.parse(raw); if (Date.now() - ts < CACHE_TTL) { tracks = data; state = 'live'; } }
    } catch {}

    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), 6000);
    (async () => {
      try {
        const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${LASTFM.user}&api_key=${LASTFM.key}&format=json&limit=5`;
        const res = await fetch(url, { signal: controller.signal });
        const json = await res.json();
        if (json.error) throw new Error(json.message);
        tracks = (json.recenttracks?.track ?? []).map(t => {
          const img = t.image?.find(i => i.size === 'medium')?.['#text'];
          return {
            artist: t.artist?.['#text'] ?? 'Unknown',
            title: t.name,
            url: t.url ?? null,
            cover: img && !img.includes(LFM_PLACEHOLDER) ? img : null,
            nowPlaying: t['@attr']?.nowplaying === 'true',
            when: t['@attr']?.nowplaying === 'true' ? 'now' : relativeTime(Number(t.date?.uts)),
          };
        });
        state = 'live';
        try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: tracks })); } catch {}
      } catch(err) {
        if (err.name === 'AbortError') return;
        if (state !== 'live') { tracks = fallback; state = 'offline'; }
      } finally {
        clearTimeout(tid);
      }
    })();
    return () => { clearTimeout(tid); controller.abort(); };
  });
</script>

<div class="card">
  <div class="widget-title" style="display:flex;align-items:center;justify-content:space-between">
    <span>
      <iconify-icon icon="fa7-brands:lastfm" width="11"></iconify-icon>
      Last.fm — @{LASTFM.user}
    </span>
    <span style="font-size:9px;color:var(--fg-3);font-family:var(--font-mono)">
      {state === 'loading' ? 'live…' : state === 'offline' ? 'offline' : 'live'}
    </span>
  </div>
  <div class="lfm-list">
    {#each tracks as t, i}
      <a
        class="lfm-row {t.nowPlaying ? 'playing' : ''}"
        style="animation:lfm-in 160ms {i*28}ms cubic-bezier(.4,0,.2,1) both"
        href={t.url ?? undefined}
        target="_blank"
        rel="noopener noreferrer"
      >
        <div class="lfm-cover" style={t.cover ? `background-image:url(${t.cover})` : ''}>
          {#if t.nowPlaying}
            <span class="lfm-bars" aria-label="Now playing"><i></i><i></i><i></i></span>
          {/if}
        </div>
        <div style="min-width:0;flex:1">
          <div class="lfm-title">{t.title}</div>
          <div class="lfm-meta">{t.artist} <span style="color:var(--meta-divider)">·</span> {t.when}</div>
        </div>
      </a>
    {/each}
    {#if state === 'loading'}
      {#each Array(5) as _}
        <div class="lfm-row" aria-hidden="true">
          <div class="lfm-cover sk" style="width:36px;height:36px;border-radius:0.5rem"></div>
          <div style="flex:1;display:flex;flex-direction:column;gap:4px">
            <div class="sk-line" style="width:80%"></div>
            <div class="sk-line" style="width:50%;height:9px"></div>
          </div>
        </div>
      {/each}
    {/if}
  </div>
</div>

<style>
  @keyframes lfm-in {
    from { opacity: 0; transform: translateY(4px); }
    to   { opacity: 1; transform: none; }
  }

  a.lfm-row {
    color: inherit;
    text-decoration: none;
  }
  a.lfm-row:hover {
    background: var(--hover-bg, oklch(from var(--card-bg) l c h / 0.6));
    border-radius: 0.5rem;
  }
</style>
