<script>
  import { onMount } from 'svelte';

  onMount(() => {
    /** @type {AudioContext | null} */
    let ctx = null;

    function getCtx() {
      if (!ctx) {
        try {
          ctx = new (window.AudioContext || window.webkitAudioContext)();
        } catch {
          return null;
        }
      }
      // Resume suspended context (autoplay policy)
      if (ctx.state === 'suspended') ctx.resume();
      return ctx;
    }

    /**
     * Play a short noise burst through a BiquadFilter.
     * @param {number} freq - Oscillator frequency
     * @param {number} gain - Master gain (volume)
     * @param {number} duration - Seconds
     * @param {'sine'|'square'|'sawtooth'|'triangle'} type - Oscillator type
     * @param {number} filterFreq - Lowpass cutoff
     */
    function playClick(freq, gain, duration, type = 'sine', filterFreq = 4000) {
      const ac = getCtx();
      if (!ac) return;

      try {
        const now = ac.currentTime;

        // Oscillator for tonal body
        const osc = ac.createOscillator();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.4, now + duration);

        // Noise for click texture
        const bufSize = ac.sampleRate * duration;
        const buf = ac.createBuffer(1, bufSize, ac.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
        const noise = ac.createBufferSource();
        noise.buffer = buf;

        // Filter the noise
        const filter = ac.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = filterFreq;

        // Gain envelope
        const gainNode = ac.createGain();
        gainNode.gain.setValueAtTime(gain, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

        // Noise gain — more prominent than osc for tactile premium feel
        const noiseGain = ac.createGain();
        noiseGain.gain.setValueAtTime(gain * 0.55, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration * 0.4);

        osc.connect(gainNode);
        noise.connect(filter);
        filter.connect(noiseGain);
        gainNode.connect(ac.destination);
        noiseGain.connect(ac.destination);

        osc.start(now);
        osc.stop(now + duration);
        noise.start(now);
        noise.stop(now + duration);
      } catch {
        // Graceful degradation — Web Audio errors are non-fatal
      }
    }

    function playWhoosh() {
      const ac = getCtx();
      if (!ac) return;

      try {
        const now = ac.currentTime;
        const duration = 0.12;

        const bufSize = ac.sampleRate * duration;
        const buf = ac.createBuffer(1, bufSize, ac.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;

        const noise = ac.createBufferSource();
        noise.buffer = buf;

        const filter = ac.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(800, now);
        filter.frequency.exponentialRampToValueAtTime(200, now + duration);
        filter.Q.value = 0.7;

        const gainNode = ac.createGain();
        gainNode.gain.setValueAtTime(0.025, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ac.destination);

        noise.start(now);
        noise.stop(now + duration);
      } catch {
        // Graceful degradation
      }
    }

    function isTypingTarget(el) {
      if (!el) return false;
      const tag = el.tagName?.toLowerCase();
      return tag === 'input' || tag === 'textarea' || el.isContentEditable;
    }

    function onKeydown(e) {
      const focused = document.activeElement;
      if (!isTypingTarget(focused)) return;

      const key = e.key;

      if (key === 'Escape') {
        playWhoosh();
        return;
      }

      if (key === ' ' || key === 'Enter') {
        // Spacebar/Enter: soft deep thud like a premium stabilized key
        playClick(80, 0.045, 0.050, 'sine', 600);
        return;
      }

      if (key === 'Backspace' || key === 'Delete') {
        // Backspace: subtle muted thock
        playClick(240, 0.035, 0.028, 'triangle', 2200);
        return;
      }

      // Regular keypress — warm, short thock (lower gain + warmer filter = premium feel)
      const seed = (key.charCodeAt(0) ?? 65) % 20;
      const freq = 520 + seed * 7;
      playClick(freq, 0.038, 0.022, 'sine', 2800);
    }

    document.addEventListener('keydown', onKeydown, { passive: true });

    return () => {
      document.removeEventListener('keydown', onKeydown);
      try { ctx?.close(); } catch { /* ignore */ }
    };
  });
</script>

<div style="display:none" aria-hidden="true"></div>
