from django import template
from core.models import WalletUser

register = template.Library()

@register.filter
def get_user(wallet_address):
    #get user object from wallet address
    try:
        return WalletUser.objects.get(wallet_address=wallet_address)
    except WalletUser.DoesNotExist:
        return None 

#this is