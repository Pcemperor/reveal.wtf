import os
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import base64

class ImageEncryptionService:
    #image encryption/decryption using fernet 
    @staticmethod
    def generate_key():
        #secure key generation
        return Fernet.generate_key()

    @staticmethod
    def encrypt_image_data(image_data, key):
    #encrypt raw image bytes
        try:
            fernet = Fernet(key)
            encrypted_data = fernet.encrypt(image_data)
            return encrypted_data
        except Exception as e:
            raise Exception(f"Decryption Failed: {str(e)}")

    @staticmethod
    def create_black_box_placeholder():
        from PIL import Image, ImageDraw
        import io 

        #create black image 
        img = Image.new('RGB',(400,400), color='black')
        draw = ImageDraw.Draw(img)

        #add question mark
        draw.text((200,200), '?', fill='white', anchor='mm')

        #convert to bytes
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='PNG')
        img_bytes.seek(0)

        return img_bytes.getvalue()
