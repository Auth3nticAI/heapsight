import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  tags: string[];
  image?: string;
  readingTime: string;
}

const BLOG_DIR = path.join(process.cwd(), "src/content/blog");

export function getBlogPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG_DIR)) return [];

  const files = fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"));

  const posts = files.map((filename) => {
    const slug = filename.replace(/\.mdx?$/, "");
    const filepath = path.join(BLOG_DIR, filename);
    const raw = fs.readFileSync(filepath, "utf-8");
    const { data, content } = matter(raw);
    const rt = readingTime(content);

    return {
      slug,
      title: (data.title as string) || slug,
      description: (data.description as string) || "",
      date: (data.date as string) || "",
      author: (data.author as string) || "HeapSight Team",
      tags: (data.tags as string[]) || [],
      image: data.image as string | undefined,
      readingTime: rt.text,
    };
  });

  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getBlogPost(
  slug: string
): { frontmatter: BlogPost; content: string } | null {
  // Try .mdx first, then .md
  const mdxPath = path.join(BLOG_DIR, `${slug}.mdx`);
  const mdPath = path.join(BLOG_DIR, `${slug}.md`);
  const filepath = fs.existsSync(mdxPath)
    ? mdxPath
    : fs.existsSync(mdPath)
    ? mdPath
    : null;

  if (!filepath) return null;

  const raw = fs.readFileSync(filepath, "utf-8");
  const { data, content } = matter(raw);
  const rt = readingTime(content);

  return {
    frontmatter: {
      slug,
      title: (data.title as string) || slug,
      description: (data.description as string) || "",
      date: (data.date as string) || "",
      author: (data.author as string) || "HeapSight Team",
      tags: (data.tags as string[]) || [],
      image: data.image as string | undefined,
      readingTime: rt.text,
    },
    content,
  };
}
