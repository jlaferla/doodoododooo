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
  AUD: '"Australian dollar" OR "AUD" forex',
  BGN: '"Bulgarian lev" OR "BGN" forex',
  BRL: '"Brazilian real" OR "BRL" forex',
  CAD: '"Canadian dollar" OR "CAD" forex',
  CHF: '"Swiss franc" OR "CHF" forex',
  CNY: '"Chinese yuan" OR "renminbi" OR "CNY" forex',
  CZK: '"Czech koruna" OR "CZK" forex',
  DKK: '"Danish krone" OR "DKK" forex',
  EUR: '"euro" OR "EUR" OR "eurozone" exchange rate',
  GBP: '"pound sterling" OR "GBP" OR "British pound" forex',
  HKD: '"Hong Kong dollar" OR "HKD" forex',
  HUF: '"Hungarian forint" OR "HUF" forex',
  IDR: '"Indonesian rupiah" OR "IDR" forex',
  ILS: '"Israeli shekel" OR "ILS" forex',
  INR: '"Indian rupee" OR "INR" forex',
  ISK: '"Icelandic krona" OR "ISK" forex',
  JPY: '"Japanese yen" OR "JPY" forex',
  KRW: '"South Korean won" OR "KRW" forex',
  MXN: '"Mexican peso" OR "MXN" forex',
  MYR: '"Malaysian ringgit" OR "MYR" forex',
  NOK: '"Norwegian krone" OR "NOK" forex',
  NZD: '"New Zealand dollar" OR "NZD" forex',
  PHP: '"Philippine peso" OR "PHP" forex',
  PLN: '"Polish zloty" OR "PLN" forex',
  RON: '"Romanian leu" OR "RON" forex',
  SEK: '"Swedish krona" OR "SEK" forex',
  SGD: '"Singapore dollar" OR "SGD" forex',
  THB: '"Thai baht" OR "THB" forex',
  TRY: '"Turkish lira" OR "TRY" forex',
  USD: '"US dollar" OR "USD" OR "Federal Reserve" forex',
  ZAR: '"South African rand" OR "ZAR" forex',
};

function fetchNews(query) {
  return new Promise((resolve, reject) => {
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=10&apiKey=${API_KEY}`;
    https.get(url, (res) => {
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
          console.log(`– ${code}: filtered to 0 articles, keeping existing`);
        }
      } else {
        console.log(`– ${code}: no results (${data.status || 'unknown'}), keeping existing`);
      }
    } catch (e) {
      console.error(`✗ ${code}: ${e.message}`);
    }

    await sleep(350); // stay within rate limits
  }

  console.log('Done.');
}

main();
