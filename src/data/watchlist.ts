export type WatchStatus = 'watching' | 'completed' | 'plan' | 'dropped' | 'hold';
export type WatchType   = 'movie' | 'tv';

export interface WatchEntry {
  id: number;
  title: string;
  year?: number;
  /** TMDB poster path e.g. "/abc123.jpg" → full URL built automatically.
   *  Or pass a full URL. Leave empty for gradient placeholder. */
  poster?: string;
  /** TMDB backdrop/banner path or full URL */
  backdrop?: string;
  type: WatchType;
  status: WatchStatus;
  /** 1–10 */
  score?: number;
  /** For TV: episodes watched */
  episodesWatched?: number;
  /** For TV: total episodes */
  episodesTotal?: number;
  /** Season count for TV */
  seasons?: number;
  /** Short note or tagline */
  note?: string;
  /** Hue for gradient placeholder (0–360) */
  hue?: number;
}

/** Poster helper — accepts TMDB path ("/abc.jpg") or a full URL */
export function posterUrl(path?: string, size = 'w342'): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

/** Fallback hardcoded data in case SIMKL fetch fails */
const FALLBACK_WATCHLIST: WatchEntry[] = [
  // ── Currently watching ──────────────────────────────
  {
    id: 1,
    title: 'Severance',
    year: 2022,
    poster: '/qKS4BYtb6TcFvbNBLJPi2OQ9WnF.jpg',
    type: 'tv',
    status: 'watching',
    score: 9,
    episodesWatched: 10,
    episodesTotal: 18,
    seasons: 2,
    note: 'Lumon Industries is wild.',
  },

  // ── Completed — Movies ───────────────────────────────
  {
    id: 3,
    title: 'Parasite',
    year: 2019,
    poster: '/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
    type: 'movie',
    status: 'completed',
    score: 10,
    hue: 145,
  },

  // ── Completed — TV ───────────────────────────────────
  {
    id: 7,
    title: 'Succession',
    year: 2018,
    poster: '/e2X8g6OsM8vCWCEP3r5kYcAEKFm.jpg',
    type: 'tv',
    status: 'completed',
    score: 9,
    episodesWatched: 39,
    episodesTotal: 39,
    seasons: 4,
  },
  {
    id: 8,
    title: 'The Bear',
    year: 2022,
    poster: '/sHFlbKS3WLqMnp9t2ghADIJFnuQ.jpg',
    type: 'tv',
    status: 'completed',
    score: 9,
    episodesWatched: 28,
    episodesTotal: 28,
    seasons: 3,
  },

  // ── Plan to watch ────────────────────────────────────
  {
    id: 9,
    title: 'Dune: Part Two',
    year: 2024,
    poster: '/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    type: 'movie',
    status: 'plan',
    hue: 85,
  },
  {
    id: 10,
    title: 'Shogun',
    year: 2024,
    poster: '/7O4iVfOMQmdCSxhOg1WnzG1AgYT.jpg',
    type: 'tv',
    status: 'plan',
    hue: 30,
    episodesTotal: 10,
  },
];

function simklHeaders(accessToken: string, clientId: string): Record<string, string> {
  const h: Record<string, string> = { 'simkl-api-key': clientId };
  if (accessToken) h['Authorization'] = `Bearer ${accessToken}`;
  return h;
}

function simklPosterUrl(poster?: string): string | undefined {
  if (!poster) return undefined;
  if (poster.startsWith('http')) return poster;
  // Simkl poster paths: "img/posters/{hash}" → full URL
  return `https://simkl.in/posters/${poster}_m.jpg`;
}

async function simklFetch(url: string, accessToken: string, clientId: string): Promise<any[]> {
  const res = await fetch(url, { headers: simklHeaders(accessToken, clientId) });
  if (!res.ok) throw new Error(`Simkl ${res.status}: ${url}`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

/**
 * Fetch user's actual watchlist from SIMKL API.
 * Requires SIMKL_ACCESS_TOKEN env var — run scripts/simkl-auth.mjs to obtain it.
 */
export async function fetchWatchlistFromSimkl(
  simklUser: string,
  clientId: string,
  accessToken: string,
): Promise<WatchEntry[]> {
  if (!accessToken) {
    console.warn('[Simkl] No access token — using fallback. Run scripts/simkl-auth.mjs.');
    return FALLBACK_WATCHLIST;
  }

  try {
    const base = `https://api.simkl.com/users/${simklUser}`;
    const [completed_movies, completed_tv, watching_movies, watching_tv, plan_movies, plan_tv] =
      await Promise.all([
        simklFetch(`${base}/movies/completed`, accessToken, clientId),
        simklFetch(`${base}/tv/completed`, accessToken, clientId),
        simklFetch(`${base}/movies/watching`, accessToken, clientId),
        simklFetch(`${base}/tv/watching`, accessToken, clientId),
        simklFetch(`${base}/movies/plantowatch`, accessToken, clientId),
        simklFetch(`${base}/tv/plantowatch`, accessToken, clientId),
      ]);

    const entries: WatchEntry[] = [];

    for (const e of watching_movies) {
      if (!e.movie?.title) continue;
      entries.push({
        id: e.movie.ids?.tmdb || e.movie.ids?.simkl || Math.random(),
        title: e.movie.title,
        year: e.movie.year,
        poster: simklPosterUrl(e.movie.poster),
        type: 'movie',
        status: 'watching',
        score: e.user_rating || undefined,
      });
    }

    for (const e of watching_tv) {
      if (!e.show?.title) continue;
      entries.push({
        id: e.show.ids?.tmdb || e.show.ids?.simkl || Math.random(),
        title: e.show.title,
        year: e.show.year,
        poster: simklPosterUrl(e.show.poster),
        type: 'tv',
        status: 'watching',
        score: e.user_rating || undefined,
        episodesWatched: e.watched_episodes_count,
        episodesTotal: e.total_episodes_count,
        seasons: e.seasons?.length,
      });
    }

    for (const e of completed_movies) {
      if (!e.movie?.title) continue;
      entries.push({
        id: e.movie.ids?.tmdb || e.movie.ids?.simkl || Math.random(),
        title: e.movie.title,
        year: e.movie.year,
        poster: simklPosterUrl(e.movie.poster),
        type: 'movie',
        status: 'completed',
        score: e.user_rating || undefined,
      });
    }

    for (const e of completed_tv) {
      if (!e.show?.title) continue;
      entries.push({
        id: e.show.ids?.tmdb || e.show.ids?.simkl || Math.random(),
        title: e.show.title,
        year: e.show.year,
        poster: simklPosterUrl(e.show.poster),
        type: 'tv',
        status: 'completed',
        score: e.user_rating || undefined,
        episodesWatched: e.watched_episodes_count,
        episodesTotal: e.total_episodes_count,
        seasons: e.seasons?.length,
      });
    }

    for (const e of plan_movies) {
      if (!e.movie?.title) continue;
      entries.push({
        id: e.movie.ids?.tmdb || e.movie.ids?.simkl || Math.random(),
        title: e.movie.title,
        year: e.movie.year,
        poster: simklPosterUrl(e.movie.poster),
        type: 'movie',
        status: 'plan',
      });
    }

    for (const e of plan_tv) {
      if (!e.show?.title) continue;
      entries.push({
        id: e.show.ids?.tmdb || e.show.ids?.simkl || Math.random(),
        title: e.show.title,
        year: e.show.year,
        poster: simklPosterUrl(e.show.poster),
        type: 'tv',
        status: 'plan',
        episodesTotal: e.total_episodes_count,
        seasons: e.seasons?.length,
      });
    }

    if (entries.length === 0) {
      console.warn('[Simkl] API returned empty lists — using fallback.');
      return FALLBACK_WATCHLIST;
    }

    return entries;
  } catch (err) {
    console.warn('[Simkl] Fetch failed, using fallback:', err);
    return FALLBACK_WATCHLIST;
  }
}

// Start with fallback, will be updated client-side
export let WATCHLIST = FALLBACK_WATCHLIST;
