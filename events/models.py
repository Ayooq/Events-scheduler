from django.db import models
from django.utils import timezone as tz


class Event(models.Model):
    """Модель мероприятия."""

    name = models.CharField('название', max_length=255)
    start = models.DateTimeField(
        'дата и время начала',
        default=tz.now,
    )
    end = models.DateTimeField(
        'дата и время окончания',
        default=tz.now,
    )
    color = models.CharField('цвет', max_length=20, default='secondary')

    class Meta:
        verbose_name = 'Мероприятие'
        verbose_name_plural = 'Мероприятия'

    def __str__(self):
        return self.name
