from django.db import models
from core.models import WalletUser
import os

class Drop(models.Model):
    creator = models.CharField(max_length=44) #store wallet address directly
    title = models.CharField(max_length=200)
    description = models.TextField()
    original_image = models.ImageField(upload_to='original_drops/', null=True, blank=True)
    encrypted_image = models.ImageField(upload_to='encrypted_drops/')
    price_sol = models.DecimalField(max_digits=10, decimal_places=4)
    total_supply = models.IntegerField()
    encryption_key = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    current_supply = models.IntegerField(default=0)
    is_sold_out = models.BooleanField(default=False)

    def mark_purchased(self, buyer_wallet):
        #mark a purchase and update supply
        self.current_supply +=1
        if self.current_supply >= self.total_supply:
            self.is_sold_out = True
        self.save()

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        #override to save handle image automatically
        from .services.encryption import ImageEncryptionService

        is_new = self._state.adding
        original_data = None

        if is_new and self.original_image:
            #generate encryption key
            key = ImageEncryptionService.generate_key()
            self.encryption_key = key.decode('utf-8')

            try:
                #read original_image
                self.original_image.seek(0)
                original_data = self.original_image.read()
                #encrypt the image
                encrypted_data = ImageEncryptionService.encrypt_image_data(original_data, key)

                #save encrypted_image 
                from django.core.files.base import ContentFile
                self.encrypted_image.save(
                    f'encrypted_{os.path.basename(self.original_image.name)}',
                    ContentFile(encrypted_data),
                    save=False #hold the save until super().save()..
                )
            except Exception as e:
                raise Exception(f'Image encryption failed: {str(e)}')
        
        super().save(*args, **kwargs)

    def get_creator_username(self):
    #get creator username if there is
        try:
            from core.models import WalletUser
            user = WalletUser.objects.get(wallet_address=self.creator)
            return user.username
        except WalletUser.DoesNotExist:
            return None 


class Purchase(models.Model):
    drop = models.ForeignKey(Drop, on_delete=models.CASCADE)
    buyer_wallet = models.CharField(max_length=44)
    transaction_signature = models.CharField(max_length=200)
    purchased_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['drop', 'buyer_wallet'] #to prevent double purchases


