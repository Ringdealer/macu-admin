# backend/api/v1/serializers.py

from dj_rest_auth.registration.serializers import RegisterSerializer
from dj_rest_auth.serializers import UserDetailsSerializer
from django.contrib.auth import get_user_model
from rest_framework import serializers

from accounts.models import Customer
from orders.models import Order, OrderItem
from products.models import Category, Product

from .utils import send_whatsapp_notification

User = get_user_model()

# ---------------- USER ----------------
class CustomUserDetailsSerializer(UserDetailsSerializer):
    is_staff = serializers.BooleanField(read_only=True)
    is_superuser = serializers.BooleanField(read_only=True)

    class Meta(UserDetailsSerializer.Meta):
        model = User
        fields = UserDetailsSerializer.Meta.fields + (
            "is_staff",
            "is_superuser",
        )


# ---------------- Product Serializer ----------------
class ProductSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = "__all__"
        read_only_fields = ["created_at", "updated_at"]

    def get_image_url(self, obj):

        try:
            if obj.image:
                return obj.image.url
        except Exception as e:
            print("ERROR:", e)

            return None
            """
        Cloudinary-only safe image resolver
        """

        if not obj.image:
            return None

        try:
            # Cloudinary + ImageField safe resolution
            url = obj.image.url

            if url:
                return url.replace("http://", "https://")

        except Exception:
            pass

        # fallback (last resort: build manually from public_id path)
        if hasattr(obj.image, "name"):
            return f"https://res.cloudinary.com/depctgzuc/image/upload/{obj.image.name}"

        return None
        """
        ✅ ROBUST IMAGE HANDLING (PRODUCTION SAFE)

        Handles:
        - Cloudinary ImageField
        - Django ImageField
        - broken/null images
        - string-based legacy values
        """

        try:
            # Case 1: Cloudinary or Django ImageField
            if obj.image and hasattr(obj.image, "url"):
                url = obj.image.url

                # Ensure HTTPS
                if url.startswith("http://"):
                    url = url.replace("http://", "https://")

                return url

            # Case 2: legacy string stored in DB (Cloudinary path or fallback)
            if isinstance(obj.image, str) and obj.image.strip():
                return f"https://res.cloudinary.com/depctgzuc/{obj.image}"

        except Exception:
            return None

        return None

    def validate_name(self, value):
        if not value.strip():
            raise serializers.ValidationError("Product name cannot be empty.")
        return value

    def validate_price(self, value):
        if value < 0:
            raise serializers.ValidationError("Price must be non-negative.")
        return value

    def validate_stock(self, value):
        if value < 0:
            raise serializers.ValidationError("Stock cannot be negative.")
        return value
    
# ---------------- Category Serializer ----------------


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "parent"]


# ---------------- OrderItem Serializer ----------------
class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)

    product_price = serializers.DecimalField(
        source="product.price",
        max_digits=10,
        decimal_places=2,
        read_only=True,
    )

    # ✅ IMPORTANT: declare computed fields
    category = serializers.SerializerMethodField()
    root_category = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = [
            "id",
            "product",
            "product_name",
            "product_price",
            "quantity",
            "category",
            "root_category",
        ]

    def validate_quantity(self, value):
        if value < 1:
            raise serializers.ValidationError(
                "Quantity must be at least 1."
            )
        return value

    def validate(self, attrs):
        product = attrs.get("product")
        quantity = attrs.get("quantity")

        if product:
            if hasattr(product, "available") and not product.available:
                raise serializers.ValidationError(
                    f"Product '{product.name}' is not available."
                )

            if hasattr(product, "stock") and quantity > product.stock:
                raise serializers.ValidationError(
                    f"Not enough stock for '{product.name}'. Available: {product.stock}"
                )

        return attrs

    # -------------------------
    # CATEGORY
    # -------------------------
    def get_category(self, obj):
        product = obj.product

        if not product or not product.category:
            return None

        category = product.category

        return {
            "id": category.id,
            "name": category.name,
            "parent": (
                {
                    "id": category.parent.id,
                    "name": category.parent.name,
                }
                if category.parent
                else None
            ),
        }

    # -------------------------
    # ROOT CATEGORY 
    # -------------------------
    def get_root_category(self, obj):
        product = obj.product

        if not product or not product.category:
            return None

        category = product.category

        while category.parent:
            category = category.parent

        return {
            "id": category.id,
            "name": category.name,
        }


# ---------------- ORDER ----------------
class OrderSerializer(serializers.ModelSerializer):
    order_items = OrderItemSerializer(many=True)

    customer_name = serializers.CharField(read_only=True)
    total = serializers.SerializerMethodField()

    status_display = serializers.CharField(
        source="get_status_display",
        read_only=True
    )
    payment_status_display = serializers.CharField(
        source="get_payment_status_display",
        read_only=True
    )

    class Meta:
        model = Order
        fields = [
            "id",
            "customer",
            "customer_name",
            "status",
            "status_display",
            "payment_status",
            "payment_status_display",
            "total",
            "phone",
            "address",
            "created_at",
            "updated_at",
            "order_items",
        ]
        read_only_fields = ["customer", "created_at", "updated_at"]

    
    def get_total(self, obj):
        return sum(
            item.product.price * item.quantity
            for item in obj.order_items.select_related("product")
        )

    # ---------------- VALIDATION ----------------
    def validate_phone(self, value):

        if not value or not value.strip():
            raise serializers.ValidationError(
                "Se requiere número telefónico para realizar pedidos."
            )
        return value

    # ---------------- CREATE FLOW ----------------
    def create(self, validated_data):

        # 🔍 DATABASE CONTEXT CHECK (IMPORTANT DEBUG POINT)
        
        order_items_data = validated_data.pop("order_items", [])

        phone = validated_data.pop("phone", "")
        address = validated_data.pop("address", "")

        customer = validated_data.pop("customer", None)

        request = self.context.get("request")
        if not customer and request and hasattr(request.user, "customer"):
            customer = request.user.customer

        if not customer:
            raise serializers.ValidationError("Customer information is required.")

        # 🔥 CREATE ORDER
        order = Order.objects.create(
            customer=customer, phone=phone, address=address, **validated_data
        )

        # ---------------- ORDER ITEMS ----------------
        product_ids = [
            item["product"] if isinstance(item["product"], int) else item["product"].id
            for item in order_items_data
        ]

        products = Product.objects.in_bulk(product_ids)

        # 🔥 IMPORTANT: merge duplicates in same request
        merged_items = {} 

        for item_data in order_items_data:
            product_id = (
                item_data["product"]
                if isinstance(item_data["product"], int)
                else item_data["product"].id
            )

            quantity = item_data.get("quantity", 1)

            
            if product_id in merged_items:
                merged_items[product_id] += quantity
            else:
                merged_items[product_id] = quantity

        # now create safely
        for product_id, quantity in merged_items.items():
            product = products.get(product_id)

            if not product:
                raise serializers.ValidationError(
                    f"Product with id {product_id} does not exist."
                )

            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=quantity
            )

        send_whatsapp_notification(order)

        return order

    def update(self, instance, validated_data):
        user = self.context["request"].user

        if "payment_status" in validated_data and not user.is_staff:
            validated_data.pop("payment_status")

        order_items_data = validated_data.pop("order_items", None)
        phone = validated_data.pop("phone", None)
        address = validated_data.pop("address", None)

        instance.status = validated_data.get("status", instance.status)
        instance.payment_status = validated_data.get(
            "payment_status", instance.payment_status
        )

        if phone is not None:
            instance.phone = phone
        if address is not None:
            instance.address = address

        instance.save(update_fields=["status", "payment_status", "phone", "address"])

        if order_items_data is not None:
            existing_items = {
                item.product_id: item
                for item in instance.order_items.select_related("product").all()
            }

            product_ids = [
                (
                    item["product"]
                    if isinstance(item["product"], int)
                    else item["product"].id
                )
                for item in order_items_data
            ]

            products = Product.objects.in_bulk(product_ids)

            for item_data in order_items_data:
                product_id = (
                    item_data["product"]
                    if isinstance(item_data["product"], int)
                    else item_data["product"].id
                )

                product = products.get(product_id)
                if not product:
                    raise serializers.ValidationError(
                        f"Product with id {product_id} does not exist."
                    )

                quantity = item_data.get("quantity", 1)

                if quantity > product.stock:
                    raise serializers.ValidationError(
                        f"Not enough stock for '{product.name}'. Available: {product.stock}"
                    )

                if product_id in existing_items:
                    item = existing_items[product_id]
                    item.quantity = quantity
                    item.save()
                else:
                    OrderItem.objects.create(
                        order=instance, product=product, quantity=quantity
                    )

            instance.order_items.exclude(product_id__in=product_ids).delete()

        return instance


class CustomRegisterSerializer(RegisterSerializer):
    phone_number = serializers.CharField(required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)

    email = serializers.EmailField(required=False, allow_blank=True) 

    def validate_email(self, value):
        return ""  

    def get_cleaned_data(self):
        data = super().get_cleaned_data()

        return {
            "username": data.get("username"),
            "password1": data.get("password1"),
            "email": data.get("email", ""),  
            "phone_number": self.validated_data.get("phone_number", ""),
            "address": self.validated_data.get("address", ""),
        }

    def save(self, request):
        user = super().save(request)

        phone = self.validated_data.get("phone_number", "")
        address = self.validated_data.get("address", "")

        # Ensure customer exists
        customer, _ = Customer.objects.get_or_create(user=user)

        customer.phone = phone
        customer.address = address
        customer.save()

        return user


# ---------------- PROFILE ----------------
class ProfileSerializer(serializers.ModelSerializer):
    phone_number = serializers.CharField(
        required=False, allow_blank=True, allow_null=True
    )
    address = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = User
        fields = ["username", "email", "phone_number", "address"]

    # ---------------- READ (merge User + Customer) ----------------
    def to_representation(self, instance):
        data = super().to_representation(instance)

        customer = getattr(instance, "customer", None)

        data["phone_number"] = customer.phone if customer and customer.phone else ""
        data["address"] = customer.address if customer and customer.address else ""

        return data

    # ---------------- WRITE (split back cleanly) ----------------
    def update(self, instance, validated_data):
        # USER FIELDS
        instance.username = validated_data.get("username", instance.username)
        instance.email = validated_data.get("email", instance.email)
        instance.save()

        # CUSTOMER FIELDS
        customer = getattr(instance, "customer", None)

        if customer:
            customer.phone = validated_data.get("phone_number", customer.phone)
            customer.address = validated_data.get("address", customer.address)
            customer.save()

        return instance