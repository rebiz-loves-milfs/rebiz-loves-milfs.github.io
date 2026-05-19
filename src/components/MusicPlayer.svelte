<script>
  import { onMount, onDestroy } from 'svelte';

  const TRACKS = [
    { title: 'Tabi no Tochuu', artist: 'Natsumi Inoue', album: 'Spice and Wolf OST', cover: '/assets/default-logo.webp', duration: 214 },
    { title: 'Distant Journey', artist: 'Kenji Ito', album: 'SaGa Frontier', cover: '/assets/default-logo.webp', duration: 183 },
    { title: 'Yuki no Hana', artist: 'Nakashima Mika', album: 'Single', cover: '/assets/default-logo.webp', duration: 266 },
    { title: 'Waltz for Debby', artist: 'Bill Evans', album: 'Waltz for Debby', cover: '/assets/default-logo.webp', duration: 379 },
    { title: 'Re:Re:', artist: 'Asian Kung-Fu Generation', album: 'Sol-fa', cover: '/assets/default-logo.webp', duration: 231 },
  ];

  let open = false;
  let playing = false;
  let shuffle = false;
  let loop = false;
  let currentIndex = 0;
  let progress = 0;
  let interval = null;

  $: track = TRACKS[currentIndex];
  $: progressPct = (progress / track.duration) * 100;
  $: timeStr = fmtTime(progress);
  $: durStr = fmtTime(track.duration);

  function fmtTime(s) {
    const m = Math.floor(s / 60);
    const ss = String(s % 60).padStart(2, '0');
    return `${m}:${ss}`;
  }

  function tick() {
    if (!playing) return;
    progress += 1;
    if (progress >= track.duration) {
      progress = 0;
      if (loop) return;
      nextTrack();
    }
  }

  function togglePlay() {
    playing = !playing;
    if (playing) {
      interval = setInterval(tick, 1000);
    } else {
      clearInterval(interval);
    }
  }

  function nextTrack() {
    clearInterval(interval);
    progress = 0;
    if (shuffle) {
      let next = currentIndex;
      while (next === currentIndex && TRACKS.length > 1)
        next = Math.floor(Math.random() * TRACKS.length);
      currentIndex = next;
    } else {
      currentIndex = (currentIndex + 1) % TRACKS.length;
    }
    if (playing) interval = setInterval(tick, 1000);
  }

  function prevTrack() {
    if (progress > 3) { progress = 0; return; }
    clearInterval(interval);
    progress = 0;
    currentIndex = (currentIndex - 1 + TRACKS.length) % TRACKS.length;
    if (playing) interval = setInterval(tick, 1000);
  }

  function selectTrack(i) {
    clearInterval(interval);
    currentIndex = i;
    progress = 0;
    playing = true;
    interval = setInterval(tick, 1000);
  }

  function seek(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    progress = Math.round(pct * track.duration);
  }

  onDestroy(() => clearInterval(interval));
</script>

<div class="mp-fab-wrap">
  <button class="mp-fab" on:click={() => open = !open} title="Music Player">
    <iconify-icon icon={playing ? 'material-symbols:music-note' : 'material-symbols:music-note-outline'} width="18"></iconify-icon>
  </button>

  {#if open}
  <div class="mp-panel">
    <div class="mp-cover-row">
      <img class="mp-cover" src={track.cover} alt={track.title} />
      <div class="mp-info">
        <div class="mp-title">{track.title}</div>
        <div class="mp-artist">{track.artist}</div>
        <div class="mp-album">{track.album}</div>
      </div>
    </div>

    <div class="mp-seek" role="slider" aria-valuenow={progressPct} aria-valuemin={0} aria-valuemax={100} aria-label="Seek" tabindex="0" on:click={seek} on:keydown={e => (e.key === 'ArrowRight' && (progress = Math.min(track.duration, progress + 5))) || (e.key === 'ArrowLeft' && (progress = Math.max(0, progress - 5)))}>
      <div class="mp-seek-fill" style="width:{progressPct}%"></div>
    </div>
    <div class="mp-time">
      <span>{timeStr}</span>
      <span>{durStr}</span>
    </div>

    <div class="mp-controls">
      <button class="mp-btn {shuffle ? 'active' : ''}" on:click={() => shuffle = !shuffle} title="Shuffle">
        <iconify-icon icon="material-symbols:shuffle" width="16"></iconify-icon>
      </button>
      <button class="mp-btn" on:click={prevTrack} title="Previous">
        <iconify-icon icon="material-symbols:skip-previous" width="20"></iconify-icon>
      </button>
      <button class="mp-btn play" on:click={togglePlay} title={playing ? 'Pause' : 'Play'}>
        <iconify-icon icon={playing ? 'material-symbols:pause' : 'material-symbols:play-arrow'} width="22"></iconify-icon>
      </button>
      <button class="mp-btn" on:click={nextTrack} title="Next">
        <iconify-icon icon="material-symbols:skip-next" width="20"></iconify-icon>
      </button>
      <button class="mp-btn {loop ? 'active' : ''}" on:click={() => loop = !loop} title="Loop">
        <iconify-icon icon="material-symbols:repeat" width="16"></iconify-icon>
      </button>
    </div>

    <div class="mp-queue">
      {#each TRACKS as t, i}
        <button class="mp-queue-item {i === currentIndex ? 'current' : ''}" on:click={() => selectTrack(i)}>
          <span class="mp-q-num">{i + 1}</span>
          <span class="mp-q-info">
            <span class="mp-q-title">{t.title}</span>
            <span class="mp-q-artist">{t.artist}</span>
          </span>
          <span class="mp-q-dur">{fmtTime(t.duration)}</span>
        </button>
      {/each}
    </div>
  </div>
  {/if}
</div>

<style>
  .mp-fab-wrap {
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 200;
  }
  .mp-fab {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: var(--primary);
    color: white;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 16px oklch(0.5 0.2 var(--hue) / 0.4);
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .mp-fab:hover {
    transform: scale(1.08);
    box-shadow: 0 6px 24px oklch(0.5 0.2 var(--hue) / 0.5);
  }
  .mp-panel {
    position: absolute;
    bottom: 60px;
    right: 0;
    width: 300px;
    background: var(--card-bg);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 16px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.15);
  }
  .mp-cover-row {
    display: flex;
    gap: 12px;
    align-items: center;
    margin-bottom: 14px;
  }
  .mp-cover {
    width: 56px;
    height: 56px;
    border-radius: 8px;
    object-fit: cover;
    flex-shrink: 0;
  }
  .mp-info { min-width: 0; }
  .mp-title { font-size: 13px; font-weight: 600; color: var(--fg-1); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .mp-artist { font-size: 11px; color: var(--fg-2); margin-top: 2px; }
  .mp-album { font-size: 10px; color: var(--fg-3); margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

  .mp-seek {
    width: 100%;
    height: 4px;
    background: var(--border);
    border-radius: 2px;
    cursor: pointer;
    position: relative;
    margin-bottom: 4px;
  }
  .mp-seek-fill {
    height: 100%;
    background: var(--primary);
    border-radius: 2px;
    transition: width 0.3s linear;
  }
  .mp-time {
    display: flex;
    justify-content: space-between;
    font-size: 10px;
    color: var(--fg-3);
    margin-bottom: 12px;
  }
  .mp-controls {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    margin-bottom: 14px;
  }
  .mp-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--fg-2);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 6px;
    border-radius: 8px;
    transition: color 0.2s, background 0.2s;
  }
  .mp-btn:hover { color: var(--primary); background: var(--primary-soft); }
  .mp-btn.active { color: var(--primary); }
  .mp-btn.play {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: var(--primary-soft);
    color: var(--primary);
  }
  .mp-btn.play:hover { background: var(--primary); color: white; }

  .mp-queue { display: flex; flex-direction: column; gap: 2px; }
  .mp-queue-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 8px;
    border-radius: 8px;
    border: none;
    background: none;
    cursor: pointer;
    text-align: left;
    width: 100%;
    transition: background 0.15s;
  }
  .mp-queue-item:hover { background: var(--hover); }
  .mp-queue-item.current { background: var(--primary-soft); }
  .mp-q-num { font-size: 10px; color: var(--fg-3); width: 14px; flex-shrink: 0; }
  .mp-q-info { flex: 1; min-width: 0; display: flex; flex-direction: column; }
  .mp-q-title { font-size: 12px; color: var(--fg-1); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .mp-q-artist { font-size: 10px; color: var(--fg-3); }
  .mp-queue-item.current .mp-q-title { color: var(--primary); }
  .mp-q-dur { font-size: 10px; color: var(--fg-3); flex-shrink: 0; }
</style>
