# Mizuki Design System

A personal blog built with Astro 5 and Svelte 5.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Astro 5](https://astro.build) |
| Components | [Svelte 5](https://svelte.dev) |
| Deployment | [Netlify](https://netlify.com) |
| Styling | CSS custom properties (design tokens) |

## Local Setup

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `LASTFM_API_KEY` | Yes | Last.fm API key for the music widget |
| `SIMKL_ACCESS_TOKEN` | No | SIMKL token for anime/movie tracking (run `node scripts/simkl-auth.mjs` to get one) |

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

## Deployment

The site deploys automatically to Netlify on push to `main`. Build settings are in `netlify.toml`.

For GitHub Pages deployment, update the `site` field in `astro.config.mjs` to match your repository URL.
