<script lang="ts">
	import { onDestroy, onMount } from "svelte";
	import type { DiscordPresenceStatus, LanyardData } from "./types";

	let data: LanyardData | null = null;
	let loading = true;
	let error = false;
	let ws: WebSocket | null = null;
	let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
	let pollTimer: ReturnType<typeof setInterval> | null = null;

	const statusColors: Record<DiscordPresenceStatus, string> = {
		online: "#43b581",
		idle: "#faa61a",
		dnd: "#f04747",
		offline: "#747f8d",
	};

	const statusLabels: Record<DiscordPresenceStatus, string> = {
		online: "Online",
		idle: "Idle",
		dnd: "Do Not Disturb",
		offline: "Offline",
	};

	async function fetchRest() {
		const cfg = (window as any).__discordStatusConfig;
		if (!cfg) return;
		try {
			const res = await fetch(`https://api.lanyard.rest/v1/users/${cfg.userId}`);
			if (!res.ok) throw new Error();
			const json = await res.json();
			if (json.success) {
				data = json.data;
				loading = false;
				error = false;
			} else throw new Error();
		} catch {
			error = true;
			loading = false;
		}
	}

	function connectWebSocket() {
		const cfg = (window as any).__discordStatusConfig;
		if (!cfg) return;

		try {
			ws = new WebSocket("wss://api.lanyard.rest/socket");

			ws.onmessage = (event) => {
				const msg = JSON.parse(event.data);
				if (msg.op === 1) {
					const interval = msg.d.heartbeat_interval;
					heartbeatTimer = setInterval(() => {
						ws?.send(JSON.stringify({ op: 3 }));
					}, interval);
					ws?.send(JSON.stringify({ op: 2, d: { subscribe_to_id: cfg.userId } }));
				} else if (msg.op === 0) {
					data = msg.d;
					loading = false;
					error = false;
				}
			};

			ws.onerror = () => {
				error = true;
				loading = false;
				fetchRest();
				pollTimer = setInterval(fetchRest, 30000);
			};

			ws.onclose = () => {
				if (heartbeatTimer) clearInterval(heartbeatTimer);
			};
		} catch {
			fetchRest();
		}
	}

	function getCustomStatus(d: LanyardData | null): string | null {
		if (!d?.activities) return null;
		const custom = d.activities.find(a => a.type === 4);
		if (!custom) return null;
		const emoji = custom.emoji?.name ?? "";
		return [emoji, custom.state].filter(Boolean).join(" ");
	}

	function getNonCustomActivities(d: LanyardData | null) {
		if (!d?.activities) return [];
		return d.activities.filter(a => a.type !== 4 && a.type !== 2);
	}

	function getAvatarUrl(d: LanyardData): string {
		const { id, avatar } = d.discord_user;
		if (!avatar) {
			return `https://cdn.discordapp.com/embed/avatars/${parseInt(d.discord_user.discriminator) % 5}.png`;
		}
		return `https://cdn.discordapp.com/avatars/${id}/${avatar}.${avatar.startsWith("a_") ? "gif" : "webp"}?size=64`;
	}

	onMount(() => {
		const cfg = (window as any).__discordStatusConfig;
		if (!cfg) return;
		if (cfg.useWebSocket) {
			connectWebSocket();
		} else {
			fetchRest();
			pollTimer = setInterval(fetchRest, 30000);
		}
	});

	onDestroy(() => {
		if (ws) ws.close();
		if (heartbeatTimer) clearInterval(heartbeatTimer);
		if (pollTimer) clearInterval(pollTimer);
	});
</script>

{#if loading}
	<div class="text-sm text-neutral-500 px-2 py-3">Connecting...</div>
{:else if error}
	<div class="text-sm text-neutral-500 px-2 py-3">Unable to connect</div>
{:else if data}
	<div class="flex items-center gap-3 px-2 py-2">
		<div class="relative shrink-0">
			<img
				src={getAvatarUrl(data)}
				alt={data.discord_user.username}
				class="w-10 h-10 rounded-full object-cover"
			/>
			<span
				class="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-neutral-800"
				style="background-color: {statusColors[data.discord_status]}"
			></span>
		</div>
		<div class="min-w-0 flex-1">
			<div class="text-sm font-bold truncate text-neutral-900 dark:text-neutral-100">
				{data.discord_user.display_name ?? data.discord_user.username}
			</div>
			<div class="text-xs" style="color: {statusColors[data.discord_status]}">
				{statusLabels[data.discord_status]}
			</div>
		</div>
	</div>

	{#if getCustomStatus(data)}
		<div class="px-2 pb-1 text-xs text-neutral-500 italic truncate">{getCustomStatus(data)}</div>
	{/if}

	{#if data.listening_to_spotify && data.spotify}
		<div class="mx-2 mb-2 rounded-lg bg-[#1db954]/10 p-2 flex items-center gap-2">
			{#if data.spotify.album_art_url}
				<img
					src={data.spotify.album_art_url}
					alt={data.spotify.album}
					class="w-9 h-9 rounded object-cover shrink-0"
				/>
			{/if}
			<div class="min-w-0 flex-1">
				<div class="text-xs font-semibold text-[#1db954] mb-0.5">Listening to Spotify</div>
				<div class="text-sm font-medium truncate">{data.spotify.song}</div>
				<div class="text-xs text-neutral-500 truncate">{data.spotify.artist}</div>
			</div>
		</div>
	{/if}

	{#each getNonCustomActivities(data) as activity}
		<div class="mx-2 mb-1.5 rounded-lg bg-black/5 dark:bg-white/5 p-2">
			<div class="text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-0.5">
				{activity.name}
			</div>
			{#if activity.details}
				<div class="text-xs text-neutral-700 dark:text-neutral-300 truncate">{activity.details}</div>
			{/if}
			{#if activity.state}
				<div class="text-xs text-neutral-500 truncate">{activity.state}</div>
			{/if}
		</div>
	{/each}
{/if}
