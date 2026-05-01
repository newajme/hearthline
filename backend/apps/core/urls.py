from django.urls import path

from . import auth_views, views

urlpatterns = [
    path("businesses/", views.BusinessListCreate.as_view(), name="business-list"),
    path("businesses/<int:pk>/", views.BusinessDetail.as_view(), name="business-detail"),
    path("channels/", views.ChannelListCreate.as_view(), name="channel-list"),
    path("channels/<int:pk>/", views.ChannelDetail.as_view(), name="channel-detail"),
    path("auth/login/", auth_views.LoginView.as_view(), name="auth-login"),
    path("auth/logout/", auth_views.LogoutView.as_view(), name="auth-logout"),
    path("auth/me/", auth_views.MeView.as_view(), name="auth-me"),
]
