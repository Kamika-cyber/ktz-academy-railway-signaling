import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch, buildUrl } from '../../api';

const getMediaSrc = (value) => {
    if (!value) return '';

    if (/^(https?:|data:|blob:)/i.test(value)) {
        return value;
    }

    if (value.startsWith('/media/')) {
        return buildUrl(value);
    }

    return encodeURI(value.startsWith('/') ? value : `/${value}`);
};

function ProgramView({ data, lang, onDataRefresh }) {
    const navigate = useNavigate();
    // --- State Management ---
    const [fallbackCourseData, setFallbackCourseData] = useState({});
    const [activeLessonId, setActiveLessonId] = useState(null);
    const [currentStep, setCurrentStep] = useState(1); // 1=Theory, 2=Video, 3=Quiz, 4=Results
    
    // Quiz State
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [scorePoints, setScorePoints] = useState(0);
    const [isAnswered, setIsAnswered] = useState(false);
    const [selectedOptionIndex, setSelectedOptionIndex] = useState(null);
    const [selectedAnswers, setSelectedAnswers] = useState([]);
    const [submittedResult, setSubmittedResult] = useState(null);
    const [isSubmittingResult, setIsSubmittingResult] = useState(false);

    // Dynamic Module Expansion tracking
    const [expandedModule, setExpandedModule] = useState(null);
    const hasApiData = (
        (
            (Array.isArray(data?.sections) && data.sections.length > 0)
            || (Array.isArray(data?.modules) && data.modules.length > 0)
        )
        && data?.lessons
        && Object.keys(data.lessons).length > 0
    );
    const courseData = hasApiData ? data.lessons : fallbackCourseData;
    const learningStats = data?.learning?.stats || {};
    const progressState = data?.learning?.progress || {};
    const completedLessonIds = new Set(progressState.completedLessonIds || []);
    const attemptedLessonIds = new Set(progressState.attemptedLessonIds || []);
    const completedModuleIds = new Set(progressState.completedModuleIds || []);
    const attemptedModuleIds = new Set(progressState.attemptedModuleIds || []);

    // Structure Definition for 7 Modules with their specific keys from JSON
    const modulesConfig = [
        {
            id: 1,
            title: "Раздел 1: Общие положения и классификация сигналов",
            icon: "fas fa-book-open",
            meta: "3 темы • Основные регламенты ИСИ",
            lessons: [
                { id: "m1l1", label: "1. Назначение и классификация сигналов" },
                { id: "m1l2", label: "2. Видимость сигналов и требования к установке" },
                { id: "m1l3", label: "3. Основные сигнальные цвета и их восприятие" }
            ]
        },
        {
            id: 2,
            title: "Раздел 2: Светофоры (входные, выходные и маршрутные)",
            icon: "fas fa-traffic-light",
            meta: "4 темы • Светофорная сигнализация СЦБ",
            lessons: [
                { id: "m2l1", label: "1. Входные светофоры" },
                { id: "m2l2", label: "2. Выходные и маршрутные светофоры" },
                { id: "m2l3", label: "3. Проходные светофоры автоблокировки" },
                { id: "m2l4", label: "4. Маневровые и горочные светофоры" }
            ]
        },
        {
            id: 3,
            title: "Раздел 3: Светофоры специального назначения",
            icon: "fas fa-exclamation-triangle",
            meta: "3 темы • Заградительные и повторительные щиты",
            lessons: [
                { id: "m3l1", label: "1. Предупредительные светофоры" },
                { id: "m3l2", label: "2. Заградительные светофоры" },
                { id: "m3l3", label: "3. Повторительные светофоры" }
            ]
        },
        {
            id: 4,
            title: "Раздел 4: Ручные и переносные сигналы",
            icon: "fas fa-flag",
            meta: "3 темы • Ограждение мест путевых работ",
            lessons: [
                { id: "m4l1", label: "1. Переносные сигналы остановки" },
                { id: "m4l2", label: "2. Ограждение мест производства работ" },
                { id: "m4l3", label: "3. Ручные сигналы проводников и составителей" }
            ]
        },
        {
            id: 5,
            title: "Раздел 5: Сигнальные знаки и указатели",
            icon: "fas fa-map-signs",
            meta: "3 темы • Путевые, постоянные и снегоочистительные знаки",
            lessons: [
                { id: "m5l1", label: "1. Маршрутные и стрелочные указатели" },
                { id: "m5l2", label: "2. Путевые сигнальные знаки постоянного типа" },
                { id: "m5l3", label: "3. Временные сигнальные знаки (Снегоочистители)" }
            ]
        },
        {
            id: 6,
            title: "Раздел 6: Звуковые сигналы и сигналы тревоги",
            icon: "fas fa-volume-up",
            meta: "3 темы • Акустический регламент локомотивов",
            lessons: [
                { id: "m6l1", label: "1. Звуковые сигналы при движении поездов" },
                { id: "m6l2", label: "2. Сигналы тревоги" },
                { id: "m6l3", label: "3. Действия локомотивной бригады при тревоге" }
            ]
        },
        {
            id: 7,
            title: "Раздел 7: Световые указатели и поездные сигналы",
            icon: "fas fa-train",
            meta: "3 темы • Обозначение головы и хвоста подвижного состава",
            lessons: [
                { id: "m7l1", label: "1. Обозначение головы поезда при движении" },
                { id: "m7l2", label: "2. Обозначение хвоста поезда" },
                { id: "m7l3", label: "3. Обозначение съемных подвижных единиц" }
            ]
        }
    ];

    const lessonWordByLang = {
        ru: 'уроков',
        kz: 'сабақ',
        en: 'lessons',
    };
    const moduleWordByLang = {
        ru: 'модулей',
        kz: 'модуль',
        en: 'modules',
    };

    const mapLessonSummary = (lesson, lessonIndex) => ({
        id: lesson.key || lesson.id,
        lessonId: lesson.id,
        label: `${lessonIndex + 1}. ${lesson.title || lesson.label}`,
        isCompleted: completedLessonIds.has(lesson.id),
        isAttempted: attemptedLessonIds.has(lesson.id),
    });

    const apiModulesConfig = hasApiData && Array.isArray(data?.sections) && data.sections.length
        ? data.sections.map((section, index) => {
            const sectionModules = (section.modules || []).map((sectionModule) => {
                const moduleLessons = (sectionModule.lessons || []).map(mapLessonSummary);

                return {
                    id: sectionModule.id,
                    key: sectionModule.key || sectionModule.id,
                    title: sectionModule.title,
                    meta: `${moduleLessons.length} ${lessonWordByLang[lang] || lessonWordByLang.ru}`,
                    isCompleted: completedModuleIds.has(sectionModule.id),
                    isAttempted: attemptedModuleIds.has(sectionModule.id),
                    lessons: moduleLessons,
                };
            });

            return {
                id: `section-${section.id || index + 1}`,
                title: section.title,
                icon: modulesConfig[index]?.icon || "fas fa-book-open",
                meta: `${sectionModules.length} ${moduleWordByLang[lang] || moduleWordByLang.ru}`,
                childModules: sectionModules,
                lessons: sectionModules.flatMap((sectionModule) => sectionModule.lessons),
            };
        })
        : hasApiData && Array.isArray(data?.modules)
            ? data.modules.map((mod, index) => ({
                id: mod.key || mod.id || index + 1,
                title: mod.title,
                icon: mod.icon || modulesConfig[index]?.icon || "fas fa-book-open",
                meta: mod.meta || `${mod.lessons?.length || 0} ${lessonWordByLang[lang] || lessonWordByLang.ru}`,
                lessons: (mod.lessons || []).map(mapLessonSummary),
            }))
            : [];
    const displayModules = apiModulesConfig.length ? apiModulesConfig : modulesConfig;

    // --- Load Data ---
    useEffect(() => {
        fetch('/courseData.json')
            .then(response => response.json())
            .then(jsonData => setFallbackCourseData(jsonData))
            .catch(error => console.error("Error loading course data:", error));
    }, []);

    // --- Action Handlers ---
    const toggleModule = (modId) => {
        setExpandedModule(expandedModule === modId ? null : modId);
    };

    const openLesson = (lessonId) => {
        if (!courseData[lessonId]) {
            alert("Материалы этой темы генерируются или обновляются. Пожалуйста, попробуйте позже.");
            return;
        }
        setActiveLessonId(lessonId);
        setCurrentStep(1);
        setCurrentQuestionIndex(0);
        setScore(0);
        setScorePoints(0);
        setIsAnswered(false);
        setSelectedOptionIndex(null);
        setSelectedAnswers([]);
        setSubmittedResult(null);
        setIsSubmittingResult(false);
    };

    const closeLesson = () => {
        setActiveLessonId(null);
    };

    const getQuestionBasePoints = (question) => Number(question?.basePoints ?? question?.base_points ?? 1) || 0;

    const handleAnswerClick = (isCorrect, index) => {
        if (isAnswered) return;
        const selectedAnswer = String.fromCharCode(65 + index);
        setIsAnswered(true);
        setSelectedOptionIndex(index);
        setSelectedAnswers((previous) => [
            ...previous.filter((answer) => answer.question_id !== currentQuestion?.id),
            {
                question_id: currentQuestion?.id,
                selected_answer: selectedAnswer,
            },
        ]);
        if (isCorrect) {
            setScore(prev => prev + 1);
            setScorePoints(prev => prev + getQuestionBasePoints(currentQuestion));
        }
    };

    const nextQuestion = () => {
        const lessonData = courseData[activeLessonId];
        if (currentQuestionIndex < lessonData.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setIsAnswered(false);
            setSelectedOptionIndex(null);
        } else {
            finishLessonQuiz();
        }
    };

    const finishLessonQuiz = async () => {
        if (isSubmittingResult) return;
        setIsSubmittingResult(true);

        const answers = selectedAnswers.filter((answer) => answer.question_id);

        try {
            const response = await apiFetch('/api/progress/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answers }),
            });

            if (!response.ok) {
                throw new Error(`Progress request failed with ${response.status}`);
            }

            const result = await response.json();
            setSubmittedResult(result);

            if (typeof result.score === 'number') setScorePoints(result.score);
            if (typeof result.correct_count === 'number') setScore(result.correct_count);

            onDataRefresh?.();
        } catch (error) {
            console.error('Progress save failed:', error);
        } finally {
            setCurrentStep(4);
            setIsSubmittingResult(false);
        }
    };

    // --- Render Previews ---
    const stepTitles = ["Шаг 1 из 4: Теория", "Шаг 2 из 4: Видео", "Шаг 3 из 4: Экзаменационный тест", "Шаг 4 из 4: Результаты"];
    const activeLesson = activeLessonId ? courseData[activeLessonId] : null;
    const maxScorePoints = activeLesson?.questions?.reduce((total, question) => total + getQuestionBasePoints(question), 0) || 0;
    const resultScorePoints = submittedResult?.score ?? scorePoints;
    const resultMaxScorePoints = submittedResult?.max_score ?? maxScorePoints;
    const resultCorrectCount = submittedResult?.correct_count ?? score;
    const resultQuestionCount = submittedResult?.total_questions ?? (activeLesson?.questions?.length || 0);
    const scorePercentage = resultMaxScorePoints ? Math.round((resultScorePoints / resultMaxScorePoints) * 100) : 0;
    const lessonPassed = submittedResult?.is_completed ?? scorePercentage === 100;
    const currentQuestion = activeLesson && currentStep >= 3 && activeLesson.questions ? activeLesson.questions[currentQuestionIndex] : null;
    const currentOptions = currentQuestion?.options || [];
    const selectedOption = Number.isInteger(selectedOptionIndex) ? currentOptions[selectedOptionIndex] : null;
    const correctOptionIndex = currentOptions.findIndex((option) => option.correct);
    const correctOption = correctOptionIndex >= 0 ? currentOptions[correctOptionIndex] : null;
    const optionLetter = (index) => (index >= 0 ? String.fromCharCode(65 + index) : '-');
    const selectedAnswerText = selectedOption ? `${optionLetter(selectedOptionIndex)}. ${selectedOption.text}` : '-';
    const correctAnswerText = correctOption ? `${optionLetter(correctOptionIndex)}. ${correctOption.text}` : '-';
    const totalModules = learningStats.totalModules ?? displayModules.reduce((total, section) => total + (section.childModules?.length || 1), 0);
    const completedModules = learningStats.completedModules ?? 0;
    const moduleCount = totalModules;
    const courseProgressPercent = learningStats.overallProgressPercent ?? 0;
    const programHeroCopy = {
        ru: {
            modulesOpen: 'Модулей завершено',
            interactiveTopics: 'Интерактивные модули',
            availability: 'Прогресс курса',
            studyLesson: 'Изучить материал',
            completedLesson: 'Завершено',
            retryLesson: 'Пройти заново',
            moduleInProgress: 'В процессе',
        },
        kz: {
            modulesOpen: 'Модуль аяқталды',
            interactiveTopics: 'Интерактивті модульдер',
            availability: 'Курс прогресі',
            studyLesson: 'Материалды оқу',
            completedLesson: 'Аяқталды',
            retryLesson: 'Қайта өту',
            moduleInProgress: 'Орындалуда',
        },
        en: {
            modulesOpen: 'Modules completed',
            interactiveTopics: 'Interactive modules',
            availability: 'Course progress',
            studyLesson: 'Study material',
            completedLesson: 'Completed',
            retryLesson: 'Retake',
            moduleInProgress: 'In progress',
        },
    };
    const heroCopy = programHeroCopy[lang] || programHeroCopy.ru;
    const feedbackCopy = {
        ru: {
            correctTitle: 'Ответ выбран верно',
            incorrectTitle: 'Ответ выбран неверно',
            selectedAnswer: 'Ваш выбор',
            correctAnswer: 'Правильный вариант',
            why: 'Почему это правильно',
            fallback: 'Этот вариант соответствует правилу сигнализации, которое проверяется в вопросе.',
        },
        kz: {
            correctTitle: 'Жауап дұрыс таңдалды',
            incorrectTitle: 'Жауап қате таңдалды',
            selectedAnswer: 'Сіздің таңдауыңыз',
            correctAnswer: 'Дұрыс нұсқа',
            why: 'Неліктен бұл дұрыс',
            fallback: 'Бұл нұсқа сұрақта тексерілетін сигнал беру ережесіне сәйкес келеді.',
        },
        en: {
            correctTitle: 'Correct answer selected',
            incorrectTitle: 'Incorrect answer selected',
            selectedAnswer: 'Your choice',
            correctAnswer: 'Correct option',
            why: 'Why this is correct',
            fallback: 'This option matches the signaling rule being checked by the question.',
        },
    };
    const feedbackText = feedbackCopy[lang] || feedbackCopy.ru;
    const explanationText = currentQuestion?.explanation || feedbackText.fallback;
    const resultCopy = {
        ru: {
            passedTitle: 'Урок успешно завершен!',
            retryTitle: 'Урок пока не завершен',
            passedSubtitle: 'Результат зафиксирован в базе. Прогресс курса и значки обновлены.',
            retrySubtitle: 'Результат сохранен, но для зачета урока нужно ответить правильно на все вопросы.',
            score: 'Баллы',
            correct: 'Правильные ответы',
            gradebook: 'В электронный журнал',
            back: 'Вернуться к учебной карте',
            retry: 'Пройти урок заново',
        },
        kz: {
            passedTitle: 'Сабақ сәтті аяқталды!',
            retryTitle: 'Сабақ әлі аяқталған жоқ',
            passedSubtitle: 'Нәтиже базаға жазылды. Курс прогресі мен белгілер жаңартылды.',
            retrySubtitle: 'Нәтиже сақталды, бірақ сабақ есептелуі үшін барлық сұраққа дұрыс жауап беру керек.',
            score: 'Ұпай',
            correct: 'Дұрыс жауаптар',
            gradebook: 'Электрондық журналға',
            back: 'Оқу картасына қайту',
            retry: 'Сабақты қайта өту',
        },
        en: {
            passedTitle: 'Lesson completed successfully!',
            retryTitle: 'Lesson is not completed yet',
            passedSubtitle: 'The result has been recorded. Course progress and badges were updated.',
            retrySubtitle: 'The result was saved, but the lesson counts only when every question is answered correctly.',
            score: 'Score',
            correct: 'Correct answers',
            gradebook: 'To gradebook',
            back: 'Back to learning map',
            retry: 'Retake lesson',
        },
    };
    const resultText = resultCopy[lang] || resultCopy.ru;
    return (
        <div className="content-area animate-fade-in">
            <section id="program-view" className="view-section active">
                
                {/* --- SLEEK NEW DASHBOARD OVERLAY HEADER --- */}
                <div className="premium-hero-header">
                    <div className="hero-grid-bg"></div>
                    <div className="hero-content">
                        <span className="premium-badge"><i className="fas fa-graduation-cap"></i> Интерактивный лекторий KTZ</span>
                        <h1 className="hero-main-title">Цифровая траектория обучения ИСИ</h1>
                        <p className="hero-subtitle">Программа подготовки инженерно-технических работников локомотивных бригад. Формат: Интерактивная теория → Медиа-лекция → Ситуационный контроль.</p>
                        
                        <div className="hero-stats-row">
                            <div className="hero-stat-card">
                                <span className="stat-num">{completedModules} / {totalModules}</span>
                                <span className="stat-lbl">{heroCopy.modulesOpen}</span>
                            </div>
                            <div className="hero-stat-card">
                                <span className="stat-num">{moduleCount}</span>
                                <span className="stat-lbl">{heroCopy.interactiveTopics}</span>
                            </div>
                            <div className="hero-stat-card">
                                <span className="stat-num">{courseProgressPercent}%</span>
                                <span className="stat-lbl">{heroCopy.availability}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- MODULE OVERVIEW (Main Hub Grid) --- */}
                {!activeLessonId && (
                    <div id="module-overview-grid" className="modern-modules-stack">
                        {displayModules.map((mod) => {
                            const isExpanded = expandedModule === mod.id;
                            return (
                                <div key={mod.id} className={`premium-module-card ${isExpanded ? 'is-expanded' : ''}`}>
                                    <div className="module-trigger-zone" onClick={() => toggleModule(mod.id)}>
                                        <div className="module-left-meta">
                                            <div className="module-icon-box">
                                                <i className={mod.icon}></i>
                                            </div>
                                            <div>
                                                <h3 className="module-title-text">{mod.title}</h3>
                                                <span className="module-meta-pills"><i className="far fa-folder-open"></i> {mod.meta}</span>
                                            </div>
                                        </div>
                                        <div className="module-right-actions">
                                            <span className="status-pill-open"><i className="fas fa-unlock"></i> Доступен</span>
                                            <div className={`chevron-indicator ${isExpanded ? 'rotated' : ''}`}>
                                                <i className="fas fa-chevron-down"></i>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Subtopics Nested Smooth List */}
                                    {isExpanded && (
                                        <div className="premium-lessons-wrapper">
                                            {(mod.childModules || [{ id: `${mod.id}-lessons`, title: mod.title, meta: mod.meta, lessons: mod.lessons }]).map((moduleGroup) => (
                                                <div
                                                    key={moduleGroup.id}
                                                    className={`section-module-group ${moduleGroup.isCompleted ? 'completed' : moduleGroup.isAttempted ? 'in-progress' : ''}`}
                                                >
                                                    {mod.childModules && (
                                                        <div className="section-module-heading">
                                                            <div>
                                                                <h4>{moduleGroup.title}</h4>
                                                                <span>{moduleGroup.meta}</span>
                                                            </div>
                                                            <span className={`module-progress-state ${moduleGroup.isCompleted ? 'completed' : moduleGroup.isAttempted ? 'in-progress' : ''}`}>
                                                                {moduleGroup.isCompleted ? heroCopy.completedLesson : moduleGroup.isAttempted ? heroCopy.moduleInProgress : heroCopy.studyLesson}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div className="section-module-lessons">
                                                        {(moduleGroup.lessons || []).map((les) => (
                                                            <div 
                                                                key={les.id} 
                                                                className={`premium-lesson-row-item clickable ${les.isCompleted ? 'completed' : les.isAttempted ? 'in-progress' : ''}`}
                                                                onClick={() => openLesson(les.id)}
                                                            >
                                                                <div className="lesson-left-info">
                                                                    <span className={`lesson-bullet ${les.isCompleted ? 'completed' : les.isAttempted ? 'in-progress' : ''}`}>
                                                                        <i className={`${les.isCompleted ? 'fas fa-check-circle' : les.isAttempted ? 'fas fa-redo-alt' : 'far fa-circle'}`}></i>
                                                                    </span>
                                                                    <span className="lesson-label-string">{les.label}</span>
                                                                </div>
                                                                <div className="lesson-right-status">
                                                                    <span className="start-study-btn">
                                                                        {les.isCompleted ? heroCopy.completedLesson : les.isAttempted ? heroCopy.retryLesson : heroCopy.studyLesson} <i className="fas fa-chevron-right"></i>
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* --- DYNAMIC LESSON CONTAINER (Active Mode View) --- */}
                {activeLessonId && activeLesson && (
                    <div id="dynamic-lesson-container" className="premium-lesson-stage-box">
                        
                        {/* Interactive Steps Top Navigation Track */}
                        <div className="stage-top-navbar">
                            <button className="back-hub-btn" onClick={closeLesson}>
                                <i className="fas fa-arrow-left"></i> Выйти в программу
                            </button>
                            <h2 className="stage-core-title">{activeLesson.title}</h2>
                            <div className="stage-step-indicator-badge">{stepTitles[currentStep - 1]}</div>
                        </div>

                        {/* Interactive Steps Progress Ribbon */}
                        <div className="progress-ribbon-bar">
                            {[1, 2, 3, 4].map(idx => (
                                <div 
                                    key={idx} 
                                    className={`ribbon-segment ${currentStep >= idx ? 'active-segment' : ''} ${currentStep === idx ? 'current-pulse' : ''}`}
                                />
                            ))}
                        </div>

                        {/* CONTENT WRAPPER */}
                        <div className="stage-body-real-content">
                            
                            {/* STEP 1: THEORY */}
                            {currentStep === 1 && (
                                <div className="step-fade-container theory-layout">
                                    <div className="theory-scrollable-block">
                                        <div className="info-banner-tip">
                                            <i className="fas fa-info-circle"></i> <strong>Регламент ИСИ КТЖ:</strong> Изучите текст инструкции ниже. Все положения обязательны к исполнению локомотивными бригадами при нахождении на службе.
                                        </div>
                                        <div 
                                            className="rendered-html-theory-content"
                                            dangerouslySetInnerHTML={{ __html: activeLesson.theory }} 
                                        />
                                    </div>
                                    <button className="premium-action-action-btn stage-next-btn" onClick={() => setCurrentStep(2)}>
                                        Перейти к видеолекции <i className="fas fa-video"></i>
                                    </button>
                                </div>
                            )}

                            {/* STEP 2: VIDEO */}
                            {currentStep === 2 && (
                                <div className="step-fade-container video-layout">
                                    <h4 className="video-inner-header-title"><i className="fas fa-play"></i> {activeLesson.videoTitle || "Видеоматериал по теме"}</h4>
                                    <div className="premium-video-cinematic-frame">
                                        <div className="cinematic-overlay-content">
                                            <div className="play-pulse-circle">
                                                <i className="fas fa-play"></i>
                                            </div>
                                            <p className="cinematic-placeholder-text">Интерактивный видеоплеер КТЖ Академии</p>
                                            <span className="video-duration-tag">Стриминг высокого разрешения • HD</span>
                                        </div>
                                    </div>
                                    <button className="premium-action-action-btn stage-quiz-btn" onClick={() => setCurrentStep(3)}>
                                        Начать аттестационный тест <i className="fas fa-user-check"></i>
                                    </button>
                                </div>
                            )}

                            {/* STEP 3: QUIZ */}
                            {currentStep === 3 && currentQuestion && (
                                <div className="step-fade-container quiz-layout">
                                    
                                    {/* Pagination Tracker */}
                                    <div className="quiz-modern-dots-row">
                                        {activeLesson.questions.map((_, i) => (
                                            <div 
                                                key={i} 
                                                className={`quiz-dot-item ${i === currentQuestionIndex ? 'active' : ''} ${i < currentQuestionIndex ? 'passed' : ''}`}
                                            >
                                                {i + 1}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="quiz-card-mainframe">
                                        <h3 className="quiz-question-text-title">
                                            Вопрос {currentQuestionIndex + 1}: {currentQuestion.text}
                                        </h3>
                                        
                                        <div className="quiz-split-media-options-grid">
                                            
                                            {/* Media container left */}
                                            {(currentQuestion.img || currentQuestion.video) && (
                                                <div className="quiz-attached-media-frame">
                                                    {currentQuestion.img && (
                                                        <img src={getMediaSrc(currentQuestion.img)} alt="Схема СЦБ" className="quiz-responsive-img" />
                                                    )}
                                                    {currentQuestion.video && (
                                                        <video src={getMediaSrc(currentQuestion.video)} controls className="quiz-responsive-video" />
                                                    )}
                                                </div>
                                            )}

                                            {/* Options list right */}
                                            <div className="quiz-options-stack-vertical">
                                                {currentQuestion.options.map((opt, i) => {
                                                    let customClass = "premium-quiz-option-row-btn";
                                                    if (isAnswered) {
                                                        if (opt.correct) customClass += " is-correct-answer";
                                                        else if (i === selectedOptionIndex) customClass += " is-wrong-answer";
                                                    }
                                                    return (
                                                        <button 
                                                            key={i}
                                                            className={customClass}
                                                            disabled={isAnswered}
                                                            onClick={() => handleAnswerClick(opt.correct, i)}
                                                        >
                                                            <span className="option-index-letter">{String.fromCharCode(65 + i)}</span>
                                                            <span className="option-inner-text-string">{opt.text}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Smooth Explanation Pop-up */}
                                        {isAnswered && (
                                            <div className={`modern-explanation-card-popup ${activeLesson.questions[currentQuestionIndex].options[selectedOptionIndex]?.correct ? 'success' : 'danger'}`}>
                                                <div className="exp-icon-headline">
                                                    <i className={activeLesson.questions[currentQuestionIndex].options[selectedOptionIndex]?.correct ? 'fas fa-check-circle' : 'fas fa-times-circle'}></i>
                                                    <strong>Экспертное разъяснение технического регламента:</strong>
                                                </div>
                                                <p className="exp-text-para">{currentQuestion.explanation}</p>
                                                <button className="premium-forward-next-btn" onClick={nextQuestion}>
                                                    {currentQuestionIndex === activeLesson.questions.length - 1 ? "Завершить тестирование" : "Следующий вопрос"} <i className="fas fa-arrow-right"></i>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* STEP 4: RESULTS */}
                            {currentStep === 4 && (
                                <div className="step-fade-container results-layout-cinematic">
                                    <div className={`trophy-pulse-animation-box ${lessonPassed ? '' : 'needs-retry'}`}>
                                        <i className={`fas fa-${lessonPassed ? 'award' : 'redo-alt'}`}></i>
                                    </div>
                                    <h2 className="results-main-title-headline">{lessonPassed ? resultText.passedTitle : resultText.retryTitle}</h2>
                                    <p className="results-subtitle-text">{lessonPassed ? resultText.passedSubtitle : resultText.retrySubtitle}</p>
                                    
                                    <div className={`score-board-visualizer-card ${lessonPassed ? 'passed' : 'needs-retry'}`}>
                                        <span className="score-percentage-text">
                                            {scorePercentage}%
                                        </span>
                                        <p className="score-absolute-fraction">{resultText.score}: <strong>{resultScorePoints} of {resultMaxScorePoints}</strong></p>
                                        <p className="score-absolute-fraction">{resultText.correct}: <strong>{resultCorrectCount} of {resultQuestionCount}</strong></p>
                                    </div>

                                    <div className="results-actions-buttons-row">
                                        <button className="results-btn outline-variant" onClick={() => navigate(`/platform/grades?lang=${lang || 'ru'}`)}>
                                            <i className="fas fa-chart-line"></i> {resultText.gradebook}
                                        </button>
                                        <button className="results-btn solid-variant" onClick={lessonPassed ? closeLesson : () => openLesson(activeLessonId)}>
                                            {lessonPassed ? resultText.back : resultText.retry} <i className={`fas fa-${lessonPassed ? 'map' : 'redo-alt'}`}></i>
                                        </button>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}

export default ProgramView;
