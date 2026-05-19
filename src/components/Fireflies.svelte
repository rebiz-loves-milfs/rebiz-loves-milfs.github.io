<script>
  import { onMount } from 'svelte';

  let canvas;
  let animId;
  let opacity = 0;
  let mounted = false;

  export function fadeIn(duration = 3500) {
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      opacity = t * t * (3 - 2 * t);
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  export function fadeOut(duration = 2500) {
    return new Promise(resolve => {
      const startOpacity = opacity;
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - start) / duration);
        opacity = startOpacity * (1 - t * t * (3 - 2 * t));
        if (t < 1) requestAnimationFrame(tick);
        else resolve();
      };
      requestAnimationFrame(tick);
    });
  }

  onMount(() => {
    mounted = true;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const hue = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--hue')) || 30;
    const isDark = () => document.documentElement.classList.contains('dark');

    const COUNT = 28;
    const flies = Array.from({ length: COUNT }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      phase: Math.random() * Math.PI * 2,
      phaseSpeed: 0.008 + Math.random() * 0.014,
      radius: 1.5 + Math.random() * 2,
      glowRadius: 8 + Math.random() * 16,
      orbitRange: 20 + Math.random() * 60,
      cx: 0, cy: 0, // set below
    }));
    flies.forEach(f => { f.cx = f.x; f.cy = f.y; });

    const resize = () => {
      if (!canvas) return;
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const draw = () => {
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const dark = isDark();
      flies.forEach(f => {
        f.phase += f.phaseSpeed;
        // drift center slowly
        f.cx += f.vx * 0.3;
        f.cy += f.vy * 0.3;
        if (f.cx < 0) f.cx = canvas.width;
        if (f.cx > canvas.width) f.cx = 0;
        if (f.cy < 0) f.cy = canvas.height;
        if (f.cy > canvas.height) f.cy = 0;
        // orbit around center
        f.x = f.cx + Math.cos(f.phase) * f.orbitRange * 0.5;
        f.y = f.cy + Math.sin(f.phase * 0.7) * f.orbitRange * 0.3;

        const blink = (Math.sin(f.phase * 1.3) + 1) / 2; // 0..1
        const alpha = dark
          ? 0.35 + blink * 0.65
          : 0.20 + blink * 0.45;

        // glow
        const grd = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.glowRadius * (0.8 + blink * 0.5));
        grd.addColorStop(0, `oklch(0.85 0.22 ${hue} / ${alpha * 0.9})`);
        grd.addColorStop(0.4, `oklch(0.75 0.18 ${hue} / ${alpha * 0.4})`);
        grd.addColorStop(1, `oklch(0.70 0.14 ${hue} / 0)`);
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.glowRadius * (0.8 + blink * 0.5), 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        // core dot
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.radius * (0.7 + blink * 0.5), 0, Math.PI * 2);
        ctx.fillStyle = `oklch(0.95 0.12 ${hue} / ${alpha})`;
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    };
    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  });
</script>

{#if mounted}
<canvas
  bind:this={canvas}
  class="fireflies-canvas"
  style="opacity:{opacity}"
  aria-hidden="true"
></canvas>
{/if}

<style>
.fireflies-canvas {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 2;
  transition: opacity 200ms linear;
}
</style>
