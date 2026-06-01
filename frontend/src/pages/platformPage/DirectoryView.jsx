import { useEffect, useMemo, useRef, useState } from 'react';
import { getLocalizedDirectory } from '../../platformDirectoryTranslations';
import { apiFetch } from '../../api';

const STORAGE_KEY = 'ktz-isi-directory-studied-v2';

const learningSections = [
  { id: '01', title: 'Общие положения', text: 'Введение, видимые и звуковые сигналы, приборы и обязательность требований ИСИ.' },
  { id: '02', title: 'Светофоры', text: '11 видов по назначению, основные показания, пригласительные и маршрутные сигналы.' },
  { id: '03', title: 'Сигналы ограждения', text: 'Постоянные и переносные сигналы, опасные места, работы на перегоне и станции.' },
  { id: '04', title: 'Ручные сигналы', text: 'Флаги, фонари, сигналы остановки, торможения и отправления.' },
  { id: '05', title: 'Указатели и знаки', text: 'Маршрутные, стрелочные, постоянные, предупредительные и временные знаки.' },
  { id: '06', title: 'Звуковые сигналы', text: 'Длинные и короткие звуки, тревоги, бдительность и оповещение.' },
  { id: '07', title: 'Сигнальные приборы', text: 'Кому выдаются фонари, флаги, петарды, рожки и порядок хранения.' },
];

const basics = [
  {
    icon: 'fa-book-open',
    title: 'Что устанавливает ИСИ',
    text: 'Инструкция задает систему видимых и звуковых сигналов, типы сигнальных приборов и условия, при которых работники должны иметь их при себе.',
  },
  {
    icon: 'fa-eye',
    title: 'Видимые сигналы',
    text: 'Дневные: диски, щиты, флаги и указатели. Ночные: огни в фонарях и указателях. В тоннелях применяются только ночные или круглосуточные сигналы.',
  },
  {
    icon: 'fa-volume-high',
    title: 'Звуковые сигналы',
    text: 'Выражаются числом и сочетанием звуков разной продолжительности. Взрыв петарды требует немедленной остановки.',
  },
];

const guideSections = [
  {
    id: '01',
    icon: 'fa-compass',
    title: 'Общее положение ИСИ',
    meta: 'Раздел 1 • лист 2 • п.1-10',
    summary: 'База всего курса: зачем нужны сигналы, какие бывают виды и почему требования ИСИ обязательны для движения поездов и маневровой работы.',
    facts: [
      'В тоннелях применяются только ночные или круглосуточные сигналы.',
      'Сигналы подразделяются на видимые и звуковые.',
      'Дневные видимые сигналы: диски, щиты, флаги и сигнальные указатели.',
      'Ночные видимые сигналы: огни установленных цветов в ручных, поездных фонарях и указателях.',
      'Взрыв петарды требует немедленной остановки.',
    ],
    note: 'Главная мысль: сигнал всегда связан с безопасностью и обязан быть понятен без догадок.',
  },
  {
    id: '02',
    icon: 'fa-traffic-light',
    title: 'Светофоры',
    meta: 'Раздел 2 • листы 4-15',
    summary: 'Основной интерактивный блок справочника. Ниже показаны 11 видов светофоров по назначению и их рабочие показания.',
    facts: [
      'По назначению: входные, выходные, горочные, заградительные, локомотивные, маневровые, маршрутные, повторительные, предупредительные, прикрытия и проходные.',
      'По устройству: линзовые, прожекторные, мачтовые, карликовые, на мостиках и на консолях.',
      'Огни бывают горящие, негорящие, немигающие и мигающие.',
      'Проходные светофоры автоблокировки обозначаются цифрами, остальные - буквами или буквами с цифрами.',
      'Красный огонь всегда читается как “Стой! Запрещается проезжать сигнал”.',
    ],
    note: 'Нажимайте на огни в карточках: так проще запомнить, когда и как горит каждый сигнал.',
  },
  {
    id: '03',
    icon: 'fa-triangle-exclamation',
    title: 'Сигналы ограждения',
    meta: 'Раздел 3 • листы 17-22',
    summary: 'Раздел про опасные места, переносные сигналы, петарды, уменьшение скорости и ограждение работ на перегоне или станции.',
    facts: [
      'Постоянные диски уменьшения скорости требуют движения с уменьшением скорости и готовностью проследовать опасное место.',
      'К переносным сигналам относятся красные щиты, желтые щиты, фонари на шестах и красные флаги.',
      'При подходе к переносному желтому сигналу машинист подает один длинный свисток.',
      'Петарды укладываются по три штуки: две на правом рельсе по ходу поезда и одна на левом.',
      'Сигнальные знаки “С” предупреждают работающих о приближении поезда.',
    ],
    note: 'Это раздел про действия до опасности: заметить, снизить скорость, остановиться или предупредить.',
  },
  {
    id: '04',
    icon: 'fa-flag',
    title: 'Ручные сигналы',
    meta: 'Раздел 4 • листы 24-25',
    summary: 'Ручные флаги и фонари применяются при встрече, проводе поездов, остановке, опробовании тормозов и работе сигналистов.',
    facts: [
      'Ручными сигналами предъявляются требования запрета движения или движения с указанной скоростью.',
      'При опробовании автотормозов подаются сигналы пробного торможения и отпуска тормозов.',
      'Сигнал остановки с поезда днем подается развернутым красным флагом.',
      'Ночью сигнал остановки подается красным огнем ручного фонаря.',
      'Сигналисты и дежурные стрелочных постов встречают и провожают поезда по установленным правилам.',
    ],
    note: 'Ручные сигналы важны там, где решение передается человеком прямо на месте.',
  },
  {
    id: '05',
    icon: 'fa-signs-post',
    title: 'Сигнальные указатели и знаки',
    meta: 'Раздел 5 • листы 27-34',
    summary: 'Маршрутные, стрелочные, постоянные, предупредительные и временные знаки помогают понять путь, границы, токоприемник, опасные места и обозначение поездов.',
    facts: [
      'Маршрутные указатели показывают путь приема, направление следования или номер пути.',
      'Стрелочные указатели показывают положение стрелки: прямо или на боковой путь.',
      'Негорящие сигнальные указатели сигнального значения не имеют.',
      'Постоянные знаки отмечают границу станции, начало и конец опасного места, токоразделы и другие участки.',
      'Временные знаки применяются при опускании токоприемника и работе снегоочистителей.',
    ],
    note: 'Знаки работают как навигация: они не заменяют сигнал, но уточняют условия движения.',
  },
  {
    id: '06',
    icon: 'fa-volume-high',
    title: 'Звуковые сигналы',
    meta: 'Раздел 6 • листы 36-37',
    summary: 'Звуки задаются числом и продолжительностью: короткие, длинные, тревожные, оповестительные и сигналы бдительности.',
    facts: [
      'Три коротких звука означают “Стой!”.',
      'Один длинный звук означает “Отправиться поезду”.',
      'Три длинных звука требуют торможения от работников, обслуживающих поезд.',
      'Оповестительный сигнал обычно подается одним длинным свистком.',
      'Сигналы тревоги применяются при общей, пожарной, воздушной, радиационной или химической опасности.',
    ],
    note: 'В звуковых сигналах важно не только количество, но и ритм: короткий и длинный звук имеют разные команды.',
  },
  {
    id: '07',
    icon: 'fa-toolbox',
    title: 'Выдача и хранение приборов',
    meta: 'Раздел 7 • лист 39 • п.127-141',
    summary: 'Раздел показывает, кому выдаются фонари, флаги, свистки, рожки, петарды и другие приборы для работы с сигналами.',
    facts: [
      'Дежурному по станции выдаются ручной сигнальный фонарь, флаги, ручной диск и ручной свисток.',
      'Машинистам выдаются фонари, флаги, красные сигнальные диски и петарды по назначению движения.',
      'Путевым работникам и сигналистам выдаются фонари, флаги, петарды и духовой рожок.',
      'Дежурному по переезду выдаются фонарь, флаги, петарды, духовой рожок и ручной свисток.',
      'Количество петард зависит от участка: однопутный, двухпутный или многопутный.',
    ],
    note: 'Приборы не декоративны: каждый выдается под конкретную обязанность и ситуацию на пути.',
  },
];

const signalCatalog = [
  {
    id: 1,
    title: 'Входные',
    section: 'ИСИ • Раздел 2 • лист 6 • п.14',
    placement: 'Перед входом на станцию',
    plate: 'Н',
    lensCount: 3,
    defaultState: 0,
    overview: 'Показывают, можно ли поезду следовать на станцию, по какому пути и с какой готовностью к остановке.',
    learnerTip: 'Для входного сигнала сначала определите путь приема: главный путь обычно связан с зеленым или желтым показанием, боковой путь - с двумя желтыми.',
    theory: [
      'Один зеленый огонь разрешает поезду следовать на станцию по главному пути с установленной скоростью.',
      'Один желтый огонь требует готовности остановиться, потому что следующий маршрутный или выходной светофор закрыт.',
      'Два желтых огня указывают прием на боковой путь с уменьшенной скоростью.',
    ],
    states: [
      {
        label: 'Зеленый',
        lights: ['green', 'off', 'off'],
        meaning: 'Разрешается следовать на станцию по главному пути с установленной скоростью; следующий светофор открыт.',
      },
      {
        label: 'Желтый',
        lights: ['off', 'yellow', 'off'],
        meaning: 'Разрешается следовать на станцию по главному пути с готовностью остановиться; следующий светофор закрыт.',
      },
      {
        label: 'Два желтых',
        lights: ['yellow', 'yellow', 'off'],
        meaning: 'Разрешается следовать на станцию с уменьшенной скоростью на боковой путь и готовностью остановиться.',
      },
      {
        label: 'Красный',
        lights: ['off', 'off', 'red'],
        meaning: 'Стой! Запрещается проезжать сигнал.',
      },
    ],
  },
  {
    id: 2,
    title: 'Выходные',
    section: 'ИСИ • Раздел 2 • лист 8 • п.18-21',
    placement: 'На выходе со станции',
    plate: 'Ч2',
    lensCount: 3,
    defaultState: 2,
    overview: 'Разрешают или запрещают отправление поезда со станции на перегон.',
    learnerTip: 'У выходного светофора главный вопрос - свободен ли перегон или блок-участки впереди.',
    theory: [
      'На участках с автоблокировкой зеленый огонь показывает, что впереди свободны два или более блок-участка.',
      'Желтый огонь разрешает отправление с готовностью остановиться у следующего закрытого светофора.',
      'Красный огонь запрещает отправление.',
    ],
    states: [
      {
        label: 'Зеленый',
        lights: ['green', 'off', 'off'],
        meaning: 'Разрешается отправиться со станции и следовать с установленной скоростью; впереди свободны два или более блок-участка.',
      },
      {
        label: 'Желтый',
        lights: ['off', 'yellow', 'off'],
        meaning: 'Разрешается отправиться со станции и следовать с готовностью остановиться; следующий светофор закрыт.',
      },
      {
        label: 'Красный',
        lights: ['off', 'off', 'red'],
        meaning: 'Стой! Запрещается проезжать сигнал.',
      },
      {
        label: 'Два зеленых',
        lights: ['green', 'green', 'off'],
        meaning: 'Разрешение отправиться на ответвление, многопутный участок или неправильный путь при установленных условиях.',
      },
    ],
  },
  {
    id: 3,
    title: 'Горочные',
    section: 'ИСИ • Раздел 2 • лист 4 и лист 32',
    placement: 'На сортировочной горке',
    plate: 'Г',
    lensCount: 3,
    variant: 'hump',
    defaultState: 0,
    overview: 'Управляют роспуском вагонов с сортировочной горки и показывают скорость роспуска.',
    learnerTip: 'Запомните как регулировку темпа: зеленый - обычный роспуск, желтый - тише, красный - стоп.',
    theory: [
      'Горочные светофоры подают сигналы для роспуска вагонов: установленная скорость, уменьшенная скорость, промежуточная скорость, остановка и осаживание.',
      'Сигнал читается по цвету огня и табличке горочного светофора.',
    ],
    states: [
      {
        label: 'Зеленый + желтый',
        lights: ['green', 'off', 'off'],
        secondaryLights: ['off', 'yellow', 'off'],
        meaning: 'Учебный обзор: зеленый разрешает роспуск с установленной скоростью, желтый рядом напоминает режим уменьшенной скорости.',
      },
      {
        label: 'Желтый',
        lights: ['off', 'yellow', 'off'],
        secondaryLights: ['off', 'off', 'off'],
        meaning: 'Разрешается роспуск вагонов с уменьшенной скоростью.',
      },
      {
        label: 'Красный',
        lights: ['off', 'off', 'red'],
        secondaryLights: ['off', 'off', 'off'],
        meaning: 'Стой! Роспуск вагонов запрещен.',
      },
      {
        label: 'Лунно-белый',
        lights: ['moon', 'off', 'off'],
        secondaryLights: ['off', 'off', 'off'],
        meaning: 'Осадить вагоны с горки на пути парка приема или вытяжной путь.',
      },
    ],
  },
  {
    id: 4,
    title: 'Заградительные',
    section: 'ИСИ • Раздел 2 • лист 12 • п.30-31',
    placement: 'У переездов, мостов, опасных мест',
    plate: '',
    lensCount: 1,
    variant: 'diamond',
    defaultState: 0,
    overview: 'Ограждают места, где движение должно быть немедленно остановлено при опасности.',
    learnerTip: 'Красный на заградительном - это абсолютный запрет. Негорящее положение сигнального значения не имеет.',
    theory: [
      'Заградительные светофоры могут требовать остановки или движения с готовностью остановиться.',
      'Негорящие заградительные сигналы сигнального значения не имеют.',
    ],
    states: [
      {
        label: 'Красный',
        lights: ['red'],
        meaning: 'Стой! Запрещается проезжать сигнал.',
      },
      {
        label: 'Желтый',
        lights: ['yellow'],
        meaning: 'Разрешается движение с готовностью остановиться; основной заградительный светофор закрыт.',
      },
      {
        label: 'Погашен',
        lights: ['off'],
        meaning: 'В негорящем положении сигнального значения не имеет.',
      },
    ],
  },
  {
    id: 5,
    title: 'Локомотивные',
    section: 'ИСИ • Раздел 2 • лист 14 • п.34-35',
    placement: 'В кабине локомотива',
    lensCount: 5,
    variant: 'locomotive',
    defaultState: 0,
    overview: 'Повторяют показания путевых светофоров и помогают машинисту видеть состояние блок-участков.',
    learnerTip: 'Белый огонь не означает свободный путь: он показывает, что сигналы с пути на локомотив не передаются.',
    theory: [
      'Зеленый огонь разрешает движение, когда впереди свободны два или более блок-участка.',
      'Желтый огонь требует уменьшенной скорости или готовности к следующему показанию.',
      'Желтый с красным означает готовность остановиться на блок-участке.',
    ],
    states: [
      {
        label: 'Зеленый',
        lights: ['green', 'off', 'off', 'off', 'off'],
        meaning: 'Разрешается движение; на путевом светофоре впереди горит зеленый огонь или свободны два и более блок-участка.',
      },
      {
        label: 'Желтый',
        lights: ['off', 'yellow', 'off', 'off', 'off'],
        meaning: 'Разрешается движение с уменьшенной скоростью; впереди свободен один блок-участок.',
      },
      {
        label: 'Желтый с красным',
        lights: ['off', 'yellow', 'red', 'off', 'off'],
        meaning: 'Разрешается движение с готовностью остановиться; следующий блок-участок занят.',
      },
      {
        label: 'Красный',
        lights: ['off', 'off', 'red', 'off', 'off'],
        meaning: 'Поезд вступил на занятый блок-участок или проследовал путевой светофор с красным огнем.',
      },
      {
        label: 'Белый',
        lights: ['off', 'off', 'off', 'off', 'white'],
        meaning: 'Локомотивные устройства включены, но показания путевых светофоров на локомотивный светофор не передаются.',
      },
    ],
  },
  {
    id: 6,
    title: 'Маневровые',
    section: 'ИСИ • Раздел 5 • лист 32 • п.98-102',
    placement: 'В маневровых районах станции',
    plate: 'М4',
    lensCount: 2,
    defaultState: 0,
    overview: 'Разрешают или запрещают маневровые передвижения локомотивов и составов.',
    learnerTip: 'Лунно-белый - маневры разрешены. Синий - маневры запрещены.',
    theory: [
      'Маневровыми светофорами подаются сигналы: разрешается производить маневры и запрещается производить маневры.',
      'На карточке показан типовой мачтовый маневровый светофор с табличкой района.',
    ],
    states: [
      {
        label: 'Лунно-белый',
        lights: ['moon', 'off'],
        meaning: 'Разрешается производить маневры.',
      },
      {
        label: 'Синий',
        lights: ['off', 'blue'],
        meaning: 'Запрещается производить маневры.',
      },
    ],
  },
  {
    id: 7,
    title: 'Маршрутные',
    section: 'ИСИ • Раздел 2 • лист 9 • п.22-24',
    placement: 'Перед маршрутом внутри станции',
    plate: '3',
    lensCount: 3,
    defaultState: 0,
    overview: 'Показывают разрешение движения по установленному маршруту и состояние следующего светофора.',
    learnerTip: 'Смотрите не только цвет, но и маршрутный указатель: он помогает понять путь или направление следования.',
    theory: [
      'Один зеленый огонь разрешает движение с установленной скоростью, если следующий маршрутный или выходной светофор открыт.',
      'Один желтый огонь требует готовности остановиться у следующего закрытого светофора.',
      'Два желтых огня показывают следование на боковой путь с уменьшенной скоростью.',
    ],
    states: [
      {
        label: 'Зеленый',
        lights: ['green', 'off', 'off'],
        meaning: 'Разрешается движение с установленной скоростью; следующий светофор открыт.',
      },
      {
        label: 'Желтый',
        lights: ['off', 'yellow', 'off'],
        meaning: 'Разрешается движение с готовностью остановиться; следующий светофор закрыт.',
      },
      {
        label: 'Желтый мигающий',
        lights: ['off', 'yellow-blink', 'off'],
        meaning: 'Разрешается проследование с установленной скоростью; следующий светофор открыт, но требует уменьшенной скорости.',
      },
      {
        label: 'Красный',
        lights: ['off', 'off', 'red'],
        meaning: 'Стой! Запрещается проезжать сигнал.',
      },
    ],
  },
  {
    id: 8,
    title: 'Повторительные',
    section: 'ИСИ • Раздел 2 • лист 13 • п.32-33',
    placement: 'Перед плохо видимым основным сигналом',
    plate: 'ПМ',
    lensCount: 1,
    defaultState: 0,
    overview: 'Повторяют открытое положение выходного или маршрутного светофора.',
    learnerTip: 'Если повторительный светофор не горит, он не дает самостоятельного разрешения.',
    theory: [
      'Зеленый огонь повторительного светофора показывает, что выходной или маршрутный светофор открыт.',
      'Негорящий повторительный светофор сигнального значения не имеет.',
    ],
    states: [
      {
        label: 'Зеленый',
        lights: ['green'],
        meaning: 'Выходной или маршрутный светофор открыт.',
      },
      {
        label: 'Погашен',
        lights: ['off'],
        meaning: 'Негорящий повторительный светофор сигнального значения не имеет.',
      },
    ],
  },
  {
    id: 9,
    title: 'Предупредительные',
    section: 'ИСИ • Раздел 2 • лист 13 • п.32-33',
    placement: 'Перед основным светофором',
    plate: 'ПН',
    lensCount: 2,
    defaultState: 0,
    overview: 'Заранее предупреждают о показании основного светофора.',
    learnerTip: 'Предупредительный сигнал нужен для подготовки: продолжать движение или заранее готовиться к остановке.',
    theory: [
      'Зеленый предупреждает, что основной светофор открыт.',
      'Желтый предупреждает о закрытом основном светофоре.',
      'Желтый мигающий связан с открытым основным сигналом, который требует уменьшенной скорости.',
    ],
    states: [
      {
        label: 'Зеленый',
        lights: ['green', 'off'],
        meaning: 'Разрешается движение с установленной скоростью; основной светофор открыт.',
      },
      {
        label: 'Желтый',
        lights: ['off', 'yellow'],
        meaning: 'Разрешается движение с готовностью остановиться; основной светофор закрыт.',
      },
      {
        label: 'Желтый мигающий',
        lights: ['off', 'yellow-blink'],
        meaning: 'Основной светофор открыт, но требует проследования с уменьшенной скоростью.',
      },
    ],
  },
  {
    id: 10,
    title: 'Прикрытия',
    section: 'ИСИ • Раздел 2 • лист 12 • п.30',
    placement: 'Перед пересечениями, мостами, разводными пролетами',
    plate: 'П',
    lensCount: 2,
    defaultState: 1,
    overview: 'Защищают опасные места и разрешают движение только при безопасном состоянии объекта.',
    learnerTip: 'Светофор прикрытия похож на охрану места: зеленый - место открыто, красный - движение запрещено.',
    theory: [
      'Светофоры прикрытия подают разрешающий сигнал движения с установленной скоростью.',
      'Красный огонь требует остановки и запрещает проезд сигнала.',
    ],
    states: [
      {
        label: 'Зеленый',
        lights: ['green', 'off'],
        meaning: 'Разрешается движение с установленной скоростью.',
      },
      {
        label: 'Красный',
        lights: ['off', 'red'],
        meaning: 'Стой! Запрещается проезжать сигнал.',
      },
    ],
  },
  {
    id: 11,
    title: 'Проходные',
    section: 'ИСИ • Раздел 2 • лист 10-11 • п.25-29',
    placement: 'На перегоне между станциями',
    plate: '5',
    lensCount: 3,
    defaultState: 2,
    overview: 'Разделяют перегон на блок-участки и показывают, насколько свободен путь впереди.',
    learnerTip: 'Для проходного светофора главное - количество свободных блок-участков впереди.',
    theory: [
      'При трехзначной автоблокировке зеленый означает свободные два или более блок-участка.',
      'Желтый означает готовность остановиться, потому что следующий светофор закрыт.',
      'Красный запрещает проезжать сигнал.',
    ],
    states: [
      {
        label: 'Зеленый',
        lights: ['green', 'off', 'off'],
        meaning: 'Разрешается движение с установленной скоростью; впереди свободны два или более блок-участка.',
      },
      {
        label: 'Желтый',
        lights: ['off', 'yellow', 'off'],
        meaning: 'Разрешается движение с готовностью остановиться; следующий светофор закрыт.',
      },
      {
        label: 'Красный',
        lights: ['off', 'off', 'red'],
        meaning: 'Стой! Запрещается проезжать сигнал.',
      },
      {
        label: 'Четырехзначный',
        lights: ['green', 'yellow', 'off'],
        meaning: 'Учебный режим четырехзначной сигнализации: впереди свободны два блок-участка, требуется внимание к следующему показанию.',
      },
    ],
  },
];

const initialStates = signalCatalog.reduce((acc, signal) => {
  acc[signal.id] = signal.defaultState || 0;
  return acc;
}, {});

const parseLight = (value) => {
  if (!value || value === 'off') {
    return { color: 'off', blink: false };
  }

  return {
    color: value.replace('-blink', ''),
    blink: value.includes('-blink'),
  };
};

const colorNames = {
  green: 'зеленый',
  yellow: 'желтый',
  red: 'красный',
  moon: 'лунно-белый',
  blue: 'синий',
  white: 'белый',
  off: 'погашен',
};

const SignalHead = ({ lights, lensCount, interactive, bright, onCycle, compact = false, labels = {} }) => {
  const slots = Array.from({ length: lensCount }, (_, index) => lights[index] || 'off');

  return (
    <div className={`isi-signal-head ${compact ? 'compact' : ''}`}>
      {slots.map((light, index) => {
        const parsed = parseLight(light);
        const isOn = parsed.color !== 'off';
        const localizedColor = labels.lightColors?.[parsed.color] || colorNames[parsed.color] || parsed.color;
        const label = isOn
          ? `${labels.lightOn || 'Горит'} ${localizedColor}`
          : (labels.lightOff || 'Огонь погашен');

        return (
          <button
            aria-label={label}
            className={[
              'isi-light-slot',
              isOn ? `on ${parsed.color}` : 'off',
              parsed.blink ? 'blink' : '',
              bright && isOn ? 'glow-bright' : '',
            ].join(' ')}
            disabled={!interactive}
            key={`${light}-${index}`}
            onClick={onCycle}
            title={interactive ? (labels.changeHint || 'Нажмите, чтобы сменить показание') : label}
            type="button"
          />
        );
      })}
    </div>
  );
};

const NormalSignal = ({ signal, state, interactive, bright, onCycle, modal, labels = {} }) => (
  <div className="isi-mast-wrap">
    <SignalHead
      labels={labels}
      bright={bright}
      compact={!modal}
      interactive={interactive}
      lensCount={signal.lensCount}
      lights={state.lights}
      onCycle={onCycle}
    />
    {state.stripes && (
      <div className="isi-route-stripes" aria-hidden="true">
        {Array.from({ length: state.stripes }).map((_, index) => (
          <span key={index} />
        ))}
      </div>
    )}
    {(state.plate || signal.plate) && <span className="isi-signal-plate">{state.plate || signal.plate}</span>}
    <span className="isi-mast-post" />
    <span className="isi-mast-base" />
  </div>
);

const HumpSignal = ({ signal, state, interactive, bright, onCycle, modal, labels = {} }) => (
  <div className="isi-hump-pair">
    <div className="isi-mast-wrap">
      <SignalHead
        labels={labels}
        bright={bright}
        compact={!modal}
        interactive={interactive}
        lensCount={signal.lensCount}
        lights={state.lights}
        onCycle={onCycle}
      />
      <span className="isi-signal-plate">{labels.humpPlate || signal.plate || 'Г'}</span>
      <span className="isi-mast-post" />
      <span className="isi-mast-base" />
    </div>
    <div className="isi-mast-wrap secondary">
      <SignalHead
        labels={labels}
        bright={bright}
        compact={!modal}
        interactive={interactive}
        lensCount={signal.lensCount}
        lights={state.secondaryLights || ['off', 'off', 'off']}
        onCycle={onCycle}
      />
      <span className="isi-signal-plate">{labels.humpPlate || signal.plate || 'Г'}</span>
      <span className="isi-mast-post" />
      <span className="isi-mast-base" />
    </div>
  </div>
);

const DiamondSignal = ({ signal, state, interactive, bright, onCycle, labels = {} }) => (
  <div className="isi-diamond-wrap">
    <div className="isi-diamond-head">
      <SignalHead
        labels={labels}
        bright={bright}
        compact
        interactive={interactive}
        lensCount={signal.lensCount}
        lights={state.lights}
        onCycle={onCycle}
      />
    </div>
    <span className="isi-mast-post" />
    <span className="isi-mast-base" />
  </div>
);

const LocomotiveSignal = ({ signal, state, interactive, bright, onCycle, labels = {} }) => (
  <div className="isi-loco-schematic">
    <div className="isi-loco-indicator">
      <span className="isi-loco-label">{labels.alsn || 'АЛСН'}</span>
      <SignalHead
        labels={labels}
        bright={bright}
        interactive={interactive}
        lensCount={signal.lensCount}
        lights={state.lights}
        onCycle={onCycle}
      />
    </div>
    <div className="isi-loco-track-view" aria-hidden="true">
      <span className="isi-loco-catenary" />
      <span className="isi-loco-rail left" />
      <span className="isi-loco-rail right" />
      <div className="isi-loco-track-signal">
        <span />
        <span />
        <span className="active" />
      </div>
      <strong>{labels.trackSignal || 'путевой сигнал'}</strong>
    </div>
  </div>
);

const SignalIllustration = ({ signal, stateIndex, interactive = false, bright = false, modal = false, onCycle, labels = {} }) => {
  const state = signal.states[stateIndex] || signal.states[0];
  const sharedProps = { signal, state, interactive, bright, onCycle, modal, labels };

  return (
    <div className={`isi-signal-scene ${modal ? 'modal' : ''} ${bright ? 'scene-bright' : ''}`}>
      <div className="isi-sky-band" aria-hidden="true" />
      <div className="isi-signal-stage">
        {signal.variant === 'hump' && <HumpSignal {...sharedProps} />}
        {signal.variant === 'diamond' && <DiamondSignal {...sharedProps} />}
        {signal.variant === 'locomotive' && <LocomotiveSignal {...sharedProps} />}
        {!signal.variant && <NormalSignal {...sharedProps} />}
      </div>
      <div className="isi-track-bed" aria-hidden="true">
        <span />
        <span />
      </div>
    </div>
  );
};

const DirectoryView = ({ data, lang, onDataRefresh }) => {
  const [cardStates, setCardStates] = useState(initialStates);
  const [hoveredId, setHoveredId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [activeSectionId, setActiveSectionId] = useState('01');
  const [studied, setStudied] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  });
  const initialLocalStudied = useRef(studied.map(String));
  const hasSyncedLocalStudied = useRef(false);

  const directoryContent = useMemo(
    () => getLocalizedDirectory(lang, { learningSections, basics, guideSections, signalCatalog }),
    [lang]
  );
  const labels = directoryContent;
  const learningSectionsData = directoryContent.learningSections;
  const basicsData = directoryContent.basics;
  const guideSectionsData = directoryContent.guideSections;
  const signalCatalogData = directoryContent.signalCatalog;
  const serverDirectoryKeys = data?.learning?.activityProgress?.directoryCards?.completedKeys;

  const cardRefs = useRef({});
  const selectedSignal = useMemo(
    () => signalCatalogData.find((signal) => signal.id === selectedId) || null,
    [selectedId, signalCatalogData]
  );
  const activeGuideSection = useMemo(
    () => guideSectionsData.find((section) => section.id === activeSectionId) || guideSectionsData[0],
    [activeSectionId, guideSectionsData]
  );

  useEffect(() => {
    if (!Array.isArray(serverDirectoryKeys)) return;

    const normalizedServerKeys = serverDirectoryKeys.map(String);
    const localKeys = Array.from(new Set(initialLocalStudied.current || []));

    if (!hasSyncedLocalStudied.current && normalizedServerKeys.length === 0 && localKeys.length > 0) {
      hasSyncedLocalStudied.current = true;
      setStudied(localKeys);

      Promise.all(localKeys.map((activityKey) => apiFetch('/api/activity-progress/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activity_type: 'directory_card',
          activity_key: activityKey,
          is_completed: true,
        }),
      })))
        .then(() => onDataRefresh?.())
        .catch((error) => console.error('Directory local progress sync failed:', error));
      return;
    }

    hasSyncedLocalStudied.current = true;
    setStudied(normalizedServerKeys);
  }, [serverDirectoryKeys]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(studied));
  }, [studied]);

  const studiedSet = useMemo(() => new Set(studied.map(String)), [studied]);
  const progress = Math.round((studied.length / signalCatalogData.length) * 100);

  const setSignalState = (signalId, nextState) => {
    setCardStates((current) => ({ ...current, [signalId]: nextState }));
  };

  const cycleSignal = (signal) => {
    setCardStates((current) => ({
      ...current,
      [signal.id]: ((current[signal.id] ?? 0) + 1) % signal.states.length,
    }));
  };

  const toggleStudied = (signalId) => {
    const activityKey = String(signalId);
    const nextCompleted = !studiedSet.has(activityKey);

    setStudied((current) => {
      const normalized = current.map(String);
      return nextCompleted
        ? Array.from(new Set([...normalized, activityKey]))
        : normalized.filter((id) => id !== activityKey);
    });

    apiFetch('/api/activity-progress/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        activity_type: 'directory_card',
        activity_key: activityKey,
        is_completed: nextCompleted,
      }),
    })
      .then((response) => {
        if (!response.ok) throw new Error(`Directory progress failed with ${response.status}`);
        return response.json();
      })
      .then(() => onDataRefresh?.())
      .catch((error) => console.error('Directory progress save failed:', error));
  };

  const scrollToSignal = (signalId) => {
    cardRefs.current[signalId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setHoveredId(signalId);
    window.setTimeout(() => setHoveredId(null), 900);
  };

  const goToModalSignal = (direction) => {
    if (!selectedSignal) return;
    const currentIndex = signalCatalogData.findIndex((signal) => signal.id === selectedSignal.id);
    const nextIndex = (currentIndex + direction + signalCatalogData.length) % signalCatalogData.length;
    setSelectedId(signalCatalogData[nextIndex].id);
  };

  return (
    <div className="isi-directory animate-fade-in">
      <section className="isi-hero">
        <div>
          <span className="isi-hero-badge"><i className="fas fa-traffic-light" /> {labels.heroBadge}</span>
          <h2>{labels.title}</h2>
          <p>{labels.subtitle}</p>
        </div>
        <div className="isi-progress-card" aria-label={`${labels.studied} ${studied.length} ${labels.of} ${signalCatalogData.length}`}>
          <span>{progress}%</span>
          <strong>{labels.studied} {studied.length} {labels.of} {signalCatalogData.length}</strong>
          <div className="isi-progress-track">
            <i style={{ width: `${progress}%` }} />
          </div>
        </div>
      </section>

      <section className="isi-section-map" aria-label={labels.sectionsAria}>
        {learningSectionsData.map((section) => (
          <button
            className={`isi-section-chip ${activeSectionId === section.id ? 'active' : ''}`}
            key={section.id}
            onClick={() => setActiveSectionId(section.id)}
            type="button"
          >
            <span>{section.id}</span>
            <div>
              <strong>{section.title}</strong>
              <p>{section.text}</p>
            </div>
          </button>
        ))}
      </section>

      <section className="isi-guide-panel" aria-label={labels.guideAria}>
        <div className="isi-guide-main">
          <div className="isi-guide-icon">
            <i className={`fas ${activeGuideSection.icon}`} />
          </div>
          <div>
            <span>{activeGuideSection.meta}</span>
            <h3>{activeGuideSection.title}</h3>
            <p>{activeGuideSection.summary}</p>
          </div>
        </div>
        <div className="isi-guide-facts">
          {activeGuideSection.facts.map((fact) => (
            <div className="isi-guide-fact" key={fact}>
              <i className="fas fa-check" />
              <p>{fact}</p>
            </div>
          ))}
        </div>
        <div className="isi-guide-note">
          <i className="fas fa-lightbulb" />
          <p>{activeGuideSection.note}</p>
        </div>
      </section>

      <section className="isi-basics-grid" aria-label={labels.basicsAria}>
        {basicsData.map((item) => (
          <article className="isi-basic-card" key={item.title}>
            <i className={`fas ${item.icon}`} />
            <div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          </article>
        ))}
      </section>

      <div className="isi-workspace">
        <aside className="isi-directory-index">
          <div className="isi-index-title">
            <span>{labels.indexSection}</span>
            <strong>{labels.indexTitle}</strong>
          </div>
          <div className="isi-index-list">
            {signalCatalogData.map((signal) => (
              <button
                className={`isi-index-item ${studiedSet.has(String(signal.id)) ? 'done' : ''}`}
                key={signal.id}
                onClick={() => scrollToSignal(signal.id)}
                onMouseEnter={() => setHoveredId(signal.id)}
                onMouseLeave={() => setHoveredId(null)}
                type="button"
              >
                <span>{signal.id}</span>
                <strong>{signal.title}</strong>
                <i className={`fas ${studiedSet.has(String(signal.id)) ? 'fa-check' : 'fa-circle'}`} />
              </button>
            ))}
          </div>
        </aside>

        <section className="isi-traffic-grid" aria-label={labels.trafficGridAria}>
          {signalCatalogData.map((signal) => {
            const activeStateIndex = cardStates[signal.id] ?? 0;
            const activeState = signal.states[activeStateIndex] || signal.states[0];
            const isStudied = studiedSet.has(String(signal.id));
            const isBright = hoveredId === signal.id || isStudied;
            const needsDirectoryAlign = ![7, 8, 9].includes(signal.id);

            return (
              <article
                className={`isi-traffic-card isi-card-id-${signal.id} ${needsDirectoryAlign ? 'needs-directory-align' : ''} ${isStudied ? 'studied' : ''}`}
                key={signal.id}
                onMouseEnter={() => setHoveredId(signal.id)}
                onMouseLeave={() => setHoveredId(null)}
                ref={(node) => { cardRefs.current[signal.id] = node; }}
              >
                <div className="isi-card-topline">
                  <span className="isi-card-number">{signal.id}</span>
                  <span className="isi-card-section">{signal.section}</span>
                </div>

                <SignalIllustration
                  labels={labels}
                  bright={isBright}
                  interactive
                  onCycle={() => cycleSignal(signal)}
                  signal={signal}
                  stateIndex={activeStateIndex}
                />

                <div className="isi-card-body">
                  <div className="isi-card-heading">
                    <div>
                      <h3>{signal.title}</h3>
                      <p>{signal.placement}</p>
                    </div>
                    <button
                      className={`isi-study-toggle ${isStudied ? 'active' : ''}`}
                      onClick={() => toggleStudied(signal.id)}
                      type="button"
                    >
                      <i className={`fas ${isStudied ? 'fa-check' : 'fa-bookmark'}`} />
                    </button>
                  </div>

                  <p className="isi-card-overview">{signal.overview}</p>

                  <div className="isi-state-pills">
                    {signal.states.map((state, index) => (
                      <button
                        className={index === activeStateIndex ? 'active' : ''}
                        key={state.label}
                        onClick={() => setSignalState(signal.id, index)}
                        type="button"
                      >
                        {state.label}
                      </button>
                    ))}
                  </div>

                  <div className="isi-current-meaning">
                    <i className="fas fa-lightbulb" />
                    <p>{activeState.meaning}</p>
                  </div>

                  <div className="isi-card-actions">
                    <button className="isi-more-btn" onClick={() => setSelectedId(signal.id)} type="button">
                      {labels.details}
                      <i className="fas fa-arrow-right" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      </div>

      {selectedSignal && (
        <div className="isi-modal-overlay" onClick={() => setSelectedId(null)} role="presentation">
          <section
            aria-modal="true"
            className="isi-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <button className="isi-modal-close" onClick={() => setSelectedId(null)} type="button">
              <i className="fas fa-times" />
            </button>

            <div className="isi-modal-head">
              <span>{selectedSignal.id}</span>
              <div>
                <p>{selectedSignal.section}</p>
                <h2>{selectedSignal.title}</h2>
              </div>
            </div>

            <div className="isi-modal-layout">
              <div className="isi-modal-visual">
                <SignalIllustration
                  labels={labels}
                  bright
                  interactive
                  modal
                  onCycle={() => cycleSignal(selectedSignal)}
                  signal={selectedSignal}
                  stateIndex={cardStates[selectedSignal.id] ?? 0}
                />
                <span className="isi-tap-hint">
                  <i className="fas fa-hand-pointer" />
                  {labels.tapHint}
                </span>
              </div>

              <div className="isi-modal-info">
                <p className="isi-modal-overview">{selectedSignal.overview}</p>

                <div className="isi-state-pills modal-pills">
                  {selectedSignal.states.map((state, index) => (
                    <button
                      className={index === (cardStates[selectedSignal.id] ?? 0) ? 'active' : ''}
                      key={state.label}
                      onClick={() => setSignalState(selectedSignal.id, index)}
                      type="button"
                    >
                      {state.label}
                    </button>
                  ))}
                </div>

                <div className="isi-modal-meaning">
                  <span>{labels.currentMeaning}</span>
                  <p>{selectedSignal.states[cardStates[selectedSignal.id] ?? 0].meaning}</p>
                </div>

                <div className="isi-theory-box">
                  <span>{labels.memoryText}</span>
                  {selectedSignal.theory.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>

                <div className="isi-tip-box">
                  <i className="fas fa-lightbulb" />
                  <p>{selectedSignal.learnerTip}</p>
                </div>
              </div>
            </div>

            <div className="isi-modal-footer">
              <button onClick={() => goToModalSignal(-1)} type="button">
                <i className="fas fa-arrow-left" />
                {labels.back}
              </button>
              <button className="primary" onClick={() => toggleStudied(selectedSignal.id)} type="button">
                <i className={`fas ${studiedSet.has(selectedSignal.id) ? 'fa-check' : 'fa-bookmark'}`} />
                {studiedSet.has(selectedSignal.id) ? labels.studied : labels.markStudied}
              </button>
              <button onClick={() => goToModalSignal(1)} type="button">
                {labels.next}
                <i className="fas fa-arrow-right" />
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default DirectoryView;
