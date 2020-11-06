from rest_framework.viewsets import ModelViewSet

from .models import Event
from .serializers import EventSerializer


class EventsView(ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
