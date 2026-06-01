from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth.models import User


SUPPORTED_LANGUAGES = ('ru', 'kz', 'en')

AUTH_FORM_TRANSLATIONS = {
    'ru': {
        'username': 'Имя пользователя',
        'email': 'Email',
        'password': 'Пароль',
        'password_confirm': 'Подтверждение пароля',
        'username_placeholder': 'Введите имя пользователя',
        'email_placeholder': 'Введите email',
        'password_placeholder': 'Введите пароль',
        'password_confirm_placeholder': 'Повторите пароль',
    },
    'kz': {
        'username': 'Пайдаланушы аты',
        'email': 'Email',
        'password': 'Құпиясөз',
        'password_confirm': 'Құпиясөзді растау',
        'username_placeholder': 'Пайдаланушы атын енгізіңіз',
        'email_placeholder': 'Email енгізіңіз',
        'password_placeholder': 'Құпиясөзді енгізіңіз',
        'password_confirm_placeholder': 'Құпиясөзді қайталаңыз',
    },
    'en': {
        'username': 'Username',
        'email': 'Email',
        'password': 'Password',
        'password_confirm': 'Confirm password',
        'username_placeholder': 'Enter username',
        'email_placeholder': 'Enter email',
        'password_placeholder': 'Enter password',
        'password_confirm_placeholder': 'Repeat password',
    },
}


def normalize_form_language(lang):
    lang = (lang or 'ru').strip().lower()

    if lang == 'kk':
        lang = 'kz'

    return lang if lang in SUPPORTED_LANGUAGES else 'ru'


class LoginForm(AuthenticationForm):
    def __init__(self, *args, lang='ru', **kwargs):
        super().__init__(*args, **kwargs)

        text = AUTH_FORM_TRANSLATIONS[normalize_form_language(lang)]
        self.fields['username'].label = text['username']
        self.fields['password'].label = text['password']
        self.fields['username'].widget.attrs.update({
            'placeholder': text['username_placeholder']
        })
        self.fields['password'].widget.attrs.update({
            'placeholder': text['password_placeholder']
        })

class RegisterForm(UserCreationForm):
    email = forms.EmailField()

    class Meta:
        model = User
        fields = ['username', 'email', 'password1', 'password2']

    def __init__(self, *args, lang='ru', **kwargs):
        super().__init__(*args, **kwargs)

        text = AUTH_FORM_TRANSLATIONS[normalize_form_language(lang)]
        self.fields['username'].label = text['username']
        self.fields['email'].label = text['email']
        self.fields['password1'].label = text['password']
        self.fields['password2'].label = text['password_confirm']
        self.fields['username'].widget.attrs.update({
            'placeholder': text['username_placeholder']
        })
        self.fields['email'].widget.attrs.update({
            'placeholder': text['email_placeholder']
        })
        self.fields['password1'].widget.attrs.update({
            'placeholder': text['password_placeholder']
        })
        self.fields['password2'].widget.attrs.update({
            'placeholder': text['password_confirm_placeholder']
        })
