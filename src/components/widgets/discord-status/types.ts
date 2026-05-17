export interface DiscordStatusWidgetProps {
	class?: string;
	style?: string;
}

export type DiscordPresenceStatus = "online" | "idle" | "dnd" | "offline";

export interface DiscordUser {
	id: string;
	username: string;
	discriminator: string;
	avatar: string | null;
	display_name?: string;
}

export interface DiscordActivity {
	id: string;
	name: string;
	type: number;
	details?: string;
	state?: string;
	emoji?: { name: string; id?: string; animated?: boolean };
	timestamps?: { start?: number; end?: number };
	assets?: {
		large_image?: string;
		large_text?: string;
		small_image?: string;
		small_text?: string;
	};
}

export interface SpotifyData {
	song: string;
	artist: string;
	album: string;
	album_art_url: string | null;
	track_id: string;
	timestamps: { start: number; end: number };
}

export interface LanyardData {
	discord_status: DiscordPresenceStatus;
	discord_user: DiscordUser;
	activities: DiscordActivity[];
	listening_to_spotify: boolean;
	spotify: SpotifyData | null;
	active_on_discord_web: boolean;
	active_on_discord_desktop: boolean;
	active_on_discord_mobile: boolean;
}

export interface LanyardRestResponse {
	success: boolean;
	data: LanyardData;
}
