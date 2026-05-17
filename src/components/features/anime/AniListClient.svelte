<script lang="ts">
  export let username: string = "";

  const ANILIST_API = "https://graphql.anilist.co";

  const QUERY = `
    query ($userName: String, $page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        pageInfo { hasNextPage }
        mediaList(userName: $userName, type: ANIME, sort: UPDATED_TIME_DESC) {
          status
          score(format: POINT_10)
          progress
          media {
            id
            title { english romaji }
            episodes
            coverImage { large }
            description(asHtml: false)
            startDate { year }
            studios(isMain: true) { nodes { name } }
            genres
            siteUrl
          }
        }
      }
    }
  `;

  interface AnimeItem {
    title: string;
    cover: string;
    link: string;
    status: string;
    rating: number;
    progress: number;
    totalEpisodes: number;
    description: string;
    year: string;
    studio: string;
    genre: string[];
  }

  const STATUS_MAP: Record<string, { text: string; cls: string; icon: string }> = {
    watching:  { text: "Watching",  cls: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",   icon: "▶" },
    completed: { text: "Completed", cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",       icon: "✓" },
    planned:   { text: "Planned",   cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",   icon: "♥" },
    onhold:    { text: "On Hold",   cls: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300", icon: "⏸" },
    dropped:   { text: "Dropped",   cls: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",           icon: "✗" },
  };

  function mapStatus(s: string): string {
    const m: Record<string, string> = {
      CURRENT: "watching", REPEATING: "watching",
      COMPLETED: "completed",
      PLANNING: "planned",
      PAUSED: "onhold",
      DROPPED: "dropped",
    };
    return m[s] ?? "planned";
  }

  async function fetchPage(page: number): Promise<{ items: AnimeItem[]; hasNext: boolean }> {
    const res = await fetch(ANILIST_API, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ query: QUERY, variables: { userName: username, page, perPage: 50 } }),
    });
    if (!res.ok) throw new Error(`AniList API error: ${res.status}`);
    const json = await res.json();
    if (json.errors) throw new Error(json.errors[0]?.message ?? "AniList error");
    const pageData = json?.data?.Page;
    const raw: any[] = pageData?.mediaList ?? [];
    return {
      hasNext: pageData?.pageInfo?.hasNextPage ?? false,
      items: raw.map((entry: any) => ({
        title: entry.media.title.english || entry.media.title.romaji || "Unknown",
        cover: entry.media.coverImage?.large ?? "",
        link: entry.media.siteUrl ?? "",
        status: mapStatus(entry.status),
        rating: entry.score ?? 0,
        progress: entry.progress ?? 0,
        totalEpisodes: entry.media.episodes ?? 0,
        description: (entry.media.description ?? "").replace(/<[^>]*>/g, ""),
        year: String(entry.media.startDate?.year ?? ""),
        studio: entry.media.studios?.nodes?.[0]?.name ?? "",
        genre: entry.media.genres ?? [],
      })),
    };
  }

  async function loadAll(): Promise<AnimeItem[]> {
    const all: AnimeItem[] = [];
    let page = 1;
    let hasNext = true;
    while (hasNext) {
      const { items, hasNext: next } = await fetchPage(page);
      all.push(...items);
      hasNext = next;
      page++;
    }
    return all;
  }

  let animeList: AnimeItem[] = [];
  let loading = true;
  let error = "";
  let activeFilter = "all";

  $: filtered = activeFilter === "all"
    ? animeList
    : animeList.filter(a => a.status === activeFilter);

  import { onMount } from "svelte";

  onMount(async () => {
    if (!username || username === "your-anilist-username") {
      error = "Please set your AniList username in src/config.ts";
      loading = false;
      return;
    }
    try {
      animeList = await loadAll();
    } catch (e: any) {
      error = e?.message ?? "Failed to load AniList data";
    } finally {
      loading = false;
    }
  });

  const FILTERS = [
    { key: "all",       label: "All" },
    { key: "watching",  label: "Watching" },
    { key: "planned",   label: "Planned" },
    { key: "completed", label: "Completed" },
    { key: "onhold",    label: "On Hold" },
    { key: "dropped",   label: "Dropped" },
  ];
</script>

<!-- Filters -->
<div class="flex flex-wrap gap-2 mb-6">
  {#each FILTERS as f}
    <button
      class="anime-filter-tag {activeFilter === f.key ? 'anime-active' : ''}"
      on:click={() => (activeFilter = f.key)}
    >
      {f.label}
      {#if f.key !== "all"}
        <span class="ml-1 opacity-60 text-xs">
          ({animeList.filter(a => a.status === f.key).length})
        </span>
      {/if}
    </button>
  {/each}
</div>

<!-- States -->
{#if loading}
  <div class="flex flex-col items-center justify-center py-20 gap-4">
    <div class="w-10 h-10 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
    <p class="text-black/50 dark:text-white/50 text-sm">Loading from AniList…</p>
  </div>
{:else if error}
  <div class="text-center py-12">
    <div class="text-5xl mb-4">😢</div>
    <h3 class="text-xl font-medium text-black/80 dark:text-white/80 mb-2">Something went wrong</h3>
    <p class="text-black/60 dark:text-white/60">{error}</p>
  </div>
{:else if filtered.length === 0}
  <div class="text-center py-12">
    <div class="text-5xl mb-4">🎌</div>
    <h3 class="text-xl font-medium text-black/80 dark:text-white/80 mb-2">No anime found</h3>
    <p class="text-black/60 dark:text-white/60">
      {activeFilter === "all" ? "Your AniList is empty." : `No entries with status "${activeFilter}".`}
    </p>
  </div>
{:else}
  <!-- Grid -->
  <div class="anime-grid-container grid gap-4 md:gap-6 anime-grid-mode">
    {#each filtered as anime}
      {@const statusInfo = STATUS_MAP[anime.status] ?? { text: anime.status, cls: "btn-regular", icon: "?" }}
      {@const progressPercent = anime.totalEpisodes > 0 ? (anime.progress / anime.totalEpisodes) * 100 : 0}
      <div
        class="group relative bg-[var(--card-bg)] border border-[var(--line-divider)] rounded-[var(--radius-large)] overflow-hidden hover:shadow-lg"
        data-anime-status={anime.status}
      >
        <div class="relative anime-cover-container aspect-[2/3] overflow-hidden">
          <a href={anime.link} target="_blank" rel="noopener noreferrer" class="block w-full h-full">
            <img
              src={anime.cover}
              alt={anime.title}
              class="w-full h-full object-cover transition-transform duration-200 group-hover:scale-110"
              loading="lazy"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                  <svg class="w-6 h-6 text-gray-800 ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </div>
          </a>

          <div class="absolute top-2 left-2 px-2 py-1 rounded-md text-xs font-medium {statusInfo.cls}">
            <span class="mr-1">{statusInfo.icon}</span>
            <span>{statusInfo.text}</span>
          </div>

          <div class="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1">
            <svg class="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span>{anime.rating}</span>
          </div>

          {#if anime.status === "watching"}
            <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
              <div class="w-full bg-white/20 rounded-full h-1.5 mb-1">
                <div
                  class="bg-gradient-to-r from-emerald-400 to-teal-400 h-1.5 rounded-full"
                  style="width: {progressPercent}%"
                ></div>
              </div>
              <div class="text-white text-xs font-medium">
                {anime.progress}/{anime.totalEpisodes} ({Math.round(progressPercent)}%)
              </div>
            </div>
          {/if}
        </div>

        <div class="p-3">
          <h3 class="text-sm font-bold text-black/90 dark:text-white/90 mb-1 leading-tight">{anime.title}</h3>
          <p class="text-black/60 dark:text-white/60 text-xs mb-2 line-clamp-2" title={anime.description}>
            {anime.description}
          </p>
          <div class="space-y-1 text-xs">
            <div class="flex justify-between items-center">
              <span class="text-black/50 dark:text-white/50 shrink-0">Year</span>
              <span class="text-black/70 dark:text-white/70 truncate ml-2 text-right">{anime.year}</span>
            </div>
            <div class="flex justify-between items-start">
              <span class="text-black/50 dark:text-white/50 shrink-0 mt-0.5">Studio</span>
              <span class="text-black/70 dark:text-white/70 text-right ml-2 line-clamp-2 break-words">{anime.studio}</span>
            </div>
            <div class="flex flex-wrap gap-1 mt-2">
              {#each anime.genre as g}
                <span class="px-1.5 py-0.5 bg-[var(--btn-regular-bg)] text-black/70 dark:text-white/70 rounded text-xs">{g}</span>
              {/each}
            </div>
          </div>
        </div>
      </div>
    {/each}
  </div>
{/if}
