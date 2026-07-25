from django.contrib import admin

from .models import Order, OrderItem


# Inline to edit OrderItems directly in the Order admin
class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 1  # Start with one blank row
    readonly_fields = ('product', 'quantity')  # Optional: make read-only if you prefer

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'customer', 'status', 'payment_status', 'created_at')
    list_filter = ('status', 'payment_status')
    inlines = [OrderItemInline]