// Helpers to group blog posts into "series" (a playlist of ordered parts).
// A post belongs to a series when its frontmatter `series` name is set; parts
// are ordered by `part` (then by date). Posts without a series stay standalone.

import type { getPosts } from "@/utils/utils";

export type BlogPost = ReturnType<typeof getPosts>[number];

export type BlogEntry =
  | { type: "post"; post: BlogPost; date: number }
  | { type: "series"; name: string; cover?: string; parts: BlogPost[]; date: number };

function time(post: BlogPost): number {
  return new Date(post.metadata.publishedAt).getTime();
}

/** Order the parts of a single series: by `part` number, then by date. */
function sortParts(parts: BlogPost[]): BlogPost[] {
  return [...parts].sort((a, b) => {
    const pa = a.metadata.part;
    const pb = b.metadata.part;
    if (typeof pa === "number" && typeof pb === "number" && pa !== pb) return pa - pb;
    if (typeof pa === "number" && typeof pb !== "number") return -1;
    if (typeof pb === "number" && typeof pa !== "number") return 1;
    return time(a) - time(b); // oldest first within a series
  });
}

/**
 * Build the /blog listing: each series collapses into one entry (ordered parts),
 * standalone posts stay as their own entry. Entries are sorted newest-first,
 * where a series' date is its most recent part.
 */
export function buildBlogEntries(posts: BlogPost[]): BlogEntry[] {
  const seriesMap = new Map<string, BlogPost[]>();
  const entries: BlogEntry[] = [];

  for (const post of posts) {
    const name = (post.metadata.series || "").trim();
    if (name) {
      const group = seriesMap.get(name) ?? [];
      group.push(post);
      seriesMap.set(name, group);
    } else {
      entries.push({ type: "post", post, date: time(post) });
    }
  }

  for (const [name, group] of seriesMap) {
    const parts = sortParts(group);
    const cover = parts.find((p) => p.metadata.image)?.metadata.image || undefined;
    const date = Math.max(...parts.map(time)); // most recent activity in the series
    entries.push({ type: "series", name, cover, parts, date });
  }

  return entries.sort((a, b) => b.date - a.date);
}

/** Ordered parts of the series a given post belongs to (empty if standalone). */
export function getSeries(posts: BlogPost[], name?: string): BlogPost[] {
  const series = (name || "").trim();
  if (!series) return [];
  return sortParts(posts.filter((p) => (p.metadata.series || "").trim() === series));
}
