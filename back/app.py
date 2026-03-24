from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import threading
import time
import os
import psycopg2
import psycopg2.extras
import psycopg2.pool
from datetime import datetime, timedelta
from apscheduler.schedulers.background import BackgroundScheduler

app = Flask(__name__)
CORS(app)

EXCHANGE_API_URL = "https://v6.exchangerate-api.com/v6/c6e4dcf788ed11a76951cb0f/latest/USD"
exchange_data = {}

# ─────────────────────────────────────────
# Database helpers
# ─────────────────────────────────────────

_pool = None

def init_pool():
    """Create a persistent connection pool at startup."""
    global _pool
    database_url = os.environ.get("DATABASE_URL", "")
    if not database_url:
        return
    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)
    _pool = psycopg2.pool.SimpleConnectionPool(1, 5, database_url)
    print("Connection pool initialised.")

def get_db():
    """Return a connection from the pool (or a fresh one if pool unavailable)."""
    if _pool:
        return _pool.getconn()
    database_url = os.environ.get("DATABASE_URL")
    if not database_url:
        raise RuntimeError("DATABASE_URL environment variable is not set.")
    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)
    return psycopg2.connect(database_url)

def return_db(conn):
    """Return a connection to the pool."""
    if _pool and conn:
        _pool.putconn(conn)


def init_db():
    """Create the rates table if it doesn't exist. Called once on startup."""
    try:
        conn = get_db()
        cur = conn.cursor()
        cur.execute("""
            CREATE TABLE IF NOT EXISTS daily_rates (
                date        DATE        NOT NULL,
                currency    VARCHAR(10) NOT NULL,
                rate        NUMERIC(20, 8) NOT NULL,
                PRIMARY KEY (date, currency)
            );
        """)
        conn.commit()
        cur.close()
        return_db(conn)
        print("Database initialised.")
    except Exception as e:
        print("Database init error:", e)


def store_daily_rates():
    """
    Fetch today's USD-base rates and write them to Postgres.
    Skips if today's data already exists (safe to call multiple times).
    """
    global exchange_data
    try:
        # Use in-memory data if available, otherwise fetch fresh
        if exchange_data and exchange_data.get("conversion_rates"):
            rates = exchange_data["conversion_rates"]
        else:
            response = requests.get(EXCHANGE_API_URL, timeout=10)
            response.raise_for_status()
            rates = response.json().get("conversion_rates", {})

        if not rates:
            print("store_daily_rates: no rates available.")
            return

        today = datetime.utcnow().date()
        conn = get_db()
        cur = conn.cursor()

        rows = [(today, currency, rate) for currency, rate in rates.items()]
        psycopg2.extras.execute_values(
            cur,
            """
            INSERT INTO daily_rates (date, currency, rate)
            VALUES %s
            ON CONFLICT (date, currency) DO NOTHING
            """,
            rows
        )

        conn.commit()
        cur.close()
        return_db(conn)
        print(f"store_daily_rates: stored {len(rows)} rates for {today}.")
    except Exception as e:
        print("store_daily_rates error:", e)


# ─────────────────────────────────────────
# Live rate polling (unchanged logic)
# ─────────────────────────────────────────

def initial_update():
    global exchange_data
    try:
        response = requests.get(EXCHANGE_API_URL)
        if response.status_code == 200:
            exchange_data = response.json()
            print("Initial exchange rates loaded.")
        else:
            print("Error fetching initial rates:", response.status_code)
    except Exception as e:
        print("Exception during initial API call:", e)


def update_exchange_rates():
    global exchange_data
    while True:
        try:
            response = requests.get(EXCHANGE_API_URL)
            if response.status_code == 200:
                exchange_data = response.json()
                print("Exchange rates updated.")
            else:
                print("Error fetching rates:", response.status_code)
        except Exception as e:
            print("Exception during API call:", e)
        time.sleep(7200)  # Update every 2 hours


# ─────────────────────────────────────────
# Routes
# ─────────────────────────────────────────

@app.route('/rates', methods=['GET'])
def get_rates():
    if not exchange_data:
        return jsonify({"error": "Exchange rate data is not yet available."}), 503
    return jsonify(exchange_data)


@app.route('/rates/historical', methods=['GET'])
def get_historical_rates():
    """
    Returns all currency rates for a specific date.

    Query params:
      date - YYYY-MM-DD (required)

    Response: { "base_code": "USD", "conversion_rates": { "EUR": 0.92, ... } }
    """
    date_str = request.args.get('date')
    if not date_str:
        return jsonify({"error": "date parameter required (YYYY-MM-DD)"}), 400

    try:
        conn = get_db()
        cur = conn.cursor()
        cur.execute("SELECT currency, rate FROM daily_rates WHERE date = %s::date", (date_str,))
        rows = cur.fetchall()
        cur.close()
        return_db(conn)
    except RuntimeError as e:
        return jsonify({"error": str(e)}), 503
    except Exception as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500

    if not rows:
        return jsonify({"error": f"No data available for {date_str}"}), 404

    return jsonify({
        "base_code": "USD",
        "conversion_rates": {row[0]: float(row[1]) for row in rows}
    })


@app.route('/history', methods=['GET'])
def get_history():
    """
    Returns daily historical rates for a currency pair derived from USD base.

    Query params:
      base   - the base currency code  (e.g. USD, EUR, GBP)  default: USD
      symbol - the target currency     (e.g. EUR, JPY, AED)  required
      from   - start date YYYY-MM-DD                         default: 90 days ago
      to     - end date   YYYY-MM-DD                         default: today

    Response: { "base": "EUR", "symbol": "GBP", "rates": { "2025-01-01": 0.8523, ... } }

    Derivation: cross_rate = usd_to_symbol / usd_to_base
    (If base is USD, usd_to_base is always 1.)
    """
    base   = request.args.get("base",   "USD").upper()
    symbol = request.args.get("symbol", "").upper()
    date_from = request.args.get("from", (datetime.utcnow().date() - timedelta(days=90)).isoformat())
    date_to   = request.args.get("to",   datetime.utcnow().date().isoformat())

    if not symbol:
        return jsonify({"error": "symbol parameter is required"}), 400

    try:
        conn = get_db()
        cur = conn.cursor()

        # Fetch USD→symbol and USD→base rows in one query
        cur.execute("""
            SELECT date, currency, rate
            FROM daily_rates
            WHERE date BETWEEN %s AND %s
              AND currency = ANY(%s)
            ORDER BY date ASC
        """, (date_from, date_to, [base, symbol]))

        rows = cur.fetchall()
        cur.close()
        return_db(conn)

        # Organise into {date: {currency: rate}}
        by_date = {}
        for date, currency, rate in rows:
            key = date.isoformat()
            if key not in by_date:
                by_date[key] = {}
            by_date[key][currency] = float(rate)

        # Derive cross rate for each date
        result = {}
        for date_str, day_rates in sorted(by_date.items()):
            usd_to_symbol = day_rates.get(symbol)
            usd_to_base   = day_rates.get(base, 1.0) if base != "USD" else 1.0

            if usd_to_symbol is None or usd_to_base == 0:
                continue  # Skip dates with incomplete data

            result[date_str] = round(usd_to_symbol / usd_to_base, 8)

        return jsonify({
            "base":   base,
            "symbol": symbol,
            "from":   date_from,
            "to":     date_to,
            "rates":  result
        })

    except RuntimeError as e:
        # DATABASE_URL not set — return a clear message during local dev
        return jsonify({"error": str(e)}), 503
    except Exception as e:
        print("History endpoint error:", e)
        return jsonify({"error": "Failed to retrieve historical data."}), 500


# ─────────────────────────────────────────
# Startup
# ─────────────────────────────────────────

if __name__ == '__main__':
    initial_update()

    # Initialise DB table (no-op if already exists)
    if os.environ.get("DATABASE_URL"):
        init_pool()
        init_db()
        store_daily_rates()  # Store today's rates immediately on boot

        # Schedule daily storage at midnight UTC
        scheduler = BackgroundScheduler()
        scheduler.add_job(store_daily_rates, 'cron', hour=0, minute=5)
        scheduler.start()
    else:
        print("DATABASE_URL not set — history storage disabled (local dev mode).")

    thread = threading.Thread(target=update_exchange_rates, daemon=True)
    thread.start()

    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)