import type { MDXComponents } from "mdx/types";

// This file is required by @next/mdx when using the App Router.
// It lets you customise how MDX elements are rendered globally.
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return { ...components };
}
