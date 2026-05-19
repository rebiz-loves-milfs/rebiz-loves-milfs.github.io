<script>
  import { onMount, onDestroy } from 'svelte';
  import Rain from './Rain.svelte';
  import Fog from './Fog.svelte';
  import Fireflies from './Fireflies.svelte';

  // Minutes to seconds helpers
  const mins = (m) => m * 60 * 1000;

  // Duration each effect stays active (ms)
  const HOLD_MIN  = mins(3);
  const HOLD_MAX  = mins(8);
  // Gap between effects (ms)
  const GAP_MIN   = mins(2);
  const GAP_MAX   = mins(5);

  // Effect roster. Weight controls how often each appears.
  // 'silence' weight = implicit gap, no entry needed.
  const EFFECTS = [
    { id: 'rain',       weight: 3 },
    { id: 'fog',        weight: 2 },
    { id: 'fireflies',  weight: 2 },
    { id: 'silence',    weight: 1 }, // explicit silence slot (gap only, no component shown)
  ];

  // Weighted random pick, excluding lastId to avoid repeating
  function pick(lastId) {
    const pool = EFFECTS.filter(e => e.id !== lastId);
    const total = pool.reduce((s, e) => s + e.weight, 0);
    let r = Math.random() * total;
    for (const e of pool) { r -= e.weight; if (r <= 0) return e.id; }
    return pool[pool.length - 1].id;
  }

  function rand(min, max) { return min + Math.random() * (max - min); }

  let active = null;      // 'rain' | 'fog' | 'fireflies' | null
  let lastId = null;
  let timerId;
  let mounted = false;

  // Component refs
  let rainRef;
  let fogRef;
  let firefliesRef;

  async function startCycle() {
    const effectId = pick(lastId);
    lastId = effectId;

    if (effectId !== 'silence') {
      active = effectId;
      // Small delay to let Svelte render the component before calling fadeIn
      await new Promise(r => setTimeout(r, 80));
      if (effectId === 'rain')       rainRef?.fadeIn?.();
      if (effectId === 'fog')        fogRef?.fadeIn?.();
      if (effectId === 'fireflies')  firefliesRef?.fadeIn?.();
    }

    const hold = effectId === 'silence' ? 0 : rand(HOLD_MIN, HOLD_MAX);

    timerId = setTimeout(async () => {
      // Fade out current effect
      if (effectId === 'rain')       await rainRef?.fadeOut?.();
      if (effectId === 'fog')        await fogRef?.fadeOut?.();
      if (effectId === 'fireflies')  await firefliesRef?.fadeOut?.();
      active = null;

      // Gap before next
      timerId = setTimeout(startCycle, rand(GAP_MIN, GAP_MAX));
    }, hold);
  }

  onMount(() => {
    mounted = true;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // Small boot delay — let the page settle first
    timerId = setTimeout(startCycle, rand(mins(0.5), mins(1.5)));
  });

  onDestroy(() => {
    clearTimeout(timerId);
  });
</script>

{#if mounted}
  {#if active === 'rain'}
    <Rain bind:this={rainRef} intensity="light" />
  {/if}
  {#if active === 'fog'}
    <Fog bind:this={fogRef} />
  {/if}
  {#if active === 'fireflies'}
    <Fireflies bind:this={firefliesRef} />
  {/if}
{/if}
