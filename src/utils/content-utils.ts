import { getCollection, type CollectionEntry } from "astro:content";

type Post = CollectionEntry<"posts">;

export async function getSortedPosts(): Promise<Post[]> {
  const posts = await getCollection("posts", ({ data }) =>
    import.meta.env.PROD ? !data.draft : true,
  );
  return posts.sort(
    (a, b) => b.data.published.getTime() - a.data.published.getTime(),
  );
}

export interface Tag {
  name: string;
  count: number;
}

export async function getTagList(): Promise<Tag[]> {
  const posts = await getCollection("posts", ({ data }) =>
    import.meta.env.PROD ? !data.draft : true,
  );
  const countMap: Record<string, number> = {};
  for (const post of posts) {
    for (const tag of post.data.tags) {
      countMap[tag] = (countMap[tag] ?? 0) + 1;
    }
  }
  return Object.entries(countMap)
    .sort(([a], [b]) => a.toLowerCase().localeCompare(b.toLowerCase()))
    .map(([name, count]) => ({ name, count }));
}

export interface Category {
  name: string;
  count: number;
}

export async function getCategoryList(): Promise<Category[]> {
  const posts = await getCollection("posts", ({ data }) =>
    import.meta.env.PROD ? !data.draft : true,
  );
  const countMap: Record<string, number> = {};
  for (const post of posts) {
    const cat = post.data.category?.trim() || "Uncategorized";
    countMap[cat] = (countMap[cat] ?? 0) + 1;
  }
  return Object.entries(countMap)
    .sort(([a], [b]) => a.toLowerCase().localeCompare(b.toLowerCase()))
    .map(([name, count]) => ({ name, count }));
}

export interface Series {
  name: string;
  count: number;
}

export async function getSeriesList(): Promise<Series[]> {
  const posts = await getCollection("posts", ({ data }) =>
    import.meta.env.PROD ? !data.draft : true,
  );
  const countMap: Record<string, number> = {};
  for (const post of posts) {
    const s = post.data.series?.trim();
    if (s) countMap[s] = (countMap[s] ?? 0) + 1;
  }
  return Object.entries(countMap)
    .sort(([a], [b]) => a.toLowerCase().localeCompare(b.toLowerCase()))
    .map(([name, count]) => ({ name, count }));
}

export async function getPostsBySeries(name: string): Promise<Post[]> {
  const posts = await getCollection("posts", ({ data }) =>
    import.meta.env.PROD ? !data.draft : true,
  );
  return posts
    .filter((p) => p.data.series?.trim() === name)
    .sort((a, b) => (a.data.seriesOrder ?? 0) - (b.data.seriesOrder ?? 0));
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(date: Date): string {
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function groupPostsByYear(posts: Post[]): Map<number, Post[]> {
  const map = new Map<number, Post[]>();
  for (const post of posts) {
    const year = post.data.published.getFullYear();
    if (!map.has(year)) map.set(year, []);
    map.get(year)!.push(post);
  }
  return map;
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export function calcReadTime(text: string): string {
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / 200);
  return `${minutes} min`;
}

export function getPostReadTime(
  frontmatterReadTime: string,
  bodyText: string,
): string {
  if (frontmatterReadTime && frontmatterReadTime.trim())
    return frontmatterReadTime;
  return calcReadTime(bodyText);
}
