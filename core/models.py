from django.db import models


class Shoe(models.Model):
    name = models.CharField(max_length=200)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    url = models.URLField(max_length=400)
    image = models.URLField(max_length=400)
    article = models.CharField(max_length=200)
    sizes = models.TextField()

    def __str__(self):
        return self.name
