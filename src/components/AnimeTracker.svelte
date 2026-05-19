<script>
  export let entries = [];
  export let statusMsg = '';
  export let user = '';

  let filter = 'all';

  $: visible = filter === 'all' ? entries : entries.filter(e => e.status === filter);
  $: counts  = entries.reduce((acc, e) => ((acc[e.status] = (acc[e.status] || 0) + 1), acc), { all: entries.length });

  function epPct(ep) {
    const [done, total] = (ep ?? '0/0').split('/').map(s => parseInt(s, 10) || 0);
    return total > 0 ? Math.min(100, (done / total) * 100) : 0;
  }
  function letter(title) {
    return (title || '').replace(/[^A-Za-z]/g, '').charAt(0).toUpperCase() || '?';
  }
</script>

<div class="card" style="display:flex;flex-direction:column;gap:18px">
  <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px">
    <div style="display:flex;flex-direction:column;gap:2px">
      <div class="widget-title" style="margin:0">
        AniList ·
        <a href="https://anilist.co/user/{user}/" target="_blank" rel="noreferrer"
           style="color:var(--primary);text-decoration:underline;text-decoration-style:dashed;text-underline-offset:3px">
          @{user}
        </a>
      </div>
      <div style="font-size:11px;color:var(--fg-3);font-family:var(--font-mono)">{statusMsg}</div>
    </div>
    <div class="filter-tabs">
      {#each [['all','All'],['current','Watching'],['completed','Completed'],['planning','Planning'],['dropped','Dropped']] as [f, label]}
        <button class="filter-tab {filter === f ? 'active' : ''}" on:click={() => filter = f}>
          {label} <span style="opacity:.55;margin-left:3px">{counts[f] ?? 0}</span>
        </button>
      {/each}
    </div>
  </div>

  <div class="anime-grid">
    {#each visible as a, idx (a.id)}
      {@const p = epPct(a.ep)}
      <div class="anime-tile">
        <div class="anime-cover"
          style={a.cover
            ? `background-image:url(${a.cover})`
            : `background:linear-gradient(135deg,oklch(0.85 0.10 ${a.hue}) 0%,oklch(0.55 0.20 ${a.hue}) 100%)`}>

          {#if !a.cover}
            <div class="anime-fallback">
              <span class="anime-glyph" style="color:oklch(0.95 0.05 {a.hue})">{letter(a.title)}</span>
              <span class="anime-hash"  style="color:oklch(0.95 0.05 {a.hue})">#{String(idx+1).padStart(2,'0')}</span>
              <span class="anime-stripe s1" style="background:oklch(0.95 0.10 {a.hue}/0.18)"></span>
              <span class="anime-stripe s2" style="background:oklch(0.95 0.10 {a.hue}/0.12)"></span>
            </div>
          {/if}

          <div class="anime-veil"></div>

          <span class="status-pill status-{a.status}">
            <span class="status-dot"></span>
            {a.status === 'current' ? 'WATCHING' : a.status.toUpperCase()}
          </span>

          {#if a.score}
            <span class="score-pill">★ {a.score}</span>
          {/if}

          <div class="anime-bottom">
            <div class="title-overlay">{a.title}</div>
            {#if a.ep}
              <div class="ep-row">
                <div class="ep-bar"><div class="ep-bar-fill" style="width:{p}%"></div></div>
                <span class="ep-text">{a.ep}</span>
              </div>
            {/if}
          </div>
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .filter-tab {
    all: unset;
    padding: 6px 14px;
    border-radius: 999px;
    font-size: 13px;
    color: var(--btn-content);
    cursor: pointer;
    transition: all 120ms;
    font-weight: 500;
  }
  .filter-tab.active {
    background: var(--card-bg);
    color: var(--primary);
    box-shadow: 0 1px 2px rgba(0,0,0,0.04);
  }
</style>
