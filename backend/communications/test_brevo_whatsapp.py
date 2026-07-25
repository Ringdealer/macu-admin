# backend/communications/test_brevo_whatsapp.py

import os

import requests
from dotenv import load_dotenv

# Load .env manually for standalone test
load_dotenv()

BREVO_API_KEY = os.getenv("BREVO_API_KEY")
BREVO_SENDER_NUMBER = os.getenv("BREVO_WHATSAPP_SENDER_NUMBER")

# 👉 CHANGE THIS to your real WhatsApp number (must include +country code)
TO_NUMBER = "+5352688092"

URL = "https://api.brevo.com/v3/whatsapp/sendMessage"

def test_brevo_whatsapp():
    if not BREVO_API_KEY:
        print("❌ Missing BREVO_API_KEY")
        return

    if not BREVO_SENDER_NUMBER:
        print("❌ Missing BREVO_WHATSAPP_SENDER_NUMBER")
        return

    payload = {
        "senderNumber": BREVO_SENDER_NUMBER,
        "contactNumbers": [TO_NUMBER],
        "type": "text",
        "text": "🧪 Test message from Django + Brevo integration"
    }

    headers = {
        "accept": "application/json",
        "content-type": "application/json",
        "api-key": BREVO_API_KEY,
    }

    response = requests.post(URL, json=payload, headers=headers)

    print("\n===== BREVO RESPONSE =====")
    print("Status Code:", response.status_code)
    print("Response:", response.text)


if __name__ == "__main__":
    test_brevo_whatsapp()