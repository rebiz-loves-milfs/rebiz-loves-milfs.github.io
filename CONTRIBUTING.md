# Contributing

## Adding Posts

Create a new `.md` or `.mdx` file in `src/content/posts/` with frontmatter:

```yaml
---
title: My Post Title
description: A short description
published: 2026-01-01
category: General
tags: [astro, svelte]
---
```

## Running Locally

```bash
npm install
cp .env.example .env  # fill in your API keys
npm run dev
```

## Opening PRs

- Run `npm run build` to ensure no build errors
- Run `npm run typecheck` for TypeScript errors
- Keep files under 500 lines per project rules
- Don't commit `.env` or secrets
