from django.urls import path, re_path
import game.views

urlpatterns = [
    re_path(r'^.*', game.views.Index.as_view(), name='index')
]
