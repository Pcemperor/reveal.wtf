from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from drops.models import Drop 
import json

def initiate_purchase(request, drop_id):
    #show purchase confirmation page
    drop = get_object_or_404(Drop, id=drop_id)
    return render(request, 'payments/purchase.html', {'drop': drop})

def verify_purchase(request, drop_id):
    #api endpoint to verify payments and reveal image
    if request.method =='POST':
        try:
            data = json.loads(request.body)
            transaction_sig = data.get('transaction_signature')
            buyer_wallet = data.get('buyer_wallet')

            drop = get_object_or_404(Drop, id=drop_id)

            #TODO: verify transaction on solana blockchain
            #for now, initiate successful payment
            
            return JsonResponse({
                'status': 'success',
                'decryption_key': drop.encryption_key,
                'image_url': drop.original_image.url
            })
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)})