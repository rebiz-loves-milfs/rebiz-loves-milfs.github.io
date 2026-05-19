<script>
  import { onMount } from 'svelte';

  export let atmosphere = undefined;

  const EMOJIS = {
    rain:      '🌧️',
    cafe:      '☕',
    forest:    '🌿',
    shrine:    '⛩️',
    synthwave: '🎹',
    silence:   '🔇',
  };

  let audioCtx = null;
  let gainNode = null;
  let sourceNodes = [];
  let visible = false;
  let playing = true;
  let dismissed = false;
  let volume = 6; // 0-100, maps to 0-0.06 gain
  let scrollListener = null;

  function getMaxGain() { return 0.06; }

  function createWhiteNoise(ctx) {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    return source;
  }

  function createBrownNoise(ctx) {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < bufferSize; i++) {
      const w = Math.random() * 2 - 1;
      data[i] = (last + 0.02 * w) / 1.02;
      last = data[i];
      data[i] *= 3.5;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    return source;
  }

  function setupRain(ctx, gain) {
    const source = createWhiteNoise(ctx);
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;
    source.connect(filter);
    filter.connect(gain);
    source.start();
    sourceNodes.push(source);
  }

  function setupCafe(ctx, gain) {
    const source = createBrownNoise(ctx);
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 600;
    source.connect(filter);
    filter.connect(gain);
    source.start();
    sourceNodes.push(source);

    // Occasional "clink" sweep
    function scheduleSwitch() {
      const delay = 4000 + Math.random() * 8000;
      setTimeout(() => {
        if (!audioCtx || audioCtx.state === 'closed') return;
        const t = audioCtx.currentTime;
        filter.frequency.setValueAtTime(600, t);
        filter.frequency.linearRampToValueAtTime(1200, t + 0.1);
        filter.frequency.linearRampToValueAtTime(600, t + 0.4);
        scheduleSwitch();
      }, delay);
    }
    scheduleSwitch();
  }

  function setupForest(ctx, gain) {
    const source = createWhiteNoise(ctx);
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 400;
    filter.Q.value = 0.5;

    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.08;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 200;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    source.connect(filter);
    filter.connect(gain);
    source.start();
    lfo.start();
    sourceNodes.push(source, lfo);
  }

  function setupShrine(ctx, gain) {
    const freqs = [432, 648, 864, 1080];
    for (const freq of freqs) {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const oscGain = ctx.createGain();
      oscGain.gain.value = 0.25 / freqs.length;
      osc.connect(oscGain);
      oscGain.connect(gain);
      osc.start();
      sourceNodes.push(osc);
    }
  }

  function setupSynthwave(ctx, gain) {
    const BPM = 120;
    const noteLen = (60 / BPM) / 2;
    const notes = [261.63, 329.63, 392, 523.25, 659.26, 523.25, 392, 329.63];
    let step = 0;

    function playNote() {
      if (!audioCtx || audioCtx.state === 'closed') return;
      const t = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      osc.type = 'square';
      osc.frequency.value = notes[step % notes.length];
      const env = audioCtx.createGain();
      env.gain.setValueAtTime(0.3, t);
      env.gain.exponentialRampToValueAtTime(0.001, t + noteLen * 0.8);
      osc.connect(env);
      env.connect(gain);
      osc.start(t);
      osc.stop(t + noteLen);
      step++;
      setTimeout(playNote, noteLen * 1000);
    }
    playNote();
  }

  function fadeIn(node, duration = 2) {
    const maxGain = getMaxGain();
    node.gain.setValueAtTime(0, audioCtx.currentTime);
    node.gain.linearRampToValueAtTime(maxGain * (volume / 100), audioCtx.currentTime + duration);
  }

  function startAudio() {
    if (!atmosphere || atmosphere === 'silence') return;
    if (!window.AudioContext && !window.webkitAudioContext) return;

    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      audioCtx = new Ctx();
      gainNode = audioCtx.createGain();
      gainNode.gain.value = 0;
      gainNode.connect(audioCtx.destination);

      switch (atmosphere) {
        case 'rain':      setupRain(audioCtx, gainNode); break;
        case 'cafe':      setupCafe(audioCtx, gainNode); break;
        case 'forest':    setupForest(audioCtx, gainNode); break;
        case 'shrine':    setupShrine(audioCtx, gainNode); break;
        case 'synthwave': setupSynthwave(audioCtx, gainNode); break;
      }

      fadeIn(gainNode, 2);
    } catch(e) {
      // Web Audio not available
      audioCtx = null;
    }
  }

  function stopAudio() {
    if (!audioCtx) return;
    try {
      for (const node of sourceNodes) {
        try { node.stop(); } catch(_) {}
      }
      sourceNodes = [];
      audioCtx.close();
      audioCtx = null;
      gainNode = null;
    } catch(_) {}
  }

  function togglePlay() {
    if (!audioCtx) return;
    if (playing) {
      audioCtx.suspend();
      playing = false;
    } else {
      audioCtx.resume();
      playing = true;
    }
  }

  function onVolumeChange(e) {
    volume = Number(e.target.value);
    if (gainNode && audioCtx) {
      gainNode.gain.setTargetAtTime(getMaxGain() * (volume / 100), audioCtx.currentTime, 0.05);
    }
  }

  function dismiss() {
    dismissed = true;
    stopAudio();
  }

  onMount(() => {
    if (!atmosphere || atmosphere === 'silence') return;

    const onScroll = () => {
      if (window.scrollY > 200) {
        visible = true;
        window.removeEventListener('scroll', onScroll);
        scrollListener = null;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    scrollListener = onScroll;

    startAudio();

    const onNavStart = () => {
      if (gainNode && audioCtx) {
        gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.5);
      }
    };
    document.addEventListener('astro:before-preparation', onNavStart);

    return () => {
      if (scrollListener) window.removeEventListener('scroll', scrollListener);
      document.removeEventListener('astro:before-preparation', onNavStart);
      stopAudio();
    };
  });
</script>

{#if atmosphere && atmosphere !== 'silence' && visible && !dismissed}
  <div class="atm-pill" role="region" aria-label="Atmosphere player">
    <span class="atm-icon">{EMOJIS[atmosphere] ?? '🎵'}</span>
    <span class="atm-name">{atmosphere}</span>
    <input
      type="range"
      class="atm-vol"
      min="0"
      max="100"
      value={volume}
      on:input={onVolumeChange}
      aria-label="Volume"
    />
    <button class="atm-btn" on:click={togglePlay} aria-label={playing ? 'Pause' : 'Play'}>
      {playing ? '⏸' : '▶'}
    </button>
    <button class="atm-btn atm-close" on:click={dismiss} aria-label="Close atmosphere player">×</button>
  </div>
{/if}

<style>
  .atm-pill {
    position: fixed;
    bottom: 84px;
    left: 24px;
    z-index: 200;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 999px;
    background: var(--card-bg, rgba(255,255,255,0.92));
    border: 1px solid var(--border, rgba(0,0,0,0.1));
    box-shadow: 0 4px 16px rgba(0,0,0,0.10);
    font-size: 12px;
    font-family: var(--font-mono, monospace);
    color: var(--fg-2, #555);
    backdrop-filter: blur(8px);
    animation: atm-slide-in 0.3s cubic-bezier(.34,1.56,.64,1) both;
  }

  @keyframes atm-slide-in {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: none; }
  }

  .atm-icon { font-size: 16px; }

  .atm-name {
    font-size: 11px;
    text-transform: capitalize;
    color: var(--fg-3, #888);
  }

  .atm-vol {
    width: 64px;
    height: 3px;
    accent-color: var(--primary, #7c3aed);
    cursor: pointer;
  }

  .atm-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 14px;
    color: var(--fg-2, #555);
    padding: 2px 4px;
    border-radius: 4px;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.15s, background 0.15s;
  }

  .atm-btn:hover {
    color: var(--primary, #7c3aed);
    background: var(--primary-soft, rgba(124,58,237,0.08));
  }

  .atm-close {
    font-size: 18px;
    line-height: 1;
    color: var(--fg-4, #aaa);
  }
</style>
