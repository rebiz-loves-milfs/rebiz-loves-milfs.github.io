---
title: "Notes on living in"
titleTinted: "oklch"
description: "Why a single --hue variable beats a five-step palette every time. Some examples from rebuilding my blog this winter."
published: 2026-03-30
category: "Frontend"
tags: ["css", "oklch"]
readTime: "7 min"
image: "/assets/posts/oklch-notes.jpg"
gradient: "linear-gradient(135deg, oklch(0.78 0.12 280), oklch(0.78 0.12 200))"
glyph: "◇"
---

## Why oklch?

The oklch color space is perceptually uniform — which means changing lightness or chroma doesn't shift the perceived hue in unexpected ways.

```css
:root {
  --hue: 30;
  --primary: oklch(0.7 0.14 var(--hue));
}
```

## The single-hue pattern

Instead of maintaining a palette of five specific colors, Mizuki derives everything from one number. You can retint the entire site at runtime without touching a single color declaration.

## Perceptual uniformity

In HSL, `hsl(200, 80%, 50%)` and `hsl(50, 80%, 50%)` have very different perceived brightness. In oklch, `oklch(0.70 0.14 200)` and `oklch(0.70 0.14 50)` are genuinely the same lightness.

## Closing thoughts

Switch everything to oklch. You won't regret it.
