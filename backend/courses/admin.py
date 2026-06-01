from pathlib import Path

from django.contrib import admin
from django import forms
from django.contrib import messages
from django.contrib.auth.admin import GroupAdmin as DjangoGroupAdmin
from django.contrib.auth.models import Group
from django.core.files.storage import default_storage
from django.utils.text import Truncator
from django.utils.text import get_valid_filename
from .models import (
    Section,
    Module,
    Lesson,
    Question,
    UserProgress,
    LearningActivityProgress,
    CourseEnrollment,
    QuizResult,
)
from .scoring import quiz_totals_from_details


ALLOWED_VIDEO_EXTENSIONS = {'.mp4', '.webm', '.ogg', '.mov'}


try:
    admin.site.unregister(Group)
except admin.sites.NotRegistered:
    pass


def short_text(value, length=80):
    return Truncator(value).chars(length) if value else '-'


@admin.register(Group)
class KTZGroupAdmin(DjangoGroupAdmin):
    list_display = ('name', 'user_count', 'permission_count')
    search_fields = ('name', 'permissions__name', 'permissions__codename')
    ordering = ('name',)

    @admin.display(description='Users')
    def user_count(self, obj):
        return obj.user_set.count()

    @admin.display(description='Permissions')
    def permission_count(self, obj):
        return obj.permissions.count()


class MediaPathAdminForm(forms.ModelForm):
    video_url = forms.CharField(
        required=False,
        max_length=500,
        help_text='External URL or local static path, for example /videos/example.mp4',
        widget=forms.TextInput(attrs={
            'placeholder': '/videos/example.mp4 or https://example.com/video.mp4',
            'style': 'width: 100%; max-width: 760px;',
        }),
    )
    image_url = forms.CharField(
        required=False,
        max_length=500,
        help_text='External URL or local static path, for example /images/example.png',
        widget=forms.TextInput(attrs={
            'placeholder': '/images/example.png or https://example.com/image.png',
            'style': 'width: 100%; max-width: 760px;',
        }),
    )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        for field_name in ('title_ru', 'title_kz', 'title_en'):
            if field_name in self.fields:
                self.fields[field_name].widget.attrs.update({
                    'style': 'width: 100%; max-width: 760px;',
                })

        for field_name in ('content_ru', 'content_kz', 'content_en'):
            if field_name in self.fields:
                self.fields[field_name].widget.attrs.update({
                    'rows': 16,
                    'style': (
                        'width: 100%; max-width: 1040px; '
                        'font-family: Consolas, monospace; line-height: 1.45;'
                    ),
                })

        for field_name in (
            'question_ru',
            'question_kz',
            'question_en',
            'explanation_ru',
            'explanation_kz',
            'explanation_en',
        ):
            if field_name in self.fields:
                self.fields[field_name].widget.attrs.update({
                    'rows': 4,
                    'style': 'width: 100%; max-width: 920px;',
                })


class QuestionMediaAdminForm(MediaPathAdminForm):
    video_upload = forms.FileField(
        required=False,
        help_text=(
            'Upload a video for this question. The uploaded file path will be '
            'saved into video_url automatically.'
        ),
        widget=forms.ClearableFileInput(attrs={
            'accept': 'video/mp4,video/webm,video/ogg,video/quicktime',
        }),
    )

    def clean_video_upload(self):
        uploaded = self.cleaned_data.get('video_upload')

        if not uploaded:
            return uploaded

        extension = Path(uploaded.name).suffix.lower()

        if extension not in ALLOWED_VIDEO_EXTENSIONS:
            allowed = ', '.join(sorted(ALLOWED_VIDEO_EXTENSIONS))
            raise forms.ValidationError(f'Unsupported video format. Use one of: {allowed}.')

        return uploaded

    def save(self, commit=True):
        instance = super().save(commit=False)
        uploaded = self.cleaned_data.get('video_upload')

        if uploaded:
            filename = get_valid_filename(uploaded.name)
            saved_path = default_storage.save(f'question-videos/{filename}', uploaded)
            instance.video_url = default_storage.url(saved_path)

        if commit:
            instance.save()
            self.save_m2m()

        return instance


@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):
    list_display = ('title_en', 'title_ru', 'title_kz', 'order')
    search_fields = ('title_ru', 'title_kz', 'title_en')
    fields = ('title_en', 'title_ru', 'title_kz', 'description_en', 'description_ru', 'description_kz', 'order')
    ordering = ('order',)

@admin.register(Module)
class ModuleAdmin(admin.ModelAdmin):
    list_display = ('title_en', 'title_ru', 'title_kz', 'section', 'order')
    list_filter = ('section',)
    search_fields = ('title_ru', 'title_kz', 'title_en')
    fields = ('section', 'title_en', 'title_ru', 'title_kz', 'description_en', 'description_ru', 'description_kz', 'order')
    ordering = ('section__order', 'order')


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    form = MediaPathAdminForm
    list_display = ('title_en', 'title_ru', 'title_kz', 'module', 'order', 'is_active', 'video_url', 'image_url')
    list_filter = ('module', 'is_active')
    search_fields = ('title_ru', 'title_kz', 'title_en')
    fieldsets = (
        ('Basic settings', {
            'fields': (
                'module',
                'order',
                'is_active',
            )
        }),
        ('Lesson titles', {
            'fields': (
                'title_en',
                'title_ru',
                'title_kz',
            )
        }),
        ('Lesson content HTML', {
            'description': (
                'You can use HTML tags such as h3, p, ul, ol, table and custom '
                'classes like lesson-rule, lesson-warning and regulation-citation.'
            ),
            'fields': (
                'content_en',
                'content_ru',
                'content_kz',
            )
        }),
        ('Media', {
            'fields': (
                'video_url',
                'image_url',
            )
        }),
    )
    ordering = ('module', 'order')


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    form = QuestionMediaAdminForm
    list_display = (
        'id',
        'lesson',
        'question_en_preview',
        'question_ru_preview',
        'question_kz_preview',
        'correct_answer',
        'base_points',
        'penalty_points',
        'video_url',
        'image_url',
    )
    list_filter = ('lesson',)
    search_fields = ('question_ru', 'question_kz', 'question_en')
    fieldsets = (
        ('Question text', {
            'fields': (
                'lesson',
                'question_en',
                'question_ru',
                'question_kz',
            )
        }),
        ('Expert explanation', {
            'fields': (
                'explanation_en',
                'explanation_ru',
                'explanation_kz',
            )
        }),
        ('Answer options', {
            'fields': (
                'option_a_en',
                'option_a_ru',
                'option_a_kz',
                'option_b_en',
                'option_b_ru',
                'option_b_kz',
                'option_c_en',
                'option_c_ru',
                'option_c_kz',
            )
        }),
        ('Correct answer and scoring', {
            'fields': (
                'correct_answer',
                'base_points',
                'penalty_points',
            )
        }),
        ('Media', {
            'fields': (
                'video_upload',
                'video_url',
                'image_url',
            )
        }),
    )

    @admin.display(ordering='question_en', description='Question en')
    def question_en_preview(self, obj):
        return short_text(obj.question_en)

    @admin.display(ordering='question_ru', description='Question ru')
    def question_ru_preview(self, obj):
        return short_text(obj.question_ru)

    @admin.display(ordering='question_kz', description='Question kz')
    def question_kz_preview(self, obj):
        return short_text(obj.question_kz)


@admin.register(UserProgress)
class UserProgressAdmin(admin.ModelAdmin):
    list_display = ('user', 'lesson_en', 'lesson_ru', 'lesson_kz', 'progress_percent', 'is_completed', 'updated_at')
    list_filter = ('is_completed', 'lesson')
    search_fields = ('user__username', 'lesson__title_en', 'lesson__title_ru', 'lesson__title_kz')

    @admin.display(ordering='lesson__title_en', description='Lesson en')
    def lesson_en(self, obj):
        return obj.lesson.title_en or '-'

    @admin.display(ordering='lesson__title_ru', description='Lesson ru')
    def lesson_ru(self, obj):
        return obj.lesson.title_ru or '-'

    @admin.display(ordering='lesson__title_kz', description='Lesson kz')
    def lesson_kz(self, obj):
        return obj.lesson.title_kz or '-'


@admin.register(LearningActivityProgress)
class LearningActivityProgressAdmin(admin.ModelAdmin):
    list_display = ('user', 'activity_type', 'activity_key', 'is_completed', 'updated_at')
    list_filter = ('activity_type', 'is_completed')
    search_fields = ('user__username', 'activity_key')


@admin.register(CourseEnrollment)
class CourseEnrollmentAdmin(admin.ModelAdmin):
    list_display = ('user', 'course_name', 'status', 'enrolled_at')
    list_filter = ('status', 'course_name')
    search_fields = ('user__username', 'course_name')

@admin.register(QuizResult)
class QuizResultAdmin(admin.ModelAdmin):
    list_display = ('user', 'lesson_en', 'lesson_ru', 'lesson_kz', 'score', 'max_score', 'correct_count', 'total_questions', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__username', 'lesson__title_en', 'lesson__title_ru', 'lesson__title_kz')
    actions = ('recalculate_selected_results',)

    @admin.display(ordering='lesson__title_en', description='Lesson en')
    def lesson_en(self, obj):
        return obj.lesson.title_en if obj.lesson else '-'

    @admin.display(ordering='lesson__title_ru', description='Lesson ru')
    def lesson_ru(self, obj):
        return obj.lesson.title_ru if obj.lesson else '-'

    @admin.display(ordering='lesson__title_kz', description='Lesson kz')
    def lesson_kz(self, obj):
        return obj.lesson.title_kz if obj.lesson else '-'

    @admin.action(description='Recalculate selected quiz results')
    def recalculate_selected_results(self, request, queryset):
        updated = 0
        unchanged = 0

        for result in queryset:
            totals = quiz_totals_from_details(result.details)
            changed = (
                result.score != totals['score']
                or result.max_score != totals['max_score']
                or result.correct_count != totals['correct_count']
                or result.total_questions != totals['total_questions']
                or result.details != totals['details']
            )

            if not changed:
                unchanged += 1
                continue

            result.score = totals['score']
            result.max_score = totals['max_score']
            result.correct_count = totals['correct_count']
            result.total_questions = totals['total_questions']
            result.details = totals['details']
            result.save(update_fields=[
                'score',
                'max_score',
                'correct_count',
                'total_questions',
                'details',
            ])
            updated += 1

        self.message_user(
            request,
            f'Recalculated {updated} quiz result(s). {unchanged} already matched the formula.',
            messages.SUCCESS,
        )
