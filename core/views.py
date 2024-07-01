from decimal import Decimal
from django.shortcuts import redirect, render, get_object_or_404  # type: ignore
from django.contrib.auth.decorators import login_required  # type: ignore
from core.models import Shoe
from core.scraping.scrape import ScrapeByArticleNike
from core.utils import get_user_profile
from members.models import UserProfile


# Create your views here.
def home(request):
    return render(request, "home.html")


@login_required
def user_profile_view(request):
    user_profile = get_user_profile(request)
    return render(request, "user_profile.html", {"user_profile": user_profile})


@login_required(login_url="/members/login")
def clear_user_fetch_history(request):
    user_profile = get_user_profile(request)
    user_profile.scraped_articles.delete()


@login_required(login_url="/members/login")
def fetch_page_view(request):
    user_profile = get_object_or_404(UserProfile, user=request.user)
    scraped_articles_history = user_profile.scraped_articles.all()

    if request.method == "POST":
        parsed_articles = Shoe.objects.all()
        article = request.POST.get("article-field")

        if "clear_articles" in request.POST:
            user_profile.scraped_articles.clear()
            return redirect("fetch_page")

        elif not parsed_articles.filter(article=article):
            scraper = ScrapeByArticleNike(article)
            article_info = scraper.scrape()

            price_decimal = Decimal(
                article_info["price"].replace("$", "").replace(",", "")
            )
            new_article = Shoe(
                url=article_info["url"],
                price=price_decimal,
                image=article_info["product_image_url"],
                name=article_info["name"],
                article=article,
                sizes=article_info["sizes"],
            )
            new_article.save()

            user_profile = get_object_or_404(UserProfile, user=request.user)
            user_profile.scraped_articles.add(new_article)

            return render(
                request,
                "fetch_page.html",
                {
                    "scraped_articles_history": scraped_articles_history,
                },
            )

        elif parsed_articles.filter(article=article):
            desired_article = Shoe.objects.get(article=article)
            user_profile.scraped_articles.add(desired_article)

            return render(
                request,
                "fetch_page.html",
                {
                    "scraped_articles_history": scraped_articles_history,
                },
            )

    elif request.method == "GET":
        return render(
            request,
            "fetch_page.html",
            {"scraped_articles_history": scraped_articles_history},
        )
