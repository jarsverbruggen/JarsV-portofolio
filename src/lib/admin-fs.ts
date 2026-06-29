import fs from "fs";
import path from "path";
import matter from "gray-matter";

/**
 * Filesystem helpers for the local admin CMS. All paths are resolved against
 * the project root (process.cwd()). Every slug/filename coming from the client
 * is validated to prevent path traversal before it touches the filesystem.
 */

const ROOT = process.cwd();

export const CONTENT_JSON = path.join(ROOT, "src", "resources", "content.data.json");
export const BLOG_DIR = path.join(ROOT, "src", "app", "blog", "posts");
export const PROJECT_DIR = path.join(ROOT, "src", "app", "work", "projects");
export const PUBLIC_IMAGES = path.join(ROOT, "public", "images");

/** Allowed subfolders for uploads, mapped to their on-disk directory. */
export const UPLOAD_SUBDIRS: Record<string, string> = {
  uploads: "uploads",
  gallery: "gallery",
  projects: "projects",
  avatar: "avatar",
};

// --- sanitization --------------------------------------------------------

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Validate a slug is a safe single path segment. Throws on anything unsafe. */
export function safeSlug(slug: string): string {
  if (!slug || !/^[a-z0-9-]+$/.test(slug) || slug.includes("..")) {
    throw new Error("Invalid slug");
  }
  return slug;
}

const SAFE_NAME = /^[A-Za-z0-9._-]+$/;

export function safeFilename(name: string): string {
  if (!name || !SAFE_NAME.test(name) || name.includes("..")) {
    throw new Error("Invalid filename");
  }
  return name;
}

/** Ensure a resolved file path stays inside the expected directory. */
export function assertInside(dir: string, filePath: string): void {
  const resolved = path.resolve(filePath);
  const base = path.resolve(dir);
  if (resolved !== base && !resolved.startsWith(base + path.sep)) {
    throw new Error("Path escapes its directory");
  }
}

// --- JSON content --------------------------------------------------------

export function readContentJson(): unknown {
  const raw = fs.readFileSync(CONTENT_JSON, "utf-8");
  return JSON.parse(raw);
}

/** Atomic write: write to a temp file then rename over the target. */
export function writeContentJson(obj: unknown): void {
  const tmp = CONTENT_JSON + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(obj, null, 2) + "\n", "utf-8");
  fs.renameSync(tmp, CONTENT_JSON);
}

// --- MDX (blog / projects) ----------------------------------------------

export type MdxEntry = {
  slug: string;
  metadata: Record<string, unknown>;
  content: string;
};

export function listMdx(dir: string): MdxEntry[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => path.extname(f) === ".mdx")
    .map((f) => {
      const raw = fs.readFileSync(path.join(dir, f), "utf-8");
      const { data, content } = matter(raw);
      return { slug: path.basename(f, ".mdx"), metadata: data, content };
    })
    .sort((a, b) => {
      const da = String(a.metadata.publishedAt || "");
      const db = String(b.metadata.publishedAt || "");
      return db.localeCompare(da);
    });
}

export function readMdx(dir: string, slug: string): MdxEntry | null {
  safeSlug(slug);
  const filePath = path.join(dir, `${slug}.mdx`);
  assertInside(dir, filePath);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  return { slug, metadata: data, content };
}

export function mdxExists(dir: string, slug: string): boolean {
  safeSlug(slug);
  return fs.existsSync(path.join(dir, `${slug}.mdx`));
}

export function writeMdx(
  dir: string,
  slug: string,
  frontmatter: Record<string, unknown>,
  body: string,
): void {
  safeSlug(slug);
  const filePath = path.join(dir, `${slug}.mdx`);
  assertInside(dir, filePath);
  // Strip empty/undefined frontmatter values so the YAML stays clean.
  const clean: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(frontmatter)) {
    if (v === undefined || v === null || v === "") continue;
    if (Array.isArray(v) && v.length === 0) continue;
    clean[k] = v;
  }
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const file = matter.stringify(body ?? "", clean);
  const tmp = filePath + ".tmp";
  fs.writeFileSync(tmp, file, "utf-8");
  fs.renameSync(tmp, filePath);
}

export function deleteMdx(dir: string, slug: string): boolean {
  safeSlug(slug);
  const filePath = path.join(dir, `${slug}.mdx`);
  assertInside(dir, filePath);
  if (!fs.existsSync(filePath)) return false;
  fs.unlinkSync(filePath);
  return true;
}

// --- uploads -------------------------------------------------------------

const MIME_EXT: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

export function isAllowedImageType(mime: string): boolean {
  return Object.prototype.hasOwnProperty.call(MIME_EXT, mime);
}

export function extForMime(mime: string): string {
  return MIME_EXT[mime] || "";
}

export function resolveUploadDir(subdir: string): { dir: string; urlBase: string } {
  const key = UPLOAD_SUBDIRS[subdir] ? subdir : "uploads";
  const dir = path.join(PUBLIC_IMAGES, UPLOAD_SUBDIRS[key]);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return { dir, urlBase: `/images/${UPLOAD_SUBDIRS[key]}` };
}
