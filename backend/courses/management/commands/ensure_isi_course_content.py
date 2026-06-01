from html import escape

from django.core.management.base import BaseCommand
from django.db import transaction

from courses.management.commands.seed_isi_lessons_questions import (
    MODULE_TOPICS,
    lesson_content,
    title_for,
)
from courses.models import Lesson, Module, Question, Section


PLACEHOLDER_VIDEO_URL = '/media/question-videos/temporary-question-video.mp4'
SECTION_DEFINITIONS = [
    {
        'order': 1,
        'title_en': 'Section 1: General Provisions',
        'title_ru': 'Раздел 1: Общие положения',
        'title_kz': '1-бөлім: Жалпы ережелер',
        'description_en': 'General provisions and the basic purpose of railway signals.',
        'description_ru': 'Общие положения и основное назначение железнодорожных сигналов.',
        'description_kz': 'Теміржол сигналдарының жалпы ережелері мен негізгі мақсаты.',
    },
    {
        'order': 2,
        'title_en': 'Section 2: Traffic Lights',
        'title_ru': 'Раздел 2: Светофоры',
        'title_kz': '2-бөлім: Бағдаршамдар',
        'description_en': 'Traffic light indications used for train and shunting movements.',
        'description_ru': 'Показания светофоров, применяемые при движении поездов и маневрах.',
        'description_kz': 'Пойыз қозғалысы мен маневр кезіндегі бағдаршам көрсеткіштері.',
    },
    {
        'order': 3,
        'title_en': 'Section 3: Protection Signals',
        'title_ru': 'Раздел 3: Сигналы ограждения',
        'title_kz': '3-бөлім: Қоршау сигналдары',
        'description_en': 'Signals used to protect obstructions, worksites and rolling stock.',
        'description_ru': 'Сигналы для ограждения препятствий, мест работ и подвижного состава.',
        'description_kz': 'Кедергілерді, жұмыс орындарын және жылжымалы құрамды қоршау сигналдары.',
    },
    {
        'order': 4,
        'title_en': 'Section 4: Hand Signals',
        'title_ru': 'Раздел 4: Ручные сигналы',
        'title_kz': '4-бөлім: Қол сигналдары',
        'description_en': 'Hand signals used by railway employees during train movement and station work.',
        'description_ru': 'Ручные сигналы работников железнодорожного транспорта при движении поездов и работе на станциях.',
        'description_kz': 'Пойыз қозғалысы және станция жұмысы кезіндегі теміржол қызметкерлерінің қол сигналдары.',
    },
    {
        'order': 5,
        'title_en': 'Section 5: Signal Indicators and Signs',
        'title_ru': 'Раздел 5: Сигнальные указатели и знаки',
        'title_kz': '5-бөлім: Сигналдық көрсеткіштер мен белгілер',
        'description_en': 'Route indicators, switch indicators and permanent or temporary signal signs.',
        'description_ru': 'Маршрутные, стрелочные указатели, постоянные и временные сигнальные знаки.',
        'description_kz': 'Маршруттық, стрелкалық көрсеткіштер және тұрақты немесе уақытша сигналдық белгілер.',
    },
    {
        'order': 6,
        'title_en': 'Section 6: Sound Signals',
        'title_ru': 'Раздел 6: Звуковые сигналы',
        'title_kz': '6-бөлім: Дыбыстық сигналдар',
        'description_en': 'Audible train signals and alarm signals.',
        'description_ru': 'Звуковые поездные сигналы и сигналы тревоги.',
        'description_kz': 'Дыбыстық пойыз сигналдары және дабыл сигналдары.',
    },
    {
        'order': 7,
        'title_en': 'Section 7: Conditions for Issuing, Accounting and Storing Signal Devices',
        'title_ru': 'Раздел 7: Выдача, учет и хранение сигнальных приборов',
        'title_kz': '7-бөлім: Сигналдық құралдарды беру, есепке алу және сақтау',
        'description_en': 'Rules for issuing, recording, storing and maintaining signaling devices.',
        'description_ru': 'Правила выдачи, учета, хранения и содержания сигнальных приборов.',
        'description_kz': 'Сигналдық құралдарды беру, есепке алу, сақтау және күтіп ұстау қағидалары.',
    },
]
SECTION_LESSON_COUNTS = [2, 9, 5, 2, 4, 2, 2]


def section_order_for_topic(topic_index):
    upper_bound = 0

    for section_order, count in enumerate(SECTION_LESSON_COUNTS, start=1):
        upper_bound += count

        if topic_index <= upper_bound:
            return section_order

    return len(SECTION_LESSON_COUNTS)


def module_title(module_number, topic, lang):
    prefixes = {
        'ru': 'Модуль',
        'kz': 'Модуль',
        'en': 'Module',
    }

    return f'{prefixes[lang]} {module_number}. {topic[lang]}'


def practice_lesson_title(module_number, topic, lang):
    if lang == 'ru':
        return f'Урок {module_number}.2. Практическое применение: {topic["ru"]}'

    if lang == 'kz':
        return f'Сабақ {module_number}.2. Практикалық қолдану: {topic["kz"]}'

    return f'Lesson {module_number}.2. Applied Practice: {topic["en"]}'


def practice_lesson_content(topic, lang):
    safe_topic = escape(topic[lang])

    if lang == 'ru':
        return f'''
<h3>Практическая цель</h3>
<p>Закрепить тему «{safe_topic}» через типовые ситуации, которые могут встретиться при поездной и станционной работе.</p>

<div class="lesson-rule">
  <strong>Алгоритм:</strong> определить сигнал, сверить его значение с Инструкцией, принять безопасное решение и подтвердить его действием.
</div>

<div class="lesson-warning">
  <strong>Контроль:</strong> модуль считается пройденным только после успешного завершения всех уроков модуля.
</div>

<h3>Что нужно уметь</h3>
<ul>
  <li>распознавать сигнал или знак в рабочей ситуации;</li>
  <li>выбирать безопасное действие;</li>
  <li>объяснять решение по требованиям Инструкции.</li>
</ul>
'''.strip()

    if lang == 'kz':
        return f'''
<h3>Практикалық мақсат</h3>
<p>«{safe_topic}» тақырыбын пойыз және станция жұмысы кезінде кездесетін үлгілік жағдайлар арқылы бекіту.</p>

<div class="lesson-rule">
  <strong>Алгоритм:</strong> сигналды анықтау, оның мәнін Нұсқаулықпен салыстыру, қауіпсіз шешім қабылдау және оны әрекетпен растау.
</div>

<div class="lesson-warning">
  <strong>Бақылау:</strong> модуль оның барлық сабақтары сәтті аяқталғаннан кейін ғана өтті деп есептеледі.
</div>

<h3>Нені білу қажет</h3>
<ul>
  <li>жұмыс жағдайындағы сигналды немесе белгіні тану;</li>
  <li>қауіпсіз әрекетті таңдау;</li>
  <li>шешімді Нұсқаулық талаптары бойынша түсіндіру.</li>
</ul>
'''.strip()

    return f'''
<h3>Practical Objective</h3>
<p>Reinforce “{safe_topic}” through typical situations that may occur during train and station operations.</p>

<div class="lesson-rule">
  <strong>Algorithm:</strong> identify the signal, compare its meaning with the Instruction, choose a safe action and confirm it by action.
</div>

<div class="lesson-warning">
  <strong>Control:</strong> a module is counted as completed only after all lessons inside that module are completed successfully.
</div>

<h3>Required Skills</h3>
<ul>
  <li>recognize the signal or sign in an operational situation;</li>
  <li>choose the safe action;</li>
  <li>explain the decision according to the Instruction requirements.</li>
</ul>
'''.strip()


def completion_question(topic):
    return {
        'question_en': f'When is “{topic["en"]}” counted as completed in KTZ Academy?',
        'question_ru': f'Когда урок «{topic["ru"]}» считается завершенным в KTZ Academy?',
        'question_kz': f'KTZ Academy жүйесінде «{topic["kz"]}» сабағы қашан аяқталды деп есептеледі?',
        'option_a_en': 'When the learner opens the lesson page.',
        'option_a_ru': 'Когда обучающийся просто открыл страницу урока.',
        'option_a_kz': 'Білім алушы сабақ бетін жай ғана ашқан кезде.',
        'option_b_en': 'When the learner watches only the video material.',
        'option_b_ru': 'Когда обучающийся посмотрел только видеоматериал.',
        'option_b_kz': 'Білім алушы тек бейнематериалды көрген кезде.',
        'option_c_en': 'When the learner answers every test question correctly.',
        'option_c_ru': 'Когда обучающийся правильно ответил на все вопросы теста.',
        'option_c_kz': 'Білім алушы тесттің барлық сұрағына дұрыс жауап берген кезде.',
        'correct_answer': 'C',
        'explanation_en': 'The course progress and section badges increase only after a perfect lesson test result.',
        'explanation_ru': 'Прогресс курса и значки разделов увеличиваются только после прохождения теста урока без ошибок.',
        'explanation_kz': 'Курс прогресі мен бөлім белгілері сабақ тесті қатесіз өткеннен кейін ғана артады.',
    }


def question_payloads(topic):
    return [
        {
            'question_en': f'What should an employee ensure after studying “{topic["en"]}”?',
            'question_ru': f'Что должен обеспечить работник после изучения темы «{topic["ru"]}»?',
            'question_kz': f'«{topic["kz"]}» тақырыбын оқығаннан кейін қызметкер нені қамтамасыз етуі керек?',
            'option_a_en': 'Correct application of the topic requirements when working with signals and train movement.',
            'option_a_ru': 'Правильное применение требований темы в работе с сигналами и движением поездов.',
            'option_a_kz': 'Сигналдармен және пойыз қозғалысымен жұмыс кезінде тақырып талаптарын дұрыс қолдану.',
            'option_b_en': 'Using signals only for reporting documentation.',
            'option_b_ru': 'Использование сигналов только для оформления отчетности.',
            'option_b_kz': 'Сигналдарды тек есепті рәсімдеу үшін қолдану.',
            'option_c_en': 'Ignoring signal indications when devices are operating correctly.',
            'option_c_ru': 'Игнорирование сигнальных показаний при исправных устройствах.',
            'option_c_kz': 'Құрылғылар дұрыс жұмыс істегенде сигнал көрсеткіштерін елемеу.',
            'correct_answer': 'A',
            'explanation_en': 'Signals are part of the safety process, so the employee must apply the requirements correctly in real work.',
            'explanation_ru': 'Сигналы являются частью процесса безопасности, поэтому работник должен правильно применять требования в реальной работе.',
            'explanation_kz': 'Сигналдар қауіпсіздік процесінің бөлігі, сондықтан қызметкер талаптарды нақты жұмыста дұрыс қолдануы керек.',
        },
        {
            'question_en': 'How should the requirements of the Signaling Instruction be treated?',
            'question_ru': 'Как следует относиться к требованиям Инструкции по сигнализации?',
            'question_kz': 'Сигнал беру нұсқаулығының талаптарына қалай қарау керек?',
            'option_a_en': 'As optional recommendations that do not require mandatory execution.',
            'option_a_ru': 'Как к дополнительным рекомендациям без обязательного исполнения.',
            'option_a_kz': 'Міндетті орындауды қажет етпейтін қосымша ұсынымдар ретінде.',
            'option_b_en': 'As mandatory requirements related to traffic safety.',
            'option_b_ru': 'Как к обязательным требованиям, связанным с безопасностью движения.',
            'option_b_kz': 'Қозғалыс қауіпсіздігімен байланысты міндетті талаптар ретінде.',
            'option_c_en': 'As information intended only for administrative personnel.',
            'option_c_ru': 'Как к информации только для административного персонала.',
            'option_c_kz': 'Тек әкімшілік персоналға арналған ақпарат ретінде.',
            'correct_answer': 'B',
            'explanation_en': 'The instruction is a mandatory safety document, not a set of optional notes.',
            'explanation_ru': 'Инструкция является обязательным документом по безопасности, а не набором необязательных заметок.',
            'explanation_kz': 'Нұсқаулық міндетті қауіпсіздік құжаты болып табылады, қосымша ескерту емес.',
        },
        completion_question(topic),
    ]


def practice_question_payloads(topic):
    return [
        {
            'question_en': f'What is the first step when applying “{topic["en"]}” in a practical situation?',
            'question_ru': f'Какой первый шаг при практическом применении темы «{topic["ru"]}»?',
            'question_kz': f'«{topic["kz"]}» тақырыбын практикада қолданудағы бірінші қадам қандай?',
            'option_a_en': 'Identify the signal or condition before choosing an action.',
            'option_a_ru': 'Определить сигнал или условие перед выбором действия.',
            'option_a_kz': 'Әрекетті таңдаудан бұрын сигналды немесе жағдайды анықтау.',
            'option_b_en': 'Ignore the indication and continue without verification.',
            'option_b_ru': 'Проигнорировать показание и продолжить без проверки.',
            'option_b_kz': 'Көрсеткішті елемей, тексерусіз жалғастыру.',
            'option_c_en': 'Wait for another employee to make the decision in every case.',
            'option_c_ru': 'Во всех случаях ждать решения другого работника.',
            'option_c_kz': 'Барлық жағдайда басқа қызметкердің шешімін күту.',
            'correct_answer': 'A',
            'explanation_en': 'A safe action starts with correct recognition of the signal or operational condition.',
            'explanation_ru': 'Безопасное действие начинается с правильного распознавания сигнала или рабочего условия.',
            'explanation_kz': 'Қауіпсіз әрекет сигналды немесе жұмыс жағдайын дұрыс танудан басталады.',
        },
        {
            'question_en': 'Why must the learner complete every lesson inside a module?',
            'question_ru': 'Почему обучающийся должен пройти каждый урок внутри модуля?',
            'question_kz': 'Неліктен білім алушы модуль ішіндегі әр сабақты аяқтауы керек?',
            'option_a_en': 'Because the section badge opens after every module in that section is completed.',
            'option_a_ru': 'Потому что значок секции открывается после завершения всех модулей этой секции.',
            'option_a_kz': 'Өйткені бөлім белгісі сол бөлімдегі барлық модуль аяқталғаннан кейін ашылады.',
            'option_b_en': 'Because lessons do not affect module progress.',
            'option_b_ru': 'Потому что уроки не влияют на прогресс модуля.',
            'option_b_kz': 'Өйткені сабақтар модуль прогресіне әсер етпейді.',
            'option_c_en': 'Because only the first lesson in each module is stored in the database.',
            'option_c_ru': 'Потому что в базе хранится только первый урок каждого модуля.',
            'option_c_kz': 'Өйткені базада әр модульдің тек бірінші сабағы сақталады.',
            'correct_answer': 'A',
            'explanation_en': 'The structure is Section -> Module -> Lesson. A section badge depends on completion of all its modules.',
            'explanation_ru': 'Структура курса: секция -> модуль -> урок. Значок секции зависит от завершения всех ее модулей.',
            'explanation_kz': 'Курс құрылымы: бөлім -> модуль -> сабақ. Бөлім белгісі барлық модульдің аяқталуына байланысты.',
        },
        {
            'question_en': 'Which test result completes a lesson under the current rules?',
            'question_ru': 'Какой результат теста завершает урок по текущим правилам?',
            'question_kz': 'Қазіргі ережелер бойынша қандай тест нәтижесі сабақты аяқтайды?',
            'option_a_en': 'Any result above zero.',
            'option_a_ru': 'Любой результат выше нуля.',
            'option_a_kz': 'Нөлден жоғары кез келген нәтиже.',
            'option_b_en': 'At least one correct answer.',
            'option_b_ru': 'Хотя бы один правильный ответ.',
            'option_b_kz': 'Кемінде бір дұрыс жауап.',
            'option_c_en': 'A perfect result: all questions answered correctly.',
            'option_c_ru': 'Идеальный результат: все вопросы отвечены правильно.',
            'option_c_kz': 'Мінсіз нәтиже: барлық сұраққа дұрыс жауап беру.',
            'correct_answer': 'C',
            'explanation_en': 'Progress increases only when the lesson test is passed with 100%.',
            'explanation_ru': 'Прогресс увеличивается только когда тест урока пройден на 100%.',
            'explanation_kz': 'Прогресс сабақ тесті 100% өткен кезде ғана артады.',
        },
    ]


def update_instance(instance, payload, preserve_media=True):
    changed_fields = []

    for field_name, value in payload.items():
        if preserve_media and field_name in {'video_url', 'image_url'} and getattr(instance, field_name, ''):
            continue

        if getattr(instance, field_name) != value:
            setattr(instance, field_name, value)
            changed_fields.append(field_name)

    if changed_fields:
        instance.save(update_fields=changed_fields)

    return bool(changed_fields)


class Command(BaseCommand):
    help = 'Ensure the ISI course has 7 sections, 26 modules, several lessons per module and 3 questions per lesson.'

    def handle(self, *args, **options):
        sections_created = 0
        sections_updated = 0
        modules_created = 0
        modules_updated = 0
        lessons_created = 0
        lessons_updated = 0
        questions_created = 0
        questions_updated = 0

        with transaction.atomic():
            sections = {}

            for section_payload in SECTION_DEFINITIONS:
                order = section_payload['order']
                section, created = Section.objects.get_or_create(
                    order=order,
                    defaults=section_payload,
                )
                sections[order] = section

                if created:
                    sections_created += 1
                elif update_instance(section, section_payload, preserve_media=False):
                    sections_updated += 1

            for module_number, topic in enumerate(MODULE_TOPICS, start=1):
                section = sections[section_order_for_topic(module_number)]
                module_payload = {
                    'section': section,
                    'order': module_number,
                    'title_en': module_title(module_number, topic, 'en'),
                    'title_ru': module_title(module_number, topic, 'ru'),
                    'title_kz': module_title(module_number, topic, 'kz'),
                    'description_en': topic['en'],
                    'description_ru': topic['ru'],
                    'description_kz': topic['kz'],
                }
                module, created = Module.objects.get_or_create(
                    order=module_number,
                    defaults=module_payload,
                )

                if created:
                    modules_created += 1
                elif update_instance(module, module_payload, preserve_media=False):
                    modules_updated += 1

                primary_titles = title_for(module_number, topic)
                lesson_definitions = [
                    {
                        'order': 1,
                        'payload': {
                            'module': module,
                            'order': 1,
                            'is_active': True,
                            'title_en': primary_titles['en'],
                            'title_ru': primary_titles['ru'],
                            'title_kz': primary_titles['kz'],
                            'content_en': lesson_content(topic, 'en'),
                            'content_ru': lesson_content(topic, 'ru'),
                            'content_kz': lesson_content(topic, 'kz'),
                        },
                        'questions': question_payloads(topic),
                    },
                    {
                        'order': 2,
                        'payload': {
                            'module': module,
                            'order': 2,
                            'is_active': True,
                            'title_en': practice_lesson_title(module_number, topic, 'en'),
                            'title_ru': practice_lesson_title(module_number, topic, 'ru'),
                            'title_kz': practice_lesson_title(module_number, topic, 'kz'),
                            'content_en': practice_lesson_content(topic, 'en'),
                            'content_ru': practice_lesson_content(topic, 'ru'),
                            'content_kz': practice_lesson_content(topic, 'kz'),
                        },
                        'questions': practice_question_payloads(topic),
                    },
                ]

                for lesson_definition in lesson_definitions:
                    lesson_payload = lesson_definition['payload']
                    lesson_order = lesson_definition['order']
                    lesson, created = Lesson.objects.get_or_create(
                        module=module,
                        order=lesson_order,
                        defaults=lesson_payload,
                    )

                    if created:
                        lessons_created += 1
                    elif update_instance(lesson, lesson_payload):
                        lessons_updated += 1

                    existing_count = lesson.questions.count()
                    for question_index, payload in enumerate(lesson_definition['questions'], start=1):
                        defaults = {
                            **payload,
                            'base_points': 10,
                            'penalty_points': 5,
                            'video_url': PLACEHOLDER_VIDEO_URL,
                        }
                        question = Question.objects.filter(
                            lesson=lesson,
                            question_en=payload['question_en'],
                        ).first()

                        if question is None:
                            if existing_count >= 3 and question_index == 3:
                                continue

                            Question.objects.create(lesson=lesson, **defaults)
                            questions_created += 1
                            existing_count += 1
                        elif update_instance(question, defaults):
                            questions_updated += 1

        self.stdout.write(
            self.style.SUCCESS(
                'ISI course content ensured. '
                f'Sections created: {sections_created}, updated: {sections_updated}. '
                f'Modules created: {modules_created}, updated: {modules_updated}. '
                f'Lessons created: {lessons_created}, updated: {lessons_updated}. '
                f'Questions created: {questions_created}, updated: {questions_updated}.'
            )
        )
