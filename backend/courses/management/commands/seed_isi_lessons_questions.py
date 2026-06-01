from html import escape

from django.core.management.base import BaseCommand
from django.db import transaction

from courses.models import Lesson, Module, Question


PLACEHOLDERS = {
    'ru': 'Материал будет дополнен.',
    'kz': 'Материал кейін толықтырылады.',
    'en': 'The material will be completed later.',
}


MODULE_TOPICS = [
    {
        'ru': 'Введение в Инструкцию по сигнализации',
        'kz': 'Сигнал беру нұсқаулығына кіріспе',
        'en': 'Introduction to the Signaling Instruction',
    },
    {
        'ru': 'Сигналы и их классификация',
        'kz': 'Сигналдар және олардың жіктелуі',
        'en': 'Signals and Their Classification',
    },
    {
        'ru': 'Светофоры: виды и классификация',
        'kz': 'Бағдаршамдар: түрлері және жіктелуі',
        'en': 'Signal Lights: Types and Classification',
    },
    {
        'ru': 'Основные значения сигналов светофоров',
        'kz': 'Бағдаршам сигналдарының негізгі мәндері',
        'en': 'Main Meanings of Signal Light Indications',
    },
    {
        'ru': 'Входные светофоры',
        'kz': 'Кіру бағдаршамдары',
        'en': 'Entrance Signal Lights',
    },
    {
        'ru': 'Входные и маршрутные светофоры при приеме на боковые пути',
        'kz': 'Бүйір жолдарға қабылдау кезіндегі кіру және маршруттық бағдаршамдар',
        'en': 'Entrance and Route Signal Lights for Receiving Trains onto Side Tracks',
    },
    {
        'ru': 'Пригласительный сигнал',
        'kz': 'Шақыру сигналы',
        'en': 'Calling-on Signal',
    },
    {
        'ru': 'Выходные и маршрутные светофоры',
        'kz': 'Шығу және маршруттық бағдаршамдар',
        'en': 'Exit and Route Signal Lights',
    },
    {
        'ru': 'Проходные светофоры',
        'kz': 'Өтпелі бағдаршамдар',
        'en': 'Block Signal Lights',
    },
    {
        'ru': 'Светофоры прикрытия, заградительные, предупредительные и повторительные',
        'kz': 'Қорғау, бөгет, ескерту және қайталау бағдаршамдары',
        'en': 'Covering, Barrier, Warning and Repeater Signal Lights',
    },
    {
        'ru': 'Локомотивные светофоры и специальные случаи',
        'kz': 'Локомотивтік бағдаршамдар және арнайы жағдайлар',
        'en': 'Locomotive Signal Lights and Special Cases',
    },
    {
        'ru': 'Постоянные диски уменьшения скорости',
        'kz': 'Жылдамдықты тұрақты азайту дискілері',
        'en': 'Permanent Speed Reduction Discs',
    },
    {
        'ru': 'Переносные сигналы',
        'kz': 'Жылжымалы сигналдар',
        'en': 'Portable Signals',
    },
    {
        'ru': 'Ограждение препятствий и мест работ на перегонах',
        'kz': 'Аралықтардағы кедергілер мен жұмыс орындарын қоршау',
        'en': 'Protection of Obstructions and Work Areas on Railway Sections',
    },
    {
        'ru': 'Ограждение препятствий и работ на станциях',
        'kz': 'Станциялардағы кедергілер мен жұмыс орындарын қоршау',
        'en': 'Protection of Obstructions and Work Areas at Stations',
    },
    {
        'ru': 'Ограждение подвижного состава и поезда при вынужденной остановке',
        'kz': 'Жылжымалы құрамды және мәжбүрлі тоқтаған пойызды қоршау',
        'en': 'Protection of Rolling Stock and Trains During Forced Stops',
    },
    {
        'ru': 'Основные ручные сигналы',
        'kz': 'Негізгі қол сигналдары',
        'en': 'Main Hand Signals',
    },
    {
        'ru': 'Ручные сигналы при движении поездов',
        'kz': 'Пойыз қозғалысы кезіндегі қол сигналдары',
        'en': 'Hand Signals During Train Movement',
    },
    {
        'ru': 'Маршрутные и стрелочные указатели',
        'kz': 'Маршруттық және стрелкалық көрсеткіштер',
        'en': 'Route and Switch Indicators',
    },
    {
        'ru': 'Указатели границ блок-участков и постоянные сигнальные знаки',
        'kz': 'Блок-учаскелер шекарасының көрсеткіштері және тұрақты сигналдық белгілер',
        'en': 'Block Section Boundary Indicators and Permanent Signal Signs',
    },
    {
        'ru': 'Постоянные, предупредительные и временные сигнальные знаки',
        'kz': 'Тұрақты, ескерту және уақытша сигналдық белгілер',
        'en': 'Permanent, Warning and Temporary Signal Signs',
    },
    {
        'ru': 'Сигналы, применяемые при маневровой работе',
        'kz': 'Маневрлік жұмыс кезінде қолданылатын сигналдар',
        'en': 'Signals Used During Shunting Operations',
    },
    {
        'ru': 'Основные звуковые сигналы при движении поездов',
        'kz': 'Пойыз қозғалысы кезіндегі негізгі дыбыстық сигналдар',
        'en': 'Main Audible Signals During Train Movement',
    },
    {
        'ru': 'Сигналы тревоги',
        'kz': 'Дабыл сигналдары',
        'en': 'Alarm Signals',
    },
    {
        'ru': 'Выдача сигнальных приборов работникам',
        'kz': 'Қызметкерлерге сигналдық құралдарды беру',
        'en': 'Issuing Signaling Devices to Employees',
    },
    {
        'ru': 'Учет, хранение и ответственность за сигнальные приборы',
        'kz': 'Сигналдық құралдарды есепке алу, сақтау және жауапкершілік',
        'en': 'Recording, Storage and Responsibility for Signaling Devices',
    },
]


def title_for(module_number, topic):
    return {
        'ru': f'Урок {module_number}.1. {topic["ru"]}',
        'kz': f'Сабақ {module_number}.1. {topic["kz"]}',
        'en': f'Lesson {module_number}.1. {topic["en"]}',
    }


def lesson_content(topic, lang):
    safe_topic = escape(topic[lang])

    if lang == 'ru':
        return f'''
<h3>Цель урока</h3>
<p>Изучить тему «{safe_topic}», назначение сигналов и их роль в обеспечении безопасности движения поездов.</p>

<div class="lesson-rule">
  <strong>Правило:</strong> сигналы служат для передачи приказов и указаний, связанных с движением поездов и маневровой работой.
</div>

<div class="lesson-warning">
  <strong>Важно:</strong> неправильное восприятие сигнала может привести к нарушению безопасности движения.
</div>

<h3>Ключевые понятия</h3>
<ul>
  <li>видимые сигналы;</li>
  <li>звуковые сигналы;</li>
  <li>сигнальные указатели;</li>
  <li>порядок восприятия сигналов работниками железнодорожного транспорта.</li>
</ul>

<div class="regulation-citation">
  Основание: Инструкция по сигнализации на железнодорожном транспорте, приказ №209.
</div>
'''.strip()

    if lang == 'kz':
        return f'''
<h3>Сабақтың мақсаты</h3>
<p>«{safe_topic}» тақырыбын, сигналдардың мақсатын және олардың пойыз қозғалысының қауіпсіздігін қамтамасыз етудегі рөлін зерделеу.</p>

<div class="lesson-rule">
  <strong>Ереже:</strong> сигналдар пойыз қозғалысы мен маневрлік жұмысқа байланысты бұйрықтар мен нұсқауларды беру үшін қолданылады.
</div>

<div class="lesson-warning">
  <strong>Маңызды:</strong> сигналды дұрыс қабылдамау қозғалыс қауіпсіздігінің бұзылуына әкелуі мүмкін.
</div>

<h3>Негізгі ұғымдар</h3>
<ul>
  <li>көрінетін сигналдар;</li>
  <li>дыбыстық сигналдар;</li>
  <li>сигналдық көрсеткіштер;</li>
  <li>теміржол көлігі қызметкерлерінің сигналдарды қабылдау тәртібі.</li>
</ul>

<div class="regulation-citation">
  Негіздеме: Теміржол көлігіндегі сигнал беру нұсқаулығы, №209 бұйрық.
</div>
'''.strip()

    return f'''
<h3>Lesson Objective</h3>
<p>Study “{safe_topic}”, the purpose of signals and their role in ensuring safe train movement.</p>

<div class="lesson-rule">
  <strong>Rule:</strong> signals are used to transmit orders and instructions related to train movement and shunting operations.
</div>

<div class="lesson-warning">
  <strong>Important:</strong> incorrect interpretation of a signal may lead to a violation of traffic safety.
</div>

<h3>Key Concepts</h3>
<ul>
  <li>visual signals;</li>
  <li>audible signals;</li>
  <li>signal indicators;</li>
  <li>the procedure for railway employees to interpret signals.</li>
</ul>

<div class="regulation-citation">
  Basis: Signaling Instruction for railway transport, Order No. 209.
</div>
'''.strip()


def question_payloads(topic):
    safe_ru = topic['ru']
    safe_kz = topic['kz']
    safe_en = topic['en']

    return [
        {
            'question_ru': f'Что должен обеспечить работник после изучения темы «{safe_ru}»?',
            'question_kz': f'«{safe_kz}» тақырыбын оқығаннан кейін қызметкер нені қамтамасыз етуі керек?',
            'question_en': f'What should an employee ensure after studying “{safe_en}”?',
            'option_a_ru': 'Правильное применение требований темы в работе с сигналами и движением поездов.',
            'option_a_kz': 'Сигналдармен және пойыз қозғалысымен жұмыс кезінде тақырып талаптарын дұрыс қолдану.',
            'option_a_en': 'Correct application of the topic requirements when working with signals and train movement.',
            'option_b_ru': 'Использование сигналов только для оформления отчетности.',
            'option_b_kz': 'Сигналдарды тек есепті рәсімдеу үшін қолдану.',
            'option_b_en': 'Using signals only for reporting documentation.',
            'option_c_ru': 'Игнорирование сигнальных показаний при исправных устройствах.',
            'option_c_kz': 'Құрылғылар дұрыс жұмыс істегенде сигнал көрсеткіштерін елемеу.',
            'option_c_en': 'Ignoring signal indications when devices are operating correctly.',
            'correct_answer': 'A',
        },
        {
            'question_ru': 'Как следует относиться к требованиям Инструкции по сигнализации?',
            'question_kz': 'Сигнал беру нұсқаулығының талаптарына қалай қарау керек?',
            'question_en': 'How should the requirements of the Signaling Instruction be treated?',
            'option_a_ru': 'Как к дополнительным рекомендациям без обязательного исполнения.',
            'option_a_kz': 'Міндетті орындауды қажет етпейтін қосымша ұсынымдар ретінде.',
            'option_a_en': 'As optional recommendations that do not require mandatory execution.',
            'option_b_ru': 'Как к обязательным требованиям, связанным с безопасностью движения.',
            'option_b_kz': 'Қозғалыс қауіпсіздігімен байланысты міндетті талаптар ретінде.',
            'option_b_en': 'As mandatory requirements related to traffic safety.',
            'option_c_ru': 'Как к информации только для административного персонала.',
            'option_c_kz': 'Тек әкімшілік персоналға арналған ақпарат ретінде.',
            'option_c_en': 'As information intended only for administrative personnel.',
            'correct_answer': 'B',
        },
    ]


def fallback_topic(module):
    return {
        'ru': module.title_ru,
        'kz': module.title_kz or module.title_ru,
        'en': module.title_en or module.title_ru,
    }


class Command(BaseCommand):
    help = 'Create or update one ISI lesson and related quiz questions for existing modules.'

    def handle(self, *args, **options):
        modules = list(
            Module.objects
            .select_related('section')
            .order_by('section__order', 'order', 'id')
        )

        if not modules:
            self.stdout.write(self.style.WARNING('No Module records found. Nothing was seeded.'))
            return

        if len(modules) != len(MODULE_TOPICS):
            self.stdout.write(
                self.style.WARNING(
                    f'Found {len(modules)} modules, expected {len(MODULE_TOPICS)}. '
                    'The command will seed all existing modules and use generic topics for extra records.'
                )
            )

        lessons_created = 0
        lessons_updated = 0
        questions_created = 0
        questions_updated = 0

        with transaction.atomic():
            for index, module in enumerate(modules, start=1):
                topic = MODULE_TOPICS[index - 1] if index <= len(MODULE_TOPICS) else fallback_topic(module)
                lesson_title = title_for(index, topic)

                lesson, lesson_created = Lesson.objects.update_or_create(
                    module=module,
                    order=1,
                    defaults={
                        'title_ru': lesson_title['ru'],
                        'title_kz': lesson_title['kz'],
                        'title_en': lesson_title['en'],
                        'content_ru': lesson_content(topic, 'ru'),
                        'content_kz': lesson_content(topic, 'kz'),
                        'content_en': lesson_content(topic, 'en'),
                        'is_active': True,
                        'video_url': '',
                        'image_url': '',
                    },
                )

                if lesson_created:
                    lessons_created += 1
                else:
                    lessons_updated += 1

                for payload in question_payloads(topic):
                    payload.update({
                        'base_points': 10,
                        'penalty_points': 5,
                        'video_url': '',
                        'image_url': '',
                    })
                    _, question_created = Question.objects.update_or_create(
                        lesson=lesson,
                        question_ru=payload['question_ru'],
                        defaults=payload,
                    )

                    if question_created:
                        questions_created += 1
                    else:
                        questions_updated += 1

        self.stdout.write(
            self.style.SUCCESS(
                'ISI lessons/questions seeded. '
                f'Lessons created: {lessons_created}, updated: {lessons_updated}. '
                f'Questions created: {questions_created}, updated: {questions_updated}.'
            )
        )
