#backend/communications/services.py
import logging
import os
from datetime import timedelta

import requests
from django.db import models, transaction
from django.utils import timezone

from communications.models import ActivityLog, Notification

logger = logging.getLogger(__name__)

# =========================
# CONFIG
# =========================
RETRY_DELAY_MINUTES = 5
MAX_RETRIES = 5


# =========================
# BREVO EMAIL
# =========================
def send_email_brevo(to_email, subject, content):
    url = "https://api.brevo.com/v3/smtp/email"

    payload = {
        "sender": {
            "name": "MacuExpress",
            "email": "noreply@macuexpress.com"
        },
        "to": [{"email": to_email}],
        "subject": subject,
        "htmlContent": content,
    }

    headers = {
        "accept": "application/json",
        "content-type": "application/json",
        "api-key": os.environ.get("BREVO_API_KEY"),
    }

    return requests.post(url, json=payload, headers=headers)


# =========================
# CALLMEBOT WHATSAPP
# =========================
def send_whatsapp_callmebot(phone, message):
    url = "https://api.callmebot.com/whatsapp.php"

    params = {
        "phone": phone,
        "text": message,
        "apikey": os.environ.get("CALLMEBOT_APIKEY"),
    }

    return requests.get(url, params=params)


# =========================
# DISPATCHER
# =========================
def dispatch_notification(notification: Notification):
    try:
        customer = notification.customer
        phone = getattr(customer, "phone", None)

        if phone:
            phone = phone.replace("+", "").strip()

        # -------------------------
        # WHATSAPP
        # -------------------------
        if notification.type == "whatsapp":
            if not phone:
                raise ValueError("Customer phone missing")

            response = send_whatsapp_callmebot(phone, notification.message)

            if response.status_code != 200:
                raise Exception(response.text)

            notification.status = "sent"
            notification.response = response.text

        # -------------------------
        # EMAIL
        # -------------------------
        elif notification.type == "email":
            email = getattr(customer.user, "email", None)

            if not email:
                raise ValueError("Customer email missing")

            response = send_email_brevo(
                to_email=email,
                subject="Actualización de tu pedido",
                content=f"<p>{notification.message}</p>"
            )

            if response.status_code not in [200, 201]:
                raise Exception(response.text)

            notification.status = "sent"
            notification.response = response.text

        # -------------------------
        # SMS (mock)
        # -------------------------
        elif notification.type == "sms":
            notification.status = "sent"
            notification.response = "sms mock sent"

        else:
            raise ValueError("Unsupported notification type")

    except Exception as e:

        notification.retry_count += 1

        if notification.retry_count >= MAX_RETRIES:
            notification.status = "failed"
            notification.response = str(e)

        else:
            notification.status = "pending"
            notification.response = str(e)

        notification.last_attempt_at = timezone.now()

        logger.warning(
            f"Notification retry {notification.retry_count}/{MAX_RETRIES} "
            f"(id={notification.id})"
        )

    finally:
        notification.save()


# =========================
# AUTO RETRY SYSTEM
# =========================
def retry_pending_notifications():
    cutoff_time = timezone.now() - timedelta(minutes=RETRY_DELAY_MINUTES)

    notifications = Notification.objects.filter(
        status__in=["pending", "failed"],
    ).filter(
        models.Q(last_attempt_at__isnull=True) |
        models.Q(last_attempt_at__lt=cutoff_time)
    )

    for notification in notifications:

        if notification.retry_count >= MAX_RETRIES:
            notification.status = "failed"
            notification.save(update_fields=["status"])
            continue

        dispatch_notification(notification)


# =========================
# SINGLE RETRY (ADMIN BUTTON)
# =========================
def retry_single_notification(notification_id):
    try:
        notification = Notification.objects.get(id=notification_id)

        if notification.status == "sent":
            return "Already sent"

        notification.retry_count = 0
        notification.status = "pending"
        notification.save()

        dispatch_notification(notification)

        return "Retried"

    except Notification.DoesNotExist:
        return "Not found"


# =========================
# ORDER NOTIFICATIONS
# =========================
def send_order_notification(order):
    if not order or not order.customer:
        return

    messages = {
        "pending": "🟡 Hemos recibido tu pedido y está en revisión.",
        "confirmed": "🟢 ¡Tu pedido ha sido confirmado!",
        "packed": "📦 Tu pedido está siendo preparado.",
        "shipped": "🚚 Tu pedido ha sido enviado.",
        "in_transit": "🛣️ Tu pedido está en camino.",
        "delivered": "🎉 ¡Tu pedido ha sido entregado! Gracias por comprar con nosotros.",
        "cancelled": "❌ Tu pedido ha sido cancelado. Si tienes dudas, contáctanos.",
    }

    message = f"""
🛒 *Pedido #{order.id}*

{messages.get(order.status, f"Actualización: {order.status}")}

📦 total = getattr(order, "total", 0)
📍 *Estado:* {order.get_status_display() if hasattr(order, 'get_status_display') else order.status}

Gracias por confiar en nosotros 🙌
"""

    with transaction.atomic():
        notification = Notification.objects.create(
            order=order,
            customer=order.customer,
            type="whatsapp",
            message=message,
            status="pending",
        )

        dispatch_notification(notification)


# =========================
# AUDIT LOG
# =========================
def log_activity(user, action, instance, description=""):
    try:
        ActivityLog.objects.create(
            user=user,
            action=action,
            model_name=instance.__class__.__name__,
            object_id=instance.id,
            description=description,
        )
    except Exception:
        pass