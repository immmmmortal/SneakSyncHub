from decimal import Decimal
from django.shortcuts import render, get_object_or_404  # type: ignore
from django.contrib.auth.decorators import login_required  # type: ignore
from core.models import Shoe
from core.scraping.scrape import ScrapeByArticleNike
from members.models import UserProfile


# Create your views here.
def home(request):
    return render(request, "home.html")


@login_required
def user_profile_view(request, user_id):
    user_profile = get_object_or_404(UserProfile, user_id=user_id)

    return render(request, "user_profile.html", {"user_profile": user_profile})


@login_required(login_url="/members/login")
def fetch_page_view(request):
    if request.method == "POST":
        article = request.POST.get("article-field")
        if request.method == "POST":
            article = request.POST.get("article-field")
            scraper = ScrapeByArticleNike(article)
            article_info = scraper.scrape()
            parsed_articles = Shoe.objects.all()

            if not parsed_articles.filter(article=article):
                price_decimal = Decimal(
                    article_info["price"].replace("$", "").replace(",", "")
                )

                shoe = Shoe(
                    url=article_info["url"],
                    price=price_decimal,
                    image=article_info["product_image_url"],
                    name=article_info["name"],
                    article=article,
                    sizes=article_info["sizes"],
                )
                shoe.save()
                user_profile = get_object_or_404(UserProfile, user=request.user)
                user_profile.scraped_articles.add(shoe)
            else:
                article_info = parsed_articles.get(article=article)
                return render(
                    request,
                    "fetch_page.html",
                    {"article_info": article_info},
                )

            return render(request, "fetch_page.html", {"article_info": article_info})
        else:
            return render(
                request,
                "fetch_page.html",
            )
        scraper = ScrapeByArticleNike(article)
        article_info = scraper.scrape()
        parsed_articles = Shoe.objects.all()

        if not parsed_articles.filter(article=article):
            price_decimal = Decimal(
                article_info["price"].replace("$", "").replace(",", "")
            )

            shoe = Shoe(
                url=article_info["url"],
                price=price_decimal,
                image=article_info["product_image_url"],
                name=article_info["name"],
                article=article,
                sizes=article_info["sizes"],
            )
            shoe.save()
            user_profile = get_object_or_404(UserProfile, user=request.user)
            user_profile.scraped_articles.add(shoe)
        else:
            article_info = parsed_articles.get(article=article)
            return render(
                request,
                "fetch_page.html",
                {"article_info": article_info},
            )

        return render(request, "fetch_page.html", {"article_info": article_info})
    else:
        return render(
            request,
            "fetch_page.html",
        )
