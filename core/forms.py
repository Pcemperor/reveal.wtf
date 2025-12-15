from django import forms
from .models import WalletUser

class ProfileForm(forms.ModelForm):
    class Meta:
        model = WalletUser
        fields = ['username','bio', 'twitter_handle', 'discord_handle', 'website_url']
        widgets = {
            'bio': forms.Textarea(attrs={'rows':3, 'placeholder': "   Tell us about your art"}),
            'username': forms.TextInput(attrs={'placeholder': '  Something unique..'}),
            'twitter_handle': forms.TextInput(attrs={"placeholder": '@username'}),
            'discord_handle': forms.TextInput(attrs={'placeholder': 'username1234'}),
        }

    def clean_username(self):
        username = self.cleaned_data['username']

        if not username:
            raise forms.ValidationError('Username is required.')
        
        if len(username) <3:
            raise forms.ValidationError('Username must be at least 3 characters.')
        
        if len(username)> 15:
            raise forms.ValidationError('Username cannot be exceed 15 characters.')

      

        if WalletUser.objects.filter(username__iexact=username).exists():
            raise forms.ValidationError('This username is already taken.')

        return username