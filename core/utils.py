from members.models import UserProfile

lorem_ipsum = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris eget dapibus augue. Phasellus justo elit, dictum eget tortor eget, gravida volutpat felis. Praesent placerat lorem vitae risus efficitur maximus. Duis mauris lorem, sollicitudin in hendrerit in, blandit at lorem. Phasellus erat sapien, suscipit quis aliquam id, feugiat eu libero. Suspendisse tortor elit, lobortis quis sodales at, lacinia et massa. Sed vel congue risus, pulvinar malesuada turpis. Praesent in massa ullamcorper, lacinia tortor at, placerat risus."


def get_user_profile(request):
    return UserProfile.objects.get(user=request.user)
