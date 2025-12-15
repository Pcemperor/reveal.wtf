from django import forms
from .models import Drop

class DropCreationForm(forms.ModelForm):
    class Meta:
        model = Drop
        fields = ['title', 'description', 'original_image', 'price_sol', 'total_supply']
        widgets = {
            'description': forms.Textarea(attrs={'rows': 4}),
        }
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        #original_image field required

        self.fields['original_image'].required = True

    