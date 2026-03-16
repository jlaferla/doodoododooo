// generate-sitemap.js — run via `npm run predeploy` before every deploy
// Writes public/sitemap.xml from currencyMapping.json + blogPosts slugs

const fs   = require('fs');
const path = require('path');

const BASE_URL = 'https://fxping.co';
const today    = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

// ── Currency codes ───────────────────────────────────────────────────────────
const currencyMapping = require('./src/currencyMapping.json');
const currencyCodes   = Object.keys(currencyMapping);

// ── Blog slugs (only posts whose date <= today) ───────────────────────────────
const blogSource  = fs.readFileSync(path.join(__dirname, 'src/blogPosts.js'), 'utf8');
const postMatches = [...blogSource.matchAll(/slug:\s*["'`]([^"'`]+)["'`][\s\S]*?date:\s*["'`]([^"'`]+)["'`]/g)];
const blogSlugs   = postMatches.filter(m => m[2] <= today).map(m => m[1]);

// ── Static pages ─────────────────────────────────────────────────────────────
const staticPages = [
  { url: '/',        priority: '1.0', changefreq: 'daily'   },
  { url: '/rates',   priority: '0.9', changefreq: 'daily'   },
  { url: '/blog',    priority: '0.8', changefreq: 'weekly'  },
  { url: '/fee-checker', priority: '0.7', changefreq: 'monthly' },
  { url: '/about',   priority: '0.5', changefreq: 'monthly' },
  { url: '/privacy', priority: '0.3', changefreq: 'yearly'  },
  { url: '/terms',   priority: '0.3', changefreq: 'yearly'  },
];

// ── Build XML ─────────────────────────────────────────────────────────────────
function urlEntry({ loc, priority, changefreq }) {
  return [
    '  <url>',
    `    <loc>${loc}</loc>`,
    `    <lastmod>${today}</lastmod>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    '  </url>',
  ].join('\n');
}

const entries = [
  // Static pages
  ...staticPages.map(p => urlEntry({
    loc: `${BASE_URL}${p.url}`,
    priority: p.priority,
    changefreq: p.changefreq,
  })),

  // Blog posts
  ...blogSlugs.map(slug => urlEntry({
    loc: `${BASE_URL}/blog/${slug}`,
    priority: '0.7',
    changefreq: 'monthly',
  })),

  // Currency detail pages
  ...currencyCodes.map(code => urlEntry({
    loc: `${BASE_URL}/currency/${code}`,
    priority: '0.6',
    changefreq: 'daily',
  })),
];

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...entries,
  '</urlset>',
].join('\n');

const outPath = path.join(__dirname, 'public/sitemap.xml');
fs.writeFileSync(outPath, xml, 'utf8');

console.log(`✓ sitemap.xml written — ${staticPages.length} static + ${blogSlugs.length} blog + ${currencyCodes.length} currency = ${entries.length} URLs`);
