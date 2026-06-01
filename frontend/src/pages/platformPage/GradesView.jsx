import React, { useState } from 'react';

const gradeCopy = {
  ru: {
    badge: 'Успеваемость',
    title: 'Прогресс курса КТЖ',
    subtitle: 'Живая панель обучения: прогресс по модулям, результаты тестов и следующие шаги подготовки.',
    currentScore: 'Прогресс по модулям',
    studyTime: 'в обучении',
    tasksDone: 'модулей завершено',
    ranking: 'в рейтинге',
    courseProgress: 'Прогресс курса',
    completed: 'пройдено',
    nextGoal: 'Следующая цель: завершить модули раздела и открыть соответствующий значок.',
    result: 'Результат',
    passing: 'Порог',
    passMessage: 'Все модули завершены. Общий прогресс курса достиг 100%.',
    retryMessage: 'Прогресс растет только после полного завершения модуля.',
    gradeSummary: 'Сводка оценок',
    gradeDetails: 'Детализация оценок',
    taskType: 'Тип задания',
    weight: 'Вес',
    grade: 'Оценка',
    total: 'Итог',
    moduleTests: 'Модульные тесты',
    chapterTests: '7 разделов курса',
    completedTopics: 'Завершено модулей',
    openedBadges: 'Открытые значки разделов',
    of: 'из',
    modules: 'модулей',
    unlocked: 'Значок открыт',
    locked: 'Значок откроется после завершения всех модулей раздела',
    finalScore: 'Итоговый прогресс курса',
    learningVideo: 'Изученные тренажеры',
    learningVideoText: 'Счетчик обновляется после успешного завершения тренажера.',
    cases: 'Карточки справочника',
    casesText: 'Счетчик обновляется, когда карточка сигнала отмечена как изученная.',
    selfCheck: 'Пройденные мини-тесты',
    selfCheckText: 'Учитываются только уроки, где тест пройден на 100%.',
    unknownLesson: 'Урок',
  },
  kz: {
    badge: 'Үлгерім',
    title: 'ҚТЖ курсының прогресі',
    subtitle: 'Оқу панелі: модульдер прогресі, тест нәтижелері және келесі дайындық қадамдары.',
    currentScore: 'Модуль прогресі',
    studyTime: 'оқуда',
    tasksDone: 'модуль аяқталды',
    ranking: 'рейтингтегі орын',
    courseProgress: 'Курс прогресі',
    completed: 'аяқталды',
    nextGoal: 'Келесі мақсат: бөлім модульдерін аяқтап, тиісті белгіні ашу.',
    result: 'Нәтиже',
    passing: 'Шек',
    passMessage: 'Барлық модульдер аяқталды. Курстың жалпы прогресі 100%-ға жетті.',
    retryMessage: 'Прогресс модуль толық аяқталғаннан кейін ғана өседі.',
    gradeSummary: 'Бағалар жиынтығы',
    gradeDetails: 'Бағалар мәліметі',
    taskType: 'Тапсырма түрі',
    weight: 'Салмақ',
    grade: 'Баға',
    total: 'Қорытынды',
    moduleTests: 'Модульдік тесттер',
    chapterTests: 'Курстың 7 бөлімі',
    completedTopics: 'Аяқталған модульдер',
    openedBadges: 'Бөлім белгілері',
    of: 'ішінен',
    modules: 'модуль',
    unlocked: 'Белгі ашылды',
    locked: 'Белгі бөлімнің барлық модульдері аяқталғанда ашылады',
    finalScore: 'Курстың қорытынды прогресі',
    learningVideo: 'Өтілген тренажерлер',
    learningVideoText: 'Санауыш тренажер сәтті аяқталғаннан кейін жаңарады.',
    cases: 'Анықтамалық карточкалары',
    casesText: 'Сигнал карточкасы оқылды деп белгіленгенде санауыш жаңарады.',
    selfCheck: 'Өтілген шағын тесттер',
    selfCheckText: 'Тек тесті 100% өткен сабақтар есептеледі.',
    unknownLesson: 'Сабақ',
  },
  en: {
    badge: 'Performance',
    title: 'KTZ course progress',
    subtitle: 'A live learning dashboard: module progress, quiz results, and next preparation steps.',
    currentScore: 'Module progress',
    studyTime: 'in learning',
    tasksDone: 'modules completed',
    ranking: 'ranking place',
    courseProgress: 'Course progress',
    completed: 'completed',
    nextGoal: 'Next goal: complete the section modules and unlock the matching badge.',
    result: 'Result',
    passing: 'Threshold',
    passMessage: 'All modules are completed. The course progress has reached 100%.',
    retryMessage: 'Progress grows only after a full module is completed.',
    gradeSummary: 'Grade summary',
    gradeDetails: 'Grade details',
    taskType: 'Task type',
    weight: 'Weight',
    grade: 'Grade',
    total: 'Total',
    moduleTests: 'Module tests',
    chapterTests: '7 course chapters',
    completedTopics: 'Completed modules',
    openedBadges: 'Unlocked chapter badges',
    of: 'of',
    modules: 'modules',
    unlocked: 'Badge unlocked',
    locked: 'Badge unlocks after all chapter modules are completed',
    finalScore: 'Final course progress',
    learningVideo: 'Completed simulators',
    learningVideoText: 'This counter updates after a simulator is completed successfully.',
    cases: 'Studied directory cards',
    casesText: 'This counter updates when signal reference cards are marked as studied.',
    selfCheck: 'Passed lesson tests',
    selfCheckText: 'Only lessons passed with a 100% quiz result are counted.',
    unknownLesson: 'Lesson',
  },
};

function calculatePercent(value, total) {
  const numericValue = Number(value) || 0;
  const numericTotal = Number(total) || 0;

  if (!numericTotal) return 0;

  return Math.round((numericValue / numericTotal) * 100);
}

function fallbackDetailGroups(copy) {
  return [
    {
      title: copy.chapterTests,
      score: '0%',
      rows: [
        [copy.completedTopics, `0 ${copy.of} 0 ${copy.modules}`],
      ],
    },
  ];
}

function GradesView({ data, lang = 'ru' }) {
  const [openGrade, setOpenGrade] = useState(0);
  const copy = gradeCopy[lang] || gradeCopy.ru;
  const learning = data?.learning || {};
  const stats = learning.stats || {};
  const gradeRows = learning.grades || [];
  const certificateRows = learning.certificates || [];
  const scorePercent = stats.averageScorePercent ?? 0;
  const progressPercent = stats.overallProgressPercent ?? 0;
  const completedModules = stats.completedModules ?? 0;
  const totalModules = stats.totalModules ?? 0;
  const completedSections = stats.completedSections ?? 0;
  const totalSections = stats.totalSections ?? 0;
  const activityProgress = learning.activityProgress || {};
  const simulatorProgress = activityProgress.simulators || {};
  const directoryProgress = activityProgress.directoryCards || {};
  const completedSimulators = simulatorProgress.completed ?? stats.simulatorsCompleted ?? 0;
  const totalSimulators = simulatorProgress.total ?? stats.simulatorsTotal ?? 0;
  const completedDirectoryCards = directoryProgress.completed ?? stats.directoryCardsCompleted ?? 0;
  const totalDirectoryCards = directoryProgress.total ?? stats.directoryCardsTotal ?? 0;
  const completedSelfChecks = stats.completedLessons ?? 0;
  const totalSelfChecks = stats.totalLessons ?? 0;
  const progressBarPercent = Math.min(100, Math.max(0, Number(progressPercent) || 0));
  const chapterProgressPercent = calculatePercent(completedSections, totalSections);
  const chapterBadgeText = totalSections ? `${completedSections} ${copy.of} ${totalSections}` : `0 ${copy.of} 0`;
  const moduleProgressText = totalModules ? `${completedModules}/${totalModules}` : '0/0';
  const simulatorProgressText = totalSimulators ? `${completedSimulators}/${totalSimulators}` : '0/0';
  const directoryProgressText = totalDirectoryCards ? `${completedDirectoryCards}/${totalDirectoryCards}` : '0/0';
  const selfCheckProgressText = totalSelfChecks ? `${completedSelfChecks}/${totalSelfChecks}` : '0/0';
  const studyHours = Number(stats.studyHours || 0).toLocaleString(undefined, { maximumFractionDigits: 1 });
  const rank = stats.rank ?? '-';
  const progressIsComplete = progressBarPercent >= 100;
  const dynamicDetailGroups = certificateRows.length
    ? certificateRows.map((section) => {
      const completed = section.completedModules ?? section.completedLessons ?? 0;
      const total = section.totalModules ?? section.totalLessons ?? 0;
      const percent = section.progressPercent ?? calculatePercent(completed, total);

      return {
        title: section.title || `${copy.chapterTests} ${section.order || ''}`.trim(),
        score: `${percent}%`,
        rows: [
          [copy.completedTopics, `${completed} ${copy.of} ${total} ${copy.modules}`],
          [copy.openedBadges, section.completed ? copy.unlocked : copy.locked],
        ],
      };
    })
    : fallbackDetailGroups(copy);

  const learningSections = [
    { icon: 'fas fa-vr-cardboard', title: copy.learningVideo, text: copy.learningVideoText, status: simulatorProgressText },
    { icon: 'fas fa-book-open', title: copy.cases, text: copy.casesText, status: directoryProgressText },
    { icon: 'fas fa-clipboard-list', title: copy.selfCheck, text: copy.selfCheckText, status: selfCheckProgressText },
  ];

  return (
    <div className="content-area animate-fade-in">
      <section id="grades-view" className="view-section grades-redesign">
        <div className="grades-hero-card">
          <div>
            <span className="premium-badge"><i className="fas fa-chart-line"></i> {copy.badge}</span>
            <h2>{copy.title}</h2>
            <p>{copy.subtitle}</p>
          </div>
          <div className="grades-hero-score">
            <strong>{progressBarPercent}%</strong>
            <span>{copy.currentScore}</span>
          </div>
        </div>

        <div className="quick-stats-row">
          <div className="mini-card reveal accent-blue">
            <div className="mini-icon-bg"><i className="fas fa-stopwatch"></i></div>
            <div className="mini-data"><span className="mini-val">{studyHours}h</span><span className="mini-label">{copy.studyTime}</span></div>
          </div>
          <div className="mini-card reveal accent-green">
            <div className="mini-icon-bg"><i className="fas fa-check-double"></i></div>
            <div className="mini-data"><span className="mini-val">{moduleProgressText}</span><span className="mini-label">{copy.tasksDone}</span></div>
          </div>
          <div className="mini-card reveal accent-yellow">
            <div className="mini-icon-bg"><i className="fas fa-medal"></i></div>
            <div className="mini-data"><span className="mini-val">{rank}</span><span className="mini-label">{copy.ranking}</span></div>
          </div>
        </div>

        <div className="grades-stats-grid">
          <div className="stat-card reveal progress-card-bright">
            <h3 className="section-title"><i className="fas fa-chart-pie text-blue"></i> {copy.courseProgress}</h3>
            <div className="progress-container">
              <div className="circular-progress animated-course-progress" style={{ '--course-progress': `${progressBarPercent}%` }}>
                <div className="inner-circle">
                  <span className="percentage">{progressBarPercent}%</span>
                  <span className="label">{copy.completed}</span>
                </div>
              </div>
            </div>
            <div className="progress-hint">{copy.nextGoal}</div>
          </div>

          <div className="stat-card reveal progress-card-bright">
            <h3 className="section-title"><i className="fas fa-bullseye text-blue"></i> {copy.currentScore}</h3>
            <div className="grade-bar-container">
              <div className="grade-labels">
                <span>{copy.result}: <strong className="text-blue">{progressBarPercent}%</strong></span>
                <span className="text-muted">{copy.completedTopics}: {moduleProgressText}</span>
              </div>
              <div className="bar-track">
                <div className="bar-fill animate-width bright-grade-fill" style={{ '--target-width': `${progressBarPercent}%`, width: `${progressBarPercent}%` }}></div>
                <div className="passing-marker" style={{ left: `${progressBarPercent}%` }}><div className="marker-tooltip">{progressBarPercent}%</div></div>
              </div>
              <div className={`status-msg ${progressIsComplete ? 'success-glow' : ''}`}>
                <i className={`fas fa-${progressIsComplete ? 'check-circle' : 'exclamation-circle'}`}></i> {progressIsComplete ? copy.passMessage : copy.retryMessage}
              </div>
            </div>
          </div>
        </div>

        <div className="grades-two-column">
          <div className="stat-card reveal grades-summary-panel">
            <h3 className="section-title"><i className="fas fa-list-ul text-blue"></i> {copy.gradeSummary}</h3>
            <table className="grades-summary-table modern-design">
              <thead>
                <tr><th>{copy.taskType}</th><th>{copy.weight}</th><th>{copy.grade}</th><th>{copy.total}</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td><i className="fas fa-layer-group table-icon"></i> {copy.chapterTests}</td>
                  <td>{totalSections}</td>
                  <td><span className="badge badge-blue">{completedSections}</span></td>
                  <td><strong>{chapterProgressPercent}%</strong></td>
                </tr>
                <tr>
                  <td><i className="fas fa-check-double table-icon"></i> {copy.completedTopics}</td>
                  <td>{totalModules}</td>
                  <td><span className="badge badge-green">{completedModules}</span></td>
                  <td><strong>{progressPercent}%</strong></td>
                </tr>
                <tr>
                  <td><i className="fas fa-medal table-icon"></i> {copy.openedBadges}</td>
                  <td>{totalSections}</td>
                  <td><span className="badge badge-yellow">{completedSections}</span></td>
                  <td><strong>{chapterBadgeText}</strong></td>
                </tr>
                <tr className="total-row-highlight">
                  <td colSpan="3">{copy.finalScore}</td>
                  <td className="total-score">{progressBarPercent}%</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="stat-card reveal grades-detail-panel">
            <h3 className="section-title"><i className="fas fa-info-circle text-blue"></i> {copy.gradeDetails}</h3>
            {dynamicDetailGroups.map((group, index) => (
              <div className="detail-group colorful-detail" key={group.title}>
                <div className="detail-header" onClick={() => setOpenGrade(openGrade === index ? null : index)}>
                  <span>{group.title}</span>
                  <span className="score-pill">{group.score} <i className={`fas fa-chevron-${openGrade === index ? 'up' : 'down'}`}></i></span>
                </div>
                {openGrade === index && (
                  <div className="detail-content">
                    {group.rows.map(([name, score]) => (
                      <div className="detail-item nested-item" key={`${name}-${score}`}><span>{name}</span><strong>{score}</strong></div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="learning-sections-grid">
          {learningSections.map((item) => (
            <div className="learning-section-card" key={item.title}>
              <div className="learning-icon"><i className={item.icon}></i></div>
              <h4>{item.title}</h4>
              <p>{item.text}</p>
              <span>{item.status}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default GradesView;
