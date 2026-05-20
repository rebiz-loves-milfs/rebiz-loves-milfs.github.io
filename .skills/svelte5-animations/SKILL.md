---
name: svelte5-animations
description: Svelte 5 animations — built-in transitions, spring/tweened motion, FLIP, GSAP integration, and Astro View Transitions coordination.
metadata:
  type: skill
  triggers:
    - Svelte animation
    - Svelte transition
    - transition:fade
    - transition:fly
    - transition:slide
    - transition:scale
    - transition:blur
    - transition:draw
    - animate:flip
    - FLIP animation
    - spring store
    - tweened store
    - $motion rune
    - GSAP Svelte
    - Svelte GSAP
    - Astro View Transitions Svelte
    - transition:persist
    - custom transition
    - in: out:
    - Svelte motion
---

# Svelte 5 Animations

Comprehensive guide to animation in Svelte 5 — from built-in directives to custom transitions, physics-based motion, and GSAP integration in Astro 5 projects.

## Built-in Transition Directives

### transition: (bidirectional)

Applies the same animation when the element enters and leaves the DOM.

```svelte
<script>
  import { fade, fly, slide, scale, blur, draw } from 'svelte/transition';
  let { visible = $bindable(false) } = $props();
</script>

{#if visible}
  <div transition:fade={{ duration: 300 }}>Hello</div>
{/if}
```

### in: and out: (independent)

Use different animations for enter and exit:

```svelte
{#if visible}
  <div
    in:fly={{ y: 20, duration: 300, easing: cubicOut }}
    out:fade={{ duration: 200 }}
  >
    Content
  </div>
{/if}
```

### Transition parameters

```svelte
<script>
  import { fly, fade, slide, scale, blur, draw } from 'svelte/transition';
  import { cubicOut, elasticOut, backOut } from 'svelte/easing';
</script>

<!-- fly: move + fade -->
<div transition:fly={{ x: 0, y: -20, duration: 400, easing: cubicOut, delay: 100 }} />

<!-- slide: height collapse -->
<div transition:slide={{ duration: 300, axis: 'y' }} />

<!-- scale: grow/shrink -->
<div transition:scale={{ start: 0.9, opacity: 0, duration: 250 }} />

<!-- blur -->
<div transition:blur={{ amount: 8, duration: 300 }} />

<!-- draw: SVG path drawing -->
<path transition:draw={{ duration: 1000, delay: 0, speed: 0.5 }} d="..." />
```

## Custom Transition Functions

### CSS-mode transition (most performant)

Return CSS string — Svelte generates keyframes and uses compositor thread:

```typescript
// src/lib/transitions.ts
import type { TransitionConfig } from 'svelte/transition';

export function slideUp(node: Element, params: { duration?: number; delay?: number } = {}): TransitionConfig {
  const { duration = 300, delay = 0 } = params;
  return {
    delay,
    duration,
    css: (t, u) => `
      opacity: ${t};
      transform: translateY(${u * 16}px);
    `,
  };
}

export function popIn(node: Element, params: { duration?: number } = {}): TransitionConfig {
  const { duration = 400 } = params;
  return {
    duration,
    css: (t) => {
      const scale = 0.8 + 0.2 * t;
      const opacity = t;
      return `transform: scale(${scale}); opacity: ${opacity};`;
    },
  };
}
```

### JS-mode transition (for complex per-frame logic)

```typescript
export function typewriter(node: Element, params: { speed?: number } = {}): TransitionConfig {
  const text = node.textContent ?? '';
  const duration = text.length * (params.speed ?? 30);

  return {
    duration,
    tick: (t) => {
      const i = Math.trunc(text.length * t);
      node.textContent = text.slice(0, i);
    },
  };
}
```

### Transition events

```svelte
<div
  transition:fly={{ y: 20 }}
  on:introstart={() => console.log('entering')}
  on:introend={() => console.log('entered')}
  on:outrostart={() => console.log('leaving')}
  on:outroend={() => console.log('left')}
>
```

## Spring and Tweened Stores

### Tweened — linear interpolation with easing

```svelte
<script>
  import { tweened } from 'svelte/motion';
  import { cubicOut, elasticOut } from 'svelte/easing';

  const progress = tweened(0, { duration: 600, easing: cubicOut });
  const x = tweened(0, { duration: 400, easing: elasticOut });

  function animate() {
    progress.set(1);
    x.set(200);
  }

  // Interrupt mid-animation — set() returns a Promise
  async function snap() {
    await progress.set(0.5, { duration: 100 }); // override options
    await progress.set(1, { duration: 600 });
  }
</script>

<div style="width: {$progress * 100}%; transform: translateX({$x}px)" />
<button onclick={animate}>Animate</button>
```

### Spring — physics-based (no fixed duration)

```svelte
<script>
  import { spring } from 'svelte/motion';

  // stiffness: 0-1 (higher = snappier)
  // damping: 0-1 (higher = less bounce)
  const pos = spring({ x: 0, y: 0 }, { stiffness: 0.1, damping: 0.5 });

  function handleMouseMove(e: MouseEvent) {
    pos.set({ x: e.clientX, y: e.clientY });
  }
</script>

<svelte:window on:mousemove={handleMouseMove} />
<div style="transform: translate({$pos.x}px, {$pos.y}px)" class="cursor" />
```

### Spring chaining for follow effects

```svelte
<script>
  import { spring } from 'svelte/motion';

  const leader  = spring({ x: 0, y: 0 }, { stiffness: 0.3, damping: 0.6 });
  const follower = spring({ x: 0, y: 0 }, { stiffness: 0.1, damping: 0.7 });

  // follower tracks leader's value
  $effect(() => {
    follower.set($leader);
  });
</script>
```

## $motion Rune (Svelte 5)

Svelte 5 introduces `$motion` for reactive motion values using rune syntax:

```svelte
<script>
  // Note: $motion API is in preview — check current Svelte 5 docs
  // Pattern using $state + spring equivalent:
  let targetX = $state(0);
  let targetY = $state(0);

  import { spring } from 'svelte/motion';
  const smoothX = spring(0, { stiffness: 0.2, damping: 0.8 });
  const smoothY = spring(0, { stiffness: 0.2, damping: 0.8 });

  $effect(() => {
    smoothX.set(targetX);
    smoothY.set(targetY);
  });
</script>

<div
  onpointermove={(e) => { targetX = e.clientX; targetY = e.clientY; }}
  style="cursor-position: {$smoothX}px {$smoothY}px"
/>
```

## FLIP Animations with animate:flip

FLIP (First, Last, Invert, Play) animates elements that reorder in a keyed `{#each}` block:

```svelte
<script>
  import { flip } from 'svelte/animate';
  import { fade } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';

  let items = $state(['Alpha', 'Beta', 'Gamma', 'Delta']);

  function shuffle() {
    items = [...items].sort(() => Math.random() - 0.5);
  }
</script>

<button onclick={shuffle}>Shuffle</button>

<ul>
  {#each items as item (item)}
    <li
      animate:flip={{ duration: 400, easing: cubicOut }}
      transition:fade={{ duration: 200 }}
    >
      {item}
    </li>
  {/each}
</ul>
```

**Rules for FLIP to work:**
- The `{#each}` must have a key: `(item)` or `(item.id)`
- `animate:` only works on direct children of keyed each blocks
- Combine with `in:`/`out:` for add/remove animations

### Custom FLIP-like with spring

```svelte
<script>
  import { spring } from 'svelte/motion';

  // Track element bounds for manual FLIP
  let el: HTMLElement;
  let pos = spring({ x: 0, y: 0 }, { stiffness: 0.2, damping: 0.7 });

  function moveElement(newX: number, newY: number) {
    const rect = el.getBoundingClientRect();
    // Invert: start from current position
    pos.set({ x: rect.x - newX, y: rect.y - newY }, { hard: true });
    // Play: animate to 0,0 (target position)
    pos.set({ x: 0, y: 0 });
  }
</script>

<div bind:this={el} style="transform: translate({$pos.x}px, {$pos.y}px)" />
```

## Cross-Component Animation Coordination

### Shared store for animation state

```typescript
// src/lib/stores/animation.svelte.ts
export const animationState = (() => {
  let phase = $state<'idle' | 'enter' | 'exit'>('idle');
  let activeId = $state<string | null>(null);

  return {
    get phase() { return phase; },
    get activeId() { return activeId; },
    start(id: string) {
      activeId = id;
      phase = 'enter';
    },
    end() {
      phase = 'idle';
      activeId = null;
    },
  };
})();
```

### Stagger children with Svelte

```svelte
<!-- Parent orchestrates children via context -->
<script>
  import { setContext } from 'svelte';
  import { writable } from 'svelte/store';

  let visible = $state(false);
  const staggerIndex = writable(0);
  setContext('stagger', staggerIndex);
</script>

<!-- Child reads its index and computes delay -->
<script>
  import { getContext } from 'svelte';
  import { fly } from 'svelte/transition';

  const { index = 0 } = $props();
  const staggerIndex = getContext('stagger');
  const delay = index * 60;
</script>

{#if visible}
  <div in:fly={{ y: 16, delay, duration: 300 }}>
    <slot />
  </div>
{/if}
```

## GSAP Integration with Svelte 5

### Basic GSAP in onMount

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { gsap } from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';

  gsap.registerPlugin(ScrollTrigger);

  let container: HTMLElement;

  onMount(() => {
    const ctx = gsap.context(() => {
      // All animations are scoped to container
      gsap.from('.card', {
        y: 40,
        opacity: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: 'power3.out',
      });

      ScrollTrigger.create({
        trigger: container,
        start: 'top 80%',
        onEnter: () => gsap.to('.card', { scale: 1, duration: 0.4 }),
      });
    }, container);

    // ctx.revert() cleans up all animations scoped to container
    return () => ctx.revert();
  });
</script>

<div bind:this={container}>
  <div class="card">...</div>
  <div class="card">...</div>
</div>
```

### GSAP timeline in reactive $effect

```svelte
<script>
  import { gsap } from 'gsap';

  let { open = $bindable(false) } = $props();
  let panel: HTMLElement;
  let tl: gsap.core.Timeline;

  $effect(() => {
    if (!panel) return;

    tl?.kill();
    tl = gsap.timeline();

    if (open) {
      tl.fromTo(panel,
        { height: 0, opacity: 0 },
        { height: 'auto', opacity: 1, duration: 0.35, ease: 'power2.out' }
      );
    } else {
      tl.to(panel, { height: 0, opacity: 0, duration: 0.25, ease: 'power2.in' });
    }

    return () => tl?.kill();
  });
</script>

<div bind:this={panel} style="overflow: hidden">
  <slot />
</div>
```

### GSAP with prefers-reduced-motion

```typescript
import { gsap } from 'gsap';

// Respect reduced motion globally
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  gsap.globalTimeline.timeScale(100); // instant
}
```

## Astro View Transitions + Svelte

### Basic setup

```astro
---
// src/layouts/Layout.astro
import { ViewTransitions } from 'astro:transitions';
---
<head>
  <ViewTransitions />
</head>
```

### Persist Svelte components across page transitions

```astro
<!-- Svelte component that survives navigation -->
<AudioPlayer client:only="svelte" transition:persist="audio-player" />
<ThemeProvider client:load transition:persist="theme" />
```

The component's state is preserved — `onMount` does NOT re-run on subsequent navigations.

### Named transitions for matched animations

```astro
<!-- Page A -->
<img src={post.hero} transition:name={`hero-${post.slug}`} />
<h1 transition:name={`title-${post.slug}`}>{post.title}</h1>
```

```astro
<!-- Page B (post detail) -->
<img src={post.hero} transition:name={`hero-${post.slug}`} />
<h1 transition:name={`title-${post.slug}`}>{post.title}</h1>
```

Astro automatically creates a matched FLIP animation between matching names.

### Custom Astro transition animation

```astro
---
import { fade } from 'astro:transitions';
const anim = {
  old: { name: 'slide-out', duration: '350ms', easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fillMode: 'both' },
  new: { name: 'slide-in',  duration: '350ms', easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fillMode: 'both' },
};
---
<main transition:animate={anim}>
  <slot />
</main>

<style>
  @keyframes slide-in  { from { translate: 100% 0; opacity: 0; } }
  @keyframes slide-out { to   { translate: -100% 0; opacity: 0; } }
</style>
```

### Svelte lifecycle and page transitions

`astro:page-load` fires after each navigation (including the first). Use it instead of `DOMContentLoaded` for initializing Svelte store side-effects:

```svelte
<script>
  import { onMount } from 'svelte';

  onMount(() => {
    // onMount runs once on first render.
    // For re-init after Astro transitions, listen to astro:page-load:
    const handler = () => reinitialize();
    document.addEventListener('astro:page-load', handler);
    return () => document.removeEventListener('astro:page-load', handler);
  });
</script>
```

## Motion Preferences in Svelte

### Reactive media query store

```typescript
// src/lib/stores/motion.svelte.ts
const prefersReducedMotion = (() => {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  let reduced = $state(mq.matches);

  mq.addEventListener('change', (e) => { reduced = e.matches; });

  return {
    get reduced() { return reduced; },
  };
})();

export { prefersReducedMotion };
```

```svelte
<script>
  import { prefersReducedMotion } from '$lib/stores/motion.svelte';
  import { fly, fade } from 'svelte/transition';

  const transition = prefersReducedMotion.reduced
    ? (node: Element, params: object) => fade(node, { duration: 0 })
    : fly;
</script>

<div in:transition={{ y: 16, duration: 300 }}>...</div>
```

## Easing Reference

```typescript
import {
  // Polynomial
  linear, quadIn, quadOut, quadInOut,
  cubicIn, cubicOut, cubicInOut,
  quartIn, quartOut, quartInOut,
  quintIn, quintOut, quintInOut,

  // Special
  sineIn, sineOut, sineInOut,
  expoIn, expoOut, expoInOut,
  circIn, circOut, circInOut,
  backIn, backOut, backInOut,
  elasticIn, elasticOut, elasticInOut,
  bounceIn, bounceOut, bounceInOut,
} from 'svelte/easing';
```

**Recommendations by use case:**

| Use case | Easing |
|---|---|
| Enter (slide/fly in) | `cubicOut`, `backOut` |
| Exit (fade/slide out) | `cubicIn`, `quintIn` |
| Interactive (button press) | `cubicOut` |
| Springy/playful | `elasticOut`, `backOut` |
| List reorder (FLIP) | `cubicOut` |
| Progress bar | `linear` |
