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

/**
 * Fetch user's actual watchlist from SIMKL API
 */
export async function fetchWatchlistFromSimkl(simklUser: string, clientId: string): Promise<WatchEntry[]> {
  try {
    const baseUrl = 'https://api.simkl.com/users';
    const params = `?client_id=${clientId}`;
    
    const [completed_movies, completed_tv, watching_tv, plantowatch_movies, plantowatch_tv] = 
      await Promise.all([
        fetch(`${baseUrl}/${simklUser}/movies/completed${params}`).then(r => r.json()).catch(() => []),
        fetch(`${baseUrl}/${simklUser}/tv/completed${params}`).then(r => r.json()).catch(() => []),
        fetch(`${baseUrl}/${simklUser}/tv/watching${params}`).then(r => r.json()).catch(() => []),
        fetch(`${baseUrl}/${simklUser}/movies/plantowatch${params}`).then(r => r.json()).catch(() => []),
        fetch(`${baseUrl}/${simklUser}/tv/plantowatch${params}`).then(r => r.json()).catch(() => []),
      ]);

    const entries: WatchEntry[] = [];

    // Process completed movies
    if (Array.isArray(completed_movies)) {
      entries.push(
        ...completed_movies
          .filter((e: any) => e.movie?.ids?.simkl)
          .map((e: any) => ({
            id: e.movie.ids.tmdb || e.movie.ids.simkl,
            title: e.movie.title,
            year: e.movie.year,
            poster: e.movie.poster,
            type: 'movie' as const,
            status: 'completed' as const,
            score: e.user_rating ? e.user_rating * 10 : undefined,
          }))
      );
    }

    // Process completed TV
    if (Array.isArray(completed_tv)) {
      entries.push(
        ...completed_tv
          .filter((e: any) => e.show?.ids?.simkl)
          .map((e: any) => ({
            id: e.show.ids.tmdb || e.show.ids.simkl,
            title: e.show.title,
            year: e.show.year,
            poster: e.show.poster,
            type: 'tv' as const,
            status: 'completed' as const,
            score: e.user_rating ? e.user_rating * 10 : undefined,
            episodesWatched: e.watched_episodes_count,
            episodesTotal: e.total_episodes,
            seasons: e.seasons,
          }))
      );
    }

    // Process watching TV (priority for featured)
    if (Array.isArray(watching_tv)) {
      entries.push(
        ...watching_tv
          .filter((e: any) => e.show?.ids?.simkl)
          .map((e: any) => ({
            id: e.show.ids.tmdb || e.show.ids.simkl,
            title: e.show.title,
            year: e.show.year,
            poster: e.show.poster,
            type: 'tv' as const,
            status: 'watching' as const,
            score: e.user_rating ? e.user_rating * 10 : undefined,
            episodesWatched: e.watched_episodes_count,
            episodesTotal: e.total_episodes,
            seasons: e.seasons,
          }))
      );
    }

    // Process plan to watch movies
    if (Array.isArray(plantowatch_movies)) {
      entries.push(
        ...plantowatch_movies
          .filter((e: any) => e.movie?.ids?.simkl)
          .map((e: any) => ({
            id: e.movie.ids.tmdb || e.movie.ids.simkl,
            title: e.movie.title,
            year: e.movie.year,
            poster: e.movie.poster,
            type: 'movie' as const,
            status: 'plan' as const,
          }))
      );
    }

    // Process plan to watch TV
    if (Array.isArray(plantowatch_tv)) {
      entries.push(
        ...plantowatch_tv
          .filter((e: any) => e.show?.ids?.simkl)
          .map((e: any) => ({
            id: e.show.ids.tmdb || e.show.ids.simkl,
            title: e.show.title,
            year: e.show.year,
            poster: e.show.poster,
            type: 'tv' as const,
            status: 'plan' as const,
            episodesTotal: e.total_episodes,
            seasons: e.seasons,
          }))
      );
    }

    return entries.length > 0 ? entries : FALLBACK_WATCHLIST;
  } catch (err) {
    console.warn('Failed to fetch SIMKL watchlist, using fallback:', err);
    return FALLBACK_WATCHLIST;
  }
}

// Start with fallback, will be updated client-side
export let WATCHLIST = FALLBACK_WATCHLIST;
