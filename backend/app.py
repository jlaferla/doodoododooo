from flask import Flask, jsonify
from flask_cors import CORS
import requests
import threading
import time

app = Flask(__name__)
CORS(app)

EXCHANGE_API_URL = "https://v6.exchangerate-api.com/v6/c6e4dcf788ed11a76951cb0f/latest/USD"
exchange_data = {}

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
        time.sleep(60)  # for testing, update every minute

@app.route('/rates', methods=['GET'])
def get_rates():
    if not exchange_data:
        return jsonify({"error": "Exchange rate data is not yet available."}), 503
    return jsonify(exchange_data)

if __name__ == '__main__':
    thread = threading.Thread(target=update_exchange_rates, daemon=True)
    thread.start()
    app.run(debug=True, port=5000)
