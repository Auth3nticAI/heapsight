import createMDX from "@next/mdx";
import remarkFrontmatter from "remark-frontmatter";

const withMDX = createMDX({
  options: {
    remarkPlugins: [remarkFrontmatter],
    rehypePlugins: [],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
  transpilePackages: ["three"],
};

export default withMDX(nextConfig);
