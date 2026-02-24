const fs = require('fs');
const path = require('path');

function getBlogSlugs() {
  const dir = path.join(process.cwd(), 'src/content/blog');
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.mdx') || f.endsWith('.md'))
    .map((f) => f.replace(/\.mdx?$/, ''));
}

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://heapsight.com',
  generateRobotsTxt: true,
  additionalPaths: async () => {
    const slugs = getBlogSlugs();
    return [
      { loc: '/blog', changefreq: 'weekly', priority: 0.8 },
      ...slugs.map((slug) => ({
        loc: `/blog/${slug}`,
        changefreq: 'monthly',
        priority: 0.7,
      })),
    ];
  },
  exclude: [
    '/dashboard',
    '/dashboard/*',
    '/settings',
    '/settings/*',
    '/lesson',
    '/lesson/*',
    '/account',
    '/account/*',
    '/progress',
    '/progress/*',
    '/upgrade',
    '/upgrade/*',
    '/upgrade/success',
    '/api',
    '/api/*',
    '/test-canvas',
    '/leaderboard',
    '/practice',
    '/learn',
    '/paths',
    '/onboarding',
  ],
  robotsTxtOptions: {
    policies: [
      { userAgent: '*', allow: '/' },
      {
        userAgent: '*',
        disallow: [
          '/dashboard',
          '/settings',
          '/lesson',
          '/account',
          '/progress',
          '/upgrade',
          '/api',
        ],
      },
    ],
  },
};
