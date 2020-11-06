from rest_framework.routers import SimpleRouter

from .views import EventsView

router = SimpleRouter()
router.register('', EventsView)

urlpatterns = router.urls
