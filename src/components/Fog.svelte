<script>
  import { onMount } from 'svelte';

  let opacity = 0;
  let mounted = false;

  export function fadeIn(duration = 4000) {
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      opacity = t * t * (3 - 2 * t); // smoothstep
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  export function fadeOut(duration = 3000) {
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

  onMount(() => { mounted = true; });
</script>

{#if mounted}
<div class="fog-root" style="opacity:{opacity}" aria-hidden="true">
  <div class="fog-layer fog-1"></div>
  <div class="fog-layer fog-2"></div>
  <div class="fog-layer fog-3"></div>
  <div class="fog-vignette"></div>
</div>
{/if}

<style>
.fog-root {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 2;
  transition: opacity 200ms linear;
}

.fog-layer {
  position: absolute;
  inset: -20% -50%;
  height: 140%;
  background: radial-gradient(
    ellipse 80% 60% at 50% 50%,
    oklch(0.96 0.015 var(--hue) / 0.55),
    transparent 70%
  );
  border-radius: 50%;
}

:global(.dark) .fog-layer {
  background: radial-gradient(
    ellipse 80% 60% at 50% 50%,
    oklch(0.22 0.018 var(--hue) / 0.60),
    transparent 70%
  );
}

.fog-1 {
  animation: fog-drift-1 42s ease-in-out infinite;
  opacity: 0.8;
  transform-origin: 30% 60%;
}
.fog-2 {
  animation: fog-drift-2 57s ease-in-out infinite reverse;
  opacity: 0.6;
  transform-origin: 70% 40%;
}
.fog-3 {
  animation: fog-drift-3 73s ease-in-out infinite;
  opacity: 0.45;
  transform-origin: 50% 80%;
}

.fog-vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse 100% 80% at 50% 100%,
    oklch(0.90 0.01 var(--hue) / 0.3) 0%,
    transparent 60%
  );
}

:global(.dark) .fog-vignette {
  background: radial-gradient(
    ellipse 100% 80% at 50% 100%,
    oklch(0.12 0.02 var(--hue) / 0.4) 0%,
    transparent 60%
  );
}

@keyframes fog-drift-1 {
  0%   { transform: translate(0%,    0%)   scale(1);    }
  33%  { transform: translate(8%,   -3%)   scale(1.04); }
  66%  { transform: translate(-5%,   4%)   scale(0.97); }
  100% { transform: translate(0%,    0%)   scale(1);    }
}
@keyframes fog-drift-2 {
  0%   { transform: translate(0%,    0%)   scale(1);    }
  40%  { transform: translate(-10%,  5%)   scale(1.05); }
  75%  { transform: translate(6%,   -2%)   scale(0.96); }
  100% { transform: translate(0%,    0%)   scale(1);    }
}
@keyframes fog-drift-3 {
  0%   { transform: translate(0%,    0%)   scale(1);    }
  50%  { transform: translate(4%,    6%)   scale(1.03); }
  100% { transform: translate(0%,    0%)   scale(1);    }
}

@media (prefers-reduced-motion: reduce) {
  .fog-layer { animation: none !important; }
}
</style>
