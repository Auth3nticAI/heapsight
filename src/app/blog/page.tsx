import type { Metadata } from "next";
import Link from "next/link";
import { getBlogPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog | HeapSight",
  description:
    "Articles about learning C++, game development, and systems programming.",
  openGraph: {
    title: "Blog | HeapSight",
    description:
      "Articles about learning C++, game development, and systems programming.",
    siteName: "HeapSight",
  },
};

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogIndexPage() {
  const posts = getBlogPosts();

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-white/[0.05]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <Link
            href="/"
            className="text-xs font-mono text-[#AFBCD5]/50 hover:text-primary transition-colors mb-8 inline-block"
          >
            &larr; HeapSight
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Blog
          </h1>
          <p className="text-base text-[#AFBCD5]/70">
            Articles about C++, game development, and systems programming.
          </p>
        </div>
      </div>

      {/* Post list */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        {posts.length === 0 ? (
          <p className="text-sm font-mono text-[#AFBCD5]/50">
            No posts yet. Check back soon.
          </p>
        ) : (
          <div className="space-y-px">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group block py-8 border-b border-white/[0.05] hover:border-primary/30 transition-colors"
              >
                {/* Tags */}
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <h2 className="text-lg sm:text-xl font-bold text-white group-hover:text-primary transition-colors mb-2 leading-snug">
                  {post.title}
                </h2>

                <p className="text-sm text-[#AFBCD5]/70 mb-4 leading-relaxed line-clamp-2">
                  {post.description}
                </p>

                <div className="flex items-center gap-3 text-[10px] font-mono text-[#AFBCD5]/40">
                  <span>{formatDate(post.date)}</span>
                  <span className="w-1 h-1 rounded-full bg-white/20 inline-block" />
                  <span>{post.readingTime}</span>
                  <span className="w-1 h-1 rounded-full bg-white/20 inline-block" />
                  <span>{post.author}</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 p-6 rounded-2xl border border-white/[0.08] bg-[#071528] text-center">
          <p className="text-sm font-semibold text-white mb-1">
            Ready to learn C++?
          </p>
          <p className="text-xs text-[#AFBCD5]/60 mb-4">
            Start with 5 free lessons on any path. No credit card required.
          </p>
          <Link
            href="/signup"
            className="inline-block px-6 py-2.5 bg-gradient-to-r from-[#246BFD] to-[#0040C3] text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            Start Building Free &rarr;
          </Link>
        </div>
      </div>
    </main>
  );
}
