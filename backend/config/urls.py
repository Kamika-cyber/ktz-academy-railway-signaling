from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include

admin.site.site_header = "KTZ Academy Administration"
admin.site.site_title = "KTZ Academy Admin"
admin.site.index_title = "Course Management Panel"

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('courses.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
