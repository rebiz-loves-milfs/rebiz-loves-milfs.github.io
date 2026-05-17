import fs from "node:fs";
import path from "node:path";

const ANILIST_API = "https://graphql.anilist.co";

const QUERY = `
query ($userName: String, $page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    pageInfo { hasNextPage currentPage }
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

interface AniListEntry {
	status: string;
	score: number;
	progress: number;
	media: {
		id: number;
		title: { english?: string; romaji?: string };
		episodes?: number;
		coverImage: { large?: string };
		description?: string;
		startDate: { year?: number };
		studios: { nodes: Array<{ name: string }> };
		genres: string[];
		siteUrl: string;
	};
}

function mapStatus(status: string): string {
	const map: Record<string, string> = {
		CURRENT: "watching",
		COMPLETED: "completed",
		PLANNING: "planned",
		PAUSED: "onhold",
		DROPPED: "dropped",
		REPEATING: "watching",
	};
	return map[status] ?? "planned";
}

async function fetchPage(
	username: string,
	page: number,
): Promise<{ entries: AniListEntry[]; hasNextPage: boolean }> {
	const res = await fetch(ANILIST_API, {
		method: "POST",
		headers: { "Content-Type": "application/json", Accept: "application/json" },
		body: JSON.stringify({
			query: QUERY,
			variables: { userName: username, page, perPage: 50 },
		}),
	});

	if (!res.ok) {
		throw new Error(`AniList API error: ${res.status}`);
	}

	const json = await res.json();
	const pageData = json?.data?.Page;
	return {
		entries: pageData?.mediaList ?? [],
		hasNextPage: pageData?.pageInfo?.hasNextPage ?? false,
	};
}

async function fetchAllEntries(username: string): Promise<AniListEntry[]> {
	const all: AniListEntry[] = [];
	let page = 1;
	let hasNext = true;

	while (hasNext) {
		const { entries, hasNextPage } = await fetchPage(username, page);
		all.push(...entries);
		hasNext = hasNextPage;
		page++;
	}

	return all;
}

async function main() {
	const username = process.argv[2];
	if (!username) {
		console.error("Usage: npx tsx src/scripts/fetch-anilist.ts <username>");
		process.exit(1);
	}

	console.log(`Fetching AniList data for user: ${username}`);

	const entries = await fetchAllEntries(username);

	const output = entries.map((entry, idx) => ({
		title:
			entry.media.title.english ||
			entry.media.title.romaji ||
			"Unknown",
		cover: entry.media.coverImage.large ?? "",
		link: entry.media.siteUrl ?? "",
		status: mapStatus(entry.status),
		rating: entry.score,
		progress: entry.progress,
		totalEpisodes: entry.media.episodes ?? 0,
		description: entry.media.description?.replace(/<[^>]*>/g, "") ?? "",
		year: String(entry.media.startDate.year ?? ""),
		studio: entry.media.studios.nodes[0]?.name ?? "",
		genre: entry.media.genres,
		id: idx,
	}));

	const outPath = path.join(process.cwd(), "src/data/anilist-data.json");
	fs.writeFileSync(outPath, JSON.stringify(output, null, 2));

	console.log(`Saved ${output.length} entries to src/data/anilist-data.json`);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
