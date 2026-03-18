// scripts/fetch-news.js
// Runs daily via GitHub Actions — fetches news for major currencies only
// and writes to public/news/{CODE}.json
// Uses The Guardian API — free, 5000 req/day, works server-side, recent articles

const https = require('https');
const fs = require('fs');
const path = require('path');

const API_KEY = process.env.NEWS_API_KEY;
const NEWS_DIR = path.join(__dirname, '..', 'public', 'news');

if (!API_KEY) {
  console.error('NEWS_API_KEY not set');
  process.exit(1);
}

if (!fs.existsSync(NEWS_DIR)) {
  fs.mkdirSync(NEWS_DIR, { recursive: true });
}

// Major currencies only — ones with enough financial news coverage
const CURRENCIES = {
  AUD: 'Australian dollar AUD',
  BRL: 'Brazilian real BRL',
  CAD: 'Canadian dollar CAD',
  CHF: 'Swiss franc CHF',
  CNY: 'Chinese yuan CNY',
  EUR: 'euro EUR',
  GBP: 'pound sterling GBP',
  HKD: 'Hong Kong dollar HKD',
  INR: 'Indian rupee INR',
  JPY: 'Japanese yen JPY',
  KRW: 'South Korean won KRW',
  MXN: 'Mexican peso MXN',
  SGD: 'Singapore dollar SGD',
  TRY: 'Turkish lira TRY',
  USD: 'US dollar USD',
  ZAR: 'South African rand ZAR',
};

// Delete stale JSON files for currencies no longer in the list
const existing = fs.readdirSync(NEWS_DIR).filter(f => f.endsWith('.json'));
for (const file of existing) {
  const code = file.replace('.json', '');
  if (!CURRENCIES[code]) {
    fs.unlinkSync(path.join(NEWS_DIR, file));
    console.log(`🗑 Removed stale file: ${file}`);
  }
}

function fetchNews(query) {
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams({
      q: query,
      'api-key': API_KEY,
      'order-by': 'newest',
      'page-size': '5',
      'show-fields': 'trailText',
      'section': 'business',
    });
    const options = {
      hostname: 'content.guardianapis.com',
      path: `/search?${params.toString()}`,
      headers: { 'User-Agent': 'fxping.co/1.0' },
    };
    https.get(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log(`Fetching news for ${Object.keys(CURRENCIES).length} currencies...`);

  for (const [code, query] of Object.entries(CURRENCIES)) {
    try {
      const data = await fetchNews(query);

      if (data.response?.status === 'ok' && data.response.results?.length > 0) {
        const articles = data.response.results
          .filter(a => a.webTitle && a.webUrl)
          .slice(0, 5)
          .map(a => ({
            title: a.webTitle,
            source: 'The Guardian',
            url: a.webUrl,
            publishedAt: a.webPublicationDate,
          }));

        if (articles.length > 0) {
          fs.writeFileSync(
            path.join(NEWS_DIR, `${code}.json`),
            JSON.stringify({ fetchedAt: new Date().toISOString(), currency: code, articles }, null, 2)
          );
          console.log(`✓ ${code}: ${articles.length} articles`);
        } else {
          console.log(`– ${code}: filtered to 0, keeping existing`);
        }
      } else {
        console.log(`– ${code}: ${data.response?.status || 'error'} — ${data.message || 'no results'}`);
      }
    } catch (e) {
      console.error(`✗ ${code}: ${e.message}`);
    }

    await sleep(200);
  }

  console.log('Done.');
}

main();
