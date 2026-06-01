from django.db import models
from django.conf import settings
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.core.validators import URLValidator


MEDIA_URL_FIELDS = ('video_url', 'image_url')


def display_text(*values):
    for value in values:
        if value:
            return value
    return ''


def validate_media_url(value):
    if not value:
        return

    if value.startswith('/'):
        return

    URLValidator()(value)


class MediaURLValidationMixin:
    def clean_fields(self, exclude=None):
        excluded_fields = set(exclude or [])
        media_values = {}

        for field_name in MEDIA_URL_FIELDS:
            if field_name not in excluded_fields:
                media_values[field_name] = getattr(self, field_name, '')
                excluded_fields.add(field_name)

        super().clean_fields(exclude=excluded_fields)

        errors = {}
        for field_name, value in media_values.items():
            try:
                validate_media_url(value)
            except ValidationError as error:
                errors[field_name] = error

        if errors:
            raise ValidationError(errors)


class Section(models.Model):
    title_ru = models.CharField(max_length=200)
    title_kz = models.CharField(max_length=200, blank=True)
    title_en = models.CharField(max_length=200, blank=True)

    description_ru = models.TextField(blank=True)
    description_kz = models.TextField(blank=True)
    description_en = models.TextField(blank=True)

    order = models.PositiveIntegerField(default=1)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return display_text(self.title_en, self.title_ru, self.title_kz)

class Module(models.Model):
    section = models.ForeignKey(
        Section,
        on_delete=models.CASCADE,
        related_name='modules',
        null=True,
        blank=True
    )

    title_ru = models.CharField(max_length=200)
    title_kz = models.CharField(max_length=200, blank=True)
    title_en = models.CharField(max_length=200, blank=True)

    description_ru = models.TextField(blank=True)
    description_kz = models.TextField(blank=True)
    description_en = models.TextField(blank=True)

    order = models.PositiveIntegerField(default=1)

    class Meta:
        ordering = ['section__order', 'order']

    def __str__(self):
        return display_text(self.title_en, self.title_ru, self.title_kz)


class Lesson(MediaURLValidationMixin, models.Model):
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='lessons')

    title_ru = models.CharField(max_length=200)
    title_kz = models.CharField(max_length=200, blank=True)
    title_en = models.CharField(max_length=200, blank=True)

    content_ru = models.TextField(blank=True)
    content_kz = models.TextField(blank=True)
    content_en = models.TextField(blank=True)

    video_url = models.URLField(blank=True, max_length=500)
    image_url = models.URLField(blank=True, max_length=500)

    order = models.PositiveIntegerField(default=1)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return display_text(self.title_en, self.title_ru, self.title_kz)


class Question(MediaURLValidationMixin, models.Model):
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='questions')

    question_ru = models.TextField()
    question_kz = models.TextField(blank=True)
    question_en = models.TextField(blank=True)

    explanation_ru = models.TextField(blank=True)
    explanation_kz = models.TextField(blank=True)
    explanation_en = models.TextField(blank=True)

    option_a_ru = models.CharField(max_length=255)
    option_a_kz = models.CharField(max_length=255, blank=True)
    option_a_en = models.CharField(max_length=255, blank=True)

    option_b_ru = models.CharField(max_length=255)
    option_b_kz = models.CharField(max_length=255, blank=True)
    option_b_en = models.CharField(max_length=255, blank=True)

    option_c_ru = models.CharField(max_length=255)
    option_c_kz = models.CharField(max_length=255, blank=True)
    option_c_en = models.CharField(max_length=255, blank=True)

    correct_answer = models.CharField(
        max_length=1,
        choices=[
            ('A', 'A'),
            ('B', 'B'),
            ('C', 'C'),
        ]
    )

    video_url = models.URLField(blank=True, max_length=500)
    image_url = models.URLField(blank=True, max_length=500)

    base_points = models.PositiveIntegerField(default=10)
    penalty_points = models.PositiveIntegerField(default=5)

    def __str__(self):
        return display_text(self.question_en, self.question_ru, self.question_kz)[:50]


class UserProgress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE)
    progress_percent = models.PositiveIntegerField(default=0)
    is_completed = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - {self.lesson} - {self.progress_percent}%"


class LearningActivityProgress(models.Model):
    DIRECTORY_CARD = 'directory_card'
    SIMULATOR = 'simulator'

    ACTIVITY_TYPES = (
        (DIRECTORY_CARD, 'Directory card'),
        (SIMULATOR, 'Simulator'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activity_progress')
    activity_type = models.CharField(max_length=32, choices=ACTIVITY_TYPES)
    activity_key = models.CharField(max_length=80)
    is_completed = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'activity_type', 'activity_key')
        ordering = ['activity_type', 'activity_key']

    def __str__(self):
        status = 'completed' if self.is_completed else 'not completed'
        return f'{self.user.username} - {self.activity_type}:{self.activity_key} - {status}'


class CourseEnrollment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    course_name = models.CharField(max_length=200, default="Instruction on Signaling")
    status = models.CharField(max_length=50, default="Enrolled")
    enrolled_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.course_name}"
    
class QuizResult(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='quiz_results')
    lesson = models.ForeignKey(
        Lesson,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='quiz_results'
    )

    score = models.IntegerField(default=0)
    max_score = models.PositiveIntegerField(default=0)
    correct_count = models.PositiveIntegerField(default=0)
    total_questions = models.PositiveIntegerField(default=0)

    details = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.score} points"
