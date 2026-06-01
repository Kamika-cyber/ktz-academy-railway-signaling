// --- NAVIGATION LOGIC (Maintained & Expanded) ---
document.querySelectorAll('.sidebar-nav .nav-item').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Update Active Class in Sidebar
        document.querySelectorAll('.sidebar-nav .nav-item').forEach(nav => nav.classList.remove('active'));
        this.classList.add('active');
        
        // Update Title in Header
        const titleText = this.innerText.trim();
        document.getElementById('page-title').innerText = titleText;

        // Switch the View
        const targetView = this.getAttribute('data-target');
        switchView(targetView);
    });
});

function switchView(viewId) {
    // Hide all views
    document.querySelectorAll('.view-section').forEach(view => {
        view.classList.remove('active');
    });
    // Show target view
    const target = document.getElementById(viewId);
    if(target) target.classList.add('active');
    
    // Reset internal sub-views (like closing the lesson if we navigate away)
    if(viewId !== 'program-view') {
        closeLesson();
    }
}

// --- SLIDESHOW LOGIC (Automatic) ---
let slideIndex = 0;
function autoShowSlides() {
    let slides = document.getElementsByClassName("slide");
    if (slides.length === 0) return; // Guard clause if not on home page
    
    for (let i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";  
    }
    slideIndex++;
    if (slideIndex > slides.length) { slideIndex = 1 }    
    slides[slideIndex - 1].style.display = "block";  
    setTimeout(autoShowSlides, 4000); // Change image every 4 seconds
}

// --- COURSE PLAN ACCORDION 

document.addEventListener("DOMContentLoaded", () => {
        // Find all module headers
        const headers = document.querySelectorAll(".module-header");

        headers.forEach(header => {
            header.addEventListener("click", () => {
                // Get the parent list item and the hidden content div
                const item = header.parentElement;
                const content = item.querySelector(".module-content");
                
                // Toggle the 'active' class to rotate the plus icon
                item.classList.toggle("active");

                // If it's already open, close it. Otherwise, open it.
                if (content.style.maxHeight) {
                    content.style.maxHeight = null;
                } else {
                    // Set max-height exactly to the height of the inner content
                    content.style.maxHeight = content.scrollHeight + "px";
                }
            });
        });
    });

// --- TEACHERS' CARD READ MORE

document.querySelectorAll('.read-more-btn').forEach(button => {
        button.addEventListener('click', function() {
            const card = this.closest('.teacher-card');
            card.classList.toggle('expanded');
            
            if (card.classList.contains('expanded')) {
                this.textContent = 'Hide';
            } else {
                this.textContent = 'Read More';
            }
        });
    });

// --- INTERACTIVE LESSON & QUIZ LOGIC V1.6 --- 


let courseData = {}; // This will hold the data from our JSON file
let activeLessonId = '';
let currentQuestionIndex = 0;
let correctAnswersCount = 0;

// 1. Fetch the data when the script loads
fetch('courseData.json')
    .then(response => response.json())
    .then(data => {
        courseData = data;
        console.log("Course data loaded successfully!");
    })
    .catch(error => console.error("Error loading course data:", error));

function openLesson(lessonId) {
    // Check if data is loaded
    if (!courseData[lessonId]) {
        alert("Данные урока еще не загружены или не существуют.");
        return;
    }

    activeLessonId = lessonId;
    currentQuestionIndex = 0;
    correctAnswersCount = 0;
    
    let lessonData = courseData[lessonId];

    // INJECT DATA INTO HTML TEMPLATE
    document.getElementById('dyn-lesson-title').innerText = lessonData.title;
    document.getElementById('dyn-theory-content').innerHTML = lessonData.theory;
    document.getElementById('dyn-video-title').innerText = lessonData.videoTitle;

    // Hide module menu, show dynamic container
    document.getElementById('module-overview').classList.add('hidden');
    document.getElementById('dynamic-lesson-container').classList.remove('hidden');
    
    goToStep('step-theory', 1);
}

function closeLesson() {
    document.getElementById('dynamic-lesson-container').classList.add('hidden');
    document.getElementById('module-overview').classList.remove('hidden');
}

function goToStep(stepClass, stepNum) {
    const container = document.getElementById('dynamic-lesson-container');
    const steps = container.querySelectorAll('.lesson-step');
    steps.forEach(step => step.classList.add('hidden'));
    
    container.querySelector(`.${stepClass}`).classList.remove('hidden');
    
    if(stepNum) {
        let texts = ["Шаг 1 из 4: Теория", "Шаг 2 из 4: Видео", "Шаг 3 из 4: Тест", "Шаг 4 из 4: Результаты"];
        document.getElementById('dyn-lesson-progress').innerText = texts[stepNum - 1];
    }
}

// -- QUIZ LOGIC --
function initQuiz() {
    goToStep('step-quiz', 3);
    renderQuestion();
}

function renderQuestion() {
    const lessonData = courseData[activeLessonId];
    const qData = lessonData.questions[currentQuestionIndex];
    const container = document.getElementById('dynamic-lesson-container');
    
    container.querySelector('.q-text').innerText = `${currentQuestionIndex + 1}. ${qData.text}`;

    // Handle Image vs Video logic
    const imgElement = container.querySelector('.q-image');
    const videoElement = container.querySelector('.q-video');

    // 1. Reset both to be hidden and clear their sources
    imgElement.classList.add('hidden');
    videoElement.classList.add('hidden');
    imgElement.src = "";
    videoElement.src = "";

    // 2. Check what type of media the JSON has, encode the URL (to fix spaces), and show the right element
    if (qData.video) {
        videoElement.src = encodeURI(qData.video);
        videoElement.classList.remove('hidden');
    } else if (qData.img) {
        imgElement.src = encodeURI(qData.img);
        imgElement.classList.remove('hidden');
    }
    
    const optionsContainer = container.querySelector('.q-options-container');
    optionsContainer.innerHTML = '';
    
    qData.options.forEach((opt, i) => {
        let btn = document.createElement('button');
        btn.className = 'quiz-option outline-btn full-width';
        btn.style.textAlign = 'left';
        btn.style.marginBottom = '10px';
        btn.style.padding = '15px';
        btn.innerText = opt.text;
        btn.onclick = () => checkAnswer(btn, opt.correct, qData.explanation);
        optionsContainer.appendChild(btn);
    });

    const pagination = container.querySelector('.quiz-pagination');
    pagination.innerHTML = '';
    for(let i = 0; i < lessonData.questions.length; i++) {
        let dot = document.createElement('div');
        dot.style.width = '30px'; dot.style.height = '30px';
        dot.style.borderRadius = '5px'; dot.style.display = 'flex';
        dot.style.alignItems = 'center'; dot.style.justifyContent = 'center';
        dot.style.fontWeight = 'bold';
        
        if (i === currentQuestionIndex) {
            dot.style.backgroundColor = 'var(--ktz-blue, #1e3a8a)';
            dot.style.color = 'white';
        } else if (i < currentQuestionIndex) {
            dot.style.backgroundColor = '#e2e8f0';
            dot.style.color = '#475569';
        } else {
            dot.style.border = '1px solid #e2e8f0';
            dot.style.color = '#94a3b8';
        }
        dot.innerText = i + 1;
        pagination.appendChild(dot);
    }

    container.querySelector('.q-explanation').classList.add('hidden');
}

function checkAnswer(clickedBtn, isCorrect, explanationText) {
    const container = document.getElementById('dynamic-lesson-container');
    const buttons = container.querySelectorAll('.quiz-option');
    buttons.forEach(btn => btn.style.pointerEvents = 'none');

    if (isCorrect) {
        clickedBtn.style.backgroundColor = "#dcfce7";
        clickedBtn.style.borderColor = "#22c55e";
        clickedBtn.style.color = "#166534";
        correctAnswersCount++;
    } else {
        clickedBtn.style.backgroundColor = "#fee2e2";
        clickedBtn.style.borderColor = "#ef4444";
        clickedBtn.style.color = "#991b1b";
        
        const actualCorrectIndex = courseData[activeLessonId].questions[currentQuestionIndex].options.findIndex(o => o.correct);
        buttons[actualCorrectIndex].style.border = "2px solid #22c55e";
        buttons[actualCorrectIndex].style.backgroundColor = "#ecfdf5";
    }

    container.querySelector('.q-exp-text').innerText = explanationText;
    
    const nextBtn = container.querySelector('.next-q-btn');
    if (currentQuestionIndex === courseData[activeLessonId].questions.length - 1) {
        nextBtn.innerText = "Завершить тест";
    } else {
        nextBtn.innerText = "Далее";
    }
    
    container.querySelector('.q-explanation').classList.remove('hidden');
}

function nextQuestion() {
    if (currentQuestionIndex < courseData[activeLessonId].questions.length - 1) {
        currentQuestionIndex++;
        renderQuestion();
    } else {
        showResults();
    }
}

function showResults() {
    goToStep('step-results', 4);
    const container = document.getElementById('dynamic-lesson-container');
    const totalQuestions = courseData[activeLessonId].questions.length;
    container.querySelector('.final-score').innerText = `${correctAnswersCount} из ${totalQuestions}`;
}

function showResults() {
    goToStep('step-results', 4);
    const container = document.getElementById('dynamic-lesson-container');
    const totalQuestions = courseData[activeLessonId].questions.length;
    container.querySelector('.final-score').innerText = `${correctAnswersCount} из ${totalQuestions}`;
}

function goToGrades(event) {
    // 1. Prevent any default jumping or bubbling
    if (event) event.preventDefault();

    // 2. Hide ALL sections
    const sections = document.querySelectorAll('.view-section');
    sections.forEach(sec => sec.classList.remove('active'));

    // 3. Show the grades section
    const gradesSection = document.getElementById('grades-view');
    if (gradesSection) {
        gradesSection.classList.add('active');
    }

    // 4. CRITICAL: Update the Sidebar UI
    // If you don't do this, the sidebar might trigger a "reset" 
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-target') === 'grades-view') {
            item.classList.add('active');
        }
    });

    // 5. Update the page title/breadcrumb
    document.getElementById('page-title').innerText = "Оценки";
    
    // 6. Close the lesson modal if it's still open
    const lessonContainer = document.getElementById('dynamic-lesson-container');
    if (lessonContainer) {
        lessonContainer.classList.add('hidden');
    }
}


// --- RESOURCES VIEWER LOGIC ---

// Updated PDF openner  ------

function openResource(title, fileName, fileType) {
    document.getElementById('viewer-title').innerText = title;
    
    const viewerContent = document.getElementById('viewer-content-area');
    
    // Inject the correct HTML based on the file type
    if (fileType === 'pdf') {
        viewerContent.innerHTML = `<iframe src="${fileName}" width="100%" height="100%" style="border: none;"></iframe>`;
    } else if (fileType === 'video') {
        viewerContent.innerHTML = `
            <video width="100%" height="100%" controls style="background: #000;">
                <source src="${fileName}" type="video/mp4">
                Ваш браузер не поддерживает просмотр видео.
            </video>`;
    } else {
        viewerContent.innerHTML = `<p class="text-muted">Формат файла не поддерживается.</p>`;
    }

    document.getElementById('resource-viewer').classList.remove('hidden');
    
    // Scroll to viewer smoothly
    document.getElementById('resource-viewer').scrollIntoView({ behavior: 'smooth' });
}

function closeResource() {
    document.getElementById('resource-viewer').classList.add('hidden');
    
    // Clear the content area. This is critical to stop a video from playing in the background!
    document.getElementById('viewer-content-area').innerHTML = `
        <p class="text-muted"><i class="fas fa-spinner fa-spin"></i> Выберите материал для просмотра...</p>
    `;
}

// ---------------------------

// Initialize logic on page load
window.onload = function() {
    
    if (typeof autoShowSlides === "function") autoShowSlides();
};

// 1. Unified Navigation Logic
document.querySelectorAll('.nav-item').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Remove active class from all nav items and sections
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        document.querySelectorAll('.view-section').forEach(view => view.classList.remove('active'));
        
        // Add active class to clicked item
        this.classList.add('active');
        
        // Get the target ID and show the section
        const targetId = this.getAttribute('data-target');
        const targetSection = document.getElementById(targetId);
        
        if (targetSection) {
            targetSection.classList.add('active');
            
            // Update the top breadcrumb title
            const pageTitle = document.getElementById('page-title');
            if (pageTitle) pageTitle.innerText = this.innerText;
            
            // Trigger animations specifically when Grades view opens
            if (targetId === 'grades-view') {
                initGradesAnimations();
            }
        }
    });
});

// 2. Dashboard Accordion (From previous step)
function toggleDashboardAccordion(header) {
    const item = header.parentElement;
    const content = header.nextElementSibling;
    item.classList.toggle('active');
    
    if (item.classList.contains('active')) {
        content.style.maxHeight = content.scrollHeight + "px";
        header.querySelector('.toggle-icon').innerText = "−";
    } else {
        content.style.maxHeight = "0";
        header.querySelector('.toggle-icon').innerText = "+";
    }
}

// 3. Grades Page Animations
function initGradesAnimations() {
    // Staggered reveal for cards
    const reveals = document.querySelectorAll('#grades-view .reveal');
    reveals.forEach((el, index) => {
        setTimeout(() => { 
            el.classList.add('active'); 
        }, index * 100);
    });

    // Reset and trigger Bar chart fill animation
    const bars = document.querySelectorAll('#grades-view .bar-fill');
    bars.forEach(bar => {
        const targetWidth = bar.style.width; // Save actual width
        bar.style.width = '0'; // Reset
        setTimeout(() => {
            bar.style.width = targetWidth; // Animate to target
        }, 300);
    });
}

// 4. Grades Accordion logic (Replaces duplicate detail toggles)
function toggleGradesAccordion(header) {
    const group = header.parentElement; 
    const content = header.nextElementSibling; 
    const icon = header.querySelector('.fa-chevron-down');

    // Toggle the clicked one
    if (content.style.display === "block") {
        content.style.display = "none";
        icon.style.transform = "rotate(0deg)";
    } else {
        content.style.display = "block";
        icon.style.transform = "rotate(180deg)";
    }
}