# backend/communications/test_callmebot.py

import requests

# -------------------------
# CONFIG (replace with yours)
# -------------------------
PHONE = "5352688092"  # must be international format WITHOUT +
API_KEY = "2874772"   # your CallMeBot API key

MESSAGE = "🧪 Test from MacuExpress Django backend - CallMeBot working!"

# -------------------------
# CALLMEBOT REQUEST
# -------------------------
url = "https://api.callmebot.com/whatsapp.php"

params = {
    "phone": PHONE,
    "text": MESSAGE,
    "apikey": API_KEY,
}

print("Sending WhatsApp message via CallMeBot...")

response = requests.get(url, params=params)

# -------------------------
# RESULT
# -------------------------
print("\n===== RESPONSE =====")
print("Status Code:", response.status_code)
print("Response Text:", response.text)