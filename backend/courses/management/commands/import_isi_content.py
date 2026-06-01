import json
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from courses.models import Lesson, Module, Question


LESSON_FIELDS = (
    'title_ru',
    'title_kz',
    'title_en',
    'content_ru',
    'content_kz',
    'content_en',
    'video_url',
    'image_url',
)

QUESTION_FIELDS = (
    'question_ru',
    'question_kz',
    'question_en',
    'option_a_ru',
    'option_a_kz',
    'option_a_en',
    'option_b_ru',
    'option_b_kz',
    'option_b_en',
    'option_c_ru',
    'option_c_kz',
    'option_c_en',
    'correct_answer',
    'base_points',
    'penalty_points',
    'video_url',
    'image_url',
)

REQUIRED_LESSON_FIELDS = ('title_ru', 'title_kz', 'title_en')
REQUIRED_QUESTION_FIELDS = (
    'question_ru',
    'question_kz',
    'question_en',
    'option_a_ru',
    'option_a_kz',
    'option_a_en',
    'option_b_ru',
    'option_b_kz',
    'option_b_en',
    'option_c_ru',
    'option_c_kz',
    'option_c_en',
    'correct_answer',
)


class Command(BaseCommand):
    help = 'Import ISI lesson and question content from a JSON file.'

    def add_arguments(self, parser):
        parser.add_argument(
            'json_path',
            help='Path to JSON file with ISI lesson and question content.',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Validate and count changes, then roll back the transaction.',
        )

    def handle(self, *args, **options):
        json_path = Path(options['json_path'])
        dry_run = options['dry_run']

        data = self.load_json(json_path)
        entries = self.get_module_entries(data)
        modules_by_order = self.get_modules_by_order()

        lessons_created = 0
        lessons_updated = 0
        questions_created = 0
        questions_updated = 0

        with transaction.atomic():
            for entry_index, entry in enumerate(entries, start=1):
                module_order = self.require_positive_int(
                    entry.get('module_order'),
                    f'Entry #{entry_index}: module_order',
                )
                module = modules_by_order.get(module_order)

                if module is None:
                    raise CommandError(
                        f'Entry #{entry_index}: Module with module_order={module_order} was not found.'
                    )

                lesson_payload = self.get_lesson_payload(entry, entry_index)
                questions_payload = self.get_questions_payload(entry, lesson_payload, entry_index)
                lesson_order = self.optional_positive_int(lesson_payload.get('order'), default=1)
                lesson_defaults = self.build_lesson_defaults(lesson_payload, entry_index)

                lesson, created = Lesson.objects.update_or_create(
                    module=module,
                    order=lesson_order,
                    defaults=lesson_defaults,
                )

                if created:
                    lessons_created += 1
                else:
                    lessons_updated += 1

                existing_questions = list(lesson.questions.all().order_by('id'))

                for question_index, question_payload in enumerate(questions_payload, start=1):
                    question_defaults = self.build_question_defaults(
                        question_payload,
                        entry_index,
                        question_index,
                    )
                    existing_question = (
                        existing_questions[question_index - 1]
                        if question_index <= len(existing_questions)
                        else None
                    )

                    if existing_question:
                        _, question_created = Question.objects.update_or_create(
                            id=existing_question.id,
                            defaults={
                                **question_defaults,
                                'lesson': lesson,
                            },
                        )
                    else:
                        _, question_created = Question.objects.update_or_create(
                            lesson=lesson,
                            question_ru=question_defaults['question_ru'],
                            defaults=question_defaults,
                        )

                    if question_created:
                        questions_created += 1
                    else:
                        questions_updated += 1

            if dry_run:
                transaction.set_rollback(True)

        prefix = 'DRY RUN: ' if dry_run else ''
        self.stdout.write(
            self.style.SUCCESS(
                f'{prefix}ISI content import finished. '
                f'Created lessons: {lessons_created}. '
                f'Updated lessons: {lessons_updated}. '
                f'Created questions: {questions_created}. '
                f'Updated questions: {questions_updated}.'
            )
        )

    def load_json(self, json_path):
        if not json_path.exists():
            raise CommandError(f'JSON file not found: {json_path}')

        try:
            with json_path.open('r', encoding='utf-8-sig') as file:
                return json.load(file)
        except json.JSONDecodeError as error:
            raise CommandError(f'Invalid JSON in {json_path}: {error}') from error

    def get_module_entries(self, data):
        if isinstance(data, list):
            entries = data
        elif isinstance(data, dict) and isinstance(data.get('modules'), list):
            entries = data['modules']
        else:
            raise CommandError('JSON root must be a list or an object with a "modules" list.')

        if not entries:
            raise CommandError('JSON does not contain any module entries.')

        for index, entry in enumerate(entries, start=1):
            if not isinstance(entry, dict):
                raise CommandError(f'Entry #{index} must be an object.')

        return entries

    def get_modules_by_order(self):
        modules = list(
            Module.objects
            .select_related('section')
            .order_by('section__order', 'order', 'id')
        )
        return {
            index: module
            for index, module in enumerate(modules, start=1)
        }

    def get_lesson_payload(self, entry, entry_index):
        lesson_payload = entry.get('lesson', entry)

        if not isinstance(lesson_payload, dict):
            raise CommandError(f'Entry #{entry_index}: lesson must be an object.')

        for field_name in REQUIRED_LESSON_FIELDS:
            if not str(lesson_payload.get(field_name, '')).strip():
                raise CommandError(f'Entry #{entry_index}: missing lesson field "{field_name}".')

        return lesson_payload

    def get_questions_payload(self, entry, lesson_payload, entry_index):
        questions = lesson_payload.get('questions', entry.get('questions', []))

        if not isinstance(questions, list):
            raise CommandError(f'Entry #{entry_index}: questions must be a list.')

        for question_index, question in enumerate(questions, start=1):
            if not isinstance(question, dict):
                raise CommandError(
                    f'Entry #{entry_index}, question #{question_index}: question must be an object.'
                )

        return questions

    def build_lesson_defaults(self, lesson_payload, entry_index):
        defaults = {
            field_name: str(lesson_payload.get(field_name, '') or '')
            for field_name in LESSON_FIELDS
        }
        defaults['is_active'] = bool(lesson_payload.get('is_active', True))

        return defaults

    def build_question_defaults(self, question_payload, entry_index, question_index):
        for field_name in REQUIRED_QUESTION_FIELDS:
            if not str(question_payload.get(field_name, '')).strip():
                raise CommandError(
                    f'Entry #{entry_index}, question #{question_index}: '
                    f'missing question field "{field_name}".'
                )

        correct_answer = str(question_payload.get('correct_answer', '')).strip().upper()
        if correct_answer not in {'A', 'B', 'C'}:
            raise CommandError(
                f'Entry #{entry_index}, question #{question_index}: '
                'correct_answer must be A, B or C.'
            )

        defaults = {
            field_name: str(question_payload.get(field_name, '') or '')
            for field_name in QUESTION_FIELDS
        }
        defaults['correct_answer'] = correct_answer
        defaults['base_points'] = self.optional_positive_int(
            question_payload.get('base_points'),
            default=10,
        )
        defaults['penalty_points'] = self.optional_positive_int(
            question_payload.get('penalty_points'),
            default=5,
        )

        return defaults

    def require_positive_int(self, value, label):
        parsed_value = self.optional_positive_int(value, default=None)

        if parsed_value is None:
            raise CommandError(f'{label} is required and must be a positive integer.')

        return parsed_value

    def optional_positive_int(self, value, default):
        if value in (None, ''):
            return default

        try:
            parsed_value = int(value)
        except (TypeError, ValueError) as error:
            raise CommandError('Expected a positive integer value.') from error

        if parsed_value < 1:
            raise CommandError('Expected a positive integer value.')

        return parsed_value
