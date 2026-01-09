import os
import threading
import time
from pathlib import Path

import requests
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS

# -----------------------------------------------------------------------------
# Flask app
# -----------------------------------------------------------------------------
APP_DIR = Path(__file__).resolve().parent
REPO_ROOT = APP_DIR.parent
FRONTEND_BUILD_DIR = REPO_ROOT / "front" / "build"

app = Flask(__name__, static_folder=str(FRONTEND_BUILD_DIR / "assets"), static_url_path="/assets")
CORS(app)

# -----------------------------------------------------------------------------
# Exchange rates updater
# -----------------------------------------------------------------------------
# Recommended: set EXCHANGE_RATE_API_KEY as an environment variable in production.
EXCHANGE_RATE_API_KEY = os.environ.get("EXCHANGE_RATE_API_KEY", "c6e4dcf788ed11a76951cb0f")
BASE_CURRENCY = os.environ.get("BASE_CURRENCY", "USD")
EXCHANGE_API_URL = f"https://v6.exchangerate-api.com/v6/{EXCHANGE_RATE_API_KEY}/latest/{BASE_CURRENCY}"

UPDATE_INTERVAL_SECONDS = int(os.environ.get("UPDATE_INTERVAL_SECONDS", "7200"))  # 2 hours default

exchange_data = {}
_started = False
_start_lock = threading.Lock()


def _fetch_once() -> None:
    """Fetch rates once and store them in memory."""
    global exchange_data
    try:
        response = requests.get(EXCHANGE_API_URL, timeout=20)
        if response.status_code == 200:
            exchange_data = response.json()
            app.logger.info("Exchange rates updated.")
        else:
            app.logger.warning("Error fetching rates: %s", response.status_code)
    except Exception as e:
        app.logger.exception("Exception during API call: %s", e)


def _update_loop() -> None:
    while True:
        _fetch_once()
        time.sleep(UPDATE_INTERVAL_SECONDS)


def ensure_updater_started() -> None:
    """Start background updater exactly once per process."""
    global _started
    if _started:
        return
    with _start_lock:
        if _started:
            return
        # Do an initial fetch synchronously so the first request can succeed.
        _fetch_once()
        t = threading.Thread(target=_update_loop, daemon=True)
        t.start()
        _started = True


@app.before_request
def _before_any_request():
    ensure_updater_started()


# -----------------------------------------------------------------------------
# API
# -----------------------------------------------------------------------------
@app.route("/rates", methods=["GET"])
def get_rates():
    if not exchange_data:
        return jsonify({"error": "Exchange rate data is not yet available."}), 503
    return jsonify(exchange_data)


# -----------------------------------------------------------------------------
# Frontend (serves the Vite build output under front/build)
# -----------------------------------------------------------------------------
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path: str):
    """
    Serve the built frontend for all non-API routes.

    - If a real file exists in front/build, serve it directly.
    - Otherwise serve index.html (so client-side routing works).
    """
    # Don't ever intercept the API route.
    if path.startswith("rates"):
        return jsonify({"error": "Not found"}), 404

    if FRONTEND_BUILD_DIR.exists():
        requested = FRONTEND_BUILD_DIR / path
        if path != "" and requested.exists() and requested.is_file():
            return send_from_directory(FRONTEND_BUILD_DIR, path)
        return send_from_directory(FRONTEND_BUILD_DIR, "index.html")

    return (
        "Frontend build not found. Run 'npm install' and 'npm run build' inside /front.",
        500,
    )


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
