import React, { useState } from 'react';

function Curriculum({ t }) {
  const [openIndex, setOpenIndex] = useState(null);

  if (!t) {
    return <section id="curriculum" className="container">Loading...</section>;
  }

  const getItems = (id, fallbackItems) => (
    t[`mod_${id}_items`] || [
      t[`mod_${id}_item_1`] || fallbackItems[0],
      t[`mod_${id}_item_2`] || fallbackItems[1],
      t[`mod_${id}_item_3`] || fallbackItems[2]
    ]
  );

  const modules = [
    { id: 1, title: t.mod_1 || "Раздел 1: Общее положение", items: getItems(1, ["§ 1. Введение", "§ 2. Сигналы", "§ 3. Видимые сигналы"]) },
    { id: 2, title: t.mod_2 || "Раздел 2: Светофоры", items: getItems(2, ["§ 1. Виды светофоров", "§ 2. Входные светофоры", "§ 3. Пригласительный сигнал"]) },
    { id: 3, title: t.mod_3 || "Раздел 3: Сигналы ограждения", items: getItems(3, ["§ 1. Постоянные диски уменьшения скорости", "§ 2. Переносные сигналы", "§ 3. Ограждение мест препятствий"]) },
    { id: 4, title: t.mod_4 || "Раздел 4: Ручные сигналы", items: getItems(4, ["§ 1. Требования к ручным сигналам", "§ 2. Виды подачи ручных сигналов"]) },
    { id: 5, title: t.mod_5 || "Раздел 5: Сигнальные указатели и знаки", items: getItems(5, ["§ 1. Маршрутные указатели", "§ 2. Указатели устройств сбрасывания", "§ 3. Постоянные сигнальные знаки"]) },
    { id: 6, title: t.mod_6 || "Раздел 6: Звуковые сигналы", items: getItems(6, ["§ 1. Виды звуковых сигналов", "§ 2. Сигналы тревоги и специальные указатели"]) },
    { id: 7, title: t.mod_7 || "Раздел 7: Условия выдачи, учета и хранения сигнальных приборов", items: getItems(7, ["§ 1. Выдача сигнальных приборов", "§ 2. Учет и хранение сигнальных приборов"]) }
  ];

  return (
    <section id="curriculum" className="container curriculum-section">
      <div className="curriculum-flex-container">
        
        {/* Left Side: Title + Accordion Container */}
        <div className="accordion-wrapper">
          <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '20px' }}>
            {t.curriculum_title || "План курса"}
          </h2>
          
          <div className="accordion-container">
            {modules.map((m) => (
              <div key={m.id} className="accordion-item">
                <div className="accordion-header" onClick={() => setOpenIndex(openIndex === m.id ? null : m.id)}>
                  <span>{m.title}</span> 
                  <i className={`fas fa-chevron-${openIndex === m.id ? 'up' : 'down'}`}></i>
                </div>
                {openIndex === m.id && (
                  <div className="accordion-content" style={{ display: 'block' }}>
                    <ul>{m.items.map((item, i) => <li key={i}>{item}</li>)}</ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Image + Informational Text Box */}
        <div className="curriculum-info-box">
          <video src="/slideshow3.mp4" autoPlay muted loop playsInline className="info-box-image homepage-autoplay-video" />
          
          <h3>{t.curriculum_method_title || "О методологии курса"}</h3>
          <p>
            {t.curriculum_method_text || "Программа обучения разработана с учетом современных требований и направлена на глубокое понимание нормативной базы. Особое внимание уделяется детальному разбору Инструкции № 209, что позволяет эффективно переводить строгие статические регламенты в плоскость динамичных оперативных задач."}
          </p>
          <div className="info-box-highlight">
            <i className="fas fa-bullseye"></i>
            <span>{t.curriculum_method_goal || "Наша цель — формирование устойчивых навыков для безопасной и бесперебойной работы."}</span>
          </div>
        </div>
        
      </div>
    </section>
  );
}

export default Curriculum;
