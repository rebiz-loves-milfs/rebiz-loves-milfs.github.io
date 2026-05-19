<script>
  import { onMount } from 'svelte';

  onMount(() => {
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9979;';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let W = 0, H = 0;
    let raf;
    let particles = [];
    let lastX = 0, lastY = 0, lastT = 0;

    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    function getHue() {
      return parseInt(getComputedStyle(document.documentElement).getPropertyValue('--hue')) || 30;
    }

    const onMove = (e) => {
      const x = e.clientX, y = e.clientY, now = performance.now();
      const dt = Math.max(1, now - lastT);
      const vx = (x - lastX) / dt, vy = (y - lastY) / dt;
      const speed = Math.hypot(vx, vy);
      lastX = x; lastY = y; lastT = now;

      if (speed < 0.35) return;

      const count = speed > 1.5 ? 3 : 1;
      const h = getHue();
      for (let i = 0; i < count; i++) {
        const r = 2.5 + Math.random() * (speed > 1.5 ? 4 : 2);
        particles.push({
          x: x + (Math.random() - 0.5) * 6,
          y: y + (Math.random() - 0.5) * 6,
          r,
          life: 1,
          decay: 0.055 + Math.random() * 0.04,
          dx: (Math.random() - 0.5) * speed * 0.6,
          dy: (Math.random() - 0.5) * speed * 0.6 - 0.4,
          hue: h + (Math.random() - 0.5) * 40,
          splat: speed > 2.0 && Math.random() < 0.3,
        });
      }
    };

    window.addEventListener('mousemove', onMove, { passive: true });

    function draw() {
      ctx.clearRect(0, 0, W, H);
      particles = particles.filter(p => {
        p.life -= p.decay;
        if (p.life <= 0) return false;
        p.x += p.dx * 0.5;
        p.y += p.dy * 0.5;
        p.dy += 0.04;
        const alpha = p.life * (p.splat ? 0.55 : 0.45);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue},80%,65%,${alpha})`;
        ctx.fill();
        if (p.splat && p.life > 0.5) {
          // tiny satellite drops
          for (let i = 0; i < 3; i++) {
            const ang = (i / 3) * Math.PI * 2 + p.life * 5;
            const dist = p.r * (2 - p.life) * 2;
            ctx.beginPath();
            ctx.arc(p.x + Math.cos(ang) * dist, p.y + Math.sin(ang) * dist, p.r * 0.3 * p.life, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${p.hue},70%,70%,${alpha * 0.6})`;
            ctx.fill();
          }
        }
        return true;
      });
      raf = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      canvas.remove();
    };
  });
</script>
