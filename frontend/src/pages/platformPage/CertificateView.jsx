const certificateCopy = {
  ru: {
    badge: 'Сертификация',
    title: 'Сертификат KTZ Academy',
    subtitle: 'Завершайте разделы курса, чтобы открывать значки и официальный сертификат по Инструкции по сигнализации.',
    readiness: 'готовность',
    lockedTitle: 'Сертификат пока недоступен',
    unlockedTitle: 'Сертификат открыт',
    lockedText: 'Для получения официального сертификата KTZ Academy необходимо завершить все разделы курса. Текущий прогресс:',
    unlockedText: 'Все разделы курса завершены. Сертификат готов к выдаче и подтвержден данными учебного журнала.',
    badgesTitle: 'Значки разделов',
    badgesText: 'Значки открываются автоматически: урок засчитывается после теста на {passing}%, модуль завершается после всех своих уроков, а значок раздела открывается после завершения всех модулей раздела.',
    lessonWord: 'тем',
    lessonsCompleted: 'модулей завершено',
    badgeUnlocked: 'Значок открыт',
    completeMore: (count) => `Завершите еще ${count} модулей, чтобы открыть значок`,
    startSection: 'Начните раздел, чтобы открыть значок',
    progressStatus: 'В процессе',
    lockedStatus: 'Закрыто',
    earnedStatus: 'Открыто',
  },
  kz: {
    badge: 'Сертификаттау',
    title: 'KTZ Academy сертификаты',
    subtitle: 'Сигнал беру нұсқаулығы бойынша ресми сертификатты ашу үшін курс бөлімдерін аяқтаңыз.',
    readiness: 'дайындық',
    lockedTitle: 'Сертификат әзірге қолжетімсіз',
    unlockedTitle: 'Сертификат ашылды',
    lockedText: 'KTZ Academy ресми сертификатын алу үшін курстың барлық бөлімдерін аяқтау қажет. Ағымдағы прогресс:',
    unlockedText: 'Курстың барлық бөлімдері аяқталды. Сертификат оқу журналындағы деректермен расталды.',
    badgesTitle: 'Бөлім белгілері',
    badgesText: 'Белгілер автоматты түрде ашылады: сабақ тесті {passing}% болса есептеледі, модуль барлық сабағы аяқталғаннан кейін жабылады, ал бөлім белгісі барлық модуль аяқталғанда ашылады.',
    lessonWord: 'сабақ',
    lessonsCompleted: 'модуль аяқталды',
    badgeUnlocked: 'Белгі ашылды',
    completeMore: (count) => `Белгіні ашу үшін тағы ${count} модуль аяқтаңыз`,
    startSection: 'Белгіні ашу үшін бөлімді бастаңыз',
    progressStatus: 'Орындалуда',
    lockedStatus: 'Жабық',
    earnedStatus: 'Ашылды',
  },
  en: {
    badge: 'Certification',
    title: 'KTZ Academy Certificate',
    subtitle: 'Complete course sections to unlock badges and the official certificate for the Signaling Instruction.',
    readiness: 'readiness',
    lockedTitle: 'Certificate is not available yet',
    unlockedTitle: 'Certificate unlocked',
    lockedText: 'To receive the official KTZ Academy certificate, all course sections must be completed. Current progress:',
    unlockedText: 'All course sections are complete. The certificate is ready and backed by the learning journal data.',
    badgesTitle: 'Section badges',
    badgesText: 'Badges unlock automatically: a lesson counts after a {passing}% test result, a module completes after all its lessons, and a section badge opens after all modules in that section are completed.',
    lessonWord: 'lessons',
    lessonsCompleted: 'modules completed',
    badgeUnlocked: 'Badge unlocked',
    completeMore: (count) => `Complete ${count} more module${count === 1 ? '' : 's'} to unlock`,
    startSection: 'Start this section to unlock the badge',
    progressStatus: 'In progress',
    lockedStatus: 'Locked',
    earnedStatus: 'Unlocked',
  },
};

const fallbackCertificates = [
  { id: 1, title: 'Section 1: General Provisions', icon: 'fas fa-flag', completed: false, completedLessons: 0, totalLessons: 2, progressPercent: 0 },
  { id: 2, title: 'Section 2: Traffic Lights', icon: 'fas fa-traffic-light', completed: false, completedLessons: 0, totalLessons: 9, progressPercent: 0 },
  { id: 3, title: 'Section 3: Protection Signals', icon: 'fas fa-exclamation-triangle', completed: false, completedLessons: 0, totalLessons: 5, progressPercent: 0 },
  { id: 4, title: 'Section 4: Hand Signals', icon: 'fas fa-hand-paper', completed: false, completedLessons: 0, totalLessons: 2, progressPercent: 0 },
  { id: 5, title: 'Section 5: Signal Indicators and Signs', icon: 'fas fa-map-signs', completed: false, completedLessons: 0, totalLessons: 4, progressPercent: 0 },
  { id: 6, title: 'Section 6: Sound Signals', icon: 'fas fa-bullhorn', completed: false, completedLessons: 0, totalLessons: 2, progressPercent: 0 },
  { id: 7, title: 'Section 7: Signal Devices', icon: 'fas fa-clipboard-list', completed: false, completedLessons: 0, totalLessons: 2, progressPercent: 0 },
];

function CertificateView({ data, lang = 'ru' }) {
  const copy = certificateCopy[lang] || certificateCopy.ru;
  const modules = data?.learning?.certificates?.length ? data.learning.certificates : fallbackCertificates;
  const stats = data?.learning?.stats || {};
  const completedCount = modules.filter((module) => module.completed).length;
  const progressPercent = stats.overallProgressPercent ?? Math.round((completedCount / modules.length) * 100);
  const passingScore = stats.passingScorePercent ?? 60;
  const isCertificateReady = modules.length > 0 && completedCount === modules.length;
  const badgesText = copy.badgesText.replace('{passing}', passingScore);

  return (
    <div className="content-area animate-fade-in">
      <section id="certificate-view" className="view-section active">
        <div className="certificate-title-card">
          <div>
            <span className="premium-badge"><i className="fas fa-certificate"></i> {copy.badge}</span>
            <h1>{copy.title}</h1>
            <p>{copy.subtitle}</p>
          </div>
          <div className="certificate-title-progress">
            <strong>{progressPercent}%</strong>
            <span>{copy.readiness}</span>
          </div>
        </div>

        <div className={`certificate-banner stat-card reveal ${isCertificateReady ? 'earned' : 'locked'}`}>
          <div className="cert-banner-icon">
            <i className={`fas fa-${isCertificateReady ? 'unlock-alt' : 'lock'}`}></i>
          </div>
          <div className="cert-banner-text">
            <h2>{isCertificateReady ? copy.unlockedTitle : copy.lockedTitle}</h2>
            <p className="text-muted">
              {isCertificateReady ? copy.unlockedText : copy.lockedText}{' '}
              {!isCertificateReady && <strong>{progressPercent}%</strong>}
            </p>
          </div>
        </div>

        <div className="badges-section mt-20 reveal">
          <h2 className="section-title">{copy.badgesTitle}</h2>
          <p className="text-muted certificate-unlock-rule">
            <i className="fas fa-info-circle"></i> {badgesText}
          </p>

          <div className="badges-list">
            {modules.map((mod) => {
              const completedLessons = mod.completedModules ?? mod.completedLessons ?? 0;
              const totalLessons = mod.totalModules ?? mod.totalLessons ?? 0;
              const rowProgress = mod.progressPercent ?? 0;
              const remainingLessons = Math.max(totalLessons - completedLessons, 0);
              const state = mod.completed ? 'earned' : rowProgress > 0 ? 'in-progress' : 'locked';
              const statusLabel = state === 'earned' ? copy.earnedStatus : state === 'in-progress' ? copy.progressStatus : copy.lockedStatus;
              const statusText = state === 'earned'
                ? copy.badgeUnlocked
                : state === 'in-progress'
                  ? copy.completeMore(remainingLessons)
                  : copy.startSection;

              return (
                <div key={mod.id} className={`badge-row-card ${state}`}>
                  <div className="badge-visual">
                    <div className="circle-badge">
                      <i className={mod.icon}></i>
                    </div>
                  </div>
                  <div className="badge-info">
                    <div className="badge-row-heading">
                      <h4>{mod.title}</h4>
                      <span className={`badge-state-label ${state}`}>{statusLabel}</span>
                    </div>
                    <p>{statusText}</p>
                    <div className="certificate-progress-track" aria-hidden="true">
                      <span style={{ width: `${Math.min(Math.max(rowProgress, 0), 100)}%` }}></span>
                    </div>
                    <span className={`certificate-progress-pill ${state}`}>
                      <span>{completedLessons}</span>
                      <span>/</span>
                      <span>{totalLessons}</span>
                      <span>{copy.lessonsCompleted}</span>
                      <strong>{rowProgress}%</strong>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

export default CertificateView;
