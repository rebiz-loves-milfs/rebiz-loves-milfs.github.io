import Key from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";

import {
	DEFAULT_SONG,
	LOCAL_PLAYLIST,
	SKIP_ERROR_DELAY,
	STORAGE_KEY_VOLUME,
} from "@/components/widgets/music-player/constants";
import type { RepeatMode, Song } from "@/components/widgets/music-player/types";
import { musicPlayerConfig } from "@/config";

export interface MusicPlayerState {
	currentSong: Song;
	playlist: Song[];
	currentIndex: number;
	isPlaying: boolean;
	isLoading: boolean;
	currentTime: number;
	duration: number;
	volume: number;
	isMuted: boolean;
	isShuffled: boolean;
	isRepeating: RepeatMode;
	showPlaylist: boolean;
	errorMessage: string;
	showError: boolean;
	isExpanded: boolean;
	isHidden: boolean;
	autoplayFailed: boolean;
	willAutoPlay: boolean;
}

function getAssetPath(path: string): string {
	if (!path) {
		return "";
	}
	if (path.startsWith("http://") || path.startsWith("https://")) {
		return path;
	}
	if (path.startsWith("/")) {
		return path;
	}
	return `/${path}`;
}

class MusicPlayerStore {
	private audio: HTMLAudioElement | null = null;
	private state: MusicPlayerState;
	private isInitialized = false;
	private unregisterInteraction: (() => void) | undefined;
	private listeners = new Set<(state: MusicPlayerState) => void>();
	private ytPlayer: any = null;
	private ytReadyPromise: Promise<void> | null = null;
	private timeUpdateInterval: any = null;

	constructor() {
		this.state = this.createInitialState();
	}

	private createInitialState(): MusicPlayerState {
		return {
			currentSong: { ...DEFAULT_SONG },
			playlist: [],
			currentIndex: 0,
			isPlaying: false,
			isLoading: false,
			currentTime: 0,
			duration: 0,
			volume: 0.7,
			isMuted: false,
			isShuffled: false,
			isRepeating: 0,
			showPlaylist: false,
			errorMessage: "",
			showError: false,
			isExpanded: false,
			isHidden: false,
			autoplayFailed: false,
			willAutoPlay: true,
		};
	}

	private createSnapshot(): MusicPlayerState {
		return {
			...this.state,
			currentSong: { ...this.state.currentSong },
			playlist: this.state.playlist.map((song) => ({ ...song })),
		};
	}

	getState(): MusicPlayerState {
		return this.createSnapshot();
	}

	getAudio(): HTMLAudioElement | null {
		return this.audio;
	}

	subscribe(listener: (state: MusicPlayerState) => void): () => void {
		this.listeners.add(listener);
		listener(this.createSnapshot());
		return () => {
			this.listeners.delete(listener);
		};
	}

	async initialize(): Promise<void> {
		if (typeof window === "undefined" || this.isInitialized) {
			return;
		}
		this.isInitialized = true;

		if (!musicPlayerConfig.enable) {
			return;
		}

		const mode = musicPlayerConfig.mode ?? "youtube";
		if (mode !== "youtube-iframe") {
			this.audio = new Audio();
			this.setupAudioListeners();
		}

		this.loadVolumeFromStorage();
		this.registerInteractionHandler();
		await this.loadPlaylist();
	}

	private setupAudioListeners(): void {
		if (!this.audio) {
			return;
		}

		this.audio.volume = this.state.volume;
		this.audio.muted = this.state.isMuted;

		this.audio.addEventListener("play", () => {
			this.state.isPlaying = true;
			this.broadcastState();
		});

		this.audio.addEventListener("pause", () => {
			this.state.isPlaying = false;
			this.broadcastState();
		});

		this.audio.addEventListener("timeupdate", () => {
			if (this.audio) {
				this.state.currentTime = this.audio.currentTime;
				this.broadcastState();
			}
		});

		this.audio.addEventListener("ended", () => {
			this.handleAudioEnded();
		});

		this.audio.addEventListener("error", () => {
			this.handleAudioError();
		});

		this.audio.addEventListener("loadeddata", () => {
			this.handleAudioLoaded();
		});

		this.audio.addEventListener("loadstart", () => {
			this.state.isLoading = true;
			this.broadcastState();
		});
	}

	private handleAudioEnded(): void {
		const mode = musicPlayerConfig.mode ?? "youtube";
		if (mode === "youtube-iframe") {
			if (this.state.isRepeating === 1) {
				if (this.ytPlayer) {
					this.ytPlayer.seekTo(0);
					this.ytPlayer.playVideo();
				}
			} else {
				this.next(true);
			}
			return;
		}
		if (this.state.isRepeating === 1) {
			if (this.audio) {
				this.audio.currentTime = 0;
				this.audio.play().catch(() => {});
			}
		} else {
			this.next(true);
		}
	}

	private handleAudioError(): void {
		this.state.isLoading = false;
		this.showError(i18n(Key.musicPlayerErrorSong));

		if (this.state.playlist.length > 1) {
			setTimeout(() => this.next(true), SKIP_ERROR_DELAY);
		} else if (this.state.playlist.length <= 1) {
			this.showError(i18n(Key.musicPlayerErrorEmpty));
		}
		this.broadcastState();
	}

	private handleAudioLoaded(): void {
		this.state.isLoading = false;
		if (this.audio?.duration && this.audio.duration > 1) {
			this.state.duration = Math.floor(this.audio.duration);
			this.state.currentSong = {
				...this.state.currentSong,
				duration: this.state.duration,
			};
		}

		if (this.state.willAutoPlay || this.state.isPlaying) {
			const playPromise = this.audio?.play();
			if (playPromise !== undefined) {
				playPromise.catch(() => {
					this.state.autoplayFailed = true;
					this.state.isPlaying = false;
				});
			}
		}
		this.broadcastState();
	}

	private loadVolumeFromStorage(): void {
		if (typeof localStorage !== "undefined") {
			const savedVolume = localStorage.getItem(STORAGE_KEY_VOLUME);
			if (savedVolume) {
				const volume = parseFloat(savedVolume);
				if (!isNaN(volume) && volume >= 0 && volume <= 1) {
					this.state.volume = volume;
					this.state.isMuted = volume === 0;
					if (this.audio) {
						this.audio.volume = volume;
						this.audio.muted = this.state.isMuted;
					}
				}
			}
		}
	}

	private registerInteractionHandler(): void {
		if (typeof document === 'undefined') {
			return;
		}
		const handler = () => {
			if (this.state.autoplayFailed && this.audio) {
				const playPromise = this.audio.play();
				if (playPromise !== undefined) {
					playPromise
						.then(() => {
							this.state.autoplayFailed = false;
						})
						.catch(() => {});
				}
			}
		};
		document.addEventListener("click", handler, { once: true });
		document.addEventListener("keydown", handler, { once: true });
		this.unregisterInteraction = () => {
			document.removeEventListener("click", handler);
			document.removeEventListener("keydown", handler);
		};
	}

	private async loadPlaylist(): Promise<void> {
		const mode = musicPlayerConfig.mode ?? "youtube";

		if (mode === "youtube") {
			const playlistId = musicPlayerConfig.youtubePlaylistId ?? "";
			const videoId = musicPlayerConfig.youtubeVideoId;
			const pipedApiUrl =
				musicPlayerConfig.pipedApiUrl ?? "https://pipedapi.kavin.rocks";

			if (videoId) {
				await this.fetchSingleVideo(pipedApiUrl, videoId);
			} else if (playlistId) {
				await this.fetchYouTubePlaylist(pipedApiUrl, playlistId);
			} else {
				this.showError(i18n(Key.musicPlayerErrorPlaylist));
			}
		} else if (mode === "youtube-iframe") {
			await this.loadYouTubeIframe();
		} else {
			this.loadLocalPlaylist();
		}
	}

	private async fetchYouTubePlaylist(
		pipedApiUrl: string,
		playlistId: string,
	): Promise<void> {
		if (!playlistId) {
			this.showError(i18n(Key.musicPlayerErrorPlaylist));
			return;
		}

		this.state.isLoading = true;
		this.broadcastState();

		try {
			const res = await fetch(
				`${pipedApiUrl}/playlists/${playlistId}`,
			);
			if (!res.ok) throw new Error("piped api error");

			const data = await res.json();
			const streams: any[] = data.relatedStreams ?? [];

			this.state.playlist = streams.map((item: any, idx: number) => {
				const rawId = (item.url ?? "").replace("/watch?v=", "");
				return {
					id: idx,
					title: item.title ?? i18n(Key.unknownSong),
					artist: item.uploaderName ?? i18n(Key.unknownArtist),
					cover: item.thumbnail ?? "",
					url: "",
					duration: item.duration ?? 0,
					videoId: rawId,
				};
			});

			this.state.isLoading = false;

			if (this.state.playlist.length > 0) {
				await this.resolveYouTubeStreamUrl(
					this.state.playlist[0],
					pipedApiUrl,
				);
				this.loadSong(this.state.playlist[0], false);
			}
		} catch (e) {
			this.showError(i18n(Key.musicPlayerErrorPlaylist));
			this.state.isLoading = false;
		}
		this.broadcastState();
	}

	private async fetchSingleVideo(
		pipedApiUrl: string,
		videoId: string,
	): Promise<void> {
		this.state.isLoading = true;
		this.broadcastState();

		try {
			const res = await fetch(`${pipedApiUrl}/streams/${videoId}`);
			if (!res.ok) throw new Error("piped api error");

			const data = await res.json();
			const audioStreams: any[] = data.audioStreams ?? [];
			const best = audioStreams
				.filter((s: any) => s.mimeType?.includes("audio"))
				.sort((a: any, b: any) => (b.bitrate ?? 0) - (a.bitrate ?? 0))[0];

			const title = data.title ?? i18n(Key.unknownSong);
			const defaultThumbnail = data.thumbnail ?? "";
			const customCover = musicPlayerConfig.customCoverUrl;
			const duration = data.duration ?? 0;
			const uploaderName = data.uploaderName ?? i18n(Key.unknownArtist);

			this.state.playlist = [{
				id: 0,
				title,
				artist: uploaderName,
				cover: customCover || defaultThumbnail,
				url: best?.url ?? "",
				duration,
				videoId,
			}];

			this.state.isLoading = false;

			if (this.state.playlist.length > 0 && this.state.playlist[0].url) {
				this.loadSong(this.state.playlist[0], false);
			}
		} catch (e) {
			this.showError(i18n(Key.musicPlayerErrorPlaylist));
			this.state.isLoading = false;
		}
		this.broadcastState();
	}

	private async resolveYouTubeStreamUrl(
		song: Song,
		pipedApiUrl: string,
	): Promise<void> {
		if (song.url || !song.videoId) return;

		try {
			const res = await fetch(`${pipedApiUrl}/streams/${song.videoId}`);
			if (!res.ok) throw new Error("stream fetch failed");
			const data = await res.json();

			const audioStreams: any[] = data.audioStreams ?? [];
			const best = audioStreams
				.filter((s: any) => s.mimeType?.includes("audio"))
				.sort((a: any, b: any) => (b.bitrate ?? 0) - (a.bitrate ?? 0))[0];

			if (best?.url) {
				song.url = best.url;
				const idx = this.state.playlist.findIndex(
					(s) => s.videoId === song.videoId,
				);
				if (idx !== -1) this.state.playlist[idx].url = best.url;
			}
		} catch (_e) {
			// stream resolution failed; will show error when playback attempted
		}
	}

	private loadLocalPlaylist(): void {
		this.state.playlist = [...LOCAL_PLAYLIST];
		if (this.state.playlist.length === 0) {
			this.showError(i18n(Key.musicPlayerErrorEmpty));
		} else {
			this.loadSong(this.state.playlist[0], false);
		}
	}

	private async loadYouTubeIframe(): Promise<void> {
		const videoId = musicPlayerConfig.youtubeVideoId;
		const playlistId = musicPlayerConfig.youtubePlaylistId;

		console.log('Loading YouTube iframe with videoId:', videoId);

		if (!videoId && !playlistId) {
			this.showError(i18n(Key.musicPlayerErrorPlaylist));
			return;
		}

		this.state.isLoading = true;
		this.broadcastState();

		try {
			console.log('Ensuring YouTube API...');
			await this.ensureYouTubeApi();
			console.log('YouTube API loaded, creating player...');
			this.createYouTubePlayer(videoId, playlistId);
		} catch (error) {
			console.error('YouTube iframe error:', error);
			this.showError(i18n(Key.musicPlayerErrorPlaylist));
			this.state.isLoading = false;
			this.broadcastState();
		}
	}

	private ensureYouTubeApi(): Promise<void> {
		if (typeof window === 'undefined' || typeof document === 'undefined') {
			return Promise.reject(new Error('Browser APIs not available'));
		}
		if ((window as any).YT) {
			return Promise.resolve();
		}

		if (!this.ytReadyPromise) {
			this.ytReadyPromise = new Promise((resolve) => {
				const tag = document.createElement('script');
				tag.src = 'https://www.youtube.com/iframe_api';
				const firstScriptTag = document.getElementsByTagName('script')[0];
				firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

				// Global callback for YouTube API
				(window as any).onYouTubeIframeAPIReady = () => {
					resolve();
				};

				// Fallback timeout in case YT never fires ready
				setTimeout(() => {
					if ((window as any).YT) {
						resolve();
					}
				}, 5000);
			});
		}
		return this.ytReadyPromise;
	}

	private createYouTubePlayer(videoId: string | undefined, playlistId: string | undefined): void {
		if (typeof document === 'undefined' || typeof window === 'undefined') {
			return;
		}
		// Clean up existing player if any
		if (this.ytPlayer) {
			try {
				this.ytPlayer.destroy();
			} catch (e) {
				// ignore
			}
			this.ytPlayer = null;
		}
		const oldDiv = document.getElementById('youtube-player-hidden');
		if (oldDiv) {
			oldDiv.remove();
		}

		// Create a hidden container div
		const playerDiv = document.createElement('div');
		playerDiv.id = 'youtube-player-hidden';
		playerDiv.style.position = 'absolute';
		playerDiv.style.top = '-9999px';
		playerDiv.style.left = '-9999px';
		playerDiv.style.width = '1px';
		playerDiv.style.height = '1px';
		playerDiv.style.visibility = 'hidden';
		document.body.appendChild(playerDiv);

		const playerConfig: any = {
			height: '1',
			width: '1',
			playerVars: {
				controls: 0,
				disablekb: 1,
				fs: 0,
				modestbranding: 1,
				rel: 0,
				playsinline: 1,
				autoplay: 1,
				enablejsapi: 1,
			},
			events: {
				onReady: (event: any) => {
					try {
						this.onYouTubePlayerReady(event);
					} catch (e) {
						console.error('YouTube player ready error:', e);
					}
				},
				onStateChange: (event: any) => {
					try {
						this.onYouTubePlayerStateChange(event);
					} catch (e) {
						console.error('YouTube player state change error:', e);
					}
				},
				onError: (event: any) => this.onYouTubePlayerError(event),
			},
		};

		if (videoId) {
			playerConfig.videoId = videoId;
		} else if (playlistId) {
			playerConfig.playerVars.list = playlistId;
			playerConfig.playerVars.listType = 'playlist';
		}

		try {
			this.ytPlayer = new (window as any).YT.Player(playerDiv, playerConfig);
		} catch (e) {
			console.error('Failed to create YouTube player:', e);
			this.state.isLoading = false;
			this.showError(i18n(Key.musicPlayerErrorPlaylist));
			this.broadcastState();
		}
	}

	private onYouTubePlayerReady(event: any): void {
		console.log('YouTube player ready!');
		this.state.isLoading = false;
		const player = event.target;

		// Set volume from stored state
		player.setVolume(this.state.volume * 100);
		if (this.state.isMuted) {
			player.mute();
		}

		const videoData = player.getVideoData();
		const duration = player.getDuration();
		const videoId = videoData.video_id;

		console.log('Video data:', videoData);
		console.log('Duration:', duration);

		const customCover = musicPlayerConfig.customCoverUrl;
		const defaultCover = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '';

		const song: Song = {
			id: 0,
			title: videoData.title || i18n(Key.unknownSong),
			artist: videoData.author?.name || i18n(Key.unknownArtist),
			cover: customCover || defaultCover,
			url: '',
			duration: duration,
			videoId: videoId,
		};

		this.state.currentSong = song;
		this.state.playlist = [song];
		this.state.currentIndex = 0;
		this.broadcastState();

		console.log('Current song set:', song);

		// Start polling for time updates
		this.startTimeUpdate();

		// Autoplay if needed
		if (this.state.willAutoPlay || this.state.isPlaying) {
			console.log('Attempting to play video...');
			player.playVideo();
		}
	}

	private onYouTubePlayerStateChange(event: any): void {
		const YT = (window as any).YT;
		if (!YT) return;

		const stateNames: any = {
			[-1]: 'UNSTARTED',
			[0]: 'ENDED',
			[1]: 'PLAYING',
			[2]: 'PAUSED',
			[3]: 'BUFFERING',
			[5]: 'CUED',
		};

		console.log('YouTube player state changed to:', stateNames[event.data] || event.data);

		switch (event.data) {
			case YT.PlayerState.PLAYING:
				console.log('Player is playing');
				this.state.isPlaying = true;
				this.state.isLoading = false;
				// Update duration from player (may be needed when loading new video)
				if (this.ytPlayer) {
					try {
						const dur = this.ytPlayer.getDuration();
						if (dur && dur > 0) {
							this.state.duration = dur;
							if (this.state.currentSong) {
								this.state.currentSong.duration = dur;
							}
						}
					} catch (e) {
						// ignore
					}
				}
				break;
			case YT.PlayerState.PAUSED:
				console.log('Player is paused');
				this.state.isPlaying = false;
				break;
			case YT.PlayerState.BUFFERING:
				console.log('Player is buffering');
				this.state.isLoading = true;
				break;
			case YT.PlayerState.ENDED:
				console.log('Player ended');
				this.handleAudioEnded();
				break;
			case YT.PlayerState.CUED:
				console.log('Player cued');
				// Video cued; update duration
				if (this.ytPlayer) {
					try {
						const dur = this.ytPlayer.getDuration();
						if (dur && dur > 0) {
							this.state.duration = dur;
							if (this.state.currentSong) {
								this.state.currentSong.duration = dur;
							}
						}
					} catch (e) {}
				}
				break;
		}
		this.broadcastState();
	}

	private onYouTubePlayerError(event: any): void {
		this.state.isLoading = false;
		this.showError(i18n(Key.musicPlayerErrorSong));
		if (this.state.playlist.length > 1) {
			setTimeout(() => this.next(true), SKIP_ERROR_DELAY);
		}
		this.broadcastState();
	}

	private startTimeUpdate(): void {
		this.stopTimeUpdate();
		this.timeUpdateInterval = setInterval(() => {
			if (this.ytPlayer && this.state.isPlaying) {
				try {
					const currentTime = this.ytPlayer.getCurrentTime();
					this.state.currentTime = currentTime;
					this.broadcastState();
				} catch (e) {
					// ignore
				}
			}
		}, 1000);
	}

	private stopTimeUpdate(): void {
		if (this.timeUpdateInterval) {
			clearInterval(this.timeUpdateInterval);
			this.timeUpdateInterval = null;
		}
	}

	private loadSong(song: Song, autoPlay = true): void {
		if (!song) return;

		const mode = musicPlayerConfig.mode ?? "youtube";

		// YouTube iframe mode: load video directly via player
		if (mode === "youtube-iframe" && song.videoId) {
			this.state.currentSong = { ...song };
			// Update index if song is in playlist
			const idx = this.state.playlist.findIndex(s => s.id === song.id);
			if (idx !== -1) {
				this.state.currentIndex = idx;
			}
			this.state.isLoading = true;
			this.state.willAutoPlay = autoPlay;
			this.broadcastState();

			if (this.ytPlayer) {
				this.ytPlayer.loadVideoById(song.videoId);
			} else {
				// If player not ready, delay slightly
				setTimeout(() => {
					if (this.ytPlayer) {
						this.ytPlayer.loadVideoById(song.videoId);
					} else {
						this.state.isLoading = false;
						this.broadcastState();
					}
				}, 100);
			}
			return;
		}

		if (song.videoId && !song.url) {
			const pipedApiUrl =
				musicPlayerConfig.pipedApiUrl ?? "https://pipedapi.kavin.rocks";
			this.state.currentSong = { ...song };
			this.state.isLoading = true;
			this.state.willAutoPlay = autoPlay;
			this.broadcastState();
			this.resolveYouTubeStreamUrl(song, pipedApiUrl).then(() => {
				if (song.url && this.audio) {
					this.audio.src = song.url;
					this.audio.load();
				}
				this.state.isLoading = false;
				this.broadcastState();
			});
			return;
		}

		if (song.url !== this.state.currentSong.url) {
			this.state.currentSong = { ...song };
			this.state.isLoading = !!song.url;
		}
		this.state.willAutoPlay = autoPlay;
		if (this.audio) {
			if (this.audio.src && song.url) {
				this.audio.src = "";
			}
			this.audio.src = getAssetPath(song.url);
			this.audio.load();
		}
		this.broadcastState();
	}

	private showError(message: string): void {
		this.state.errorMessage = message;
		this.state.showError = true;
		setTimeout(() => {
			this.state.showError = false;
			this.broadcastState();
		}, 3000);
		this.broadcastState();
	}

	hideError(): void {
		this.state.showError = false;
		this.broadcastState();
	}

	toggle(): void {
		const mode = musicPlayerConfig.mode ?? "youtube";
		if (mode === "youtube-iframe") {
			if (!this.ytPlayer) {
				return;
			}
			if (this.state.isPlaying) {
				this.ytPlayer.pauseVideo();
			} else {
				this.ytPlayer.playVideo();
			}
		} else {
			if (!this.audio || !this.state.currentSong.url) {
				return;
			}
			if (this.state.isPlaying) {
				this.audio.pause();
			} else {
				this.audio.play().catch(() => {});
			}
		}
	}

	play(): void {
		const mode = musicPlayerConfig.mode ?? "youtube";
		if (mode === "youtube-iframe") {
			if (!this.ytPlayer) {
				return;
			}
			this.ytPlayer.playVideo();
		} else {
			if (!this.audio || !this.state.currentSong.url) {
				return;
			}
			this.audio.play().catch(() => {});
		}
	}

	pause(): void {
		const mode = musicPlayerConfig.mode ?? "youtube";
		if (mode === "youtube-iframe") {
			if (!this.ytPlayer) {
				return;
			}
			this.ytPlayer.pauseVideo();
		} else {
			if (!this.audio) {
				return;
			}
			this.audio.pause();
		}
	}

	next(autoPlay = true): void {
		if (this.state.playlist.length <= 1) {
			return;
		}

		let newIndex: number;
		if (this.state.isShuffled) {
			do {
				newIndex = Math.floor(
					Math.random() * this.state.playlist.length,
				);
			} while (
				newIndex === this.state.currentIndex &&
				this.state.playlist.length > 1
			);
		} else {
			newIndex =
				this.state.currentIndex < this.state.playlist.length - 1
					? this.state.currentIndex + 1
					: 0;
		}

		this.state.currentIndex = newIndex;
		this.loadSong(this.state.playlist[newIndex], autoPlay);
	}

	prev(): void {
		if (this.state.playlist.length <= 1) {
			return;
		}
		const newIndex =
			this.state.currentIndex > 0
				? this.state.currentIndex - 1
				: this.state.playlist.length - 1;
		this.state.currentIndex = newIndex;
		this.loadSong(this.state.playlist[newIndex], true);
	}

	playIndex(index: number): void {
		if (index < 0 || index >= this.state.playlist.length) {
			return;
		}
		this.state.currentIndex = index;
		this.loadSong(this.state.playlist[index], true);
	}

	seek(time: number): void {
		const mode = musicPlayerConfig.mode ?? "youtube";
		if (mode === "youtube-iframe") {
			if (!this.ytPlayer) return;
			if (time >= 0 && time <= this.state.duration) {
				this.ytPlayer.seekTo(time, true);
				this.state.currentTime = time;
				this.broadcastState();
			}
			return;
		}
		if (!this.audio) {
			return;
		}
		if (time >= 0 && time <= this.state.duration) {
			this.audio.currentTime = time;
			this.state.currentTime = time;
			this.broadcastState();
		}
	}

	setVolume(volume: number): void {
		const clampedVolume = Math.max(0, Math.min(1, volume));
		this.state.volume = clampedVolume;
		this.state.isMuted = clampedVolume === 0;
		const mode = musicPlayerConfig.mode ?? "youtube";
		if (mode === "youtube-iframe") {
			if (this.ytPlayer) {
				this.ytPlayer.setVolume(clampedVolume * 100);
				if (clampedVolume === 0) {
					this.ytPlayer.mute();
				} else {
					this.ytPlayer.unMute();
				}
			}
		} else {
			if (this.audio) {
				this.audio.volume = clampedVolume;
				this.audio.muted = this.state.isMuted;
			}
		}
		if (typeof localStorage !== "undefined") {
			localStorage.setItem(STORAGE_KEY_VOLUME, String(clampedVolume));
		}
		this.broadcastState();
	}

	toggleMute(): void {
		this.state.isMuted = !this.state.isMuted;
		const mode = musicPlayerConfig.mode ?? "youtube";
		if (mode === "youtube-iframe") {
			if (this.ytPlayer) {
				if (this.state.isMuted) {
					this.ytPlayer.mute();
				} else {
					this.ytPlayer.unMute();
				}
			}
		} else {
			if (this.audio) {
				this.audio.muted = this.state.isMuted;
			}
		}
		this.broadcastState();
	}

	toggleShuffle(): void {
		this.state.isShuffled = !this.state.isShuffled;
		if (this.state.isShuffled) {
			this.state.isRepeating = 0;
		}
		this.broadcastState();
	}

	toggleRepeat(): void {
		this.state.isRepeating = ((this.state.isRepeating + 1) %
			3) as RepeatMode;
		if (this.state.isRepeating !== 0) {
			this.state.isShuffled = false;
		}
		this.broadcastState();
	}

	toggleMode(): void {
		if (this.state.isShuffled) {
			this.toggleShuffle();
			return;
		}
		if (this.state.isRepeating === 2) {
			this.toggleRepeat();
			this.toggleShuffle();
			return;
		}
		this.toggleRepeat();
	}

	togglePlaylist(): void {
		this.state.showPlaylist = !this.state.showPlaylist;
		this.broadcastState();
	}

	toggleExpanded(): void {
		this.state.isExpanded = !this.state.isExpanded;
		// 保持与原先 usePlayerState.toggleExpandedUI 一致的联动行为：
		// 展开时强制取消隐藏，并关闭播放列表，避免状态组合异常
		if (this.state.isExpanded) {
			this.state.showPlaylist = false;
			this.state.isHidden = false;
		}
		this.broadcastState();
	}

	toggleHidden(): void {
		this.state.isHidden = !this.state.isHidden;
		// 保持与原先 usePlayerState.toggleHiddenUI 一致的联动行为：
		// 隐藏时收起播放器并关闭播放列表，防止展开 UI 悬挂在小球旁边
		if (this.state.isHidden) {
			this.state.isExpanded = false;
			this.state.showPlaylist = false;
		}
		this.broadcastState();
	}

	canSkip(): boolean {
		return this.state.playlist.length > 1;
	}

	setProgress(percent: number): void {
		const mode = musicPlayerConfig.mode ?? "youtube";
		if (mode === "youtube-iframe") {
			if (!this.ytPlayer) return;
			const newTime = percent * this.state.duration;
			this.ytPlayer.seekTo(newTime, true);
			this.state.currentTime = newTime;
			this.broadcastState();
			return;
		}
		if (!this.audio) {
			return;
		}
		const newTime = percent * this.state.duration;
		this.audio.currentTime = newTime;
		this.state.currentTime = newTime;
		this.broadcastState();
	}

	private broadcastState(): void {
		const snapshot = this.createSnapshot();

		for (const listener of this.listeners) {
			listener(snapshot);
		}

		if (typeof window === "undefined") {
			return;
		}
		window.dispatchEvent(
			new CustomEvent("music-sidebar:state", {
				detail: snapshot,
			}),
		);
	}

	destroy(): void {
		if (this.unregisterInteraction) {
			this.unregisterInteraction();
		}
		if (this.audio) {
			this.audio.pause();
			this.audio.src = "";
			this.audio = null;
		}
		if (this.ytPlayer) {
			try {
				this.ytPlayer.destroy();
			} catch (e) {
				// ignore
			}
			this.ytPlayer = null;
		}
		// Remove hidden player div if exists (only on client)
		if (typeof document !== 'undefined') {
			const playerDiv = document.getElementById('youtube-player-hidden');
			if (playerDiv) {
				playerDiv.remove();
			}
		}
		this.stopTimeUpdate();
		this.isInitialized = false;
	}
}

export const musicPlayerStore = new MusicPlayerStore();
