from django.db import models
from django.db.models.signals import post_save


class Shoe(models.Model):
    name = models.CharField(max_length=200)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    url = models.URLField(max_length=400)
    image = models.URLField(max_length=400)
    article = models.CharField(max_length=200)
    sizes = models.TextField()
    parsed_from = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)
    count = models.IntegerField(default=0)
    description = models.TextField()

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        user_profile = kwargs.pop('user_profile', None)

        super(Shoe, self).save(*args, **kwargs)

        if user_profile:
            post_save.send(sender=self.__class__,
                           instance=self,
                           created=True,
                           user=user_profile)


class ShoePriceHistory(models.Model):
    shoe = models.ForeignKey(Shoe, on_delete=models.CASCADE,
                             related_name='price_history')
    price = models.DecimalField(max_digits=10, decimal_places=2)
    date_recorded = models.DateField()
