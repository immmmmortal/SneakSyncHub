from django.shortcuts import render
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from members.models import CustomUser, UserProfile
from core.forms import UserProfileForm


# Create your views here.

def home(request):
    return render(request, 'home.html')


@login_required
def user_profile_view(request):
    custom_user = request.user
    user_profile, created = UserProfile.objects.get_or_create(
        user=custom_user
    )

    return render(request,
                  'user_profile.html',
                  {'user_profile': user_profile}
                  )
