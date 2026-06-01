import platformTranslations from './platformTranslations.json';

const supported = ['ru', 'kz', 'en'];

function normalizeLang(lang) {
  const value = String(lang || '').trim().toLowerCase();
  if (value === 'kk') return 'kz';
  return supported.includes(value) ? value : 'ru';
}

function byId(items = []) {
  return new Map(items.map((item) => [String(item.id), item]));
}

function copyTextList(source = [], translated = []) {
  if (!translated.length) return source;
  const translatedById = byId(translated);

  return source.map((item, index) => ({
    ...item,
    ...(translatedById.get(String(item.id)) || translated[index] || {}),
  }));
}

function localizeSignals(sourceSignals = [], translatedSignals = []) {
  if (!translatedSignals.length) return sourceSignals;
  const translatedById = byId(translatedSignals);

  return sourceSignals.map((signal, index) => {
    const translated = translatedById.get(String(signal.id)) || translatedSignals[index] || {};

    return {
      ...signal,
      title: translated.title || signal.title,
      section: translated.section || signal.section,
      placement: translated.placement || signal.placement,
      overview: translated.overview || signal.overview,
      learnerTip: translated.learnerTip || signal.learnerTip,
      theory: Array.isArray(translated.theory) && translated.theory.length ? translated.theory : signal.theory,
      states: signal.states.map((state, stateIndex) => {
        const translatedState = translated.states?.[stateIndex] || {};

        return {
          ...state,
          label: translatedState.label || state.label,
          meaning: translatedState.meaning || state.meaning,
        };
      }),
    };
  });
}

export function getLocalizedDirectory(lang, source) {
  const selectedLang = normalizeLang(lang);
  const ru = platformTranslations.ru?.directory || {};
  const translated = platformTranslations[selectedLang]?.directory || ru;

  if (selectedLang === 'ru') {
    return {
      ...ru,
      learningSections: source.learningSections,
      basics: source.basics,
      guideSections: source.guideSections,
      signalCatalog: source.signalCatalog,
    };
  }

  return {
    ...ru,
    ...translated,
    learningSections: copyTextList(source.learningSections, translated.learningSections),
    basics: copyTextList(source.basics, translated.basics),
    guideSections: copyTextList(source.guideSections, translated.guideSections),
    signalCatalog: localizeSignals(source.signalCatalog, translated.signalCatalog),
  };
}
