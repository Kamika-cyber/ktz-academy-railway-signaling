from django.conf import settings
from django.http import HttpResponse
from django.utils.cache import patch_vary_headers


class FrontendCorsMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.method == 'OPTIONS' and self._is_allowed_origin(request):
            response = HttpResponse(status=204)
        else:
            response = self.get_response(request)

        self._add_cors_headers(request, response)
        return response

    def _is_allowed_origin(self, request):
        origin = request.headers.get('Origin')
        return origin in getattr(settings, 'FRONTEND_ORIGINS', [])

    def _add_cors_headers(self, request, response):
        origin = request.headers.get('Origin')

        if origin not in getattr(settings, 'FRONTEND_ORIGINS', []):
            return

        response['Access-Control-Allow-Origin'] = origin
        response['Access-Control-Allow-Credentials'] = 'true'
        response['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'Content-Type, X-CSRFToken, X-Requested-With'
        patch_vary_headers(response, ['Origin'])
