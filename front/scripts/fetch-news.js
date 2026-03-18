// scripts/fetch-news.js
// Runs daily via GitHub Actions — fetches news for each Frankfurter currency
// and writes to public/news/{CODE}.json

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

const CURRENCIES = {
  AUD: 'Australian dollar exchange rate',
  BGN: 'Bulgarian lev exchange rate',
  BRL: 'Brazilian real exchange rate',
  CAD: 'Canadian dollar exchange rate',
  CHF: 'Swiss franc exchange rate',
  CNY: 'Chinese yuan exchange rate',
  CZK: 'Czech koruna exchange rate',
  DKK: 'Danish krone exchange rate',
  EUR: 'euro exchange rate',
  GBP: 'British pound exchange rate',
  HKD: 'Hong Kong dollar exchange rate',
  HUF: 'Hungarian forint exchange rate',
  IDR: 'Indonesian rupiah exchange rate',
  ILS: 'Israeli shekel exchange rate',
  INR: 'Indian rupee exchange rate',
  ISK: 'Icelandic krona exchange rate',
  JPY: 'Japanese yen exchange rate',
  KRW: 'South Korean won exchange rate',
  MXN: 'Mexican peso exchange rate',
  MYR: 'Malaysian ringgit exchange rate',
  NOK: 'Norwegian krone exchange rate',
  NZD: 'New Zealand dollar exchange rate',
  PHP: 'Philippine peso exchange rate',
  PLN: 'Polish zloty exchange rate',
  RON: 'Romanian leu exchange rate',
  SEK: 'Swedish krona exchange rate',
  SGD: 'Singapore dollar exchange rate',
  THB: 'Thai baht exchange rate',
  TRY: 'Turkish lira exchange rate',
  USD: 'US dollar exchange rate',
  ZAR: 'South African rand exchange rate',
};

function fetchNews(query) {
  return new Promise((resolve, reject) => {
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=5&apiKey=${API_KEY}`;
    const options = { headers: { 'User-Agent': 'fxping.co news fetcher' } };
    https.get(url, options, (res) => {
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

      if (data.status === 'ok' && data.articles?.length > 0) {
        const articles = data.articles
          .filter(a => a.title && a.url && !a.title.includes('[Removed]'))
          .slice(0, 5)
          .map(a => ({
            title: a.title,
            source: a.source.name,
            url: a.url,
            publishedAt: a.publishedAt,
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
        console.log(`– ${code}: ${data.status} — ${data.message || 'no message'}`);
      }
    } catch (e) {
      console.error(`✗ ${code}: ${e.message}`);
    }

    await sleep(350);
  }

  console.log('Done.');
}

main();
