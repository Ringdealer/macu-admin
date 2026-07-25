# backend/api/v1/admin/serializers.py

import uuid

from dj_rest_auth.registration.serializers import RegisterSerializer
from dj_rest_auth.serializers import UserDetailsSerializer
from django.contrib.auth import get_user_model
from rest_framework import serializers

from accounts.models import Customer
from communications.models import ActivityLog, AdminNote, Notification
from communications.services import send_order_notification
from orders.models import Order, OrderItem
from products.models import Category, Product, StockMovement

User = get_user_model()

class CategorySerializer(serializers.ModelSerializer):
    parent = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Category
        fields = ["id", "name", "parent"]
        read_only_fields = ["id"]

    def to_representation(self, instance):
        data = super().to_representation(instance)

        if instance.parent:
            data["parent"] = {
                "id": instance.parent.id,
                "name": instance.parent.name,
            }

        return data

    def validate_name(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Category name cannot be empty."
            )

        if Category.objects.filter(
            name__iexact=value
        ).exclude(
            pk=getattr(self.instance, "pk", None)
        ).exists():
            raise serializers.ValidationError(
                "Category already exists."
            )

        return value

    def create(self, validated_data):
        validated_data["name"] = validated_data["name"].strip()
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if "name" in validated_data:
            validated_data["name"] = validated_data["name"].strip()

        return super().update(instance, validated_data)


# ---------------- NOTIFICATIONS ----------------
class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = "__all__"


# ---------------- ADMIN NOTES ----------------
class AdminNoteSerializer(serializers.ModelSerializer):
    created_by_name = serializers.SerializerMethodField()

    class Meta:
        model = AdminNote
        fields = [
            "id",
            "order",
            "note",
            "created_by",
            "created_by_name",
            "created_at",
        ]
        read_only_fields = ["created_by"]

    def get_created_by_name(self, obj):
        return obj.created_by.username if obj.created_by else "System"

    def create(self, validated_data):
        request = self.context["request"]
        validated_data["created_by"] = request.user
        return super().create(validated_data)


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


# ---------------- PRODUCT ----------------
class ProductSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    category = CategorySerializer(read_only=True)

    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source="category",
        write_only=True,
        required=False,
        allow_null=True
    )

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "price",
            "stock",
            "available",
            "image_url",
            "category",
            "category_id",
        ]
        read_only_fields = ["created_at", "updated_at"]

    # -------------------------
    # 🔒 LEAF CATEGORY ENFORCEMENT
    # -------------------------
    def validate_category(self, value):
        if value is None:
            return value

        # ❌ Reject parent categories (must be leaf)
        if value.parent is None:
            raise serializers.ValidationError(
                "Select a subcategory (leaf category), not a parent category."
            )

        return value

    def get_image_url(self, obj):
        if obj.image and hasattr(obj.image, "url"):
            url = obj.image.url
            return url.replace("http://", "https://")
        return None


# ---------------- ORDER ITEM ----------------
class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(
        source="product.name",
        read_only=True,
    )

    product_price = serializers.DecimalField(
        source="product.price",
        max_digits=10,
        decimal_places=2,
        read_only=True,
    )

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

    def get_root_category(self, obj):
        product = obj.product

        if not product or not product.category:
            return None

        category = product.category

        # climb hierarchy until root
        while category.parent:
            category = category.parent

        return {
            "id": category.id,
            "name": category.name,
        }


# ---------------- ORDER ----------------
class OrderSerializer(serializers.ModelSerializer):
    
    order_items = OrderItemSerializer(many=True)
    customer_phone = serializers.SerializerMethodField()

    customer_name = serializers.SerializerMethodField()
    total = serializers.SerializerMethodField()

    status_display = serializers.CharField(source="get_status_display", read_only=True)
    payment_status_display = serializers.CharField(
        source="get_payment_status_display", read_only=True
    )

    class Meta:
        model = Order
        fields = [
            "id",
            "customer",
            "customer_name",
             "customer_phone",
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

    def get_customer_phone(self, obj):
        return getattr(obj.customer, "phone", obj.phone)

    def get_customer_name(self, obj):
        return (
            getattr(obj.customer, "name", str(obj.customer))
            if obj.customer
            else "Cliente"
        )

    def get_total(self, obj):
        return sum(
            item.product.price * item.quantity
            for item in obj.order_items.select_related("product")
        )

    # ---------------- CREATE ORDER ----------------
    def create(self, validated_data):
        items_data = validated_data.pop("order_items", [])

        request = self.context["request"]
        customer = getattr(request.user, "customer", None)

        if not customer:
            raise serializers.ValidationError("Customer required.")

        order = Order.objects.create(customer=customer, **validated_data)

        for item in items_data:
            product = item["product"]
            quantity = item.get("quantity", 1)

            OrderItem.objects.create(order=order, product=product, quantity=quantity)

        
        send_order_notification(order)

        return order

    # ---------------- UPDATE ORDER ----------------
    def update(self, instance, validated_data):
        request = self.context["request"]

        if "payment_status" in validated_data and not request.user.is_staff:
            validated_data.pop("payment_status")

        items_data = validated_data.pop("order_items", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()

        if items_data is not None:
            instance.order_items.all().delete()

            for item in items_data:
                OrderItem.objects.create(
                    order=instance,
                    product=item["product"],
                    quantity=item.get("quantity", 1),
                )

        # notify only on update
        send_order_notification(instance)

        return instance


# ---------------- REGISTER ----------------
class CustomRegisterSerializer(RegisterSerializer):
    phone_number = serializers.CharField(required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)

    def get_cleaned_data(self):
        data = super().get_cleaned_data()
        data["phone_number"] = self.validated_data.get("phone_number", "")
        data["address"] = self.validated_data.get("address", "")
        return data


# backend/api/v1/admin/serializers.py

# ---------------- CUSTOMER ----------------
class CustomerSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()  
    email = serializers.SerializerMethodField()  
    is_verified = serializers.SerializerMethodField()  

    phone = serializers.CharField(required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)

    total_orders = serializers.SerializerMethodField()
    last_order_date = serializers.SerializerMethodField()
    orders = serializers.SerializerMethodField()

    class Meta:
        model = Customer
        fields = [
            "id",
            "uuid",
            "name",
            "email",
            "is_verified",  
            "phone",
            "address",
            "total_orders",
            "last_order_date",
            "orders",
        ]

    def get_name(self, obj):
        return obj.user.get_full_name() or obj.user.username

    def get_email(self, obj):  
        return obj.user.email  

    def get_is_verified(self, obj):  
        return obj.user.is_verified  

    def get_total_orders(self, obj):
        return obj.orders.count()

    def get_last_order_date(self, obj):
        last = obj.orders.order_by("-created_at").first()
        return last.created_at if last else None

    def get_orders(self, obj):
        return [
            {
                "id": o.id,
                "status": o.status,
                "payment_status": o.payment_status,
                "created_at": o.created_at,
                "total": getattr(o, "total", 0),
            }
            for o in obj.orders.all()
        ]

    def validate_email(self, value):
        # allow empty email
        if value in [None, ""]:
            return ""
        return value

    def create(self, validated_data):
        request = self.context["request"]

        email = request.data.get("email", "").strip()
        password = request.data.get("password", "").strip()
        name = request.data.get("name", "").strip()  

        User = get_user_model()

        # create user WITHOUT requiring email
        user = User.objects.create(
            username=email if email else f"customer_{uuid.uuid4().hex[:8]}",
            email=email if email else "",
            first_name=name,  
        )

        # password MUST be required
        if not password:
            raise serializers.ValidationError({
                "password": "Password is required"
            })

        user.set_password(password)
        user.save()

        customer = Customer.objects.create(
            user=user,
            **validated_data
        )

        return customer

    def update(self, instance, validated_data):  
        request = self.context["request"]  

        user = instance.user  

        name = request.data.get("name")  
        email = request.data.get("email")  

        if name is not None:  
            user.first_name = name  

        if email is not None:  
            user.email = email.strip().lower()  
            user.username = user.email or user.username  

        user.save()  

        instance.phone = validated_data.get("phone", instance.phone)  
        instance.address = validated_data.get("address", instance.address)  

        instance.save()  

        return instance  


# ---------------- STOCK MOVEMENT ----------------
class StockMovementSerializer(serializers.ModelSerializer):
    reason_display = serializers.SerializerMethodField()
    reason_display_es = serializers.ReadOnlyField()

    class Meta:
        model = StockMovement
        fields = [
            "id",
            "product",
            "old_stock",
            "new_stock",
            "change",
            "reason",
            "reason_display",
            "reason_display_es",
            "created_at",
        ]

    def get_reason_display(self, obj):
        return obj.get_reason_display()


class ActivityLogSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source="user.email", read_only=True)

    class Meta:
        model = ActivityLog
        fields = [
            "id",
            "user",
            "user_email",
            "action",
            "model_name",
            "object_id",
            "description",
            "created_at",
        ]
