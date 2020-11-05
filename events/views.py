from django.shortcuts import render
from rest_framework.viewsets import ModelViewSet

from .models import Event
from .serializers import EventSerializer


def index(request):
    return render(request, 'events/index.html')


class EventsView(ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
