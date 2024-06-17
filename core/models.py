from django.db import models

class Shoe(models.Model):
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    url = models.URLField()
    image = models.URLField()
    article = models.CharField(max_length=100)

    def __str__(self):
        return self.name

    