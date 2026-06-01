import React, { useRef, useState } from 'react';

const resourceFolders = [
  {
    id: 'course',
    title: 'Учебные материалы курса',
    icon: 'fas fa-book-open',
    accent: 'blue',
    files: [
      { title: 'Полный учебник по сигнализации', type: 'pdf', url: '/ActualMaterial.pdf', meta: 'PDF, основной материал' },
      { title: 'Презентация курса', type: 'pdf', url: '/Presentation.pdf', meta: 'PDF, слайды' },
      { title: 'Карта модулей обучения', type: 'book', meta: 'Интерактивная книжка' },
      { title: 'План практических занятий', type: 'book', meta: 'Памятка слушателя' },
      { title: 'Чек-лист допуска к тесту', type: 'book', meta: 'Контроль готовности' },
    ],
  },
  {
    id: 'signals',
    title: 'Дополнительные материалы',
    icon: 'fas fa-traffic-light',
    accent: 'green',
    files: [
      { title: 'Назначение сигналов', type: 'book', meta: 'Теория и примеры' },
      { title: 'Входные светофоры', type: 'video', url: '/question1.mp4', meta: 'Видеоразбор' },
      { title: 'Красный сигнал', type: 'image', url: '/red.jpg', meta: 'Визуальная карточка' },
      { title: 'Желтый сигнал', type: 'image', url: '/yellow.jpg', meta: 'Визуальная карточка' },
      { title: 'Зеленый сигнал', type: 'image', url: '/green.jpg', meta: 'Визуальная карточка' },
    ],
  },
  {
    id: 'practice',
    title: 'Видео-разборы заданий',
    icon: 'fas fa-clipboard-check',
    accent: 'gold',
    files: [
      { title: 'Разбор типовых ошибок', type: 'book', meta: 'Методический лист' },
      { title: 'Тренажер ситуаций на пути', type: 'video', url: '/intro.mp4', meta: 'Автовоспроизведение' },
      { title: 'Шаблон самопроверки', type: 'book', meta: '5 шагов контроля' },
      { title: 'Финальная подготовка', type: 'book', meta: 'Краткая книжка' },
      { title: 'Регламент прохождения экзамена', type: 'book', meta: 'Инструкция' },
    ],
  },
];

const bookPages = [
  'Курс КТЖ построен как последовательная траектория: теория, визуальный пример, практика и короткая проверка понимания.',
  'В каждой теме важно фиксировать не только название сигнала, но и действие, которое обязан выполнить сотрудник.',
  'Перед тестом повторите цвета, положения светофоров, ручные сигналы и порядок действий при нестандартной ситуации.',
  'Практические материалы помогают быстрее перейти от чтения инструкции к уверенным решениям в реальных кейсах.',
];

function ResourcesView() {
  const [activeFolder, setActiveFolder] = useState(resourceFolders[0].id);
  const [activeFile, setActiveFile] = useState(resourceFolders[0].files[0]);
  const [page, setPage] = useState(0);
  const viewerRef = useRef(null);

  const folder = resourceFolders.find((item) => item.id === activeFolder) || resourceFolders[0];

  const openFile = (file) => {
    setActiveFile(file);
    setPage(0);
    setTimeout(() => viewerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
  };

  const openFolder = (folderId) => {
    const nextFolder = resourceFolders.find((item) => item.id === folderId);
    setActiveFolder(folderId);
    setActiveFile(nextFolder.files[0]);
    setPage(0);
  };

  const renderViewer = () => {
    if (activeFile.type === 'pdf') {
      return <iframe src={`${activeFile.url}#toolbar=0&navpanes=0`} title={activeFile.title} className="pdf-iframe-frame" />;
    }

    if (activeFile.type === 'video') {
      return <video src={activeFile.url} autoPlay muted loop playsInline className="resource-video-frame" />;
    }

    if (activeFile.type === 'image') {
      return <img src={activeFile.url} alt={activeFile.title} className="resource-image-frame" />;
    }

    return (
      <div className="book-reader">
        <div className="book-cover">
          <span>KTZ Academy</span>
          <h3>{activeFile.title}</h3>
        </div>
        <div className="book-page">
          <span className="page-number">Страница {page + 1} / {bookPages.length}</span>
          <p>{bookPages[page]}</p>
          <div className="book-controls">
            <button onClick={() => setPage((prev) => Math.max(prev - 1, 0))} disabled={page === 0}>
              <i className="fas fa-arrow-left"></i>
            </button>
            <button onClick={() => setPage((prev) => Math.min(prev + 1, bookPages.length - 1))} disabled={page === bookPages.length - 1}>
              <i className="fas fa-arrow-right"></i>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="content-area animate-fade-in">
      <section id="resources-view" className="view-section active">
        <div className="premium-hero-header resources-hero">
          <div className="hero-grid-bg"></div>
          <div className="hero-content">
            <span className="premium-badge"><i className="fas fa-folder-open"></i> Библиотека КТЖ</span>
            <h1 className="hero-main-title">Учебные ресурсы по папкам</h1>
            <p className="hero-subtitle">В каждой папке по 5 материалов. Файлы открываются внутри платформы: PDF, видео, карточки и интерактивная книжка.</p>
          </div>
        </div>

        <div className="resource-folder-grid">
          {resourceFolders.map((item) => (
            <button
              key={item.id}
              className={`folder-card ${item.accent} ${activeFolder === item.id ? 'active' : ''}`}
              onClick={() => openFolder(item.id)}
            >
              <i className={item.icon}></i>
              <span>{item.title}</span>
              <small>{item.files.length} файлов</small>
            </button>
          ))}
        </div>

        <div className="resource-library-layout">
          <div className="folder-file-list">
            <div className="folder-list-title">
              <i className={folder.icon}></i>
              <div>
                <h3>{folder.title}</h3>
                <p>Откройте материал из списка</p>
              </div>
            </div>
            {folder.files.map((file, index) => (
              <button
                key={file.title}
                className={`file-row ${activeFile.title === file.title ? 'active' : ''}`}
                onClick={() => openFile(file)}
              >
                <i className={`file-type-icon ${file.type === 'pdf' ? 'fas fa-file-pdf' : file.type === 'video' ? 'fas fa-film' : file.type === 'image' ? 'fas fa-image' : 'fas fa-book'}`}></i>
                <span className="file-index">{index + 1}</span>
                <span className="file-main">
                  <strong>{file.title}</strong>
                  <small>{file.meta}</small>
                </span>
              </button>
            ))}
          </div>

          <div className="premium-document-viewer resource-book-viewer" ref={viewerRef}>
            <div className="viewer-top-bar">
              <div className="viewer-title-area">
                <div className="viewer-indicator-dot"></div>
                <h3>{activeFile.title}</h3>
              </div>
              <span className="viewer-mode-pill">{activeFile.type.toUpperCase()}</span>
            </div>
            <div className="viewer-stage-area">{renderViewer()}</div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ResourcesView;
