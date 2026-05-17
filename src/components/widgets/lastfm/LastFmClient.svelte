<script lang="ts">
	import { onDestroy, onMount } from "svelte";
	import type { LastFmTrack } from "./types";

	let nowPlaying: LastFmTrack | null = null;
	let recentTracks: LastFmTrack[] = [];
	let loading = true;
	let error = false;
	let intervalId: ReturnType<typeof setInterval> | null = null;

	async function fetchTracks() {
		const cfg = (window as any).__lastFmConfig;
		if (!cfg) return;

		try {
			const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${cfg.username}&api_key=${cfg.apiKey}&format=json&limit=${cfg.limit}`;
			const res = await fetch(url);
			if (!res.ok) throw new Error("API error");
			const data = await res.json();

			// Normalize track field (can be object or array)
			let tracks: LastFmTrack[] = [];
			if (Array.isArray(data.recenttracks?.track)) {
				tracks = data.recenttracks.track;
			} else if (data.recenttracks?.track) {
				tracks = [data.recenttracks.track];
			}

			// First track with @attr.nowplaying = "true" is live
			if (tracks[0]?.["@attr"]?.nowplaying === "true") {
				nowPlaying = tracks[0];
				recentTracks = tracks.slice(1);
			} else {
				nowPlaying = null;
				recentTracks = tracks;
			}
			loading = false;
			error = false;
		} catch {
			error = true;
			loading = false;
		}
	}

	function getTrackImage(track: LastFmTrack): string {
		return track.image?.find(i => i.size === "medium")?.["#text"] || "";
	}

	function formatAgo(uts: string): string {
		const seconds = Math.floor(Date.now() / 1000) - parseInt(uts, 10);
		if (seconds < 60) return "just now";
		if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
		if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
		return `${Math.floor(seconds / 86400)}d ago`;
	}

	onMount(() => {
		fetchTracks();
		const cfg = (window as any).__lastFmConfig;
		const interval = cfg?.pollInterval ?? 30000;
		intervalId = setInterval(fetchTracks, interval);
	});

	onDestroy(() => {
		if (intervalId) clearInterval(intervalId);
	});
</script>

{#if loading}
	<div class="text-sm text-neutral-500 px-2 py-3">Loading...</div>
{:else if error}
	<div class="text-sm text-neutral-500 px-2 py-3">Unable to load tracks</div>
{:else}
	{#if nowPlaying}
		<div class="px-2 py-2 rounded-lg bg-[var(--primary)]/10">
			<div class="flex items-center gap-1.5 mb-2">
				<span class="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse shrink-0"></span>
				<span class="text-xs font-semibold text-[var(--primary)] uppercase tracking-wide">Now Playing</span>
			</div>
			<div class="flex items-start gap-3">
				<img
					src={getTrackImage(nowPlaying)}
					alt={nowPlaying.album["#text"]}
					class="w-12 h-12 rounded-full object-cover shrink-0 ring-1 ring-[var(--primary)]/20"
					on:error={(e) => (e.target.style.display = "none")}
				/>
				<div class="min-w-0 flex-1">
					<div class="text-sm font-bold truncate text-neutral-900 dark:text-neutral-100">
						{nowPlaying.name}
					</div>
					<div class="text-xs text-neutral-500 truncate">{nowPlaying.artist["#text"]}</div>
				</div>
			</div>
		</div>
	{:else}
		<div class="text-xs text-neutral-500 px-2 py-1 italic">Nothing playing right now</div>
	{/if}

	{#if recentTracks.length > 0}
		<div class="mt-3 flex flex-col gap-1.5">
			{#each recentTracks as track}
				<a
					href={track.url}
					target="_blank"
					rel="noopener noreferrer"
					class="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors group"
				>
					<img
						src={getTrackImage(track)}
						alt={track.album["#text"]}
						class="w-9 h-9 rounded-full object-cover shrink-0"
						on:error={(e) => (e.target.style.display = "none")}
					/>
					<div class="min-w-0 flex-1">
						<div class="text-sm font-medium truncate text-neutral-800 dark:text-neutral-200 group-hover:text-[var(--primary)] transition-colors">
							{track.name}
						</div>
						<div class="text-xs text-neutral-500 truncate">{track.artist["#text"]}</div>
					</div>
					{#if track.date}
						<span class="text-xs text-neutral-400 shrink-0 whitespace-nowrap">{formatAgo(track.date.uts)}</span>
					{/if}
				</a>
			{/each}
		</div>
	{/if}
{/if}
