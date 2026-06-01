# KTZ Academy — Railway Signaling E-Learning Platform

KTZ Academy is a full-stack multilingual e-learning platform for studying Railway Signaling Instructions (ISI) and practicing railway signal recognition. The project combines a Django backend, SQL/PostgreSQL-ready database structure, Django Admin management panel, and a React/Vite frontend with an interactive learning environment.

The platform is designed for railway signaling training and supports structured course content, user authentication, multilingual learning materials, quizzes, progress tracking, an interactive ISI reference directory, railway signal light cards, resources, simulators, and backend-calculated quiz results.

## Repository Description

Full-stack railway signaling e-learning platform with Django, SQL/PostgreSQL-ready database, React/Vite frontend, multilingual course content, quizzes, progress tracking, ISI signal reference cards, scenario-based simulators, and administrative content management tools.

## Main Features

* Public homepage for course presentation
* User registration, login, logout, and session-based authentication
* React/Vite single-page learning platform
* Multilingual interface and course content: Russian, Kazakh, and English
* Course structure based on 7 sections and 26 learning modules
* Structured lessons with theory, media, quizzes, and results
* Backend-calculated quiz scoring
* SQL storage of users, course content, questions, progress, and quiz results
* Interactive ISI reference directory with railway signal light cards
* Resource library for supporting learning materials
* Scenario-based simulator section for practical signaling training
* Grades and progress dashboard
* Certificate progress logic
* Django Admin panel for course and result management

## Tech Stack

| Layer       | Technology                           | Purpose                                             |
| ----------- | ------------------------------------ | --------------------------------------------------- |
| Frontend    | React + Vite                         | User interface and learning platform                |
| Backend     | Django / Python                      | Authentication, API, scoring, and admin logic       |
| Database    | SQL / PostgreSQL-ready schema        | Course content, users, questions, progress, results |
| Admin Panel | Django Admin                         | Course and user data management                     |
| Security    | Django Session Authentication + CSRF | Protected login, logout, and API requests           |
| Styling     | CSS, Font Awesome, custom components | Responsive and interactive interface                |

## Project Structure

```text
ktz-academy-railway-signaling/
│
├── backend/
│   ├── config/
│   ├── courses/
│   ├── manage.py
│   └── requirements.txt
│
└── frontend/
    ├── public/
    ├── src/
    ├── package.json
    └── vite.config.js
```

## Backend

The backend is implemented with Django. It handles authentication, course data processing, quiz validation, score calculation, progress storage, database communication, and administrative management.

### Backend Responsibilities

* User registration and login
* Session-based authentication
* Logout through backend endpoint
* CSRF-protected API communication
* Course structure management
* Multilingual course content processing
* Quiz answer validation
* Backend score calculation
* Quiz result saving
* User progress tracking
* Course enrollment tracking
* PostgreSQL-ready SQL database management
* Django Admin management interface

### Backend Structure

```text
backend/
│
├── config/
│   ├── settings.py
│   ├── urls.py
│   ├── wsgi.py
│   └── asgi.py
│
├── courses/
│   ├── models.py
│   ├── views.py
│   ├── urls.py
│   ├── admin.py
│   ├── forms.py
│   ├── middleware.py
│   ├── migrations/
│   ├── templates/
│   │   ├── login.html
│   │   └── register.html
│   └── management/
│       └── commands/
│
└── manage.py
```

## Database

The platform uses an SQL database structure prepared for PostgreSQL. The database stores the main educational and assessment entities of the system.

### Main Stored Data

* Registered users
* Course enrollments
* 7 course sections
* 26 learning modules
* Structured lessons
* Multilingual lesson content
* Quiz questions
* Answer options
* Correct answers
* Base points and penalty points
* Media links for lessons and questions
* User progress
* Quiz results
* Detailed result logs

### Main Database Models

```text
User
CourseEnrollment
Section
Module
Lesson
Question
UserProgress
QuizResult
```

### Course Structure

```text
Section
  └── Module
        └── Lesson
              └── Question
```

### User Assessment Structure

```text
User
  ├── CourseEnrollment
  ├── UserProgress
  └── QuizResult
```

## Scoring Logic

Quiz scoring is calculated on the Django backend. The frontend sends selected answers to the backend, and Django validates them using the stored correct answers and scoring parameters.

The implemented scoring formula is:

```text
If correct:
S += Bi

If incorrect:
S += Bi - Pi
```

Where:

```text
S  = final score
Bi = base points for the question
Pi = penalty points for the question
```

Example:

```text
base_points = 10
penalty_points = 5

Correct answer   = 10 points
Incorrect answer = 5 points
```

For two questions:

```text
2 correct answers = 20 / 20
1 correct answer  = 15 / 20
0 correct answers = 10 / 20
```

The result is saved in the `QuizResult` table together with score, maximum score, correct answer count, total number of questions, timestamp, and detailed JSON information.

## API Endpoints

The backend provides API endpoints for authentication, course loading, progress saving, and logout.

```text
GET  /api/csrf/
GET  /api/me/
GET  /api/course-data/
GET  /api/course-data/?lang=ru
GET  /api/course-data/?lang=kz
GET  /api/course-data/?lang=kk
GET  /api/course-data/?lang=en
POST /api/progress/
POST /api/logout/
```

### API Purpose

* `/api/csrf/` — initializes CSRF protection
* `/api/me/` — returns the current authenticated user
* `/api/course-data/` — returns course sections, modules, lessons, questions, media, and scoring fields
* `/api/progress/` — validates quiz answers, calculates score, and saves result
* `/api/logout/` — logs out the current user

## Multilingual Support

The platform supports three languages:

```text
Russian
Kazakh
English
```

Multilingual content is stored at the database level using separate fields:

```text
title_ru / title_kz / title_en
content_ru / content_kz / content_en
question_ru / question_kz / question_en
option_a_ru / option_a_kz / option_a_en
option_b_ru / option_b_kz / option_b_en
option_c_ru / option_c_kz / option_c_en
```

The backend supports the following language parameters:

```text
?lang=ru
?lang=kz
?lang=kk
?lang=en
```

The `kk` value is normalized as `kz` on the backend.

## Admin Panel

Django Admin is used as the course management panel.

Admin URL:

```text
http://127.0.0.1:8000/admin/
```

Through Django Admin, administrators can manage:

* Users
* Course enrollments
* Sections
* Modules
* Lessons
* Quiz questions
* Correct answers
* Base points and penalty points
* Media URLs
* User progress
* Quiz results

This allows training content and assessment parameters to be updated without changing the frontend code.

## Frontend

The frontend is implemented with React and Vite. It provides the user interface for the homepage, platform dashboard, course lessons, quizzes, reference directory, simulators, grades, resources, and certificate progress.

### Frontend Responsibilities

* Public homepage
* Language switching
* Platform layout and navigation
* Course section and module display
* Lesson rendering
* Quiz interface
* Real-time progress visualization
* Grades dashboard
* Certificate progress interface
* ISI reference directory
* Railway signal light cards
* Resource library
* Scenario-based simulators
* API communication with Django backend

### Frontend Structure

```text
frontend/
│
├── public/
│
├── src/
│   ├── components/
│   │   ├── homepage/
│   │   └── platform/
│   │
│   ├── pages/
│   │   └── platformPage/
│   │
│   ├── api.js
│   ├── App.jsx
│   ├── main.jsx
│   └── translations.js
│
├── index.html
├── package.json
└── vite.config.js
```

## Frontend and Backend Connection

The backend runs on:

```text
http://127.0.0.1:8000/
```

The frontend runs on:

```text
http://127.0.0.1:5173/
```

React communicates with Django through API requests. Django validates the user session, retrieves or updates data in the SQL database, and returns JSON responses.

Example workflow:

```text
React requests course data
        ↓
Django checks authentication
        ↓
Django retrieves data from SQL
        ↓
Django returns JSON response
        ↓
React displays course content
```

## Local Development Setup

### Backend Setup

Open the backend folder:

```powershell
cd backend
```

Run the Django backend server:

```powershell
.\.venv\Scripts\python.exe manage.py runserver
```

Backend URL:

```text
http://127.0.0.1:8000/
```

### Frontend Setup

Open the frontend folder:

```powershell
cd frontend
```

Install dependencies:

```powershell
npm install
```

Run the React/Vite development server:

```powershell
npm run dev -- --host 127.0.0.1
```

Frontend URL:

```text
http://127.0.0.1:5173/
```

## Demo Workflow

A typical demonstration flow:

1. Open the homepage.
2. Switch between Russian, Kazakh, and English.
3. Register or log in.
4. Enter the learning platform.
5. Open the course program.
6. View 7 sections and 26 modules.
7. Open a lesson.
8. Study theory and media content.
9. Complete a quiz.
10. View the calculated result.
11. Open the ISI reference directory.
12. Study railway signal light cards.
13. Open the resource library.
14. Open scenario-based simulators.
15. View grades and progress.
16. Open Django Admin.
17. Show course content and saved quiz results.
18. Open pgAdmin and show SQL records.

## Authors / Responsibilities

### Issabay Kamila

* Backend and data-management implementation
* Django server logic
* SQL database structure
* Registration, login, and logout mechanisms
* API-supported course data processing
* Interactive ISI reference directory
* Railway signal light cards
* Resource library

### Kabylbek Takhmina

* Frontend and interaction implementation
* React-based user interface development
* Homepage and platform structure
* Course navigation
* Visual learning components
* Scenario-based simulators
* Practical training screens
* Operational visualization
* User-facing learning flow for railway signaling education

## Suggested GitHub Topicss

```text
django
react
vite
postgresql
e-learning
railway-signaling
lms
multilingual
django-admin
quiz-platform
```

## Notes

Before making the repository public, remove sensitive files and data such as:

```text
.env
SECRET_KEY
database passwords
personal data
local database files
.venv/
node_modules/
```

Recommended `.gitignore` entries:

```gitignore
.env
.venv/
__pycache__/
*.pyc
db.sqlite3
node_modules/
dist/
.DS_Store
```

## License

This project was developed as a diploma project for educational purposes.
