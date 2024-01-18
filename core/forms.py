from django import forms
from members.models import UserProfile


class UserProfileForm(forms.ModelForm):
    class Meta:
        model = UserProfile
        fields = ['email', 'profile_picture', 'preferred_sites']

    def __init__(self, *args, **kwargs):
        user_email = kwargs.pop('user_email', None)
        super(UserProfileForm, self).__init__(*args, **kwargs)
        self.fields['email'].initial = user_email

    email = forms.EmailField(disabled=True)
