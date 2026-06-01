from django.urls import path
from django.contrib.auth import views as auth_views
from . import views

urlpatterns = [
    path('', views.homepage, name='homepage'),
    path('course/', views.index, name='index'),
    path('course/index/', views.index, name='course_index'),

    path('api/csrf/', views.csrf_api, name='csrf_api'),
    path('api/me/', views.me_api, name='me_api'),
    path('api/course-data/', views.course_modules_api, name='course_data_api'),
    path('api/modules/', views.course_modules_api, name='course_modules_api'),
    path('api/progress/', views.api_progress, name='api_progress'),
    path('api/activity-progress/', views.api_activity_progress, name='activity_progress_api'),
    path('api/logout/', views.logout_api, name='logout_api'),

    path('register/', views.register, name='register'),
    path('login/', views.LocalizedLoginView.as_view(), name='login'),
    path('logout/', auth_views.LogoutView.as_view(next_page='homepage'), name='logout'),
]
