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

        // Noise gain (softer than osc)
        const noiseGain = ac.createGain();
        noiseGain.gain.setValueAtTime(gain * 0.3, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration * 0.5);

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
        gainNode.gain.setValueAtTime(0.05, now);
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
        // Deeper thud — lower freq, slightly longer
        playClick(90, 0.09, 0.055, 'sine', 800);
        return;
      }

      if (key === 'Backspace' || key === 'Delete') {
        // Different pitch, slightly lower
        playClick(260, 0.07, 0.030, 'triangle', 3000);
        return;
      }

      // Regular keypress — short percussive click
      // Vary freq slightly per key for character
      const seed = (key.charCodeAt(0) ?? 65) % 20;
      const freq = 580 + seed * 8;
      playClick(freq, 0.08, 0.025, 'sine', 4500);
    }

    document.addEventListener('keydown', onKeydown, { passive: true });

    return () => {
      document.removeEventListener('keydown', onKeydown);
      try { ctx?.close(); } catch { /* ignore */ }
    };
  });
</script>

<div style="display:none" aria-hidden="true"></div>
