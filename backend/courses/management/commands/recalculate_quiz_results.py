from django.core.management.base import BaseCommand

from courses.models import QuizResult
from courses.scoring import quiz_totals_from_details


class Command(BaseCommand):
    help = 'Recalculate saved quiz results using the backend scoring formula.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--apply',
            action='store_true',
            help='Save recalculated values. Without this flag the command only reports changes.',
        )
        parser.add_argument(
            '--ids',
            nargs='*',
            type=int,
            help='Optional quiz result IDs to recalculate.',
        )

    def handle(self, *args, **options):
        queryset = QuizResult.objects.all().order_by('id')

        if options['ids']:
            queryset = queryset.filter(id__in=options['ids'])

        checked = 0
        changed = 0

        for result in queryset:
            checked += 1
            totals = quiz_totals_from_details(result.details)
            changed_fields = []

            for field_name in ('score', 'max_score', 'correct_count', 'total_questions', 'details'):
                if getattr(result, field_name) != totals[field_name]:
                    changed_fields.append(field_name)

            if not changed_fields:
                continue

            changed += 1
            self.stdout.write(
                f'QuizResult #{result.id}: '
                f'score {result.score} -> {totals["score"]}, '
                f'max_score {result.max_score} -> {totals["max_score"]}, '
                f'correct_count {result.correct_count} -> {totals["correct_count"]}, '
                f'total_questions {result.total_questions} -> {totals["total_questions"]}'
            )

            if options['apply']:
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

        mode = 'updated' if options['apply'] else 'would update'
        self.stdout.write(self.style.SUCCESS(
            f'Checked {checked} quiz result(s); {mode} {changed}.'
        ))
