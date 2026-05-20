---
name: css-animations-master
description: Master modern CSS animations — keyframes, scroll-driven, view transitions, spring easing, and performance-safe motion design.
metadata:
  type: skill
  triggers:
    - CSS animation
    - keyframes
    - scroll-driven animation
    - animation-timeline
    - view transitions
    - @starting-style
    - CSS transition
    - cubic-bezier
    - will-change
    - prefers-reduced-motion
    - animate on scroll
    - enter animation
    - exit animation
    - motion design
    - CSS motion
---

# CSS Animations Master

Expert-level guidance for building fluid, accessible, performant CSS animations in modern web projects including Astro 5 + Svelte 5 design systems.

## Core Animation Primitives

### @keyframes + animation shorthand

```css
@keyframes slide-up {
  from {
    opacity: 0;
    translate: 0 1rem;
  }
  to {
    opacity: 1;
    translate: 0 0;
  }
}

.card {
  animation: slide-up 400ms cubic-bezier(0.16, 1, 0.3, 1) both;
}
```

**animation shorthand order:** `name duration easing delay iteration-count direction fill-mode play-state`

```css
animation: slide-up 400ms ease-out 100ms 1 normal both running;
```

### Orchestrating delays for staggered sequences

```css
.list-item {
  animation: fade-in 300ms ease-out both;
}
.list-item:nth-child(1) { animation-delay: 0ms; }
.list-item:nth-child(2) { animation-delay: 60ms; }
.list-item:nth-child(3) { animation-delay: 120ms; }

/* Dynamic stagger via custom property */
.list-item {
  animation-delay: calc(var(--index, 0) * 60ms);
}
```

## Custom Easing

### cubic-bezier

```css
/* Spring-like overshoot */
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);

/* Snappy ease-out */
--ease-snappy: cubic-bezier(0.16, 1, 0.3, 1);

/* Anticipation (ease-in with slight back) */
--ease-anticipate: cubic-bezier(0.36, 0, 0.66, -0.56);
```

### linear() — step easing and spring approximation

```css
/* Bounce */
--ease-bounce: linear(
  0, 0.063, 0.25, 0.563, 1 36.4%, 0.812, 0.75, 0.813, 1 72.7%,
  0.953, 0.938, 1
);

/* Spring (approximated) */
--ease-spring-smooth: linear(
  0, 0.009, 0.035 2.1%, 0.141 4.4%, 0.723 12.4%, 0.938, 1.077 20.4%,
  1.121, 1.149 24.4%, 1.128 27.5%, 1.017 40%, 0.991, 1
);
```

Use the [linear() generator](https://linear-easing-generator.netlify.app/) to create spring/bounce curves.

## @starting-style — Enter Animations Without JS

Animate elements when they first appear in the DOM or when `display: none` transitions to visible:

```css
/* Animate a popover entering */
[popover] {
  transition: opacity 300ms ease-out, translate 300ms ease-out;
  opacity: 1;
  translate: 0 0;

  @starting-style {
    opacity: 0;
    translate: 0 -0.5rem;
  }
}

/* Also works with display:none → block transitions */
.drawer {
  transition:
    opacity 250ms ease-out,
    translate 250ms cubic-bezier(0.16, 1, 0.3, 1),
    display 250ms allow-discrete;

  @starting-style {
    opacity: 0;
    translate: -100% 0;
  }
}
```

## Scroll-Driven Animations

### animation-timeline: scroll()

Links animation progress to scroll position of a scroll container.

```css
@keyframes progress-bar {
  from { scaleX: 0; }
  to   { scaleX: 1; }
}

.reading-progress {
  transform-origin: left;
  animation: progress-bar linear both;
  animation-timeline: scroll(root block);
}
```

`scroll(scroller axis)` — scroller: `root | nearest | self | <element>`, axis: `block | inline | x | y`

### animation-timeline: view()

Links animation to how far an element has entered/left the viewport.

```css
@keyframes reveal {
  entry 0%  { opacity: 0; translate: 0 2rem; }
  entry 100% { opacity: 1; translate: 0 0; }
}

.section {
  animation: reveal linear both;
  animation-timeline: view();
  animation-range: entry 0% entry 40%;
}
```

**animation-range values:**
- `entry 0% entry 100%` — while entering viewport
- `exit 0% exit 100%` — while exiting viewport
- `contain 0% contain 100%` — while fully visible
- `cover 0% cover 100%` — entire scroll passage

### Named timeline with scroll-timeline

```css
.scroll-container {
  overflow-y: scroll;
  scroll-timeline: --my-timeline block;
}

.animated-child {
  animation: fade-in linear both;
  animation-timeline: --my-timeline;
}
```

## View Transitions API

Animate between page states and DOM changes smoothly.

### Basic usage

```javascript
// Wrap DOM mutations
document.startViewTransition(() => {
  updateTheDOMSomehow();
});
```

### Naming elements for matched transitions

```css
.hero-image {
  view-transition-name: hero;
}

/* Customize the transition */
::view-transition-old(hero) {
  animation: 400ms ease-out both fade-out;
}
::view-transition-new(hero) {
  animation: 400ms ease-out both fade-in;
}
```

### With Astro 5 View Transitions

```astro
---
import { ViewTransitions } from 'astro:transitions';
---
<head>
  <ViewTransitions />
</head>
```

```astro
<!-- Persist an element across page transitions -->
<canvas transition:persist="webgl-canvas" />

<!-- Named transition for matched animation -->
<img transition:name="hero-image" src={post.hero} />
```

Custom animation in Astro:

```astro
<div transition:animate="custom-slide">
```

```css
@keyframes custom-slide-in {
  from { translate: 100% 0; opacity: 0; }
}
@keyframes custom-slide-out {
  to { translate: -100% 0; opacity: 0; }
}

[data-astro-transition-scope] {
  animation: custom-slide-in 350ms cubic-bezier(0.16, 1, 0.3, 1) both;
}
[data-astro-transition-scope][data-astro-transition="back"] {
  animation: custom-slide-out 350ms cubic-bezier(0.16, 1, 0.3, 1) both;
}
```

## CSS Custom Properties as Animation Variables

Drive animations with tokens for consistent, themeable motion:

```css
:root {
  --duration-fast:   150ms;
  --duration-base:   250ms;
  --duration-slow:   400ms;
  --duration-slower: 700ms;

  --ease-default:   cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in:        cubic-bezier(0.55, 0, 1, 0.45);
  --ease-out:       cubic-bezier(0, 0.55, 0.45, 1);
  --ease-spring:    cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-bounce:    linear(0, 0.063, 0.25, 0.563, 1 36.4%, 0.812, 0.75, 0.813, 1 72.7%, 0.953, 0.938, 1);
}

.button {
  transition:
    background-color var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-spring);
}
```

Animate custom properties themselves (requires `@property` registration):

```css
@property --gradient-angle {
  syntax: '<angle>';
  inherits: false;
  initial-value: 0deg;
}

@keyframes spin-gradient {
  to { --gradient-angle: 360deg; }
}

.shimmer {
  background: conic-gradient(from var(--gradient-angle), #f0f, #0ff, #f0f);
  animation: spin-gradient 3s linear infinite;
}
```

## Performance — The Golden Rules

### Compositor-only properties (zero layout/paint cost)

Safe to animate freely:
- `transform` (translate, scale, rotate, skew)
- `opacity`
- `filter` (partial — blur is expensive)
- `backdrop-filter` (expensive, use sparingly)

**Never animate:** `width`, `height`, `top`, `left`, `margin`, `padding`, `border`, `font-size`

Use logical transform functions (CSS 2023):

```css
/* Preferred over transform: translateY() */
translate: 0 1rem;
scale: 0.95;
rotate: 45deg;
```

### will-change — use sparingly

```css
/* Only when you KNOW the element will animate imminently */
.modal {
  will-change: transform, opacity;
}

/* Remove after animation completes */
.modal.is-open {
  will-change: auto;
}
```

Do NOT apply `will-change` to everything — it forces GPU layer creation and increases memory pressure.

### contain for animation isolation

```css
.animated-list {
  contain: layout style;
}
```

## Accessibility — prefers-reduced-motion

Always wrap motion in a media query:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Or use the progressive enhancement approach — opt IN to motion:

```css
/* Default: no motion */
.card {
  opacity: 1;
  translate: 0 0;
}

/* Opt-in to motion */
@media (prefers-reduced-motion: no-preference) {
  .card {
    animation: slide-up 400ms var(--ease-default) both;
  }
}
```

For scroll-driven animations specifically:

```css
@media (prefers-reduced-motion: no-preference) {
  .section {
    animation: reveal linear both;
    animation-timeline: view();
    animation-range: entry 0% entry 40%;
  }
}
```

## Motion Design Principles

### Duration guidelines

| Interaction | Duration |
|---|---|
| Micro (tooltip, hover state) | 100–150ms |
| Small (button press, checkbox) | 150–200ms |
| Medium (modal open, panel slide) | 250–350ms |
| Large (page transition, hero) | 350–500ms |
| Ambient (background loop) | 2000ms+ |

### Easing rules

- **Entering** elements: ease-out (fast start, decelerate into position)
- **Exiting** elements: ease-in (accelerate out of view)
- **Both** (reposition): ease-in-out
- **Springy** interactions: overshoot cubic-bezier or `linear()` spring

### Delay orchestration

- Stagger related items: 40–80ms between siblings
- Never exceed 500ms total stagger span (feels broken)
- Entrance delays feel natural; exit delays feel sluggish (avoid)

## Practical Patterns

### Hover lift card

```css
.card {
  transition:
    box-shadow var(--duration-base) var(--ease-out),
    translate var(--duration-base) var(--ease-spring);

  @media (prefers-reduced-motion: no-preference) {
    &:hover {
      translate: 0 -4px;
      box-shadow: 0 12px 40px hsl(0 0% 0% / 0.15);
    }
  }
}
```

### Skeleton shimmer loading

```css
@keyframes shimmer {
  from { background-position: -200% center; }
  to   { background-position:  200% center; }
}

.skeleton {
  background: linear-gradient(
    90deg,
    hsl(0 0% 90%) 25%,
    hsl(0 0% 97%) 50%,
    hsl(0 0% 90%) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s linear infinite;
}
```

### Typewriter text reveal

```css
@keyframes typewriter {
  from { clip-path: inset(0 100% 0 0); }
  to   { clip-path: inset(0 0% 0 0); }
}

.typewriter {
  animation: typewriter 2s steps(40) both;
}
```

### Scroll-reveal fade-up (no JS)

```css
@media (prefers-reduced-motion: no-preference) {
  @keyframes fade-up {
    from {
      opacity: 0;
      translate: 0 2rem;
    }
  }

  [data-animate] {
    animation: fade-up 600ms var(--ease-default) both;
    animation-timeline: view();
    animation-range: entry 0% entry 35%;
  }
}
```

## Svelte 5 Integration

Use CSS animations alongside Svelte transitions. For purely CSS-driven animations, avoid Svelte's `transition:` on the same element to prevent conflicts.

```svelte
<script>
  let { visible = $bindable(false) } = $props();
</script>

<!-- Let CSS handle the animation via @starting-style -->
{#if visible}
  <div class="modal">
    <slot />
  </div>
{/if}

<style>
  .modal {
    transition: opacity 300ms ease-out, translate 300ms var(--ease-spring);

    @starting-style {
      opacity: 0;
      translate: 0 -1rem;
    }
  }
</style>
```
