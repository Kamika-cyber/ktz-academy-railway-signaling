from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'django-diploma-secret-key-for-development'

DEBUG = True

ALLOWED_HOSTS = ['127.0.0.1', 'localhost']


INSTALLED_APPS = [
    'jazzmin',

    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    'courses',
]


MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'courses.middleware.FrontendCorsMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]


ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [
            BASE_DIR / 'courses' / 'templates',
        ],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]


WSGI_APPLICATION = 'config.wsgi.application'


DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'ktz_academy_db',
        'USER': 'postgres',
        'PASSWORD': '5432',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}


LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'Asia/Almaty'

USE_I18N = True

USE_TZ = True


STATIC_URL = 'static/'

STATICFILES_DIRS = [
    BASE_DIR / 'courses' / 'static',
]

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'


DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

FRONTEND_HOME_URL = 'http://127.0.0.1:5173/'
FRONTEND_PLATFORM_URL = 'http://127.0.0.1:5173/platform'
FRONTEND_ORIGINS = [
    'http://127.0.0.1:5173',
    'http://localhost:5173',
]

CSRF_TRUSTED_ORIGINS = FRONTEND_ORIGINS

JAZZMIN_SETTINGS = {
    "site_title": "KTZ Academy Admin",
    "site_header": "KTZ Academy",
    "site_brand": "KTZ Academy",
    "welcome_sign": "Welcome to KTZ Academy Course Management Panel",
    "copyright": "KTZ Academy",

    "topmenu_links": [
        {"name": "Open Website", "url": "/", "new_window": True},
        {"name": "Course Page", "url": "/course/", "new_window": True},
    ],

    "show_sidebar": True,
    "navigation_expanded": True,
    "custom_css": "admin/ktz-admin.css",
    "changeform_format": "horizontal_tabs",
    "related_modal_active": True,

    "icons": {
        "auth": "fas fa-user-shield",
        "auth.User": "fas fa-users",
        "auth.Group": "fas fa-user-shield",
        "courses.Section": "fas fa-layer-group",
        "courses.Module": "fas fa-book",
        "courses.Lesson": "fas fa-chalkboard-teacher",
        "courses.Question": "fas fa-question-circle",
        "courses.CourseEnrollment": "fas fa-id-badge",
        "courses.QuizResult": "fas fa-clipboard-check",
        "courses.UserProgress": "fas fa-chart-line",
        "courses.LearningActivityProgress": "fas fa-tasks",
    },
}

JAZZMIN_UI_TWEAKS = {
    "theme": "litera",
    "default_theme_mode": "light",
    "navbar": "navbar-white navbar-light",
    "accent": "accent-primary",
    "sidebar": "sidebar-dark-primary",
    "brand_colour": "navbar-primary",
    "navbar_fixed": True,
    "sidebar_fixed": True,
    "sidebar_nav_flat_style": True,
    "sidebar_nav_compact_style": False,
    "button_classes": {
        "primary": "btn-primary",
        "secondary": "btn-outline-secondary",
        "info": "btn-outline-primary",
        "warning": "btn-warning",
        "danger": "btn-danger",
        "success": "btn-success",
    },
}

LOGIN_URL = 'login'
LOGIN_REDIRECT_URL = FRONTEND_PLATFORM_URL
LOGOUT_REDIRECT_URL = 'homepage'
