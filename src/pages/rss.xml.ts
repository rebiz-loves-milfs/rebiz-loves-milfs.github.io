import type { APIRoute } from "astro";
import { getSortedPosts } from "../utils/content-utils";
import { SITE, AUTHOR } from "../config";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export const GET: APIRoute = async () => {
  const allPosts = await getSortedPosts();
  const now = new Date();

  const posts = allPosts
    .filter(
      (p) => !p.data.encrypted && !(p.data.unlockAt && now < p.data.unlockAt),
    )
    .slice(0, 20);

  const items = posts
    .map((p) => {
      const link = `${SITE.url}/posts/${p.id}/`;
      const title = escapeXml(p.data.title);
      const description = escapeXml(p.data.description ?? "");
      const pubDate = p.data.published.toUTCString();
      const guid = link;

      return `    <item>
      <title>${title}</title>
      <link>${link}</link>
      <description>${description}</description>
      <pubDate>${pubDate}</pubDate>
      <guid isPermaLink="true">${guid}</guid>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE.title)}</title>
    <link>${SITE.url}</link>
    <description>${escapeXml(SITE.description)}</description>
    <language>en</language>
    <lastBuildDate>${now.toUTCString()}</lastBuildDate>
    <managingEditor>${escapeXml(AUTHOR.name)}</managingEditor>
    <atom:link href="${SITE.url}/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
};
