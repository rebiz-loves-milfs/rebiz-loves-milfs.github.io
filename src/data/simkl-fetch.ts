/**
 * Fetch SIMKL stats and media lists at build time
 */

import { SIMKL } from "../config";

export interface SimklStats {
  total_mins: number;
  movies?: {
    completed?: { count: number; total_mins: number };
    plantowatch?: { count: number };
    dropped?: { count: number };
    total_mins: number;
  };
  tv?: {
    watching?: { count: number; watched_episodes_count: number };
    completed?: { count: number; watched_episodes_count: number };
    hold?: { count: number };
    plantowatch?: { count: number };
    dropped?: { count: number };
    total_mins: number;
  };
  watched_last_week?: {
    total_mins: number;
    movies_mins: number;
    tv_mins: number;
  };
}

/**
 * Fetch SIMKL stats (build-time)
 */
export async function fetchSimklStats(): Promise<SimklStats | null> {
  try {
    const res = await fetch(
      `https://api.simkl.com/users/${SIMKL.user}/stats?client_id=${SIMKL.clientId}`,
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Failed to fetch SIMKL stats:", err);
    return null;
  }
}

/**
 * Fetch list from SIMKL (movies or tv) - build-time
 */
export async function fetchSimklList(
  type: "movies" | "tv",
  status:
    | "completed"
    | "watching"
    | "plantowatch"
    | "dropped"
    | "hold" = "completed",
): Promise<any[]> {
  try {
    const res = await fetch(
      `https://api.simkl.com/users/${SIMKL.user}/${type}/${status}?client_id=${SIMKL.clientId}`,
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error(`Failed to fetch SIMKL ${type} ${status}:`, err);
    return [];
  }
}

/**
 * Fetch all completed movies and TV for build
 */
export async function fetchSimklWatchlist() {
  const [movies, tv] = await Promise.all([
    fetchSimklList("movies", "completed"),
    fetchSimklList("tv", "completed"),
  ]);

  return {
    movies: movies.map((m: any) => ({
      id: m.movie?.ids?.simkl || m.movie?.ids?.tmdb,
      title: m.movie?.title,
      year: m.movie?.year,
      rating: m.user_rating,
    })),
    tv: tv.map((t: any) => ({
      id: t.show?.ids?.simkl || t.show?.ids?.tmdb,
      title: t.show?.title,
      year: t.show?.year,
      rating: t.user_rating,
      episodes: t.watched_episodes_count,
      seasons: t.seasons,
    })),
  };
}
