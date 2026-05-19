<script>
  import { onMount } from 'svelte';

  export let user = '';
  export let clientId = '';
  /** full = big dashboard layout (for /movies page); false = compact sidebar card */
  export let full = false;

  let state = 'loading';
  let stats = null;

  // ── Derived stats ──────────────────────────────────────────
  $: totalMins      = stats?.total_mins ?? 0;
  $: totalHours     = Math.round(totalMins / 60);
  $: totalDays      = Math.round((totalMins / 60 / 24) * 10) / 10;

  // Movies
  $: mvCompleted    = stats?.movies?.completed?.count    ?? 0;
  $: mvPlan         = stats?.movies?.plantowatch?.count  ?? 0;
  $: mvDropped      = stats?.movies?.dropped?.count      ?? 0;
  $: mvTotalMins    = stats?.movies?.total_mins          ?? 0;
  $: mvHours        = Math.round(mvTotalMins / 60);
  $: mvTotal        = mvCompleted + mvPlan + mvDropped;

  // TV (non-anime live-action)
  $: tvWatching     = stats?.tv?.watching?.count         ?? 0;
  $: tvCompleted    = stats?.tv?.completed?.count        ?? 0;
  $: tvHold         = stats?.tv?.hold?.count             ?? 0;
  $: tvPlan         = stats?.tv?.plantowatch?.count      ?? 0;
  $: tvDropped      = stats?.tv?.dropped?.count          ?? 0;
  $: tvEps          = (stats?.tv?.watching?.watched_episodes_count  ?? 0)
                    + (stats?.tv?.completed?.watched_episodes_count ?? 0);
  $: tvTotalMins    = stats?.tv?.total_mins              ?? 0;
  $: tvHours        = Math.round(tvTotalMins / 60);
  $: tvTotal        = tvWatching + tvCompleted + tvHold + tvPlan + tvDropped;

  // Last week
  $: lwMins         = stats?.watched_last_week?.total_mins      ?? 0;
  $: lwMovieMins    = stats?.watched_last_week?.movies_mins     ?? 0;
  $: lwTvMins       = stats?.watched_last_week?.tv_mins         ?? 0;
  $: lwHours        = Math.round((lwMins / 60) * 10) / 10;

  // Status bars (movies)
  $: mvBars = mvTotal > 0 ? [
    { label: 'Completed', count: mvCompleted, hue: 145 },
    { label: 'Plan',      count: mvPlan,      hue: 30  },
    { label: 'Dropped',   count: mvDropped,   hue: 25  },
  ].filter(b => b.count > 0) : [];

  // Status bars (TV)
  $: tvBars = tvTotal > 0 ? [
    { label: 'Watching',  count: tvWatching,  hue: 200 },
    { label: 'Completed', count: tvCompleted, hue: 145 },
    { label: 'On Hold',   count: tvHold,      hue: 85  },
    { label: 'Plan',      count: tvPlan,      hue: 30  },
    { label: 'Dropped',   count: tvDropped,   hue: 25  },
  ].filter(b => b.count > 0) : [];

  function barPct(count, total) {
    return total > 0 ? Math.round((count / total) * 100) : 0;
  }

  onMount(() => {
    if (!user || !clientId) { state = 'unconfigured'; return; }
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), 8000);
    (async () => {
      try {
        const res = await fetch(
          `https://api.simkl.com/users/${user}/stats?client_id=${clientId}`,
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!json?.total_mins) throw new Error('Empty');
        stats = json;
        state = 'done';
      } catch (err) {
        if (err.name !== 'AbortError') state = 'error';
      } finally { clearTimeout(tid); }
    })();
    return () => { clearTimeout(tid); controller.abort(); };
  });
</script>

{#if full}
<div class="sf-full">
  {#if state === 'unconfigured'}
    <div class="sf-placeholder">
      <iconify-icon icon="material-symbols:movie-outline" width="32"></iconify-icon>
      <p>Add your Simkl <code>user</code> and <code>clientId</code> to <code>src/config.ts</code>.</p>
    </div>

  {:else if state === 'loading'}
    <div class="sf-full-header">
      <div class="sf-sk sf-sk-brand"></div>
      <div class="sf-sk" style="width:90px;height:28px;border-radius:999px"></div>
    </div>
    <div class="sf-hero-row">
      {#each [0,1,2,3] as _}<div class="sf-sk sf-sk-hero"></div>{/each}
    </div>
    <div class="sf-cols">
      <div>{#each [0,1,2,3,4] as i}<div class="sf-sk sf-sk-bar" style="--w:{90-i*14}%"></div>{/each}</div>
      <div>{#each [0,1,2,3,4] as i}<div class="sf-sk sf-sk-bar" style="--w:{85-i*10}%"></div>{/each}</div>
    </div>

  {:else if state === 'error'}
    <div class="sf-placeholder">
      <iconify-icon icon="material-symbols:signal-disconnected" width="32"></iconify-icon>
      <span>Could not load Simkl stats</span>
    </div>

  {:else}

    <!-- Header -->
    <div class="sf-full-header">
      <div class="sf-brand">
        <iconify-icon icon="material-symbols:play-circle-outline" width="24" class="sf-icon"></iconify-icon>
        <div>
          <span class="sf-brand-title">Simkl</span>
          <span class="sf-brand-user">simkl.com/{user}</span>
        </div>
      </div>
      <div class="sf-header-right">
        {#if lwMins > 0}
          <span class="sf-week-badge">
            <span class="sf-live-dot"></span>
            {lwHours}h this week
          </span>
        {/if}
        <a href="https://simkl.com/{user}" target="_blank" rel="noopener noreferrer" class="sf-profile-btn">
          View profile →
        </a>
      </div>
    </div>

    <!-- Hero stats -->
    <div class="sf-hero-row">
      <div class="sf-hero-stat">
        <span class="sf-hero-val">{totalHours.toLocaleString()}<span class="sf-unit">h</span></span>
        <span class="sf-hero-lbl">Total watched</span>
      </div>
      <div class="sf-hero-div"></div>
      <div class="sf-hero-stat">
        <span class="sf-hero-val">{totalDays}<span class="sf-unit">d</span></span>
        <span class="sf-hero-lbl">Days of life</span>
      </div>
      <div class="sf-hero-div"></div>
      <div class="sf-hero-stat">
        <span class="sf-hero-val">{mvCompleted}</span>
        <span class="sf-hero-lbl">Movies seen</span>
      </div>
      <div class="sf-hero-div"></div>
      <div class="sf-hero-stat">
        <span class="sf-hero-val">{tvEps.toLocaleString()}</span>
        <span class="sf-hero-lbl">TV episodes</span>
      </div>
    </div>

    <!-- Two-column breakdown -->
    <div class="sf-cols">

      <!-- Movies -->
      <div class="sf-col">
        <div class="sf-col-head">
          <span class="sf-col-icon"><iconify-icon icon="material-symbols:movie-outline" width="15"></iconify-icon></span>
          <span class="sf-col-title">Movies</span>
          <span class="sf-col-sub">{mvHours}h watched</span>
        </div>

        {#if mvBars.length > 0}
          <div class="sf-bars">
            {#each mvBars as b}
              <div class="sf-bar-row">
                <span class="sf-bar-label">{b.label}</span>
                <div class="sf-bar-track">
                  <div class="sf-bar-fill" style="width:{barPct(b.count, mvTotal)}%;background:oklch(0.70 0.14 {b.hue})"></div>
                </div>
                <span class="sf-bar-count">{b.count}</span>
              </div>
            {/each}
          </div>
        {:else}
          <p class="sf-empty-note">No movies tracked yet.</p>
        {/if}

        <!-- Last week movies -->
        {#if lwMovieMins > 0}
          <div class="sf-lw-badge">
            <iconify-icon icon="material-symbols:schedule-outline" width="12"></iconify-icon>
            {Math.round(lwMovieMins / 60 * 10) / 10}h in movies this week
          </div>
        {/if}
      </div>

      <!-- TV Shows -->
      <div class="sf-col">
        <div class="sf-col-head">
          <span class="sf-col-icon"><iconify-icon icon="material-symbols:tv-outline" width="15"></iconify-icon></span>
          <span class="sf-col-title">TV Series</span>
          <span class="sf-col-sub">{tvHours}h · {tvEps} eps</span>
        </div>

        {#if tvBars.length > 0}
          <div class="sf-bars">
            {#each tvBars as b}
              <div class="sf-bar-row">
                <span class="sf-bar-label">{b.label}</span>
                <div class="sf-bar-track">
                  <div class="sf-bar-fill" style="width:{barPct(b.count, tvTotal)}%;background:oklch(0.70 0.14 {b.hue})"></div>
                </div>
                <span class="sf-bar-count">{b.count}</span>
              </div>
            {/each}
          </div>

          <!-- Watching now indicator -->
          {#if tvWatching > 0}
            <div class="sf-watching-now">
              <span class="sf-watching-dot"></span>
              {tvWatching} show{tvWatching > 1 ? 's' : ''} currently watching
            </div>
          {/if}
        {:else}
          <p class="sf-empty-note">No TV shows tracked yet.</p>
        {/if}

        {#if lwTvMins > 0}
          <div class="sf-lw-badge">
            <iconify-icon icon="material-symbols:schedule-outline" width="12"></iconify-icon>
            {Math.round(lwTvMins / 60 * 10) / 10}h in TV this week
          </div>
        {/if}
      </div>

    </div>

    <!-- Note: anime tracked on /anime via AniList -->
    <div class="sf-anime-note">
      <iconify-icon icon="material-symbols:info-outline" width="13"></iconify-icon>
      Anime stats live on the <a href="/anime">Anime</a> page — tracked via AniList.
    </div>

  {/if}
</div>

<!-- ═══════════════════════════════════════════════════
     COMPACT SIDEBAR  (full={false})
═══════════════════════════════════════════════════ -->
{:else}
<div class="card sf-compact">

  {#if state === 'unconfigured'}
    <div class="sf-placeholder">
      <iconify-icon icon="material-symbols:movie-outline" width="22"></iconify-icon>
      <p>Configure Simkl in <code>config.ts</code>.</p>
    </div>

  {:else if state === 'loading'}
    <div class="sf-header-row">
      <div class="sf-sk sf-sk-icon"></div>
      <div class="sf-sk" style="height:13px;width:90px;border-radius:4px"></div>
    </div>
    <div class="sf-pills-row">
      {#each [0,1,2] as _}<div class="sf-sk sf-sk-pill"></div>{/each}
    </div>
    {#each [0,1,2,3] as i}<div class="sf-sk sf-sk-bar" style="--w:{90-i*14}%;margin-bottom:7px"></div>{/each}

  {:else if state === 'error'}
    <div class="sf-placeholder">
      <iconify-icon icon="material-symbols:signal-disconnected" width="22"></iconify-icon>
      <span>Could not load</span>
    </div>

  {:else}
    <!-- Compact header -->
    <div class="sf-header-row">
      <iconify-icon icon="material-symbols:play-circle-outline" width="15" class="sf-icon"></iconify-icon>
      <span class="widget-title" style="margin:0">Simkl</span>
      {#if lwMins > 0}
        <span class="sf-live-dot" style="margin-left:auto"></span>
      {/if}
    </div>

    <!-- Compact pills -->
    <div class="sf-pills-row">
      <div class="sf-pill">
        <span class="sf-pill-val">{totalHours.toLocaleString()}h</span>
        <span class="sf-pill-lbl">Watched</span>
      </div>
      <div class="sf-pill">
        <span class="sf-pill-val">{mvCompleted}</span>
        <span class="sf-pill-lbl">Movies</span>
      </div>
      <div class="sf-pill">
        <span class="sf-pill-val">{tvCompleted + tvWatching}</span>
        <span class="sf-pill-lbl">Shows</span>
      </div>
    </div>

    <!-- Compact status bars (movies + TV combined) -->
    {#each mvBars.slice(0,3) as b}
      <div class="sf-bar-row">
        <span class="sf-bar-label">{b.label}</span>
        <div class="sf-bar-track"><div class="sf-bar-fill" style="width:{barPct(b.count, mvTotal)}%;background:oklch(0.70 0.14 {b.hue})"></div></div>
        <span class="sf-bar-count">{b.count}</span>
      </div>
    {/each}

    <a href="/movies" class="sf-see-more">See full stats →</a>
  {/if}
</div>
{/if}

<style>
/* ── Shared ──────────────────────────────────────────── */
.sf-sk { background:linear-gradient(90deg,var(--btn-regular-bg) 0%,var(--btn-regular-bg-hover) 50%,var(--btn-regular-bg) 100%); background-size:200% 100%; animation:sf-skim 1s ease-in-out infinite; border-radius:0.5rem; }
@keyframes sf-skim { 0%{background-position:-100% 0} 100%{background-position:100% 0} }
.sf-sk-bar { height:10px; border-radius:999px; width:var(--w,80%); margin-bottom:8px; }
.sf-icon { color:var(--primary); flex-shrink:0; }
.sf-placeholder { display:flex; flex-direction:column; align-items:center; gap:8px; padding:32px 24px; text-align:center; color:var(--fg-3); font-size:13px; }
.sf-placeholder code { font-size:11px; background:var(--btn-regular-bg); padding:2px 5px; border-radius:4px; color:var(--primary); }
.sf-bar-row { display:flex; align-items:center; gap:8px; }
.sf-bar-track { flex:1; height:6px; background:var(--btn-regular-bg); border-radius:999px; overflow:hidden; }
.sf-bar-fill { height:100%; border-radius:999px; transition:width 700ms cubic-bezier(0.4,0,0.2,1); }
.sf-bar-count { font-family:var(--font-mono); font-size:11px; font-weight:700; color:var(--fg-3); width:28px; text-align:right; flex-shrink:0; }
.sf-bars { display:flex; flex-direction:column; gap:8px; margin-bottom:12px; }
.sf-bar-label { width:72px; flex-shrink:0; font-size:12.5px; font-weight:600; color:var(--fg-2); font-family:var(--font-display); }

.sf-live-dot { width:6px; height:6px; border-radius:50%; background:oklch(0.62 0.18 145); display:inline-block; flex-shrink:0; animation:sf-pulse 2s ease-out infinite; }
@keyframes sf-pulse { 0%{box-shadow:0 0 0 0 oklch(0.62 0.18 145/0.5)} 70%{box-shadow:0 0 0 5px oklch(0.62 0.18 145/0)} 100%{box-shadow:0 0 0 0 oklch(0.62 0.18 145/0)} }

.sf-week-badge { display:inline-flex; align-items:center; gap:6px; font-size:11px; font-family:var(--font-mono); color:oklch(0.55 0.14 145); background:oklch(0.92 0.04 145); padding:4px 11px; border-radius:999px; }
.dark .sf-week-badge { color:oklch(0.78 0.14 145); background:oklch(0.28 0.05 145); }

/* ══ FULL DASHBOARD ════════════════════════════════════ */
.sf-full {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-large);
  padding: 28px 32px;
  margin-bottom: 24px;
}

/* Full header */
.sf-full-header {
  display:flex; align-items:center; justify-content:space-between;
  margin-bottom:24px; padding-bottom:20px; border-bottom:1px solid var(--border);
}
.sf-brand { display:flex; align-items:center; gap:12px; }
.sf-brand-title { display:block; font-family:var(--font-display); font-weight:800; font-size:22px; color:var(--fg-1); line-height:1.1; }
.sf-brand-user { display:block; font-family:var(--font-mono); font-size:11px; color:var(--fg-4); }
.sf-header-right { display:flex; align-items:center; gap:10px; }
.sf-profile-btn { font-size:12px; font-family:var(--font-mono); color:var(--primary); text-decoration:none; padding:6px 14px; border:1px solid var(--primary); border-radius:999px; transition:background 120ms, color 120ms; }
.sf-profile-btn:hover { background:var(--primary); color:white; }

/* Full skeleton */
.sf-sk-brand { height:44px; width:200px; border-radius:0.5rem; }
.sf-sk-hero { flex:1; height:96px; border-radius:var(--radius-medium); }

/* Hero row */
.sf-hero-row {
  display:flex; align-items:center;
  background:var(--btn-regular-bg); border-radius:var(--radius-large);
  overflow:hidden; margin-bottom:32px;
}
.sf-hero-stat { flex:1; display:flex; flex-direction:column; align-items:center; gap:6px; padding:24px 16px; }
.sf-hero-val { font-family:var(--font-mono); font-weight:900; font-size:36px; color:var(--primary); line-height:1; letter-spacing:-0.02em; }
.sf-unit { font-size:18px; font-weight:600; opacity:0.55; margin-left:1px; }
.sf-hero-lbl { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:var(--fg-4); }
.sf-hero-div { width:1px; height:56px; background:var(--border); flex-shrink:0; }

/* Two-column breakdown */
.sf-cols { display:grid; grid-template-columns:1fr 1fr; gap:40px; margin-bottom:20px; }

.sf-col-head {
  display:flex; align-items:center; gap:8px;
  padding-bottom:14px; margin-bottom:14px;
  border-bottom:1px solid var(--border);
}
.sf-col-icon { color:var(--primary); display:flex; }
.sf-col-title { font-family:var(--font-display); font-weight:800; font-size:17px; color:var(--fg-1); flex:1; }
.sf-col-sub { font-family:var(--font-mono); font-size:11px; color:var(--fg-4); }

.sf-empty-note { font-size:13px; color:var(--fg-4); margin:0; }

.sf-watching-now {
  display:inline-flex; align-items:center; gap:6px;
  font-size:12px; font-family:var(--font-mono); color:oklch(0.58 0.14 200);
  background:oklch(0.92 0.03 200); padding:4px 11px; border-radius:999px;
  margin-top:4px;
}
.dark .sf-watching-now { color:oklch(0.78 0.14 200); background:oklch(0.28 0.04 200); }
.sf-watching-dot { width:5px; height:5px; border-radius:50%; background:oklch(0.62 0.18 200); animation:sf-pulse 2s ease-out infinite; }

.sf-lw-badge {
  display:inline-flex; align-items:center; gap:5px;
  font-size:11px; font-family:var(--font-mono); color:var(--fg-3);
  margin-top:10px;
}

.sf-anime-note {
  display:flex; align-items:center; gap:6px;
  font-size:12px; color:var(--fg-4); font-family:var(--font-mono);
  padding-top:18px; border-top:1px solid var(--border);
}
.sf-anime-note a { color:var(--primary); text-decoration:none; }
.sf-anime-note a:hover { text-decoration:underline; }

@media (max-width:700px) {
  .sf-full { padding:20px 18px; }
  .sf-cols { grid-template-columns:1fr; gap:24px; }
  .sf-hero-row { flex-wrap:wrap; }
  .sf-hero-stat { flex:0 0 50%; }
  .sf-hero-div { display:none; }
  .sf-full-header { flex-direction:column; align-items:flex-start; gap:10px; }
}

/* ══ COMPACT SIDEBAR ════════════════════════════════════ */
.sf-compact { display:flex; flex-direction:column; gap:0; }
.sf-header-row { display:flex; align-items:center; gap:8px; margin-bottom:12px; }
.sf-sk-icon { width:20px; height:20px; border-radius:5px; flex-shrink:0; }
.sf-pills-row { display:flex; gap:7px; margin-bottom:14px; }
.sf-pill { flex:1; display:flex; flex-direction:column; align-items:center; gap:3px; padding:10px 6px; background:var(--btn-regular-bg); border:1px solid var(--border); border-radius:var(--radius-medium); }
.sf-sk-pill { flex:1; height:58px; border-radius:var(--radius-medium); }
.sf-pill-val { font-family:var(--font-mono); font-weight:800; font-size:15px; color:var(--primary); line-height:1; }
.sf-pill-lbl { font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:var(--fg-4); }
.sf-see-more { font-size:11px; font-family:var(--font-mono); color:var(--primary); text-decoration:none; margin-top:12px; display:block; text-align:right; }
.sf-see-more:hover { text-decoration:underline; }
</style>
