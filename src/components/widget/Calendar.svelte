<script>
  import { onMount } from 'svelte';

  export let postDates = []; // {date: 'YYYY-MM-DD', id: string, title: string}[]

  let viewYear  = 0;
  let viewMonth = 0; // 0-based
  let todayDate = 0;
  let todayMonth = 0;
  let todayYear  = 0;
  let mounted = false;
  let popupDay = null;
  let hoverDay = null;

  const DAY_HEADERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const MONTH_NAMES = ['January','February','March','April','May','June',
                       'July','August','September','October','November','December'];

  onMount(() => {
    const now = new Date();
    todayDate  = now.getDate();
    todayMonth = now.getMonth();
    todayYear  = now.getFullYear();
    viewYear   = todayYear;
    viewMonth  = todayMonth;
    mounted = true;
  });

  // Derived values that recompute when viewYear/viewMonth change
  $: daysInMonth = viewYear ? new Date(viewYear, viewMonth + 1, 0).getDate() : 0;
  $: firstDay    = viewYear ? new Date(viewYear, viewMonth, 1).getDay() : 0;
  $: isCurrentMonth = viewYear === todayYear && viewMonth === todayMonth;

  $: postsByDay = (() => {
    if (!viewYear) return {};
    const prefix = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-`;
    const map = {};
    for (const p of postDates) {
      if (p.date.startsWith(prefix)) {
        const day = parseInt(p.date.slice(8), 10);
        if (!map[day]) map[day] = [];
        map[day].push({ id: p.id, title: p.title });
      }
    }
    return map;
  })();

  $: totalPosts = Object.values(postsByDay).reduce((s, a) => s + a.length, 0);

  function prev() {
    popupDay = null;
    if (viewMonth === 0) { viewMonth = 11; viewYear -= 1; }
    else viewMonth -= 1;
  }
  function next() {
    popupDay = null;
    if (viewMonth === 11) { viewMonth = 0; viewYear += 1; }
    else viewMonth += 1;
  }
  function goToday() {
    popupDay = null;
    viewYear  = todayYear;
    viewMonth = todayMonth;
  }

  function handleClick(d) {
    const posts = postsByDay[d];
    if (!posts?.length) return;
    if (posts.length === 1) {
      window.location.href = `/posts/${posts[0].id}`;
    } else {
      popupDay = popupDay === d ? null : d;
    }
  }
</script>

{#if mounted}
<div class="card cal-wrap">
  <!-- Header with month nav -->
  <div class="cal-nav">
    <button class="cal-arrow" on:click={prev} aria-label="Previous month">‹</button>
    <div class="cal-nav-center">
      <span class="cal-month-label">{MONTH_NAMES[viewMonth]} {viewYear}</span>
      {#if !isCurrentMonth}
        <button class="cal-today-btn" on:click={goToday}>today</button>
      {:else}
        <span class="cal-tally">{totalPosts} post{totalPosts !== 1 ? 's' : ''}</span>
      {/if}
    </div>
    <button class="cal-arrow" on:click={next} aria-label="Next month">›</button>
  </div>

  <!-- Day grid -->
  <div class="cal-grid">
    {#each DAY_HEADERS as d}
      <div class="cal-h">{d}</div>
    {/each}
    {#each Array(firstDay) as _}
      <div></div>
    {/each}

    {#each Array(daysInMonth) as _, i}
      {@const d = i + 1}
      {@const dayPosts = postsByDay[d] ?? []}
      {@const hasPost = dayPosts.length > 0}
      {@const isToday = isCurrentMonth && d === todayDate}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <div
        class="cal-d"
        class:has={hasPost}
        class:today={isToday}
        role={hasPost ? 'button' : undefined}
        tabindex={hasPost ? 0 : undefined}
        aria-label={hasPost ? `${d} — ${dayPosts.length} post${dayPosts.length > 1 ? 's' : ''}` : undefined}
        on:click={() => handleClick(d)}
        on:keydown={e => (e.key === 'Enter' || e.key === ' ') && handleClick(d)}
        on:mouseenter={() => (hoverDay = d)}
        on:mouseleave={() => (hoverDay = null)}
      >
        {d}
        {#if hasPost}<span class="cal-pip"></span>{/if}

        {#if hoverDay === d && hasPost}
          <div class="cal-tooltip" role="tooltip">
            {#each dayPosts.slice(0, 3) as p}
              <span class="cal-tip-line">{p.title}</span>
            {/each}
            {#if dayPosts.length > 3}
              <span class="cal-tip-more">+{dayPosts.length - 3} more</span>
            {/if}
          </div>
        {/if}
      </div>
    {/each}
  </div>

  <!-- Multi-post popup -->
  {#if popupDay !== null && postsByDay[popupDay]}
    <div class="cal-popup">
      <div class="cal-popup-title">{MONTH_NAMES[viewMonth]} {popupDay}</div>
      {#each postsByDay[popupDay] as p}
        <a href={`/posts/${p.id}`} class="cal-popup-link">{p.title}</a>
      {/each}
    </div>
  {/if}
</div>
{/if}

<style>
  .cal-wrap { position: relative; }

  /* ── Month navigation ── */
  .cal-nav {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 10px; gap: 4px;
  }
  .cal-nav-center {
    flex: 1; display: flex; flex-direction: column;
    align-items: center; gap: 2px;
  }
  .cal-month-label {
    font-size: 13px; font-weight: 700; color: var(--fg-1);
    font-family: var(--font-display); letter-spacing: -0.01em;
    line-height: 1;
  }
  .cal-tally {
    font-size: 10px; color: var(--fg-4);
    font-family: var(--font-mono); line-height: 1;
  }
  .cal-arrow {
    width: 26px; height: 26px; border-radius: 50%;
    border: 1px solid var(--border);
    background: var(--btn-regular-bg); color: var(--fg-2);
    font-size: 15px; line-height: 1; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: background 120ms, color 120ms;
    flex-shrink: 0;
  }
  .cal-arrow:hover { background: var(--primary-soft); color: var(--primary); border-color: transparent; }
  .cal-today-btn {
    font-size: 10px; font-family: var(--font-mono);
    color: var(--primary); background: var(--primary-soft);
    border: none; border-radius: 999px;
    padding: 2px 8px; cursor: pointer;
    transition: background 120ms;
    line-height: 1.4;
  }
  .cal-today-btn:hover { background: var(--btn-regular-bg-hover); }

  /* ── Grid ── */
  .cal-d {
    aspect-ratio: 1; display: flex; align-items: center; justify-content: center;
    border-radius: 0.4rem; position: relative;
    cursor: default; transition: background 120ms, color 120ms;
    font-size: 12px;
  }
  .cal-d.has {
    cursor: pointer; font-weight: 700; color: var(--fg-1);
  }
  .cal-d.has:hover { background: var(--primary-soft); color: var(--primary); }
  .cal-d.today {
    background: var(--primary); color: white; font-weight: 700;
    animation: todayPulse 2.4s ease-out infinite;
  }
  .cal-d.today.has:hover { background: var(--primary-hover); color: white; }

  .cal-pip {
    position: absolute; bottom: 2px; left: 50%; transform: translateX(-50%);
    width: 4px; height: 4px; border-radius: 50%;
    background: var(--primary); pointer-events: none;
  }
  .cal-d.today .cal-pip { background: white; }

  /* ── Tooltip ── */
  .cal-tooltip {
    position: absolute; bottom: calc(100% + 6px); left: 50%;
    transform: translateX(-50%);
    background: var(--card-bg); border: 1px solid var(--border);
    border-radius: 0.6rem; padding: 7px 10px;
    box-shadow: 0 6px 20px rgba(0,0,0,0.12);
    z-index: 30; min-width: 150px; max-width: 210px;
    display: flex; flex-direction: column; gap: 3px;
    pointer-events: none;
  }
  .cal-tip-line {
    font-size: 11.5px; color: var(--fg-1); line-height: 1.35;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
    overflow: hidden;
    font-weight: 500;
  }
  .cal-tip-more { font-size: 10.5px; color: var(--fg-3); font-family: var(--font-mono); }

  /* ── Multi-post popup ── */
  .cal-popup {
    margin-top: 10px; border-top: 1px solid var(--border); padding-top: 10px;
    display: flex; flex-direction: column; gap: 4px;
    animation: popup-in 140ms cubic-bezier(.4,0,.2,1);
  }
  @keyframes popup-in {
    from { opacity: 0; transform: translateY(-4px); }
    to   { opacity: 1; transform: none; }
  }
  .cal-popup-title {
    font-size: 10px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.08em; color: var(--fg-3); margin-bottom: 2px;
    font-family: var(--font-mono);
  }
  .cal-popup-link {
    font-size: 13px; color: var(--fg-1); text-decoration: none;
    padding: 5px 8px; border-radius: 0.4rem;
    transition: background 100ms, color 100ms;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
    overflow: hidden; line-height: 1.4;
  }
  .cal-popup-link:hover { background: var(--primary-soft); color: var(--primary); }

  @keyframes todayPulse {
    0%, 100% { box-shadow: 0 0 0 0 oklch(0.70 0.14 30 / 0.5); }
    60%       { box-shadow: 0 0 0 4px oklch(0.70 0.14 30 / 0); }
  }
</style>
