
from django.contrib import admin
from django.urls import path
from core.views import *
from drops.views import create_drop, verify_payment_and_reveal
from payments.views import *
from django.conf import settings
from django.conf.urls.static import static


urlpatterns = [
    path('admin/', admin.site.urls),
    path('', home, name='home'),
    path('api/wallet_login/', wallet_login, name='wallet_login'),
    path('create_drop/', create_drop, name='create_drop'),
    path('drop/<int:drop_id>/purchase/', initiate_purchase, name='purchase_drop'),
    path('api/drop/<int:drop_id>/verify_purchase/', verify_purchase, name='verify_purchase'),
    path('api/drop/<int:drop_id>/reveal/', verify_payment_and_reveal, name='reveal_drop'),
    path('profile/setup/', setup_profile, name='setup_profile'),
    path('@<str:username>/', profile_view, name='profile_view'),
    path('api/user/has-profile/', check_user_profile, name='check_profile'),
    path('search/', search_results, name='search_results'),
    ]


if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)