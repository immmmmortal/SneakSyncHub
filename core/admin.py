from django.contrib import admin
from django import forms
from core.models import Shoe


class ShoeAdminForm(forms.ModelForm):
    class Meta:
        model = Shoe
        fields = "__all__"

    def clean_price(self):
        price = self.cleaned_data.get("price")
        if price is not None and price < 0:
            raise forms.ValidationError("Price cannot be negative.")
        return price

    def clean_sale_price(self):
        sale_price = self.cleaned_data.get("sale_price")
        if sale_price is not None and sale_price < 0:
            raise forms.ValidationError("Sale price cannot be negative.")
        return sale_price


class ShoeAdmin(admin.ModelAdmin):
    form = ShoeAdminForm
    list_display = ("name", "price", "sale_price", "created_at")
    list_filter = ("created_at",)
    search_fields = ("name", "article")
    ordering = ("-created_at",)

    def save_model(self, request, obj, form, change):
        """
        Custom save method to handle logic explicitly and trigger signals.
        """
        if change:  # If the object is being updated
            update_fields = []
            if "price" in form.changed_data:
                update_fields.append("price")
            if "sale_price" in form.changed_data:
                update_fields.append("sale_price")

            # Save the object and specify the fields that were updated
            obj.save(update_fields=update_fields)
        else:
            # Normal save for new objects
            super().save_model(request, obj, form, change)


# Register the admin view
admin.site.register(Shoe, ShoeAdmin)
