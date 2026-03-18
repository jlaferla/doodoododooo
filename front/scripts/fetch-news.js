// scripts/fetch-news.js
// Runs daily via GitHub Actions — fetches news for major currencies only
// and writes to public/news/{CODE}.json
// Uses Marketaux API — financial news focused, free tier 100 req/day

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
  AUD: 'Australian dollar exchange rate',
  BRL: 'Brazilian real exchange rate',
  CAD: 'Canadian dollar exchange rate',
  CHF: 'Swiss franc exchange rate',
  CNY: 'Chinese yuan renminbi exchange rate',
  EUR: 'euro eurozone exchange rate',
  GBP: 'British pound sterling exchange rate',
  HKD: 'Hong Kong dollar exchange rate',
  INR: 'Indian rupee exchange rate',
  JPY: 'Japanese yen exchange rate',
  KRW: 'South Korean won exchange rate',
  MXN: 'Mexican peso exchange rate',
  SGD: 'Singapore dollar exchange rate',
  TRY: 'Turkish lira exchange rate',
  USD: 'US dollar Federal Reserve exchange rate',
  ZAR: 'South African rand exchange rate',
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

// 7 days ago for published_after filter
function sevenDaysAgo() {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return d.toISOString().split('T')[0] + 'T00:00:00';
}

function fetchNews(query) {
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams({
      search: query,
      language: 'en',
      limit: '5',
      published_after: sevenDaysAgo(),
      api_token: API_KEY,
    });
    const options = {
      hostname: 'api.marketaux.com',
      path: `/v1/news/all?${params.toString()}`,
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

      if (data.data?.length > 0) {
        const articles = data.data
          .filter(a => a.title && a.url)
          .slice(0, 5)
          .map(a => ({
            title: a.title,
            source: a.source,
            url: a.url,
            publishedAt: a.published_at,
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
        console.log(`– ${code}: no results — ${data.error?.message || data.message || 'empty response'}`);
      }
    } catch (e) {
      console.error(`✗ ${code}: ${e.message}`);
    }

    await sleep(200);
  }

  console.log('Done.');
}

main();
