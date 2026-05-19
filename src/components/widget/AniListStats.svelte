<script>
  import { onMount } from 'svelte';

  export let user = '';
  /** When true renders the full-width dashboard layout. When false renders the compact sidebar widget. */
  export let full = false;

  const QUERY = `query($u:String){
    MediaListCollection(userName:$u,type:ANIME){
      lists{
        entries{
          score
          progress
          media{
            duration
            genres
            episodes
          }
        }
      }
    }
  }`;

  let state = 'loading';
  let totalTitles = 0;
  let totalHours = 0;
  let totalDays = 0;
  let meanScore = 0;
  let genreData = [];
  let scoreData = [];

  const CACHE_KEY = `anilist-stats-${user}`;
  const CACHE_TTL = 60 * 60 * 1000; // 1 hour

  function applyStats(d) {
    totalTitles = d.totalTitles; totalHours = d.totalHours; totalDays = d.totalDays;
    meanScore = d.meanScore; genreData = d.genreData; scoreData = d.scoreData;
    state = 'done';
  }

  onMount(() => {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) { const { ts, data } = JSON.parse(raw); if (Date.now() - ts < CACHE_TTL) applyStats(data); }
    } catch {}

    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), 6000);

    (async () => {
      try {
        const res = await fetch('https://graphql.anilist.co', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: QUERY, variables: { u: user } }),
          signal: controller.signal,
        });
        if (!res.ok) throw new Error('API error');
        const json = await res.json();
        if (json.errors) throw new Error('GraphQL error');

        const allEntries = [];
        for (const list of json.data?.MediaListCollection?.lists ?? []) {
          for (const entry of list.entries ?? []) allEntries.push(entry);
        }

        totalTitles = allEntries.length;

        let mins = 0;
        for (const e of allEntries) mins += (e.progress ?? 0) * (e.media?.duration ?? 24);
        totalHours = Math.round((mins / 60) * 10) / 10;
        totalDays  = Math.round((mins / 60 / 24) * 10) / 10;

        const scored = allEntries.filter(e => e.score > 0);
        meanScore = scored.length
          ? Math.round((scored.reduce((s, e) => s + e.score, 0) / scored.length) * 10) / 10
          : 0;

        const genreMap = {};
        for (const e of allEntries)
          for (const g of e.media?.genres ?? []) genreMap[g] = (genreMap[g] ?? 0) + 1;

        const sortedGenres = Object.entries(genreMap).sort((a, b) => b[1] - a[1]);
        const topN = full ? 10 : 6;
        const maxGenreCount = sortedGenres[0]?.[1] ?? 1;
        genreData = sortedGenres.slice(0, topN).map(([name, count]) => ({
          name, count,
          pct: Math.round((count / totalTitles) * 100),
          barPct: Math.round((count / maxGenreCount) * 100),
        }));

        const scoreDist = {};
        for (let i = 1; i <= 10; i++) scoreDist[i] = 0;
        for (const e of allEntries) { const s = Math.round(e.score); if (s >= 1 && s <= 10) scoreDist[s]++; }
        const maxCount = Math.max(...Object.values(scoreDist), 1);
        scoreData = Array.from({ length: 10 }, (_, i) => ({
          label: i + 1, count: scoreDist[i + 1],
          heightPct: Math.round((scoreDist[i + 1] / maxCount) * 100),
        }));

        state = 'done';
        try { localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: { totalTitles, totalHours, totalDays, meanScore, genreData, scoreData } })); } catch {}
      } catch (err) {
        if (err.name !== 'AbortError' && state !== 'done') state = 'error';
      } finally {
        clearTimeout(tid);
      }
    })();

    return () => { clearTimeout(tid); controller.abort(); };
  });
</script>

<!-- ══════════════════════════════════════════════════════
     FULL-WIDTH DASHBOARD VARIANT  (full={true})
══════════════════════════════════════════════════════ -->
{#if full}
<div class="als-full">
  <div class="als-full-header">
    <div class="als-full-brand">
      <iconify-icon icon="simple-icons:anilist" width="22" class="als-anilist-icon"></iconify-icon>
      <div>
        <span class="als-full-title">AniList Stats</span>
        <span class="als-full-user">@{user}</span>
      </div>
    </div>
    <a href={`https://anilist.co/user/${user}`} target="_blank" rel="noopener noreferrer" class="als-profile-link">
      View profile →
    </a>
  </div>

  {#if state === 'loading'}
    <div class="als-full-skeleton">
      <div class="als-hero-row">
        {#each [0,1,2,3] as _}<div class="sk als-hero-sk"></div>{/each}
      </div>
      <div class="als-body-row">
        <div class="als-col-genres">
          {#each [0,1,2,3,4,5,6,7] as _}<div class="sk sk-line" style="margin-bottom:10px"></div>{/each}
        </div>
        <div class="als-col-scores">
          <div class="sk" style="width:80px;height:14px;border-radius:4px;margin-bottom:12px"></div>
          <div class="sk als-score-chart-sk"></div>
        </div>
      </div>
    </div>

  {:else if state === 'error'}
    <div class="als-full-error">
      <iconify-icon icon="material-symbols:signal-disconnected" width="32"></iconify-icon>
      <span>Could not load AniList stats</span>
    </div>

  {:else}
    <!-- Hero stat numbers -->
    <div class="als-hero-row">
      <div class="als-hero-stat">
        <span class="als-hero-val">{totalTitles}</span>
        <span class="als-hero-lbl">Titles</span>
      </div>
      <div class="als-hero-divider"></div>
      <div class="als-hero-stat">
        <span class="als-hero-val">{totalHours}<span class="als-hero-unit">h</span></span>
        <span class="als-hero-lbl">Hours watched</span>
      </div>
      <div class="als-hero-divider"></div>
      <div class="als-hero-stat">
        <span class="als-hero-val">{totalDays}<span class="als-hero-unit">d</span></span>
        <span class="als-hero-lbl">Days of life</span>
      </div>
      <div class="als-hero-divider"></div>
      <div class="als-hero-stat">
        <span class="als-hero-val">{meanScore > 0 ? meanScore : '—'}<span class="als-hero-unit">{meanScore > 0 ? '/10' : ''}</span></span>
        <span class="als-hero-lbl">Mean score</span>
      </div>
    </div>

    <!-- Body: genres left, score chart right -->
    <div class="als-body-row">

      <!-- Genres -->
      {#if genreData.length > 0}
      <div class="als-col-genres">
        <div class="als-col-label">Top Genres</div>
        <div class="als-genres-full">
          {#each genreData as g}
            <div class="als-genre-row-full">
              <span class="als-genre-name-full">{g.name}</span>
              <div class="als-genre-track-full">
                <div class="als-genre-bar-full" style="width:{g.barPct}%"></div>
              </div>
              <span class="als-genre-nums">
                <span class="als-genre-count">{g.count}</span>
                <span class="als-genre-pct-full">{g.pct}%</span>
              </span>
            </div>
          {/each}
        </div>
      </div>
      {/if}

      <!-- Score distribution -->
      {#if scoreData.some(s => s.count > 0)}
      <div class="als-col-scores">
        <div class="als-col-label">Score Distribution</div>
        <div class="als-score-chart-full">
          {#each scoreData as s}
            <div class="als-score-col-full" title="Score {s.label}: {s.count} titles">
              <div class="als-score-bar-wrap-full">
                <div
                  class="als-score-bar-full"
                  style="height:{Math.max(s.heightPct, s.count > 0 ? 4 : 0)}%;opacity:{0.25 + (s.heightPct / 100) * 0.75}"
                ></div>
              </div>
              <span class="als-score-lbl-full">{s.label}</span>
              {#if s.count > 0}
                <span class="als-score-count-full">{s.count}</span>
              {/if}
            </div>
          {/each}
        </div>
      </div>
      {/if}

    </div>
  {/if}
</div>

<!-- ══════════════════════════════════════════════════════
     COMPACT SIDEBAR VARIANT  (full={false})
══════════════════════════════════════════════════════ -->
{:else}
<div class="card">
  <div class="widget-title">
    <iconify-icon icon="simple-icons:anilist" width="11"></iconify-icon>
    AniList Stats
    <span class="als-user">@{user}</span>
  </div>

  {#if state === 'loading'}
    <div class="als-skeleton">
      <div class="als-pills-row">
        {#each [0, 1, 2] as _}<div class="sk als-pill-sk"></div>{/each}
      </div>
      {#each [0, 1, 2, 3, 4, 5] as _, i}
        <div class="sk-line" style="width:{85 - i * 8}%;margin-bottom:8px"></div>
      {/each}
    </div>

  {:else if state === 'error'}
    <div class="als-empty">
      <iconify-icon icon="material-symbols:signal-disconnected" width="24"></iconify-icon>
      <span>Could not load stats</span>
    </div>

  {:else}
    <div class="als-pills-row">
      <div class="als-pill">
        <span class="als-pill-val">{totalTitles}</span>
        <span class="als-pill-lbl">Titles</span>
      </div>
      <div class="als-pill">
        <span class="als-pill-val">{totalHours}h</span>
        <span class="als-pill-lbl">Hours</span>
      </div>
      <div class="als-pill">
        <span class="als-pill-val">{meanScore > 0 ? meanScore : '—'}</span>
        <span class="als-pill-lbl">Mean</span>
      </div>
    </div>

    {#if genreData.length > 0}
      <div class="als-section-label">Top Genres</div>
      <div class="als-genres">
        {#each genreData as g}
          <div class="als-genre-row">
            <span class="als-genre-name">{g.name}</span>
            <div class="als-genre-track">
              <div class="als-genre-bar" style="width:{g.barPct}%"></div>
            </div>
            <span class="als-genre-pct">{g.pct}%</span>
          </div>
        {/each}
      </div>
    {/if}

    {#if scoreData.some(s => s.count > 0)}
      <div class="als-section-label">Score Distribution</div>
      <div class="als-score-chart">
        {#each scoreData as s}
          <div class="als-score-col">
            <div class="als-score-bar-wrap">
              <div class="als-score-bar" style="height:{s.heightPct}%;opacity:{0.3 + (s.heightPct/100)*0.7}" title="{s.count}"></div>
            </div>
            <span class="als-score-lbl">{s.label}</span>
          </div>
        {/each}
      </div>
    {/if}
  {/if}
</div>
{/if}

<style>
/* ── Shared skeleton tokens ──────────────────────────── */
.sk { background: linear-gradient(90deg,var(--btn-regular-bg) 0%,var(--btn-regular-bg-hover) 50%,var(--btn-regular-bg) 100%); background-size:200% 100%; animation:skim 1s ease-in-out infinite; border-radius:0.5rem; }
.sk-line { height:12px; border-radius:0.4rem; }
@keyframes skim { 0%{background-position:-100% 0} 100%{background-position:100% 0} }

/* ════════════════════════════════════════
   FULL-WIDTH DASHBOARD
════════════════════════════════════════ */
.als-full {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-large);
  padding: 28px 32px;
  margin-bottom: 24px;
}

.als-full-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border);
}
.als-full-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}
.als-anilist-icon { color: oklch(0.58 0.18 250); flex-shrink: 0; }
.als-full-title {
  display: block;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 20px;
  color: var(--fg-1);
  line-height: 1.1;
}
.als-full-user {
  display: block;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--fg-4);
  margin-top: 2px;
}
.als-profile-link {
  font-size: 12px;
  font-family: var(--font-mono);
  color: var(--primary);
  text-decoration: none;
  padding: 6px 14px;
  border: 1px solid var(--primary);
  border-radius: 999px;
  transition: background 120ms, color 120ms;
}
.als-profile-link:hover { background: var(--primary); color: white; }

/* Hero stats row */
.als-hero-row {
  display: flex;
  align-items: center;
  gap: 0;
  margin-bottom: 32px;
  background: var(--btn-regular-bg);
  border-radius: var(--radius-large);
  overflow: hidden;
}
.als-hero-sk {
  flex: 1;
  height: 100px;
  border-radius: 0;
}
.als-hero-stat {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 24px 16px;
}
.als-hero-val {
  font-family: var(--font-mono);
  font-weight: 900;
  font-size: 36px;
  color: var(--primary);
  line-height: 1;
  letter-spacing: -0.02em;
}
.als-hero-unit {
  font-size: 18px;
  font-weight: 600;
  opacity: 0.6;
  margin-left: 1px;
}
.als-hero-lbl {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--fg-4);
}
.als-hero-divider {
  width: 1px;
  height: 60px;
  background: var(--border);
  flex-shrink: 0;
}

/* Body row */
.als-body-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
}
@media (max-width: 640px) {
  .als-body-row { grid-template-columns: 1fr; gap: 24px; }
  .als-hero-row { flex-wrap: wrap; }
  .als-hero-stat { flex: 0 0 50%; }
  .als-hero-divider { display: none; }
  .als-full { padding: 20px 18px; }
}
.als-col-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--fg-4);
  margin-bottom: 14px;
}

/* Genre bars */
.als-genres-full { display: flex; flex-direction: column; gap: 9px; }
.als-genre-row-full {
  display: flex;
  align-items: center;
  gap: 10px;
}
.als-genre-name-full {
  width: 100px;
  flex-shrink: 0;
  font-size: 13px;
  font-weight: 600;
  font-family: var(--font-display);
  color: var(--fg-2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.als-genre-track-full {
  flex: 1;
  height: 7px;
  background: var(--btn-regular-bg);
  border-radius: 999px;
  overflow: hidden;
}
.als-genre-bar-full {
  height: 100%;
  background: linear-gradient(90deg, var(--primary), oklch(0.78 0.12 calc(var(--hue) + 30)));
  border-radius: 999px;
  transition: width 700ms cubic-bezier(0.4, 0, 0.2, 1);
}
.als-genre-nums {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  width: 44px;
  flex-shrink: 0;
}
.als-genre-count {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  color: var(--fg-2);
  line-height: 1;
}
.als-genre-pct-full {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--fg-4);
  line-height: 1;
}

/* Score chart */
.als-score-chart-full {
  display: flex;
  align-items: flex-end;
  gap: 6px;
  height: 140px;
  padding-bottom: 24px;
  position: relative;
}
.als-score-chart-sk {
  width: 100%;
  height: 140px;
  border-radius: 0.5rem;
}
.als-score-col-full {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  position: relative;
}
.als-score-bar-wrap-full {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: flex-end;
}
.als-score-bar-full {
  width: 100%;
  background: var(--primary);
  border-radius: 3px 3px 0 0;
  min-height: 3px;
  transition: height 700ms cubic-bezier(0.4, 0, 0.2, 1);
}
.als-score-lbl-full {
  position: absolute;
  bottom: -18px;
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--fg-4);
}
.als-score-count-full {
  position: absolute;
  top: -18px;
  font-family: var(--font-mono);
  font-size: 9px;
  color: var(--fg-3);
  font-weight: 700;
}

/* Full skeleton */
.als-full-skeleton { }
.als-hero-sk { height: 96px; border-radius: 0; }
.als-body-row .sk-line { margin-bottom: 10px; }

/* Full error */
.als-full-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 48px;
  color: var(--fg-4);
  font-size: 14px;
}

/* ════════════════════════════════════════
   COMPACT SIDEBAR
════════════════════════════════════════ */
.als-user { font-size:10px; color:var(--fg-4); font-family:var(--font-mono); margin-left:auto; font-weight:400; }
.als-skeleton { padding-top:4px; }
.als-empty { display:flex; flex-direction:column; align-items:center; gap:8px; padding:24px 0; color:var(--fg-4); font-size:13px; }
.als-pills-row { display:flex; gap:8px; margin-bottom:16px; }
.als-pill { flex:1; display:flex; flex-direction:column; align-items:center; gap:3px; padding:10px 8px; background:var(--btn-regular-bg); border:1px solid var(--border); border-radius:0.75rem; }
.als-pill-sk { flex:1; height:54px; border-radius:0.75rem; }
.als-pill-val { font-family:var(--font-mono); font-weight:800; font-size:16px; color:var(--primary); line-height:1; }
.als-pill-lbl { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:var(--fg-4); }
.als-section-label { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:var(--fg-4); margin-bottom:8px; margin-top:4px; }
.als-genres { display:flex; flex-direction:column; gap:6px; margin-bottom:16px; }
.als-genre-row { display:flex; align-items:center; gap:8px; font-size:12px; }
.als-genre-name { width:76px; flex-shrink:0; font-family:var(--font-display); font-weight:600; color:var(--fg-2); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.als-genre-track { flex:1; height:5px; background:var(--btn-regular-bg); border-radius:999px; overflow:hidden; }
.als-genre-bar { height:100%; background:var(--primary); border-radius:999px; transition:width 600ms cubic-bezier(0.4,0,0.2,1); }
.als-genre-pct { font-family:var(--font-mono); font-size:10px; color:var(--fg-4); width:30px; text-align:right; flex-shrink:0; }
.als-score-chart { display:flex; align-items:flex-end; gap:4px; height:60px; padding-bottom:16px; position:relative; }
.als-score-col { flex:1; display:flex; flex-direction:column; align-items:center; height:100%; position:relative; }
.als-score-bar-wrap { flex:1; width:100%; display:flex; align-items:flex-end; }
.als-score-bar { width:100%; background:var(--primary); border-radius:2px 2px 0 0; min-height:2px; transition:height 600ms cubic-bezier(0.4,0,0.2,1); }
.als-score-lbl { position:absolute; bottom:-16px; font-family:var(--font-mono); font-size:9px; color:var(--fg-4); text-align:center; }
</style>
