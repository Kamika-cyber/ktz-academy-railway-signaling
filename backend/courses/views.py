from django.conf import settings
from django.shortcuts import render, redirect
from django.contrib.auth import get_user_model, login, logout as auth_logout
from django.contrib.auth import views as auth_views
from django.db.models import Case, IntegerField, Value, When
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_GET, require_POST
from functools import lru_cache
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

from .forms import LoginForm, RegisterForm
import json
from .models import (
    CourseEnrollment,
    Lesson,
    Section,
    Module as CourseModule,
    Question,
    QuizResult,
    UserProgress,
    LearningActivityProgress,
)
from .scoring import question_score


FRONTEND_HOME_URL = settings.FRONTEND_HOME_URL
FRONTEND_PLATFORM_URL = settings.FRONTEND_PLATFORM_URL
SUPPORTED_LANGUAGES = ('ru', 'kz', 'en')
LANGUAGE_COOKIE_NAME = 'preferredLang'
LANGUAGE_SESSION_KEY = 'preferred_lang'
LANGUAGE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365
PASSING_SCORE_PERCENT = 100
ACTIVITY_PROGRESS_TOTALS = {
    LearningActivityProgress.DIRECTORY_CARD: 11,
    LearningActivityProgress.SIMULATOR: 2,
}


def normalize_language(lang):
    lang = (lang or '').strip().lower()

    if lang == 'kk':
        lang = 'kz'

    return lang if lang in SUPPORTED_LANGUAGES else 'ru'


def request_language(request):
    return normalize_language(
        request.GET.get('lang')
        or request.POST.get('lang')
        or request.session.get(LANGUAGE_SESSION_KEY)
        or request.COOKIES.get(LANGUAGE_COOKIE_NAME)
    )


def remember_language(request, lang):
    request.session[LANGUAGE_SESSION_KEY] = normalize_language(lang)


def html_language(lang):
    return 'kk' if lang == 'kz' else lang


def with_language(url, lang):
    parts = urlsplit(url)
    query = dict(parse_qsl(parts.query, keep_blank_values=True))
    query['lang'] = normalize_language(lang)

    return urlunsplit((
        parts.scheme,
        parts.netloc,
        parts.path,
        urlencode(query),
        parts.fragment,
    ))


def response_with_language(response, lang):
    response.set_cookie(
        LANGUAGE_COOKIE_NAME,
        normalize_language(lang),
        max_age=LANGUAGE_COOKIE_MAX_AGE,
        samesite='Lax',
    )
    return response


def auth_context(lang):
    normalized = normalize_language(lang)

    return {
        'lang': normalized,
        'html_lang': html_language(normalized),
    }


@lru_cache(maxsize=1)
def course_ui_translations():
    path = settings.BASE_DIR / 'courses' / 'static' / 'Diploma' / 'course-ui-i18n.json'

    with path.open(encoding='utf-8') as file:
        return json.load(file)


def course_ui_for_language(lang):
    translations = course_ui_translations()
    normalized = normalize_language(lang)

    return translations.get(normalized, translations.get('ru', {}))


def homepage(request):
    lang = request_language(request)
    remember_language(request, lang)

    return response_with_language(
        redirect(with_language(FRONTEND_HOME_URL, lang)),
        lang,
    )


def index(request):
    lang = request_language(request)
    remember_language(request, lang)

    return response_with_language(
        redirect(with_language(FRONTEND_PLATFORM_URL, lang)),
        lang,
    )


def register(request):
    lang = request_language(request)
    remember_language(request, lang)

    if request.method == "POST":
        form = RegisterForm(request.POST, lang=lang)

        if form.is_valid():
            user = form.save()
            login(request, user)

            CourseEnrollment.objects.create(
                user=user,
                course_name="Instruction on Signaling",
                status="Enrolled"
            )

            return response_with_language(
                redirect(with_language(FRONTEND_PLATFORM_URL, lang)),
                lang,
            )
    else:
        form = RegisterForm(lang=lang)

    return response_with_language(
        render(request, 'register.html', {'form': form, **auth_context(lang)}),
        lang,
    )


class LocalizedLoginView(auth_views.LoginView):
    template_name = 'login.html'
    authentication_form = LoginForm

    def dispatch(self, request, *args, **kwargs):
        self.lang = request_language(request)
        remember_language(request, self.lang)
        response = super().dispatch(request, *args, **kwargs)
        return response_with_language(response, self.lang)

    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()
        kwargs['lang'] = self.lang
        return kwargs

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context.update(auth_context(self.lang))
        return context

    def get_success_url(self):
        return with_language(FRONTEND_PLATFORM_URL, self.lang)


@require_GET
@ensure_csrf_cookie
def csrf_api(request):
    return JsonResponse({'csrfToken': get_token(request)})


def user_payload(user):
    display_name = user.get_full_name().strip() or user.username
    name_parts = [part for part in display_name.split() if part]
    initials = ''.join(part[0].upper() for part in name_parts[:2]) or user.username[:1].upper()

    return {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'display_name': display_name,
        'initials': initials,
    }


def percent(value, total):
    return round((value / total) * 100) if total else 0


def best_quiz_results(user):
    best_by_lesson = {}

    results = (
        QuizResult.objects
        .filter(user=user, lesson__isnull=False)
        .select_related('lesson__module__section')
        .order_by('-created_at')
    )

    for result in results:
        if not result.lesson_id:
            continue

        result_percent = percent(result.score, result.max_score)
        previous = best_by_lesson.get(result.lesson_id)

        if previous is None or result_percent > previous['percent']:
            best_by_lesson[result.lesson_id] = {
                'result': result,
                'percent': result_percent,
            }

    return best_by_lesson


def user_learning_metrics(user, sections, active_lessons):
    best_results = best_quiz_results(user)
    progress_by_lesson = {
        row['lesson_id']: row
        for row in UserProgress.objects.filter(user=user).values(
            'lesson_id',
            'progress_percent',
            'is_completed',
        )
    }
    active_lesson_ids = {lesson.id for lesson in active_lessons}
    question_counts = {
        lesson.id: len(lesson.questions.all())
        for lesson in active_lessons
    }
    completed_lesson_ids = set()

    for lesson in active_lessons:
        best_result = best_results.get(lesson.id)

        if best_result is not None:
            result = best_result['result']
            expected_questions = question_counts.get(lesson.id, 0)

            if (
                expected_questions > 0
                and result.total_questions >= expected_questions
                and best_result['percent'] >= PASSING_SCORE_PERCENT
            ):
                completed_lesson_ids.add(lesson.id)
            continue

        progress_row = progress_by_lesson.get(lesson.id)

        if (
            progress_row
            and progress_row['is_completed']
            and progress_row['progress_percent'] >= PASSING_SCORE_PERCENT
        ):
            completed_lesson_ids.add(lesson.id)

    attempted_lesson_ids = set(best_results.keys()) | {
        lesson_id for lesson_id, row in progress_by_lesson.items()
        if row['progress_percent'] > 0
    }
    attempted_lesson_ids = attempted_lesson_ids & active_lesson_ids
    in_progress_lessons = max(len(attempted_lesson_ids - completed_lesson_ids), 0)

    module_lesson_ids = {}

    for lesson in active_lessons:
        if not lesson.module_id:
            continue

        module_lesson_ids.setdefault(lesson.module_id, set()).add(lesson.id)

    completed_module_ids = {
        module_id for module_id, lesson_ids in module_lesson_ids.items()
        if lesson_ids and lesson_ids <= completed_lesson_ids
    }
    attempted_module_ids = {
        module_id for module_id, lesson_ids in module_lesson_ids.items()
        if lesson_ids & attempted_lesson_ids
    }
    total_modules = len(module_lesson_ids)
    completed_modules = len(completed_module_ids)
    in_progress_modules = max(len(attempted_module_ids - completed_module_ids), 0)

    lesson_count = len(active_lessons)
    completed_lessons = len(completed_lesson_ids)
    total_score = sum(item['result'].score for item in best_results.values())
    total_max_score = sum(item['result'].max_score for item in best_results.values())
    average_score_percent = percent(total_score, total_max_score)

    certificate_rows = []
    completed_sections = 0

    for section in sections:
        section_module_ids = {
            lesson.module_id for lesson in active_lessons
            if lesson.module
            and lesson.module.section_id == section.id
            and lesson.module_id in module_lesson_ids
        }
        section_total = len(section_module_ids)
        section_completed = len([
            module_id for module_id in section_module_ids
            if module_id in completed_module_ids
        ])
        section_percent = percent(section_completed, section_total)
        is_completed = section_total > 0 and section_completed == section_total

        if is_completed:
            completed_sections += 1

        certificate_rows.append({
            'id': section.id,
            'order': section.order,
            'title': section,
            'completed': is_completed,
            'completed_modules': section_completed,
            'total_modules': section_total,
            'progress_percent': section_percent,
        })

    points = total_score + completed_modules * 50 + completed_sections * 150
    study_hours = round(completed_lessons * 0.55 + len(best_results) * 0.2, 1)

    return {
        'best_results': best_results,
        'completed_lesson_ids': completed_lesson_ids,
        'attempted_lesson_ids': attempted_lesson_ids,
        'completed_module_ids': completed_module_ids,
        'attempted_module_ids': attempted_module_ids,
        'lesson_count': lesson_count,
        'completed_lessons': completed_lessons,
        'in_progress_lessons': in_progress_lessons,
        'module_count': total_modules,
        'completed_modules': completed_modules,
        'in_progress_modules': in_progress_modules,
        'completed_sections': completed_sections,
        'total_sections': len(sections),
        'overall_progress_percent': percent(completed_modules, total_modules),
        'lesson_progress_percent': percent(completed_lessons, lesson_count),
        'average_score_percent': average_score_percent,
        'total_score': total_score,
        'total_max_score': total_max_score,
        'total_quizzes': QuizResult.objects.filter(user=user).count(),
        'points': points,
        'study_hours': study_hours,
        'certificates': certificate_rows,
    }


def section_icon(order):
    icons = {
        1: 'fas fa-flag',
        2: 'fas fa-traffic-light',
        3: 'fas fa-exclamation-triangle',
        4: 'fas fa-hand-paper',
        5: 'fas fa-map-signs',
        6: 'fas fa-bullhorn',
        7: 'fas fa-clipboard-list',
    }
    return icons.get(order, 'fas fa-certificate')


def activity_progress_state(user):
    completed = {
        LearningActivityProgress.DIRECTORY_CARD: set(),
        LearningActivityProgress.SIMULATOR: set(),
    }

    rows = LearningActivityProgress.objects.filter(user=user, is_completed=True)

    for row in rows:
        if row.activity_type in completed:
            completed[row.activity_type].add(str(row.activity_key))

    def payload(activity_type):
        completed_keys = sorted(completed.get(activity_type, set()))
        total = ACTIVITY_PROGRESS_TOTALS.get(activity_type, len(completed_keys))

        return {
            'completed': len(completed_keys),
            'total': total,
            'percent': percent(len(completed_keys), total),
            'completedKeys': completed_keys,
        }

    return {
        'directoryCards': payload(LearningActivityProgress.DIRECTORY_CARD),
        'simulators': payload(LearningActivityProgress.SIMULATOR),
    }


def learning_state(user, lang):
    sections = list(Section.objects.all().order_by('order'))
    active_lessons = list(
        Lesson.objects.filter(is_active=True)
        .select_related('module__section')
        .prefetch_related('questions')
        .order_by('module__section__order', 'module__order', 'order', 'id')
    )
    metrics = user_learning_metrics(user, sections, active_lessons)
    activity_progress = activity_progress_state(user)

    users = list(get_user_model().objects.filter(is_active=True).order_by('id'))
    leaderboard_rows = []

    for candidate in users:
        candidate_metrics = user_learning_metrics(candidate, sections, active_lessons)
        display = user_payload(candidate)['display_name']
        leaderboard_rows.append({
            'user_id': candidate.id,
            'name': display,
            'points': candidate_metrics['points'],
            'badges': candidate_metrics['completed_sections'],
            'hours': candidate_metrics['study_hours'],
            'isCurrentUser': candidate.id == user.id,
        })

    leaderboard_rows.sort(
        key=lambda item: (-item['points'], -item['badges'], -item['hours'], item['name'].lower())
    )

    for index, row in enumerate(leaderboard_rows, start=1):
        row['place'] = index

    current_rank = next(
        (row['place'] for row in leaderboard_rows if row['isCurrentUser']),
        None
    )

    certificates = []
    for row in metrics['certificates']:
        section = row['title']
        title = localized_value(section, 'title', lang)
        fallback_description = (
            f"{row['completed_modules']} of {row['total_modules']} modules completed"
            if lang == 'en'
            else f"{row['completed_modules']} / {row['total_modules']} модуль аяқталды"
            if lang == 'kz'
            else f"Завершено {row['completed_modules']} из {row['total_modules']} модулей"
        )
        certificates.append({
            'id': row['id'],
            'order': row['order'],
            'title': title,
            'description': localized_value(section, 'description', lang) or fallback_description,
            'icon': section_icon(row['order']),
            'completed': row['completed'],
            'completedModules': row['completed_modules'],
            'totalModules': row['total_modules'],
            'completedLessons': row['completed_modules'],
            'totalLessons': row['total_modules'],
            'progressPercent': row['progress_percent'],
        })

    best_results = sorted(
        metrics['best_results'].values(),
        key=lambda item: item['result'].lesson_id or 0
    )
    grade_rows = []

    for item in best_results:
        result = item['result']
        lesson_title = localized_value(result.lesson, 'title', lang) if result.lesson else ''
        grade_rows.append({
            'id': result.id,
            'title': lesson_title,
            'score': result.score,
            'maxScore': result.max_score,
            'percent': item['percent'],
            'correctCount': result.correct_count,
            'totalQuestions': result.total_questions,
            'createdAt': result.created_at.isoformat(),
        })

    return {
        'stats': {
            'totalLessons': metrics['lesson_count'],
            'completedLessons': metrics['completed_lessons'],
            'totalModules': metrics['module_count'],
            'completedModules': metrics['completed_modules'],
            'totalSections': metrics['total_sections'],
            'completedSections': metrics['completed_sections'],
            'overallProgressPercent': metrics['overall_progress_percent'],
            'lessonProgressPercent': metrics['lesson_progress_percent'],
            'averageScorePercent': metrics['average_score_percent'],
            'totalScore': metrics['total_score'],
            'totalMaxScore': metrics['total_max_score'],
            'totalQuizzes': metrics['total_quizzes'],
            'studyHours': metrics['study_hours'],
            'rank': current_rank,
            'passingScorePercent': PASSING_SCORE_PERCENT,
            'inProgressLessons': metrics['in_progress_lessons'],
            'inProgressModules': metrics['in_progress_modules'],
            'directoryCardsCompleted': activity_progress['directoryCards']['completed'],
            'directoryCardsTotal': activity_progress['directoryCards']['total'],
            'simulatorsCompleted': activity_progress['simulators']['completed'],
            'simulatorsTotal': activity_progress['simulators']['total'],
        },
        'leaderboard': leaderboard_rows,
        'certificates': certificates,
        'grades': grade_rows,
        'activityProgress': activity_progress,
        'progress': {
            'completedLessonIds': sorted(metrics['completed_lesson_ids']),
            'attemptedLessonIds': sorted(metrics['attempted_lesson_ids']),
            'completedModuleIds': sorted(metrics['completed_module_ids']),
            'attemptedModuleIds': sorted(metrics['attempted_module_ids']),
        },
    }


@require_GET
def me_api(request):
    if not request.user.is_authenticated:
        return JsonResponse({'authenticated': False}, status=401)

    return JsonResponse({
        'authenticated': True,
        'user': user_payload(request.user)
    })


@require_POST
def logout_api(request):
    auth_logout(request)
    return JsonResponse({'ok': True})


def localized_value(instance, field_name, lang):
    return (
        getattr(instance, f'{field_name}_{lang}', None)
        or getattr(instance, f'{field_name}_ru', None)
        or ''
    )


def module_icon(module_index):
    icons = [
        'fas fa-book-open',
        'fas fa-traffic-light',
        'fas fa-exclamation-triangle',
        'fas fa-flag',
        'fas fa-map-signs',
        'fas fa-volume-up',
        'fas fa-train',
    ]
    return icons[(module_index - 1) % len(icons)]


def lesson_count_label(count, lang):
    if lang == 'en':
        return f'{count} lesson{"s" if count != 1 else ""}'

    if lang == 'kz':
        return f'{count} тақырып'

    mod10 = count % 10
    mod100 = count % 100

    if mod10 == 1 and mod100 != 11:
        word = 'тема'
    elif 2 <= mod10 <= 4 and not 12 <= mod100 <= 14:
        word = 'темы'
    else:
        word = 'тем'

    return f'{count} {word}'


def video_title(lesson_title, lang):
    prefixes = {
        'ru': 'Видеолекция',
        'kz': 'Бейнесабақ',
        'en': 'Video lecture',
    }
    return f'{prefixes.get(lang, prefixes["ru"])}: {lesson_title}'


def question_payload(question, lang):
    question_text = localized_value(question, 'question', lang)
    options = [
        {
            'text': localized_value(question, 'option_a', lang),
            'correct': question.correct_answer == 'A',
        },
        {
            'text': localized_value(question, 'option_b', lang),
            'correct': question.correct_answer == 'B',
        },
        {
            'text': localized_value(question, 'option_c', lang),
            'correct': question.correct_answer == 'C',
        },
    ]

    return {
        'id': question.id,
        'question': question_text,
        'text': question_text,
        'video': question.video_url,
        'img': question.image_url,
        'option_a': options[0]['text'],
        'option_b': options[1]['text'],
        'option_c': options[2]['text'],
        'correct_answer': question.correct_answer,
        'correct': question.correct_answer,
        'basePoints': question.base_points,
        'penaltyPoints': question.penalty_points,
        'base_points': question.base_points,
        'penalty_points': question.penalty_points,
        'options': options,
        'explanation': localized_value(question, 'explanation', lang),
    }


def course_modules_api(request):
    if not request.user.is_authenticated:
        return JsonResponse({'authenticated': False}, status=401)

    lang = request_language(request)
    remember_language(request, lang)

    sections = Section.objects.all().order_by('order')
    section_map = {}
    data = []

    for section in sections:
        section_data = {
            'id': section.id,
            'order': section.order,
            'title': localized_value(section, 'title', lang),
            'description': localized_value(section, 'description', lang),
            'modules': [],
        }
        section_map[section.id] = section_data
        data.append(section_data)

    modules_qs = (
        CourseModule.objects
        .select_related('section')
        .prefetch_related('lessons__questions')
        .annotate(
            section_missing=Case(
                When(section__isnull=True, then=Value(1)),
                default=Value(0),
                output_field=IntegerField(),
            )
        )
        .order_by('section_missing', 'section__order', 'order', 'id')
    )

    modules = []
    lessons = {}

    for module_index, module in enumerate(modules_qs, start=1):
        lesson_summaries = []
        module_data = {
            'id': module.id,
            'key': f'm{module_index}',
            'order': module.order,
            'section_id': module.section_id,
            'section_order': module.section.order if module.section else None,
            'title': localized_value(module, 'title', lang),
            'description': localized_value(module, 'description', lang),
            'icon': module_icon(module_index),
            'lessons': lesson_summaries,
        }

        for lesson in module.lessons.filter(is_active=True).order_by('order', 'id'):
            lesson_key = f'm{module_index}l{lesson.order}'
            lesson_title = localized_value(lesson, 'title', lang)
            lesson_content = localized_value(lesson, 'content', lang)
            questions = [
                question_payload(question, lang)
                for question in lesson.questions.all().order_by('id')
            ]
            lesson_data = {
                'id': lesson.id,
                'key': lesson_key,
                'order': lesson.order,
                'title': lesson_title,
                'content': lesson_content,
                'theory': lesson_content,
                'videoTitle': video_title(lesson_title, lang),
                'videoUrl': lesson.video_url,
                'imageUrl': lesson.image_url,
                'questions': questions,
            }
            lesson_summary = {
                'id': lesson.id,
                'key': lesson_key,
                'order': lesson.order,
                'label': f'{lesson.order}. {lesson_title}',
                'title': lesson_title,
                'videoUrl': lesson.video_url,
                'imageUrl': lesson.image_url,
                'questions': questions,
            }
            lesson_summaries.append(lesson_summary)
            lessons[lesson_key] = lesson_data

        module_data['meta'] = lesson_count_label(len(lesson_summaries), lang)
        modules.append(module_data)

        if module.section_id in section_map:
            section_map[module.section_id]['modules'].append(module_data)

    return response_with_language(JsonResponse({
        'authenticated': True,
        'lang': lang,
        'user': user_payload(request.user),
        'learning': learning_state(request.user, lang),
        'ui': course_ui_for_language(lang),
        'sections': data,
        'modules': modules,
        'lessons': lessons,
    }), lang)

@require_POST
def api_progress(request):
    if not request.user.is_authenticated:
        return JsonResponse(
            {"detail": "Authentication required"},
            status=401
        )

    try:
        payload = json.loads(request.body.decode("utf-8"))
    except json.JSONDecodeError:
        return JsonResponse(
            {"detail": "Invalid JSON"},
            status=400
        )

    answers = payload.get("answers", [])

    if not isinstance(answers, list):
        return JsonResponse(
            {"detail": "Answers must be a list"},
            status=400
        )

    total_score = 0
    max_score = 0
    correct_count = 0
    details = []
    lesson = None

    question_ids = []

    for item in answers:
        question_id = item.get("question_id")

        if question_id:
            question_ids.append(question_id)

    questions = {
        question.id: question
        for question in Question.objects.filter(id__in=question_ids)
    }

    for item in answers:
        question_id = item.get("question_id")
        selected_answer = str(item.get("selected_answer", "")).strip().upper()

        question = questions.get(question_id)

        if not question:
            continue

        if lesson is None:
            lesson = question.lesson

        correct_answer = str(question.correct_answer).strip().upper()
        is_correct = selected_answer == correct_answer

        base_points = question.base_points
        penalty_points = question.penalty_points

        max_score += base_points

        if is_correct:
            correct_count += 1

        points_delta = question_score(base_points, penalty_points, is_correct)

        total_score += points_delta

        details.append({
            "question_id": question.id,
            "selected_answer": selected_answer,
            "correct_answer": correct_answer,
            "is_correct": is_correct,
            "points_delta": points_delta,
            "base_points": base_points,
            "penalty_points": penalty_points,
        })

    quiz_result = QuizResult.objects.create(
        user=request.user,
        lesson=lesson,
        score=total_score,
        max_score=max_score,
        correct_count=correct_count,
        total_questions=len(details),
        details=details
    )

    progress_record = None
    if lesson:
        score_percent = percent(total_score, max_score)
        expected_question_count = lesson.questions.count()
        is_completed = (
            bool(details)
            and expected_question_count > 0
            and len(details) >= expected_question_count
            and score_percent >= PASSING_SCORE_PERCENT
        )
        progress_record = UserProgress.objects.filter(
            user=request.user,
            lesson=lesson,
        ).order_by('id').first()

        if progress_record:
            progress_record.progress_percent = score_percent
            progress_record.is_completed = is_completed
            progress_record.save(update_fields=[
                'progress_percent',
                'is_completed',
                'updated_at',
            ])
        else:
            progress_record = UserProgress.objects.create(
                user=request.user,
                lesson=lesson,
                progress_percent=score_percent,
                is_completed=is_completed,
            )

    lang = request_language(request)

    return JsonResponse({
        "result_id": quiz_result.id,
        "progress_id": progress_record.id if progress_record else None,
        "score": total_score,
        "max_score": max_score,
        "correct_count": correct_count,
        "total_questions": len(details),
        "percent": percent(total_score, max_score),
        "passing_score_percent": PASSING_SCORE_PERCENT,
        "is_completed": progress_record.is_completed if progress_record else False,
        "details": details,
        "learning": learning_state(request.user, lang),
    })


@require_POST
def api_activity_progress(request):
    if not request.user.is_authenticated:
        return JsonResponse(
            {"detail": "Authentication required"},
            status=401,
        )

    try:
        payload = json.loads(request.body.decode("utf-8"))
    except json.JSONDecodeError:
        return JsonResponse(
            {"detail": "Invalid JSON"},
            status=400,
        )

    activity_type = str(payload.get('activity_type', '')).strip()
    activity_key = str(payload.get('activity_key', '')).strip()
    is_completed = bool(payload.get('is_completed', True))

    if activity_type not in ACTIVITY_PROGRESS_TOTALS:
        return JsonResponse(
            {"detail": "Unsupported activity type"},
            status=400,
        )

    if not activity_key:
        return JsonResponse(
            {"detail": "Activity key is required"},
            status=400,
        )

    progress, _ = LearningActivityProgress.objects.update_or_create(
        user=request.user,
        activity_type=activity_type,
        activity_key=activity_key,
        defaults={'is_completed': is_completed},
    )

    lang = request_language(request)

    return JsonResponse({
        'id': progress.id,
        'activity_type': progress.activity_type,
        'activity_key': progress.activity_key,
        'is_completed': progress.is_completed,
        'learning': learning_state(request.user, lang),
    })
