export interface LastFmWidgetProps {
	class?: string;
	style?: string;
}

export interface LastFmTrack {
	name: string;
	artist: { "#text": string };
	album: { "#text": string };
	image: { "#text": string; size: string }[];
	url: string;
	"@attr"?: { nowplaying: "true" };
	date?: { "#text": string; uts: string };
}

export interface LastFmApiResponse {
	recenttracks: {
		track: LastFmTrack | LastFmTrack[];
		"@attr": { user: string; total: string };
	};
}
