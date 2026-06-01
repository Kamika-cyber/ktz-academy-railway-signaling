from django.core.management.base import BaseCommand

from courses.models import Question


TEMPORARY_VIDEO_URL = '/media/question-videos/temporary-question-video.mp4'


LANGUAGE_TEXT = {
    'en': {
        'prefix': 'The correct answer is option {letter}: "{answer}".',
        'body': (
            'This option matches the signaling rule checked by the question. '
            'The other options describe a different indication or operating condition.'
        ),
    },
    'ru': {
        'prefix': 'Правильный ответ - вариант {letter}: "{answer}".',
        'body': (
            'Этот вариант соответствует правилу сигнализации, которое проверяется в вопросе. '
            'Остальные варианты описывают другое показание или другое условие движения.'
        ),
    },
    'kz': {
        'prefix': 'Дұрыс жауап - {letter} нұсқасы: "{answer}".',
        'body': (
            'Бұл нұсқа сұрақта тексерілетін сигнал беру ережесіне сәйкес келеді. '
            'Қалған нұсқалар басқа көрсеткішті немесе басқа қозғалыс шартын сипаттайды.'
        ),
    },
}


def option_text(question, lang):
    field_name = f'option_{question.correct_answer.lower()}_{lang}'
    fallback_name = f'option_{question.correct_answer.lower()}_ru'
    return getattr(question, field_name, '') or getattr(question, fallback_name, '') or question.correct_answer


def explanation_text(question, lang):
    text = LANGUAGE_TEXT[lang]
    answer = option_text(question, lang)

    return f'{text["prefix"].format(letter=question.correct_answer, answer=answer)} {text["body"]}'


class Command(BaseCommand):
    help = 'Fill temporary question videos and expert explanations for existing questions.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--overwrite',
            action='store_true',
            help='Replace existing video_url and explanation fields.',
        )

    def handle(self, *args, **options):
        overwrite = options['overwrite']
        updated = 0
        skipped = 0

        for question in Question.objects.all().order_by('id'):
            changed_fields = []

            if overwrite or not question.video_url:
                question.video_url = TEMPORARY_VIDEO_URL
                changed_fields.append('video_url')

            for lang in ('en', 'ru', 'kz'):
                field_name = f'explanation_{lang}'

                if overwrite or not getattr(question, field_name):
                    setattr(question, field_name, explanation_text(question, lang))
                    changed_fields.append(field_name)

            if changed_fields:
                question.save(update_fields=sorted(set(changed_fields)))
                updated += 1
            else:
                skipped += 1

        self.stdout.write(self.style.SUCCESS(
            f'Updated {updated} question(s). Skipped {skipped} already filled question(s).'
        ))
