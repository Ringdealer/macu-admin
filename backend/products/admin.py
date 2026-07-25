from django import forms
from django.contrib import admin
from django.contrib.admin import SimpleListFilter
from django.utils.html import format_html

from .models import Category, Product

# =====================================================
# CATEGORY HELPERS
# =====================================================


def get_category_level(category):
    level = 0
    current = category.parent

    while current:
        level += 1
        current = current.parent

    return level


def category_label(category):
    level = get_category_level(category)

    if level == 0:
        return category.name

    return f"{'— ' * level}{category.name}"


# =====================================================
# HIERARCHICAL CATEGORY FILTER
# =====================================================


class HierarchicalCategoryFilter(SimpleListFilter):
    title = "category"
    parameter_name = "category"

    def lookups(self, request, model_admin):
        categories = Category.objects.select_related("parent").all()

        return [(str(category.id), category_label(category)) for category in categories]

    def queryset(self, request, queryset):
        value = self.value()

        if not value:
            return queryset

        try:
            category = Category.objects.get(pk=value)
        except Category.DoesNotExist:
            return queryset

        category_ids = [category.id]

        children = Category.objects.filter(parent=category)

        category_ids.extend(children.values_list("id", flat=True))

        return queryset.filter(category_id__in=category_ids)


# =====================================================
# PRODUCT ADMIN FORM
# =====================================================


class ProductAdminForm(forms.ModelForm):
    characteristics_description = forms.CharField(
        label="Descripción (Características)",
        required=False,
        widget=forms.Textarea(attrs={"rows": 3}),
    )

    class Meta:
        model = Product
        fields = "__all__"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        # Pre-fill characteristics field
        if self.instance and self.instance.characteristics:
            self.fields["characteristics_description"].initial = (
                self.instance.characteristics.get("description", "")
            )

        # -------------------------------------------------
        # Hierarchical category dropdown
        # -------------------------------------------------
        self.fields["category"].label_from_instance = lambda obj: category_label(obj)

    def clean(self):
        cleaned_data = super().clean()

        description = cleaned_data.get("characteristics_description")

        if description:
            cleaned_data["characteristics"] = {"description": description}
        else:
            cleaned_data["characteristics"] = None

        return cleaned_data


# =====================================================
# CATEGORY ADMIN
# =====================================================


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):

    fields = (
        "name",
        "parent",
    )

    list_display = (
        "hierarchical_name",
        "parent",
    )

    list_filter = ("parent",)

    search_fields = ("name",)

    def hierarchical_name(self, obj):
        return category_label(obj)

    hierarchical_name.short_description = "Category"


# =====================================================
# PRODUCT ADMIN
# =====================================================


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):

    form = ProductAdminForm

    list_display = (
        "name",
        "category",
        "price",
        "stock",
        "available",
        "image_preview",
        "created_at",
        "updated_at",
    )

    list_filter = (
        HierarchicalCategoryFilter,
        "available",
        "created_at",
    )

    search_fields = (
        "name",
        "description",
        "uuid",
    )

    readonly_fields = (
        "uuid",
        "updated_at",
        "image_preview",
    )

    ordering = ("-updated_at",)

    # =================================================
    # IMAGE PREVIEW
    # =================================================

    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" ' 'style="max-height:80px; border-radius:8px;" />',
                obj.image.url,
            )

        return "No image"

    image_preview.short_description = "Image"
