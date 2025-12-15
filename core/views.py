from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from drops.models import Drop
from .models import WalletUser
from .forms import ProfileForm
from django.contrib import messages

@csrf_exempt
def wallet_login(request):
    if request.method == 'POST':
        try:
            date = json.loads(request.body)
            wallet_address = date.get('wallet_address')
            if wallet_address:
                #store wallet in session
                request.session['wallet_address'] = wallet_address
                request.session.modified = True 

                return JsonResponse({'status': 'success'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)})
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'})

def home(request):
    drops =  Drop.objects.filter(is_sold_out=False).order_by('-created_at')
    wallet_address = request.session.get('wallet_address')
    user = None
    if wallet_address:
        try:
            user = WalletUser.objects.get(wallet_address=wallet_address)
        except WalletUser.DoesNotExist:
            user = None
    return render(request, 'home.html', {'drops':drops})

def setup_profile(request):
    #setup or update profile
    wallet_address = request.session.get('wallet_address')

    if not wallet_address:
        messages.error(request, 'Please connect your wallet first.')
        return redirect('home')

    #get or create user
    user, created = WalletUser.objects.get_or_create(
        wallet_address=wallet_address
    )

    if request.method == 'POST':
        form = ProfileForm(request.POST, instance=user)
        if form.is_valid():
            form.save()
            messages.success(request, 'Profile updated.')
            return redirect('home')
    else:
        form = ProfileForm(instance=user)
    return render(request, 'core/setup_profile.html',{
        'form': form,
        'user':user
    }) 

def profile_view(request, username):
    #public profile page
    user = get_object_or_404(WalletUser, username=username)

    #get user's drops
    from drops.models import Drop
    drops = Drop.objects.filter(creator=user.wallet_address)

    return render(request, 'core/profile.html',{
        'profile_user': user,
        'drops':drops
    })

def check_user_profile(request):
    #to check if user has set up profile
    wallet_address = request.GET.get('wallet')

    if not wallet_address:
        return JsonResponse({'has_profile': False})

    try:
        user = WalletUser.objects.get(wallet_address=wallet_address)
        has_profile = bool(user.username)
        return JsonResponse({'has_profile': has_profile})
    except WalletUser.DoesNotExist:
        return JsonResponse({'has_profile': False})
           
def search_results(request):
    #mvp search for users and drops
    query = request.GET.get('q', '').strip()
    results = {}

    if query:
        #search for users (case sensitive partial match)
        from .models import WalletUser
        users = WalletUser.objects.filter(
            username__icontains=query
        ).exclude(username__isnull=True).exclude(username__exact='')

        #search for drops
        from drops.models import Drop
        drops = Drop.objects.filter(
            title__icontains=query
        ).filter(is_sold_out=False)

        results = {
            'users':users,
            'drops': drops,
            'query': query,
        }
    return render(request, 'core/search_results.html', results)