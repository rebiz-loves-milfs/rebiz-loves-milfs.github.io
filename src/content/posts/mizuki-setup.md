---
title: "Setting up Mizuki for the first time"
description: "A guide for past-me. Install pnpm, edit src/config.ts, hit the hue picker until you like the colour, deploy on Cloudflare."
published: 2026-01-22
category: "Frontend"
tags: ["astro", "mizuki"]
readTime: "8 min"
image: "/assets/posts/mizuki-setup.jpg"
gradient: "linear-gradient(135deg, oklch(0.85 0.08 60), oklch(0.78 0.10 30))"
glyph: "⌘"
---

## Prerequisites

You need Node 18+, pnpm, and a basic understanding of Astro.

```bash
pnpm create astro@latest
cd my-blog
pnpm add @astrojs/svelte svelte
```

## Config

Edit `src/config.ts` first. Set your name, bio, Last.fm username, Discord user ID, and AniList username.

```typescript
export const siteConfig = {
  title: 'Your Blog',
  author: 'Your Name',
};
```

## Theme hue

The hue picker in the navbar lets visitors retint the whole site. The default is `30` (warm amber).

## Deployment

Cloudflare Pages works out of the box. Set the build command to `astro build` and output directory to `dist`.
