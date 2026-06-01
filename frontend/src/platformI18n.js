import platformTranslations from './platformTranslations.json';

export const SUPPORTED_PLATFORM_LANGS = ['ru', 'kz', 'en'];

export function normalizePlatformLang(lang) {
  const value = String(lang || '').trim().toLowerCase();
  if (value === 'kk') return 'kz';
  return SUPPORTED_PLATFORM_LANGS.includes(value) ? value : 'ru';
}

function getCookie(name) {
  const cookies = document.cookie ? document.cookie.split('; ') : [];
  const cookie = cookies.find((item) => item.startsWith(name + '='));
  return cookie ? decodeURIComponent(cookie.split('=').slice(1).join('=')) : '';
}

export function getInitialPlatformLang() {
  const params = new URLSearchParams(window.location.search);
  return normalizePlatformLang(
    params.get('lang') || localStorage.getItem('preferredLang') || getCookie('preferredLang')
  );
}

export function rememberPlatformLang(lang) {
  const selectedLang = normalizePlatformLang(lang);
  localStorage.setItem('preferredLang', selectedLang);
  document.cookie = 'preferredLang=' + encodeURIComponent(selectedLang) + '; path=/; max-age=31536000; SameSite=Lax';
  document.documentElement.lang = selectedLang === 'kz' ? 'kk' : selectedLang;

  const url = new URL(window.location.href);
  url.searchParams.set('lang', selectedLang);
  window.history.replaceState({}, '', url.pathname + url.search + url.hash);
}

export const routeTitleKeys = {
  '/platform': 'nav_home',
  '/platform/program': 'nav_program_full',
  '/platform/directory': 'nav_directory',
  '/platform/simulators': 'nav_simulators',
  '/platform/grades': 'nav_grades',
  '/platform/resources': 'nav_resources',
  '/platform/certificate': 'nav_certificate',
};

export const platformNavItems = [
  { to: '/platform', end: true, icon: 'fas fa-th-large', key: 'nav_home' },
  { to: '/platform/program', icon: 'fas fa-book-open', key: 'nav_course' },
  { to: '/platform/directory', icon: 'fas fa-traffic-light', key: 'nav_directory' },
  { to: '/platform/simulators', icon: 'fas fa-gamepad', key: 'nav_simulators' },
  { to: '/platform/grades', icon: 'fas fa-chart-line', key: 'nav_grades' },
  { to: '/platform/resources', icon: 'fas fa-folder-open', key: 'nav_resources' },
  { to: '/platform/certificate', icon: 'fas fa-certificate', key: 'nav_certificate' },
];

export function createPlatformT(lang, apiUi = {}) {
  const selectedLang = normalizePlatformLang(lang);
  const base = platformTranslations.ru || {};
  const current = platformTranslations[selectedLang] || base;
  const dictionary = { ...base, ...current, ...(apiUi || {}) };

  return (key, fallback) => (
    Object.prototype.hasOwnProperty.call(dictionary, key) ? dictionary[key] : (fallback ?? key)
  );
}

const extraPhrases = {
  program_stats_modules_open: {
    ru: 'Модулей открыто',
    kz: 'Ашылған модульдер',
    en: 'Modules open',
  },
  program_stats_interactive_topics: {
    ru: 'Интерактивные темы',
    kz: 'Интерактивті тақырыптар',
    en: 'Interactive topics',
  },
  program_available: {
    ru: 'Доступен',
    kz: 'Қолжетімді',
    en: 'Available',
  },
  program_open_material: {
    ru: 'Изучить материал',
    kz: 'Материалды оқу',
    en: 'Study material',
  },
  program_back_to_journal: {
    ru: 'В электронный журнал',
    kz: 'Электрондық журналға',
    en: 'To gradebook',
  },
  program_learning_map: {
    ru: 'Вернуться к учебной карте',
    kz: 'Оқу картасына қайту',
    en: 'Back to learning map',
  },
  program_course_available: {
    ru: 'Доступность курсов',
    kz: 'Курс қолжетімділігі',
    en: 'Course availability',
  },
  program_modules_meta: {
    ru: 'Основные регламенты ИСИ',
    kz: 'ИСИ негізгі регламенттері',
    en: 'Core ISI regulations',
  },
  program_signal_meta: {
    ru: 'Светофорная сигнализация СЦБ',
    kz: 'СЦБ бағдаршам сигнализациясы',
    en: 'Interlocking signal system',
  },
  directory_track_signal: {
    ru: 'путевой сигнал',
    kz: 'жол сигналы',
    en: 'track signal',
  },
  directory_alsn: {
    ru: 'АЛСН',
    kz: 'АЛСН',
    en: 'ALSN',
  },
  directory_lit_green: {
    ru: 'Горит зеленый',
    kz: 'Жасыл жанып тұр',
    en: 'Green light is on',
  },
  directory_light_off: {
    ru: 'Огонь погашен',
    kz: 'От сөнген',
    en: 'Light off',
  },

  program_module_1_restored: {
    ru: "Раздел 1: Общие положения и классификация сигналов",
    kz: "1-бөлім: Жалпы ережелер және сигналдардың жіктелуі",
    en: "Section 1: General provisions and signal classification",
  },
  program_module_1_meta_restored: {
    ru: "3 темы • Основные регламенты ИСИ",
    kz: "3 тақырып • ИСИ негізгі регламенттері",
    en: "3 topics • Core ISI regulations",
  },
  program_lesson_1_1_restored: {
    ru: "1. Назначение и классификация сигналов",
    kz: "1. Сигналдардың мақсаты және жіктелуі",
    en: "1. Purpose and classification of signals",
  },
  program_lesson_1_2_restored: {
    ru: "2. Видимость сигналов и требования к установке",
    kz: "2. Сигналдардың көрінуі және орнату талаптары",
    en: "2. Signal visibility and installation requirements",
  },
  program_lesson_1_3_restored: {
    ru: "3. Основные сигнальные цвета и их восприятие",
    kz: "3. Негізгі сигнал түстері және оларды қабылдау",
    en: "3. Main signal colors and their perception",
  },
  program_module_2_restored: {
    ru: "Раздел 2: Светофоры (входные, выходные и маршрутные)",
    kz: "2-бөлім: Бағдаршамдар (кіру, шығу және маршруттық)",
    en: "Section 2: Signals (entrance, exit, and route)",
  },
  program_module_2_meta_restored: {
    ru: "4 темы • Светофорная сигнализация СЦБ",
    kz: "4 тақырып • СЦБ бағдаршам сигнализациясы",
    en: "4 topics • Interlocking signal system",
  },
  program_lesson_2_1_restored: { ru: "1. Входные светофоры", kz: "1. Кіру бағдаршамдары", en: "1. Entrance signals" },
  program_lesson_2_2_restored: { ru: "2. Выходные и маршрутные светофоры", kz: "2. Шығу және маршруттық бағдаршамдар", en: "2. Exit and route signals" },
  program_lesson_2_3_restored: { ru: "3. Проходные светофоры автоблокировки", kz: "3. Автоблоктаудың өтпелі бағдаршамдары", en: "3. Automatic block signals" },
  program_lesson_2_4_restored: { ru: "4. Маневровые и горочные светофоры", kz: "4. Маневрлік және дөңестік бағдаршамдар", en: "4. Shunting and hump signals" },
  program_module_3_restored: {
    ru: "Раздел 3: Светофоры специального назначения",
    kz: "3-бөлім: Арнайы мақсаттағы бағдаршамдар",
    en: "Section 3: Special-purpose signals",
  },
  program_module_3_meta_restored: {
    ru: "3 темы • Заградительные и повторительные щиты",
    kz: "3 тақырып • Қоршау және қайталау сигналдары",
    en: "3 topics • Protective and repeater signals",
  },
  program_lesson_3_1_restored: { ru: "1. Предупредительные светофоры", kz: "1. Ескерту бағдаршамдары", en: "1. Distant signals" },
  program_lesson_3_2_restored: { ru: "2. Заградительные светофоры", kz: "2. Қоршау бағдаршамдары", en: "2. Protective signals" },
  program_lesson_3_3_restored: { ru: "3. Повторительные светофоры", kz: "3. Қайталау бағдаршамдары", en: "3. Repeater signals" },
  program_module_4_restored: {
    ru: "Раздел 4: Ручные и переносные сигналы",
    kz: "4-бөлім: Қол және тасымалды сигналдар",
    en: "Section 4: Hand and portable signals",
  },
  program_module_4_meta_restored: {
    ru: "3 темы • Ограждение мест путевых работ",
    kz: "3 тақырып • Жол жұмыстары орындарын қоршау",
    en: "3 topics • Protection of track work sites",
  },
  program_lesson_4_1_restored: { ru: "1. Переносные сигналы остановки", kz: "1. Тасымалды тоқтау сигналдары", en: "1. Portable stop signals" },
  program_lesson_4_2_restored: { ru: "2. Ограждение мест производства работ", kz: "2. Жұмыс орындарын қоршау", en: "2. Protecting work sites" },
  program_lesson_4_3_restored: { ru: "3. Ручные сигналы проводников и составителей", kz: "3. Жолсеріктер мен құрастырушылардың қол сигналдары", en: "3. Hand signals of conductors and train preparers" },
  program_module_5_restored: {
    ru: "Раздел 5: Сигнальные знаки и указатели",
    kz: "5-бөлім: Сигналдық белгілер және көрсеткіштер",
    en: "Section 5: Signal signs and indicators",
  },
  program_module_5_meta_restored: {
    ru: "3 темы • Путевые, постоянные и снегоочистительные знаки",
    kz: "3 тақырып • Жол, тұрақты және қартазалағыш белгілер",
    en: "3 topics • Track, permanent, and snowplow signs",
  },
  program_lesson_5_1_restored: { ru: "1. Маршрутные и стрелочные указатели", kz: "1. Маршруттық және бұрмалық көрсеткіштер", en: "1. Route and switch indicators" },
  program_lesson_5_2_restored: { ru: "2. Путевые сигнальные знаки постоянного типа", kz: "2. Тұрақты жол сигналдық белгілері", en: "2. Permanent track signal signs" },
  program_lesson_5_3_restored: { ru: "3. Временные сигнальные знаки (Снегоочистители)", kz: "3. Уақытша сигналдық белгілер (қартазалағыштар)", en: "3. Temporary signal signs (snowplows)" },
  program_module_6_restored: {
    ru: "Раздел 6: Звуковые сигналы и сигналы тревоги",
    kz: "6-бөлім: Дыбыстық және дабыл сигналдары",
    en: "Section 6: Sound and alarm signals",
  },
  program_module_6_meta_restored: {
    ru: "3 темы • Акустический регламент локомотивов",
    kz: "3 тақырып • Локомотивтердің акустикалық регламенті",
    en: "3 topics • Locomotive acoustic regulations",
  },
  program_lesson_6_1_restored: { ru: "1. Звуковые сигналы при движении поездов", kz: "1. Пойыз қозғалысындағы дыбыстық сигналдар", en: "1. Sound signals during train movement" },
  program_lesson_6_2_restored: { ru: "2. Сигналы тревоги", kz: "2. Дабыл сигналдары", en: "2. Alarm signals" },
  program_lesson_6_3_restored: { ru: "3. Действия локомотивной бригады при тревоге", kz: "3. Дабыл кезіндегі локомотив бригадасының әрекеттері", en: "3. Locomotive crew actions during an alarm" },
  program_module_7_restored: {
    ru: "Раздел 7: Световые указатели и поездные сигналы",
    kz: "7-бөлім: Жарық көрсеткіштері және пойыз сигналдары",
    en: "Section 7: Light indicators and train signals",
  },
  program_module_7_meta_restored: {
    ru: "3 темы • Обозначение головы и хвоста подвижного состава",
    kz: "3 тақырып • Жылжымалы құрамның басы мен соңын белгілеу",
    en: "3 topics • Marking the head and tail of rolling stock",
  },
  program_lesson_7_1_restored: { ru: "1. Обозначение головы поезда при движении", kz: "1. Қозғалыстағы пойыз басын белгілеу", en: "1. Marking the head of a moving train" },
  program_lesson_7_2_restored: { ru: "2. Обозначение хвоста поезда", kz: "2. Пойыз соңын белгілеу", en: "2. Marking the tail of a train" },
  program_lesson_7_3_restored: { ru: "3. Обозначение съемных подвижных единиц", kz: "3. Алынбалы жылжымалы бірліктерді белгілеу", en: "3. Marking removable rolling units" },
  program_theory_notice_restored: {
    ru: "Изучите текст инструкции ниже. Все положения обязательны к исполнению локомотивными бригадами при нахождении на службе.",
    kz: "Төмендегі нұсқаулық мәтінін оқыңыз. Барлық ережелер қызмет кезінде локомотив бригадалары үшін міндетті.",
    en: "Study the instruction text below. All provisions are mandatory for locomotive crews while on duty.",
  },
  program_video_title_restored: { ru: "Видеоматериал по теме", kz: "Тақырып бойынша бейнематериал", en: "Video material for the topic" },
  program_video_player_restored: { ru: "Интерактивный видеоплеер КТЖ Академии", kz: "КТЖ Академиясының интерактивті бейнеплеері", en: "KTZ Academy interactive video player" },
  program_video_quality_restored: { ru: "Стриминг высокого разрешения • HD", kz: "Жоғары айқындықтағы трансляция • HD", en: "High-resolution streaming • HD" },
  program_scheme_restored: { ru: "Схема СЦБ", kz: "СЦБ сызбасы", en: "Interlocking scheme" },
  program_expert_restored: { ru: "Экспертное разъяснение технического регламента:", kz: "Техникалық регламенттің сараптамалық түсіндірмесі:", en: "Expert explanation of the technical regulation:" },
  program_finish_test_restored: { ru: "Завершить тестирование", kz: "Тестілеуді аяқтау", en: "Finish testing" },
  program_next_question_restored: { ru: "Следующий вопрос", kz: "Келесі сұрақ", en: "Next question" },
  program_done_restored: { ru: "Раздел успешно проработан!", kz: "Бөлім сәтті пысықталды!", en: "Section completed successfully!" },
  program_result_saved_restored: {
    ru: "Результат зафиксирован в учебном журнале КТЖ Академии.",
    kz: "Нәтиже КТЖ Академиясының оқу журналына тіркелді.",
    en: "The result has been recorded in the KTZ Academy learning journal.",
  },
  program_correct_answers_restored: { ru: "Верных ответов:", kz: "Дұрыс жауаптар:", en: "Correct answers:" },
  sim_task_1_typo_restored: { ru: "Ситуционная задача 1: Звуковая сигнализация", kz: "Ситуациялық тапсырма 1: Дыбыстық сигнализация", en: "Scenario task 1: Sound signaling" },
  sim_task_2_typo_restored: { ru: "Ситуционная задача 2: Ручные сигналы", kz: "Ситуациялық тапсырма 2: Қол сигналдары", en: "Scenario task 2: Hand signals" },
  sim_module_5_restored: { ru: "Приступить к Модулю 5", kz: "5-модульге өту", en: "Start Module 5" },
  sim_back_restored: { ru: "← Вернуться к выбору", kz: "← Таңдауға оралу", en: "← Back to selection" },
  sim_yellow_back_restored: { ru: "Движение назад (Желтый)", kz: "Артқа қозғалу (сары)", en: "Move backward (yellow)" },
  sim_red_stop_restored: { ru: "Сигнал «Стой!» (Красный)", kz: "«Тоқта!» сигналы (қызыл)", en: "Stop signal (red)" },
  sim_green_clear_restored: { ru: "Путь свободен (Зеленый)", kz: "Жол бос (жасыл)", en: "Track clear (green)" },

  program_hero_subtitle_arrow_exact: {
    ru: "Программа подготовки инженерно-технических работников локомотивных бригад. Формат: Интерактивная теория → Медиа-лекция → Ситуационный контроль.",
    kz: "Локомотив бригадаларының инженерлік-техникалық қызметкерлерін даярлау бағдарламасы. Формат: интерактивті теория → медиа-дәріс → ситуациялық бақылау.",
    en: "Training program for engineering and technical staff of locomotive crews. Format: interactive theory → media lecture → scenario assessment.",
  },
  simulator_card_sound_description_exact: {
    ru: "Формирование навыков экстренного оповещения. Отработка нормативных звуковых комбинаций при обнаружении аварийных ситуаций (пожар, разрыв состава).",
    kz: "Шұғыл хабарлау дағдыларын қалыптастыру. Апаттық жағдайлар анықталған кезде нормативтік дыбыстық комбинацияларды пысықтау (өрт, құрамның үзілуі).",
    en: "Build emergency alert skills. Practice standard sound combinations when emergency situations are detected (fire, train separation).",
  },
  simulator_card_hand_description_exact: {
    ru: "Управление маневровыми передвижениями. Практика применения визуальных жестов составителя поездов для контроля локомотива в дневное время.",
    kz: "Маневрлік қозғалыстарды басқару. Күндізгі уақытта локомотивті бақылау үшін пойыз құрастырушысының визуалды қимылдарын қолдану тәжірибесі.",
    en: "Control shunting movements. Practice visual hand gestures used by train preparers to control a locomotive in daylight.",
  },
  simulator_hero_badge_exact: {
    ru: "Виртуальный полигон",
    kz: "Виртуалды полигон",
    en: "Virtual training ground",
  },
  simulator_hero_title_exact: {
    ru: "Тренажерные комплексы KTZ",
    kz: "KTZ тренажерлік кешендері",
    en: "KTZ simulator complexes",
  },
  simulator_hero_subtitle_exact: {
    ru: "Отработка практических навыков сигнализации в безопасной виртуальной среде. Выберите симулятор для начала тренировки.",
    kz: "Қауіпсіз виртуалды ортада сигнализация бойынша практикалық дағдыларды пысықтау. Жаттығуды бастау үшін симуляторды таңдаңыз.",
    en: "Practice signaling skills in a safe virtual environment. Choose a simulator to start training.",
  },
  simulator_open_button_exact: {
    ru: "Перейти к симулятору",
    kz: "Симуляторға өту",
    en: "Open simulator",
  },
  simulator_back_to_list_exact: {
    ru: "К списку тренажеров",
    kz: "Тренажерлер тізіміне",
    en: "Back to simulator list",
  },
};

function collectStringPairs(source, target, pairs) {
  if (typeof source === 'string' && typeof target === 'string') {
    pairs.push([source, target]);
    return;
  }

  if (Array.isArray(source) && Array.isArray(target)) {
    source.forEach((item, index) => collectStringPairs(item, target[index], pairs));
    return;
  }

  if (source && target && typeof source === 'object' && typeof target === 'object') {
    Object.keys(source).forEach((key) => collectStringPairs(source[key], target[key], pairs));
  }
}

function textLookupFor(lang) {
  const selectedLang = normalizePlatformLang(lang);
  const pairs = [];
  const target = platformTranslations[selectedLang] || platformTranslations.ru;

  for (const variant of SUPPORTED_PLATFORM_LANGS) {
    collectStringPairs(platformTranslations[variant], target, pairs);
  }

  Object.values(extraPhrases).forEach((item) => {
    const translated = item[selectedLang] || item.ru;
    Object.values(item).forEach((value) => pairs.push([value, translated]));
  });

  return new Map(pairs.filter(([from, to]) => typeof from === 'string' && typeof to === 'string'));
}

function translateTextValue(value, lookup, lang) {
  const trimmed = value.trim();
  if (!trimmed) return value;

  const leading = value.match(/^\s*/)?.[0] || '';
  const trailing = value.match(/\s*$/)?.[0] || '';

  if (lookup.has(trimmed)) {
    return leading + lookup.get(trimmed) + trailing;
  }

  const selectedLang = normalizePlatformLang(lang);
  const dynamic = translateDynamicText(trimmed, selectedLang);
  return dynamic ? leading + dynamic + trailing : value;
}

function translateDynamicText(text, lang) {
  const question = text.match(/^Вопрос\s+(\d+):\s*(.+)$/);
  if (question) {
    if (lang === 'en') return 'Question ' + question[1] + ': ' + question[2];
    if (lang === 'kz') return question[1] + '-сұрақ: ' + question[2];
  }

  const studied = text.match(/^Изучено\s+(\d+)\s+из\s+(\d+)$/);
  if (studied) {
    if (lang === 'en') return 'Studied ' + studied[1] + ' of ' + studied[2];
    if (lang === 'kz') return 'Оқылды ' + studied[1] + ' / ' + studied[2];
  }

  const page = text.match(/^Страница\s+(\d+)\s+\/\s+(\d+)$/);
  if (page) {
    if (lang === 'en') return 'Page ' + page[1] + ' / ' + page[2];
    if (lang === 'kz') return 'Бет ' + page[1] + ' / ' + page[2];
  }

  const correct = text.match(/^Верных ответов:\s*(\d+)\s+из\s+(\d+)$/);
  if (correct) {
    if (lang === 'en') return 'Correct answers: ' + correct[1] + ' of ' + correct[2];
    if (lang === 'kz') return 'Дұрыс жауаптар: ' + correct[1] + ' / ' + correct[2];
  }

  return '';
}

export function translatePlatformDom(lang) {
  const root = document.getElementById('root');
  if (!root) return;

  const lookup = textLookupFor(lang);
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || ['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'OPTION'].includes(parent.tagName)) {
        return NodeFilter.FILTER_REJECT;
      }
      return node.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    },
  });

  const nodes = [];
  let node = walker.nextNode();
  while (node) {
    nodes.push(node);
    node = walker.nextNode();
  }

  nodes.forEach((textNode) => {
    const translated = translateTextValue(textNode.nodeValue, lookup, lang);
    if (translated !== textNode.nodeValue) textNode.nodeValue = translated;
  });
}

export function startPlatformDomTranslator(lang) {
  let frame = 0;
  const translate = () => {
    window.cancelAnimationFrame(frame);
    frame = window.requestAnimationFrame(() => translatePlatformDom(lang));
  };

  translate();
  const observer = new MutationObserver(translate);
  const root = document.getElementById('root');
  if (root) observer.observe(root, { childList: true, characterData: true, subtree: true });

  return () => {
    window.cancelAnimationFrame(frame);
    observer.disconnect();
  };
}
