from django.shortcuts import render, get_object_or_404 # type: ignore
from django.contrib.auth.decorators import login_required # type: ignore
from core.scraping.scrape import ScrapeByArticleNike
from members.models import UserProfile
from django.http import JsonResponse

# Create your views here.
def home(request):
    return render(request, 'home.html')

@login_required
def user_profile_view(request, user_id):
    user_profile = get_object_or_404(UserProfile, user_id=user_id)

    return render(request,
                  'user_profile.html',
                  {'user_profile': user_profile}
                  )


def fetch_page_view(request):
    if request.method == 'POST' and request.is_ajax():
        article = request.POST.get('article-field')
        article_info = ScrapeByArticleNike(article).scrape()
        return JsonResponse(article_info)
        
    else:g
        return render(request, 'fetch_page.html')
