<script>
  import { onDestroy, onMount } from 'svelte';
  import { YOUTUBE } from '../config';

  let ytPlayer = null;
  let ytReady = false;
  let state = 'loading';   // loading | ok | unconfigured | error
  let currentTitle = '';
  let currentArtist = '';
  let currentThumb = '';
  let isPlaying = false;
  let currentTime = 0;
  let duration = 0;
  let tickInterval = null;

  $: progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;
  $: timeStr = fmt(currentTime);
  $: durStr = fmt(duration);

  function fmt(s) {
    s = Math.floor(s || 0);
    const m = Math.floor(s / 60);
    return `${m}:${String(s % 60).padStart(2, '0')}`;
  }

  function ensureYTApi() {
    return new Promise(resolve => {
      if (window.YT?.Player) { resolve(); return; }
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
      window.onYouTubeIframeAPIReady = resolve;
      setTimeout(resolve, 6000); // fallback
    });
  }

  async function init() {
    if (!YOUTUBE.playlistId) { state = 'unconfigured'; return; }

    state = 'loading';
    try {
      await ensureYTApi();
      const container = document.getElementById('yt-player-div');
      if (!container) return;

      ytPlayer = new window.YT.Player(container, {
        height: '1', width: '1',
        playerVars: {
          listType:       'playlist',
          list:           YOUTUBE.playlistId,
          autoplay:       1,
          controls:       0,
          modestbranding: 1,
          rel:            0,
          playsinline:    1,
          enablejsapi:    1,
        },
        events: {
          onReady:       onReady,
          onStateChange: onStateChange,
          onError:       () => { state = 'error'; },
        },
      });
    } catch {
      state = 'error';
    }
  }

  function onReady(e) {
    state = 'ok';
    ytReady = true;
    updateMeta();
    startTick();
  }

  function onStateChange(e) {
    const YT = window.YT;
    if (!YT) return;
    isPlaying = e.data === YT.PlayerState.PLAYING;
    if (e.data === YT.PlayerState.PLAYING || e.data === YT.PlayerState.PAUSED) {
      updateMeta();
    }
  }

  function updateMeta() {
    if (!ytPlayer?.getVideoData) return;
    const d = ytPlayer.getVideoData();
    currentTitle  = d.title  || '';
    currentArtist = d.author || '';
    const vid = d.video_id;
    currentThumb  = vid ? `https://img.youtube.com/vi/${vid}/mqdefault.jpg` : '';
    duration = ytPlayer.getDuration?.() || 0;
  }

  function startTick() {
    tickInterval = setInterval(() => {
      if (ytPlayer?.getCurrentTime) {
        currentTime = ytPlayer.getCurrentTime();
        duration    = ytPlayer.getDuration?.() || duration;
      }
    }, 500);
  }

  function togglePlay() {
    if (!ytPlayer) return;
    isPlaying ? ytPlayer.pauseVideo() : ytPlayer.playVideo();
  }

  function nextTrack() { ytPlayer?.nextVideo?.(); }
  function prevTrack() { ytPlayer?.previousVideo?.(); }

  function seek(e) {
    if (!ytPlayer || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    ytPlayer.seekTo(((e.clientX - rect.left) / rect.width) * duration, true);
  }

  onMount(init);
  onDestroy(() => {
    clearInterval(tickInterval);
    ytPlayer?.destroy?.();
  });
</script>

<!-- hidden YT player target -->
<div id="yt-player-div" style="position:absolute;top:-9999px;left:-9999px;width:1px;height:1px;"></div>

<div class="yt-wrap">
  <div class="yt-head">
    <span class="widget-title" style="display:flex;align-items:center;gap:6px">
      <iconify-icon icon="fa7-brands:youtube" width="14" style="color:oklch(0.55 0.22 25)"></iconify-icon>
      Playlist
    </span>
  </div>

  {#if state === 'unconfigured'}
    <div class="yt-prompt">
      <iconify-icon icon="fa7-brands:youtube" width="28" style="color:oklch(0.55 0.22 25)"></iconify-icon>
      <p>Add your playlist ID in <code>src/config.ts</code>:</p>
      <pre class="yt-snippet">YOUTUBE: {`{ playlistId: 'PLxxxxxxxxx' }`}</pre>
      <p class="yt-note">No API key needed.</p>
    </div>

  {:else if state === 'error'}
    <div class="yt-prompt">
      <iconify-icon icon="material-symbols:error-outline" width="24"></iconify-icon>
      <p>Could not load playlist. Check the playlist ID and make sure it's public.</p>
    </div>

  {:else if state === 'loading'}
    <div class="yt-prompt">
      <span class="yt-spinner"></span>
      <p>Loading playlist…</p>
    </div>

  {:else}
    <!-- now playing -->
    {#if currentTitle}
      <div class="yt-now">
        {#if currentThumb}
          <img class="yt-thumb" src={currentThumb} alt={currentTitle} />
        {/if}
        <div class="yt-meta">
          <div class="yt-title">{currentTitle}</div>
          {#if currentArtist}<div class="yt-artist">{currentArtist}</div>{/if}
        </div>
      </div>

      <!-- seek bar -->
      <div class="yt-seek" role="slider" aria-valuenow={progressPct} aria-valuemin={0} aria-valuemax={100} aria-label="Seek" tabindex="0" on:click={seek}>
        <div class="yt-seek-fill" style="width:{progressPct}%"></div>
      </div>
      <div class="yt-time"><span>{timeStr}</span><span>{durStr}</span></div>

      <!-- controls -->
      <div class="yt-controls">
        <button class="yt-btn" on:click={prevTrack} title="Previous">
          <iconify-icon icon="material-symbols:skip-previous" width="22"></iconify-icon>
        </button>
        <button class="yt-btn play" on:click={togglePlay} title={isPlaying ? 'Pause' : 'Play'}>
          <iconify-icon icon={isPlaying ? 'material-symbols:pause' : 'material-symbols:play-arrow'} width="24"></iconify-icon>
        </button>
        <button class="yt-btn" on:click={nextTrack} title="Next">
          <iconify-icon icon="material-symbols:skip-next" width="22"></iconify-icon>
        </button>
      </div>
    {/if}
  {/if}
</div>

<style>
  .yt-wrap { display: flex; flex-direction: column; gap: 12px; }
  .yt-head { display: flex; align-items: center; justify-content: space-between; }

  .yt-prompt {
    display: flex; flex-direction: column; align-items: center;
    gap: 8px; padding: 20px 12px; text-align: center;
    color: var(--fg-3);
  }
  .yt-prompt p { font-size: 13px; color: var(--fg-3); margin: 0; line-height: 1.5; }
  .yt-prompt code { font-family: var(--font-mono); font-size: 12px; background: var(--hover); padding: 2px 5px; border-radius: 4px; }
  .yt-snippet { font-family: var(--font-mono); font-size: 11px; background: var(--btn-regular-bg); color: var(--fg-2); padding: 8px 12px; border-radius: 7px; white-space: pre; overflow-x: auto; width: 100%; text-align: left; }
  .yt-note { font-size: 11px; color: var(--fg-4); margin: 0; }
  .yt-spinner { width: 20px; height: 20px; border: 2px solid var(--border); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  .yt-now { display: flex; gap: 12px; align-items: center; }
  .yt-thumb { width: 56px; height: 42px; border-radius: 6px; object-fit: cover; flex-shrink: 0; }
  .yt-meta { flex: 1; min-width: 0; }
  .yt-title { font-size: 13px; font-weight: 600; color: var(--fg-1); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .yt-artist { font-size: 11px; color: var(--fg-3); margin-top: 2px; }

  .yt-seek {
    width: 100%; height: 4px; background: var(--border);
    border-radius: 2px; cursor: pointer; position: relative;
  }
  .yt-seek-fill { height: 100%; background: var(--primary); border-radius: 2px; transition: width 0.3s linear; }
  .yt-time { display: flex; justify-content: space-between; font-size: 10px; color: var(--fg-3); font-family: var(--font-mono); }

  .yt-controls { display: flex; align-items: center; justify-content: center; gap: 6px; }
  .yt-btn { background: none; border: none; cursor: pointer; color: var(--fg-2); display: flex; align-items: center; justify-content: center; padding: 6px; border-radius: 8px; transition: color 0.15s, background 0.15s; }
  .yt-btn:hover { color: var(--primary); background: var(--primary-soft); }
  .yt-btn.play { width: 40px; height: 40px; border-radius: 50%; background: var(--primary-soft); color: var(--primary); }
  .yt-btn.play:hover { background: var(--primary); color: white; }
</style>
