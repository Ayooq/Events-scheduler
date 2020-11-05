from django.urls import path
from rest_framework.routers import SimpleRouter

from .views import index, EventsView

router = SimpleRouter()
router.register('', EventsView)

urlpatterns = router.urls
