import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getBlogPosts, getBlogPost } from "@/lib/blog";

// Pre-render all known blog posts at build time
export async function generateStaticParams() {
  const posts = getBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return { title: "Post Not Found | HeapSight" };

  return {
    title: `${post.frontmatter.title} | HeapSight Blog`,
    description: post.frontmatter.description,
    openGraph: {
      title: post.frontmatter.title,
      description: post.frontmatter.description,
      siteName: "HeapSight",
      type: "article",
      publishedTime: post.frontmatter.date,
      authors: [post.frontmatter.author],
      ...(post.frontmatter.image ? { images: [post.frontmatter.image] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: post.frontmatter.title,
      description: post.frontmatter.description,
    },
  };
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  // Dynamically import the compiled MDX module
  // webpack creates a context for all .mdx files in this path at build time
  const { default: MDXContent } = await import(
    `../../../content/blog/${slug}.mdx`
  );

  return (
    <main className="min-h-screen bg-background">
      {/* Back nav */}
      <div className="border-b border-white/[0.05]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4">
          <Link
            href="/blog"
            className="text-xs font-mono text-[#AFBCD5]/50 hover:text-primary transition-colors"
          >
            &larr; All Posts
          </Link>
        </div>
      </div>

      {/* Article */}
      <article className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        {/* Tags */}
        {post.frontmatter.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {post.frontmatter.tags.map((tag) => (
              <span
                key={tag}
                className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
          {post.frontmatter.title}
        </h1>

        {/* Meta */}
        <div className="flex items-center gap-3 text-[10px] font-mono text-[#AFBCD5]/40 mb-10 pb-8 border-b border-white/[0.05]">
          <span>{formatDate(post.frontmatter.date)}</span>
          <span className="w-1 h-1 rounded-full bg-white/20 inline-block" />
          <span>{post.frontmatter.readingTime}</span>
          <span className="w-1 h-1 rounded-full bg-white/20 inline-block" />
          <span>{post.frontmatter.author}</span>
        </div>

        {/* MDX Content */}
        <div
          className="
            text-[#AFBCD5]/90 leading-relaxed
            [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:text-white [&_h1]:mt-12 [&_h1]:mb-4 [&_h1]:leading-tight
            [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-white [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:leading-snug
            [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-white [&_h3]:mt-8 [&_h3]:mb-2
            [&_p]:mb-5 [&_p]:text-[15px]
            [&_ul]:mb-5 [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_ul>li]:list-disc [&_ul>li]:text-[15px]
            [&_ol]:mb-5 [&_ol]:pl-5 [&_ol]:space-y-1.5 [&_ol>li]:list-decimal [&_ol>li]:text-[15px]
            [&_strong]:text-white [&_strong]:font-semibold
            [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 [&_a]:hover:opacity-80
            [&_code]:font-mono [&_code]:text-[13px] [&_code]:bg-white/[0.07] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[#9CD323]
            [&_pre]:bg-[#040B10] [&_pre]:border [&_pre]:border-white/[0.08] [&_pre]:rounded-xl [&_pre]:p-5 [&_pre]:mb-5 [&_pre]:overflow-x-auto
            [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-[#AFBCD5]
            [&_blockquote]:border-l-2 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-[#AFBCD5]/60 [&_blockquote]:mb-5
            [&_hr]:border-white/[0.08] [&_hr]:my-8
          "
        >
          <MDXContent />
        </div>

        {/* CTA */}
        <div className="mt-16 pt-8 border-t border-white/[0.05]">
          <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#071528] text-center">
            <p className="text-sm font-semibold text-white mb-1">
              Ready to start learning C++?
            </p>
            <p className="text-xs text-[#AFBCD5]/60 mb-4">
              5 free lessons on every path. No credit card, no local setup.
            </p>
            <Link
              href="/signup"
              className="inline-block px-6 py-2.5 bg-gradient-to-r from-[#246BFD] to-[#0040C3] text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              Start Building Free &rarr;
            </Link>
          </div>
        </div>
      </article>
    </main>
  );
}
