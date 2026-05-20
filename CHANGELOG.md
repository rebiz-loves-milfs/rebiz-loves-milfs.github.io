# Changelog

## [Unreleased]

### Changed
- Moved Last.fm API key from hardcoded value to `LASTFM_API_KEY` env var
- Fixed placeholder `site: 'https://example.com'` in `astro.config.mjs`
- Switched 6 `client:only` components to `client:idle` for lazy loading
- Changed sidebar widgets from `client:load` to `client:visible`
- Replaced mobile nav `<button>` elements with `<a>` tags for SEO
- Added HSTS and Permissions-Policy security headers in `netlify.toml`
- Removed broken admin-role catch-all redirect from `netlify.toml`
- Added font preload for ZenMaruGothic-Medium
- Fixed hero image CLS with explicit width/height attributes

### Added
- `.env.example` template file
- `@astrojs/sitemap` integration replacing custom `sitemap.xml.ts`
- `astro-compress` for brotli/gzip compression
- ESLint, Prettier, and Vitest dev tooling
- `src/components/PostCard.astro` extracted from `[...page].astro`
- `src/styles/home.css` extracted from `[...page].astro`

### Removed
- Hardcoded Last.fm API key from `src/config.ts`
- Broken `[[redirects]]` block from `netlify.toml`
- Custom `src/pages/sitemap.xml.ts` (replaced by `@astrojs/sitemap`)
- Dev artifacts: `tod`, lighthouse report HTML files
