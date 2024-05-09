from django.shortcuts import render, get_object_or_404
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required

from core.scraping.scrape_by_article_nike import scrape_by_article
from members.models import CustomUser, UserProfile
from core.forms import UserProfileForm


# Create your views here.

def home(request):
    return render(request, 'home.html')


@login_required
def user_profile_view(request, user_id):
    custom_user = request.user
    user_profile = get_object_or_404(UserProfile, user_id=user_id)

    return render(request,
                  'user_profile.html',
                  {'user_profile': user_profile}
                  )


def fetch_page_view(request):
    if request.method == 'POST':
        article = request.POST.get('article-field')
        article_info = scrape_by_article(article)

        return render(request, 'fetch_page.html', {
            article_info:
                "article_info"
        })
    else:
        return render(request, 'fetch_page.html')
