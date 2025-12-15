from django.db import models

class WalletUser(models.Model):
    wallet_address = models.CharField(max_length=44, unique=True)
    username = models.CharField(max_length=30, unique=True, null=True,blank=True)
    bio = models.TextField(blank=True)
    twitter_handle = models.CharField(max_length=50,blank=True)
    discord_handle = models.CharField(max_length=50,blank=True)
    website_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        if self.username:
            return f"@{self.username}"
        return f"{self.wallet_address[:8]}..."
    def has_completed_profile(self):
        return bool(self.username)
    def __str__(self):
        return f'{self.wallet_address[:8]}...'
