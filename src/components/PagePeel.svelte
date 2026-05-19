<script>
  import { onMount } from 'svelte';

  const CHARS = '0123456789ABCDEF日ﾊﾋﾌﾍﾎｦｧｨｩｪｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ<>{}[]|/\\;:';
  const FS = 13;
  const CORNERS = ['br', 'bl', 'tr', 'tl'];

  // Per-corner: CSS position + parent transform
  const CORNER_POS = {
    br: 'bottom:0;right:0;',
    bl: 'bottom:0;left:0;',
    tr: 'top:0;right:0;',
    tl: 'top:0;left:0;',
  };
  // Transform applied to peel-wrap to flip the triangle for each corner
  const CORNER_XFORM = {
    br: '',
    bl: 'scaleX(-1)',
    tr: 'scaleY(-1)',
    tl: 'scaleX(-1) scaleY(-1)',
  };
  // Counter-transform for the label so text stays readable
  const LABEL_XFORM = {
    br: '',
    bl: 'scaleX(-1)',
    tr: 'scaleY(-1)',
    tl: 'scaleX(-1) scaleY(-1)',
  };

  let canvas, ctx;
  let peelSize = 20;
  let peeling = false;
  let corner = 'br';
  let drops = [];
  let mRaf, pRaf, scheduleTid, repairTid;

  function initMatrix(W, H) {
    if (!ctx) return;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);
    const cols = Math.ceil(W / FS);
    drops = Array.from({ length: cols }, () => -Math.floor(Math.random() * 20));
  }

  function drawMatrix(W, H) {
    if (!ctx) return;
    ctx.fillStyle = 'rgba(0,0,0,0.055)';
    ctx.fillRect(0, 0, W, H);
    ctx.font = `bold ${FS}px monospace`;
    for (let i = 0; i < drops.length; i++) {
      const bright = Math.random() > 0.93;
      ctx.fillStyle = bright ? '#ccffcc' : `hsl(120,100%,${28 + Math.random() * 22}%)`;
      const ch = CHARS[Math.floor(Math.random() * CHARS.length)];
      const y = drops[i] * FS;
      if (y > 0) ctx.fillText(ch, i * FS, y);
      if (y > H && Math.random() > 0.97) drops[i] = 0;
      drops[i]++;
    }
    mRaf = requestAnimationFrame(() => drawMatrix(W, H));
  }

  function animPeel(target, onDone) {
    const from = peelSize;
    const t0 = performance.now();
    const dur = Math.max(300, Math.abs(target - from) * 2.5);
    cancelAnimationFrame(pRaf);
    function step(t) {
      const k = Math.min(1, (t - t0) / dur);
      const e = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;
      peelSize = from + (target - from) * e;
      if (k < 1) pRaf = requestAnimationFrame(step);
      else { peelSize = target; onDone?.(); }
    }
    pRaf = requestAnimationFrame(step);
  }

  function triggerPeel(c) {
    if (peeling) return;
    corner = c ?? CORNERS[Math.floor(Math.random() * CORNERS.length)];
    peeling = true;
    window.__nx7_peelActive = true;
    window.__nx7_peelCorner = corner;
    const S = Math.min(window.innerWidth, window.innerHeight) * 0.30;
    if (canvas) {
      canvas.width = Math.round(S);
      canvas.height = Math.round(S);
      initMatrix(canvas.width, canvas.height);
    }
    cancelAnimationFrame(mRaf);
    drawMatrix(canvas?.width ?? 200, canvas?.height ?? 200);
    animPeel(S, () => {
      window.dispatchEvent(new CustomEvent('nx7-peel-start', { detail: { corner } }));
      repairTid = setTimeout(repairPeel, 7000);
    });
  }

  function repairPeel() {
    clearTimeout(repairTid);
    cancelAnimationFrame(mRaf);
    animPeel(20, () => {
      peeling = false;
      window.__nx7_peelActive = false;
      window.__nx7_peelCorner = null;
      if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
      window.dispatchEvent(new CustomEvent('nx7-peel-end'));
    });
  }

  onMount(() => {
    ctx = canvas?.getContext('2d');
    window.__nx7_triggerPeel = triggerPeel;
    window.__nx7_repairPeel = repairPeel;

    function scheduleNext() {
      const delay = 50000 + Math.random() * 80000;
      scheduleTid = setTimeout(() => { triggerPeel(); scheduleNext(); }, delay);
    }
    scheduleNext();

    return () => {
      clearTimeout(scheduleTid);
      clearTimeout(repairTid);
      cancelAnimationFrame(mRaf);
      cancelAnimationFrame(pRaf);
      delete window.__nx7_triggerPeel;
      delete window.__nx7_repairPeel;
      delete window.__nx7_peelActive;
      delete window.__nx7_peelCorner;
    };
  });

  $: wrapStyle = `width:${peelSize}px;height:${peelSize}px;${CORNER_POS[corner]}transform:${CORNER_XFORM[corner]};transform-origin:${
    corner === 'br' ? 'bottom right' :
    corner === 'bl' ? 'bottom left' :
    corner === 'tr' ? 'top right' : 'top left'
  };`;
</script>

<!-- Hover trigger zones at all 4 corners -->
{#each CORNERS as c}
  <div
    class="peel-trigger"
    style={CORNER_POS[c]}
    role="presentation"
    on:mouseenter={() => { if (!peeling) triggerPeel(c); }}
  ></div>
{/each}

<!-- The visual peel -->
<div class="peel-wrap" style={wrapStyle}>
  <div class="peel-matrix">
    <canvas bind:this={canvas} style="width:{peelSize}px;height:{peelSize}px"></canvas>
  </div>
  <div class="peel-fold"></div>
  <svg class="peel-crease" viewBox="0 0 100 100" preserveAspectRatio="none">
    <line x1="100" y1="0" x2="0" y2="100" stroke="rgba(0,0,0,0.18)" stroke-width="1.5"/>
  </svg>
  {#if peelSize > 100}
    <div class="peel-label" style="transform:{LABEL_XFORM[corner]}">REALITY.EXE</div>
  {/if}
</div>

<style>
  .peel-trigger {
    position: fixed;
    width: 48px; height: 48px;
    z-index: 181;
    cursor: pointer;
    pointer-events: auto;
  }

  .peel-wrap {
    position: fixed;
    z-index: 180;
    pointer-events: none;
    min-width: 20px; min-height: 20px;
  }

  .peel-matrix {
    position: absolute; inset: 0;
    clip-path: polygon(100% 0%, 100% 100%, 0% 100%);
    background: #000;
    overflow: hidden;
  }
  .peel-matrix canvas { display: block; }

  .peel-fold {
    position: absolute; inset: 0;
    clip-path: polygon(0% 0%, 100% 0%, 0% 100%);
    background: linear-gradient(135deg,
      oklch(0.96 0.005 30) 0%,
      oklch(0.90 0.008 30) 55%,
      oklch(0.80 0.010 30) 100%
    );
    filter: drop-shadow(3px 3px 6px rgba(0,0,0,0.30));
  }

  .peel-crease {
    position: absolute; inset: 0;
    width: 100%; height: 100%;
    pointer-events: none;
    overflow: visible;
  }

  .peel-label {
    position: absolute;
    bottom: 12px; right: 12px;
    font-family: monospace; font-size: 9px; font-weight: 700;
    color: #00ff41;
    letter-spacing: 0.08em;
    text-shadow: 0 0 8px #00ff41;
    pointer-events: none;
    opacity: 0.85;
    animation: peel-flicker 0.8s steps(2) infinite;
    transform-origin: bottom right;
  }

  @keyframes peel-flicker {
    0%, 100% { opacity: 0.85; }
    50%       { opacity: 0.45; }
  }
</style>
