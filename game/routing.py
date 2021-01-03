from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/play/(?P<game_id>\w+)/', consumers.TestConsumer.as_asgi()),
]
