<script>
  import { onMount } from 'svelte';

  /** @type {'light' | 'medium' | 'heavy'} */
  export let intensity = 'medium';

  const DROP_COUNT = { light: 40, medium: 80, heavy: 150 };

  let canvasOpacity = 0;
  let canvasEl = null;

  export function fadeIn(duration = 3000) {
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      canvasOpacity = t * t * (3 - 2 * t);
      if (canvasEl) canvasEl.style.opacity = canvasOpacity;
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  export function fadeOut(duration = 2000) {
    return new Promise(resolve => {
      const startOp = canvasOpacity;
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - start) / duration);
        canvasOpacity = startOp * (1 - t * t * (3 - 2 * t));
        if (canvasEl) canvasEl.style.opacity = canvasOpacity;
        if (t < 1) requestAnimationFrame(tick);
        else resolve();
      };
      requestAnimationFrame(tick);
    });
  }

  onMount(() => {
    // Respect prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const canvas = document.createElement('canvas');
    canvas.style.cssText =
      'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:2;opacity:0;transition:opacity 200ms linear;';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(canvas);
    canvasEl = canvas;

    const ctx = canvas.getContext('2d');
    let W = 0, H = 0;
    let raf;
    const count = DROP_COUNT[intensity] ?? 80;

    function getHue() {
      return parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue('--hue').trim()
      ) || 30;
    }

    function isDark() {
      return document.documentElement.classList.contains('dark');
    }

    /** @type {Array<{x:number, y:number, speed:number, length:number, opacity:number}>} */
    let drops = [];

    function makeDropAt(x, y) {
      const speed  = 2 + Math.random() * 4;           // 2–6 px/frame
      const length = 15 + Math.random() * 20;          // 15–35 px
      const opacity = 0.15 + Math.random() * 0.40;     // 0.15–0.55
      return { x, y, speed, length, opacity };
    }

    function initDrops() {
      drops = Array.from({ length: count }, () =>
        makeDropAt(Math.random() * W, Math.random() * H)
      );
    }

    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
      initDrops();
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    // Angle: ~15° lean (tan 15° ≈ 0.268)
    const ANGLE_X = Math.tan((15 * Math.PI) / 180);

    function draw() {
      ctx.clearRect(0, 0, W, H);

      const hue     = getHue();
      const dark    = isDark();
      // In dark mode, rain is more prominent; in light mode, subtle
      const baseLightness = dark ? 0.80 : 0.55;
      const baseChroma    = dark ? 0.18 : 0.08;

      for (let i = 0; i < drops.length; i++) {
        const d = drops[i];

        // Move drop
        d.y += d.speed;
        d.x += d.speed * ANGLE_X;

        // Reset when off-screen bottom (or far right)
        if (d.y - d.length > H || d.x > W + 40) {
          drops[i] = makeDropAt(Math.random() * W * 1.1, -d.length - Math.random() * H * 0.3);
          continue;
        }

        // Draw diagonal line
        const visibleOpacity = dark ? d.opacity : d.opacity * 0.5;
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - d.length * ANGLE_X, d.y - d.length);
        ctx.strokeStyle = `oklch(${baseLightness} ${baseChroma} ${hue} / ${visibleOpacity})`;
        ctx.lineWidth   = 0.8 + Math.random() * 0.4;
        ctx.stroke();
      }

      raf = requestAnimationFrame(draw);
    }
    draw();

    function onAfterSwap() {
      // Re-read hue after navigation; drops continue naturally
    }
    document.addEventListener('astro:after-swap', onAfterSwap);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      document.removeEventListener('astro:after-swap', onAfterSwap);
      canvas.remove();
    };
  });
</script>
