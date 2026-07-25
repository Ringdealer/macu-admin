#backend/api/v1/utils.py
from urllib.parse import quote  # safe URL encoding for WhatsApp message

import requests
from django.conf import settings


def send_whatsapp_notification(order):
    """
    Send a WhatsApp notification to admin via CallMeBot when a new order is created.
    Includes customer's name and phone if available, with safe fallbacks.
    """

    # -------------------------
    # CUSTOMER NAME 
    # -------------------------
    customer_name = "Cliente"

    customer = getattr(order, "customer", None)
    user = getattr(customer, "user", None) if customer else None

    if user:
        # safest Django method (best option)
        full_name = ""

        try:
            full_name = user.get_full_name()
        except Exception:
            full_name = ""

        if full_name and full_name.strip():
            customer_name = full_name.strip()

        elif getattr(user, "first_name", None) or getattr(user, "last_name", None):
            full_name = f"{user.first_name} {user.last_name}".strip()
            if full_name:
                customer_name = full_name

        elif getattr(user, "username", None):
            customer_name = user.username

        elif getattr(user, "email", None):
            customer_name = user.email

    # -------------------------
    # PHONE
    # -------------------------
    customer_phone = ""
    if getattr(order, "phone", None):
        customer_phone = order.phone
    elif customer and getattr(customer, "phone", None):
        customer_phone = customer.phone

    # -------------------------
    # ADDRESS
    # -------------------------
    customer_address = ""
    if getattr(order, "address", None):
        customer_address = order.address
    elif customer and getattr(customer, "address", None):
        customer_address = customer.address

    # -------------------------
    # ITEMS 
    # -------------------------
    items_text = ""
    total_calculated = 0

    items = order.order_items.select_related("product").all()

    if items:  # safer than .exists()
        items_text = "\n🛒 Artículos:\n"

        for item in items:
            product_name = getattr(item.product, "name", "Producto")
            qty = item.quantity
            price = getattr(item.product, "price", 0) or 0

            line_total = price * qty
            total_calculated += line_total

            items_text += f"- {product_name} x{qty} = ${line_total}\n"

    # -------------------------
    # BUILD MESSAGE
    # -------------------------
    message = (
        "🚚 Nuevo pedido recibido\n\n"
        f"🧾 Pedido #{order.id}\n"
        f"👤 Cliente: {customer_name}\n"
    )

    if customer_phone:
        message += f"📞 Teléfono: {customer_phone}\n"

    if customer_address:
        message += f"📍 Dirección: {customer_address}\n"

    if items_text:
        message += items_text

        total = total_calculated if total_calculated else getattr(
                order,
                "total_amount",
                "N/A",
            )

        message += f"\n💰 Total: ${total}\n"

    # -------------------------
    # SEND
    # -------------------------
    encoded_message = quote(message)

    url = (
        f"https://api.callmebot.com/whatsapp.php"
        f"?phone={quote(settings.CALLMEBOT_PHONE)}"
        f"&text={encoded_message}"
        f"&apikey={settings.CALLMEBOT_APIKEY}"
    )

    try:
        response = requests.get(url, timeout=10)
        if response.status_code != 200:
            print("WhatsApp notification failed:", response.text)
    except Exception as e:
        print("WhatsApp notification failed:", e)