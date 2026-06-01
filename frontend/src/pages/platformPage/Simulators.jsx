import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { apiFetch } from '../../api';

const SIMULATOR_KEYS = {
  sound: 'sound-fire-alarm',
  hand: 'hand-signal-shunting',
};

const Simulators = ({ data, onDataRefresh }) => {
  const [currentView, setCurrentView] = useState('menu');
  const serverSimulatorKeys = data?.learning?.activityProgress?.simulators?.completedKeys || [];
  const serverSimulatorKeyString = serverSimulatorKeys.join('|');
  const [completedSimulators, setCompletedSimulators] = useState(() => new Set(serverSimulatorKeys.map(String)));

  useEffect(() => {
    setCompletedSimulators(new Set(serverSimulatorKeys.map(String)));
  }, [serverSimulatorKeyString]);

  const completedSimulatorCount = completedSimulators.size;
  const completedSimulatorText = useMemo(
    () => `${completedSimulatorCount}/${Object.keys(SIMULATOR_KEYS).length}`,
    [completedSimulatorCount]
  );

  // --- TASK 4 (Sound) STATE ---
  const [timeline4, setTimeline4] = useState([]);
  const [statusMsg4, setStatusMsg4] = useState('');
  const [isSuccess4, setIsSuccess4] = useState(false);
  const [isError4, setIsError4] = useState(false);
  const expectedPattern4 = ['long', 'short', 'short'];

  // --- TASK 5 (Hand Signals) STATE ---
  const [step5, setStep5] = useState(1); // 1 - move back, 2 - stop
  const [isMoving, setIsMoving] = useState(false);
  const [isSuccess5, setIsSuccess5] = useState(false);
  const [statusMsg5, setStatusMsg5] = useState('');
  const [isError5, setIsError5] = useState(false);

  const resetAll = () => {
    setTimeline4([]); setStatusMsg4(''); setIsSuccess4(false); setIsError4(false);
    setStep5(1); setIsMoving(false); setIsSuccess5(false); setStatusMsg5(''); setIsError5(false);
  };

  const handleGoBack = () => {
    resetAll();
    setCurrentView('menu');
  };

  const markSimulatorCompleted = (activityKey) => {
    const wasCompleted = completedSimulators.has(activityKey);

    setCompletedSimulators((current) => new Set([...current, activityKey]));

    if (wasCompleted) {
      onDataRefresh?.();
      return;
    }

    apiFetch('/api/activity-progress/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        activity_type: 'simulator',
        activity_key: activityKey,
        is_completed: true,
      }),
    })
      .then((response) => {
        if (!response.ok) throw new Error(`Simulator progress failed with ${response.status}`);
        return response.json();
      })
      .then(() => onDataRefresh?.())
      .catch((error) => console.error('Simulator progress save failed:', error));
  };

  // --- TASK 4 LOGIC ---
  const handleDragStart4 = (e, type) => e.dataTransfer.setData('soundType', type);
  const handleDrop4 = (e) => {
    e.preventDefault();
    const soundType = e.dataTransfer.getData('soundType');
    if (soundType && timeline4.length < 3) {
      const newTimeline = [...timeline4, soundType];
      setTimeline4(newTimeline);
      const isCorrect = newTimeline.every((val, i) => val === expectedPattern4[i]);
      
      if (!isCorrect) {
        setIsError4(true);
        setIsSuccess4(false);
        setStatusMsg4('Ошибка! Нарушена нормативная последовательность сигналов.');
      } else if (newTimeline.length === 3) {
        setIsSuccess4(true);
        setIsError4(false);
        setStatusMsg4('Успешно. Сигнал "Пожарная тревога" передан корректно.');
        markSimulatorCompleted(SIMULATOR_KEYS.sound);
      }
    }
  };

  // --- TASK 5 LOGIC ---
  const handleDragStart5 = (e, type) => e.dataTransfer.setData('actionType', type);
  
  const handleDrop5 = (e) => {
    e.preventDefault();
    const action = e.dataTransfer.getData('actionType');

    if (step5 === 1) {
      if (action === 'move_back') {
        setIsMoving(true); 
        setStep5(2);      
        setIsError5(false);
        setStatusMsg5('Верно. Локомотив начал движение назад. Подготовьтесь к экстренной остановке.');
      } else {
        setIsError5(true);
        setStatusMsg5('Ошибка. Для движения назад требуется сигнал опущенной рукой с желтым флагом.');
      }
    } else if (step5 === 2) {
      if (action === 'stop') {
        setIsMoving(false); 
        setIsSuccess5(true);
        setIsError5(false);
        setStatusMsg5('Успешно. Сигнал "Стой" передан, локомотив остановлен.');
        markSimulatorCompleted(SIMULATOR_KEYS.hand);
      } else {
        setIsError5(true);
        setStatusMsg5('Ошибка. Для экстренной остановки необходим круговой сигнал красным флагом.');
      }
    }
  };

  // --- RENDER MENU ---
  if (currentView === 'menu') {
    return (
      <div className="content-area animate-fade-in">
        <section className="view-section active">
          
          {/* PROFESSIONAL HERO BANNER */}
          <div className="premium-hero-header simulator-hero">
            <div className="hero-grid-bg"></div>
            <div className="hero-content">
              <span className="premium-badge"><i className="fas fa-vr-cardboard"></i> Виртуальный полигон</span>
              <h1 className="hero-main-title">Тренажерные комплексы KTZ</h1>
              <p className="hero-subtitle">Отработка практических навыков сигнализации в безопасной виртуальной среде. Выберите симулятор для начала тренировки.</p>
            </div>
          </div>
          
          <div className="task-selection-grid">
            {/* TASK 4 CARD */}
            <div className={`task-intro-card task-card-audio ${completedSimulators.has(SIMULATOR_KEYS.sound) ? 'sim-completed' : ''}`}>
              <div className="task-card-body">
                <div className="task-icon-wrapper"><i className="fas fa-volume-up"></i></div>
                <h3 className="task-card-title">Ситуционная задача 1: Звуковая сигнализация</h3>
                <p className="task-card-description">
                  Формирование навыков экстренного оповещения. Отработка нормативных звуковых комбинаций при обнаружении аварийных ситуаций (пожар, разрыв состава).
                </p>
              </div>
              <button className="start-task-btn" onClick={() => setCurrentView('task4')}>
                Перейти к симулятору <i className="fas fa-arrow-right" style={{marginLeft: '8px'}}></i>
              </button>
            </div>
            
            {/* TASK 5 CARD */}
            <div className={`task-intro-card task-card-signals ${completedSimulators.has(SIMULATOR_KEYS.hand) ? 'sim-completed' : ''}`}>
              <div className="task-card-body">
                <div className="task-icon-wrapper"><i className="fas fa-flag"></i></div>
                <h3 className="task-card-title">Ситуционная задача 2: Ручные сигналы</h3>
                <p className="task-card-description">
                  Управление маневровыми передвижениями. Практика применения визуальных жестов составителя поездов для контроля локомотива в дневное время.
                </p>
              </div>
              <button className="start-task-btn" onClick={() => setCurrentView('task5')}>
                Перейти к симулятору <i className="fas fa-arrow-right" style={{marginLeft: '8px'}}></i>
              </button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // --- RENDER TASK 4 ---
  if (currentView === 'task4') {
    return (
      <div className="content-area animate-fade-in">
        <div className="navigation-bar">
          <button className="back-btn" onClick={handleGoBack}>
            <i className="fas fa-arrow-left" style={{ marginRight: '8px' }}></i> К списку тренажеров
          </button>
        </div>
        <div className="task-reference-panel">
          <h4>Ситуация 1: Подача звукового сигнала пожарной тревоги</h4>
          <p className="scenario-text"><strong>Вводная:</strong> В хвостовом вагоне обнаружено возгорание. Сформируйте нормативный сигнал: 1 длинный и 2 коротких гудка.</p>
        </div>
        
        <div className="task-header">
          <h3>Акустическая панель управления</h3>
          <button className="reset-btn" onClick={() => { setTimeline4([]); setStatusMsg4(''); setIsSuccess4(false); setIsError4(false); }}>
            <i className="fas fa-undo"></i> Сбросить алгоритм
          </button>
        </div>
        
        <div className="simulator-workspace">
          <div className="sound-palette">
            <h4>Доступные сигналы:</h4>
            <div className="sound-block long-sound" draggable onDragStart={(e) => handleDragStart4(e, 'long')}>Длинный ( — )</div>
            <div className="sound-block short-sound" draggable onDragStart={(e) => handleDragStart4(e, 'short')}>Короткий ( • )</div>
          </div>
          
          <div className="timeline-container">
            <div className="drop-zone" onDrop={handleDrop4} onDragOver={(e) => e.preventDefault()}>
              {timeline4.length === 0 ? (
                <span className="placeholder-text">Перенесите элементы сигналов в эту зону для формирования кода</span>
              ) : (
                timeline4.map((t, i) => <div key={i} className={`sound-item ${t}-item`}>{t === 'long' ? '——' : '•'}</div>)
              )}
            </div>
            
            <div className="audio-wave-anim">
              <div className="audio-bar"></div><div className="audio-bar"></div><div className="audio-bar"></div>
              <div className="audio-bar"></div><div className="audio-bar"></div><div className="audio-bar"></div>
              <div className="audio-bar"></div>
            </div>
          </div>
        </div>

        <div className="action-footer-panel">
          {isSuccess4 && <button className="next-scenario-btn" onClick={() => setCurrentView('task5')}>Situation 2 <i className="fas fa-arrow-right"></i></button>}
        </div>

        {statusMsg4 && createPortal(
          <div className="modal-overlay">
            <div className={`center-feedback-popup ${isSuccess4 ? 'modal-success' : 'modal-error'}`}>
              <div className="modal-content">
                <div className="modal-icon-wrapper">
                  {isSuccess4 ? <i className="fas fa-check-circle"></i> : <i className="fas fa-exclamation-triangle"></i>}
                </div>
                <h3 className="modal-headline">Результат операции</h3>
                <p className="modal-text">{statusMsg4}</p>
                <button className="modal-close-btn" onClick={() => setStatusMsg4('')}>Закрыть окно</button>
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
    );
  }

  // --- RENDER TASK 5 ---
  if (currentView === 'task5') {
    return (
      <div className="simulators-view animate-fade-in">
        <div className="navigation-bar">
          <button className="back-btn" onClick={handleGoBack}>← Вернуться к выбору</button>
        </div>
        <div className="task-reference-panel">
          <h4>Ситуация 2: Ручные сигналы составителя поездов</h4>
          <p className="scenario-text"><strong>Сценарий:</strong> Дневные маневры. Дайте команду локомотиву на движение "Назад", затем своевременно скомандуйте "Стой".</p>
          <p className="instruction-text"><strong>Задача:</strong> Зажмите и перетащите нужную анимацию сигнала на фигурку путевого составителя.</p>
        </div>
        
        <div className="task-header">
          <h3>Маневровый участок</h3>
          <button className="reset-btn" onClick={() => { setStep5(1); setIsMoving(false); setIsSuccess5(false); setStatusMsg5(''); setIsError5(false); }}>Сбросить позицию</button>
        </div>

        <div className="simulator-workspace-v2">
          <div className="signals-palette-v2">
            
            {/* SIGNAL 1 - Move Back */}
            <div className="signal-drag-item" draggable onDragStart={(e) => handleDragStart5(e, 'move_back')}>
              <div className="hand-preview-container">
                <div className="shoulder-1">
                  <svg width="400" height="400" viewBox="-200 -50 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', top: '-25px', left: '-120px', overflow: 'visible' }}>
                    <path d="M 0 0 Q 15 65 5 130" className="skin-stroke" strokeWidth="26" stroke="#EDC9AF" />
                    <path d="M -10 160 L 70 120" stroke="#8B4513" strokeWidth="6" strokeLinecap="round"/>
                    <path fill="#FFDD00" stroke="#E5C100" strokeWidth="2">
                      <animate attributeName="d" dur="0.6s" repeatCount="indefinite" 
                               values="M 30 140 L 70 120 L 90 160 L 50 180 Z; M 30 140 L 70 120 L 85 165 L 55 175 Z; M 30 140 L 70 120 L 90 160 L 50 180 Z" />
                    </path>
                    <circle cx="5" cy="140" r="16" fill="#EDC9AF" />
                    <path className="finger-details" stroke="#8B4513" strokeWidth="1" d="M 0 132 L 12 136 M -2 140 L 10 144 M -4 148 L 8 152 M -2 155 L 6 158" />
                  </svg>
                </div>
              </div>
              <span>Движение назад (Желтый)</span>
            </div>

            {/* SIGNAL 2 - Stop */}
            <div className="signal-drag-item" draggable onDragStart={(e) => handleDragStart5(e, 'stop')}>
              <div className="hand-preview-container">
                <div className="shoulder-2">
                  <svg width="500" height="500" viewBox="-250 -250 500 500" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', top: '-185px', left: '-190px', overflow: 'visible' }}>
                    <path d="M 0 0 Q 50 15 105 0" className="skin-stroke" strokeWidth="26" stroke="#EDC9AF" />
                    <path d="M 95 15 L 165 -45" stroke="#8B4513" strokeWidth="6" strokeLinecap="round"/>
                    <path fill="#FF0000" stroke="#D00000" strokeWidth="2">
                      <animate attributeName="d" dur="0.6s" repeatCount="indefinite" 
                               values="M 123 -9 L 165 -45 L 201 -3 L 159 33 Z; M 123 -9 L 165 -45 L 195 -8 L 165 30 Z; M 123 -9 L 165 -45 L 201 -3 L 159 33 Z" />
                    </path>
                    <circle cx="110" cy="-2" r="16" fill="#EDC9AF" />
                    <path className="finger-details" stroke="#8B4513" strokeWidth="1" d="M 103 -10 L 115 -1 M 108 -14 L 120 -5 M 113 -18 L 125 -9" />
                  </svg>
                </div>
              </div>
              <span>Сигнал «Стой!» (Красный)</span>
            </div>

            {/* SIGNAL 3 - Move Forward */}
            <div className="signal-drag-item" draggable onDragStart={(e) => handleDragStart5(e, 'move_forward')}>
              <div className="hand-preview-container">
                <div className="shoulder-3">
                  <svg width="400" height="400" viewBox="-200 -250 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', top: '-250px', left: '-200px', overflow: 'visible' }}>
                    <path d="M 0 120 Q -15 50 0 -20" className="skin-stroke" strokeWidth="26" stroke="#EDC9AF" />
                    <path d="M 0 -20 L 60 -80" stroke="#8B4513" strokeWidth="6" strokeLinecap="round"/>
                    <path fill="#00A859" stroke="#008443" strokeWidth="2">
                      <animate attributeName="d" dur="0.6s" repeatCount="indefinite" 
                               values="M 15 -35 L 60 -80 L 105 -35 L 60 10 Z; M 15 -35 L 60 -80 L 100 -40 L 65 5 Z; M 15 -35 L 60 -80 L 105 -35 L 60 10 Z" />
                    </path>
                    <circle cx="0" cy="-20" r="16" fill="#EDC9AF" />
                    <path className="finger-details" stroke="#8B4513" strokeWidth="1" d="M -8 -25 L 4 -20 M -10 -21 L 2 -16 M -10 -16 L 2 -11 M -8 -12 L 4 -7" />
                  </svg>
                </div>
              </div>
              <span>Путь свободен (Зеленый)</span>
            </div>
          </div>

          <div className="railway-scene-v2">
            <div className={`locomotive-v2 ${step5 >= 2 ? 'moving-back-anim' : ''}`}>
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="130 90 530 160" preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: 'auto', display: 'block' }}>
                 <defs>
                   <clipPath id="train-body-clip">
                     <path d="M 170 115 L 570 115 C 590 115, 610 130, 630 170 C 645 200, 640 220, 620 220 L 170 220 C 160 220, 155 215, 155 205 L 155 125 C 155 118, 160 115, 170 115 Z" />
                   </clipPath>
                 </defs>
                 <path d="M 170 115 L 570 115 C 590 115, 610 130, 630 170 C 645 200, 640 220, 620 220 L 170 220 C 160 220, 155 215, 155 205 L 155 125 C 155 118, 160 115, 170 115 Z" fill="#004d99" />
                 <g clipPath="url(#train-body-clip)">
                   <rect x="220" y="115" width="60" height="105" fill="#0b6fcf" />
                   <rect x="450" y="115" width="60" height="105" fill="#0b6fcf" />
                   <rect x="140" y="172" width="520" height="8" fill="#ffcc00" />
                   <rect x="140" y="188" width="520" height="8" fill="#ffcc00" />
                 </g>
                 <rect x="149" y="140" width="6" height="50" rx="3" fill="#566270" />
                 <g fill="#566270">
                   <rect x="175" y="130" width="35" height="30" rx="6" />
                   <rect x="230" y="125" width="16" height="38" rx="4" />
                   <rect x="254" y="125" width="16" height="38" rx="4" />
                   <rect x="290" y="130" width="70" height="30" rx="6" />
                   <rect x="370" y="130" width="70" height="30" rx="6" />
                   <rect x="460" y="125" width="16" height="38" rx="4" />
                   <rect x="484" y="125" width="16" height="38" rx="4" />
                   <rect x="531" y="130" width="57" height="30" rx="6" />
                 </g>
                 <g className={isMoving ? 'spin' : ''} style={{ transformOrigin: '220px 232px' }}>
                   <circle cx="220" cy="232" r="14" fill="#1e293b" />
                   <line x1="220" y1="218" x2="220" y2="246" stroke="#fff" strokeWidth="2" />
                 </g>
                 <g className={isMoving ? 'spin' : ''} style={{ transformOrigin: '270px 232px' }}>
                   <circle cx="270" cy="232" r="14" fill="#1e293b" />
                   <line x1="270" y1="218" x2="270" y2="246" stroke="#fff" strokeWidth="2" />
                 </g>
                 <g className={isMoving ? 'spin' : ''} style={{ transformOrigin: '470px 232px' }}>
                   <circle cx="470" cy="232" r="14" fill="#1e293b" />
                   <line x1="470" y1="218" x2="470" y2="246" stroke="#fff" strokeWidth="2" />
                 </g>
                 <g className={isMoving ? 'spin' : ''} style={{ transformOrigin: '520px 232px' }}>
                   <circle cx="520" cy="232" r="14" fill="#1e293b" />
                   <line x1="520" y1="218" x2="520" y2="246" stroke="#fff" strokeWidth="2" />
                 </g>
               </svg>
            </div>

            <div className="shunter-drop-target" onDrop={handleDrop5} onDragOver={(e) => e.preventDefault()}>
               <div style={{ position: 'relative', width: '200px', height: '320px', transform: 'scale(0.38)', transformOrigin: 'center center', marginBottom: '-75px', marginTop: '-70px' }}>
                 <div style={{ position: 'absolute', top: '25px', left: '50%', transform: 'translateX(-50%)', zIndex: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                   <div style={{ width: '108px', height: '35px', backgroundColor: '#2b6cb0', borderRadius: '18px 18px 4px 4px', position: 'relative', overflow: 'hidden' }}>
                     <div style={{ position: 'absolute', bottom: '4px', left: '50%', transform: 'translateX(-50%)', width: '18px', height: '22px', backgroundColor: '#facc15', borderRadius: '2px 2px 6px 6px', clipPath: 'polygon(0 0, 100% 0, 100% 60%, 50% 100%, 0% 60%)' }}></div>
                   </div>
                   <div style={{ width: '94px', height: '9px', backgroundColor: '#ef4444', borderRadius: '2px', marginTop: '1px' }}></div>
                   <div style={{ width: '106px', height: '10px', backgroundColor: '#1e3a8a', borderRadius: '0 0 12px 12px' }}></div>
                 </div>
                 <div style={{ position: 'absolute', top: '50px', left: '50%', transform: 'translateX(-50%)', width: '84px', height: '84px', backgroundColor: '#ffcd94', borderRadius: '50%', zIndex: 3 }}></div>
                 <div style={{ position: 'absolute', top: '122px', left: '50%', transform: 'translateX(-50%)', width: '136px', height: '150px', backgroundColor: '#2b6cb0', borderRadius: '45px 45px 16px 16px', zIndex: 1, overflow: 'hidden' }}>
                   <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '100px', height: '112px', backgroundColor: '#7dd3fc', borderRadius: '12px 12px 16px 16px', overflow: 'hidden' }}>
                     <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '52px', height: '34px', backgroundColor: '#1e3a8a', clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }}>
                       <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '22px', height: '15px', backgroundColor: '#7dd3fc', clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }}></div>
                     </div>
                     <div style={{ position: 'absolute', top: '22px', left: '50%', transform: 'translateX(-50%)', width: '11px', height: '52px', backgroundColor: '#334155', borderRadius: '2px', clipPath: 'polygon(15% 0, 85% 0, 100% 85%, 50% 100%, 0% 85%)' }}></div>
                     <div style={{ position: 'absolute', bottom: '36px', width: '22px', height: '8px', backgroundColor: '#1e3a8a', borderRadius: '4px', left: '12px' }}></div>
                     <div style={{ position: 'absolute', bottom: '36px', width: '22px', height: '8px', backgroundColor: '#1e3a8a', borderRadius: '4px', right: '12px' }}></div>
                     <div style={{ position: 'absolute', bottom: '12px', width: '100%', height: '10px', backgroundColor: '#1e3a8a', borderRadius: '2px' }}></div>
                   </div>
                 </div>
               </div>
               
            </div>
            <div className="rail-tracks"></div>
          </div>
        </div>


        {/* Modal Overlay explicitly styled to cover everything securely */}
        {statusMsg5 && createPortal(
          <div className="modal-overlay">
            <div className={`center-feedback-popup ${isError5 ? 'modal-error' : 'modal-success'}`}>
              <div className="modal-content">
                <div className="modal-icon-wrapper">
                  {isError5 ? <i className="fas fa-exclamation-triangle"></i> : <i className="fas fa-check-circle"></i>}
                </div>
                <h3 className="modal-headline">Анализ действий</h3>
                <p className="modal-text">{statusMsg5}</p>
                <button className="modal-close-btn" onClick={() => setStatusMsg5('')}>
                  {isError5 ? 'Попробовать снова' : 'Продолжить'}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

        <div className="action-footer-panel">
          {isSuccess5 && <button className="next-scenario-btn" onClick={handleGoBack}>Завершить сценарий <i className="fas fa-check"></i></button>}
        </div>
      </div>
    );
  }
};

export default Simulators;
