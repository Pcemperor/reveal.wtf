from django.contrib import admin
from .models import Drop

@admin.register(Drop)
class DropAdmin(admin.ModelAdmin):
    list_display = ['price_sol', 'total_supply', 'created_at', 'title', 'creator', 'description', 'encryption_key', 'is_sold_out', 'current_supply', 'original_image']
    list_filter = ['created_at']
    search_fields = ['title', 'creator']
    

