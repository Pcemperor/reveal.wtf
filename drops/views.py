from django.shortcuts import render, redirect 
from .forms import DropCreationForm
from django.http import JsonResponse, HttpResponse
import json
from .models import Drop, Purchase
from .services.encryption import ImageEncryptionService


def create_drop(request):
    wallet_address = request.session.get('wallet_address')
    if not wallet_address:
        messages.error(request, 'Please connect your wallet first.')
        return redirect('home') 

        #check if user has profile
    try:
        from core.models import WalletUser
        user = WalletUser.objects.get(wallet_address=wallet_address)
        if not user.username:
            messages.warning(request, 'Please set up your profile before creating a drop.')
            return redirect('setup_profile')
    except WalletUser.DoesNotExist:
        messages.warning(request, 'Please set up your profile before creating a drop.')
        return redirect('setup_profile')

    error_message = None
    success_message = None
    if request.method == 'POST':
        form = DropCreationForm(request.POST, request.FILES)
        if form.is_valid():
            drop = form.save(commit=False)
            drop.creator = request.session.get('wallet_address', 'unknown')
            try:
                drop.save()
                success_message = 'Drop uploaded successfully!'
                form = DropCreationForm()  # reset form after success
            except Exception as e:
                error_message = str(e)
        # else: form errors will be shown
    else:
        form = DropCreationForm()

    return render(request, 'drops/create_drop.html', {
        'form': form,
        'error_message': error_message,
        'success_message': success_message,
    })

def verify_payment_and_reveal(request, drop_id):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            transaction_sig = data.get('transaction_signature')
            buyer_wallet = data.get('buyer_wallet')

            drop = Drop.objects.get(id=drop_id)

            #TODO: verify transaction on sol blockchain
            #for now, trust frontend

            #mark as purchased
            drop.mark_purchased(buyer_wallet)

            #create wallet record
            Purchase.objects.create(
                drop=drop,
                buyer_wallet=buyer_wallet,
                transaction_signature=transaction_sig,
            )

            return JsonResponse({
                'status': 'success',
                'revealed_image_url': drop.original_image.url,
                'decryption_key': drop.encryption_key,
                'is_unique': drop.total_supply == 1
            })

        except Exception as e:
                return JsonResponse({'status': 'error', 'message': str(e)})
                