# AI Assessment Platform

A modern, full-stack Learning Management System (LMS) and Online Examination Platform built with **Flask** and **React**. The system enables schools to manage exams, teachers, students, analytics, and secure online assessments through a role-based architecture.

---

## Features

### Authentication

* Role-based authentication
* Secure session management
* Password change functionality
* Protected API endpoints

### Super Admin

* School management
* Subscription & validity management
* Global analytics dashboard
* School performance monitoring

### School Admin

* Teacher management
* Student management
* Exam oversight
* School analytics

### Teacher

* Create and manage exams
* Question bank management
* Schedule examinations
* Student performance analytics
* AI-powered insights

### Student

* Quiz registration
* Secure online examination
* Multiple attempt support
* Detailed result analysis
* Question review
* Performance dashboard

---

## Technology Stack

### Frontend

* React
* React Router
* Tailwind CSS
* Zustand
* Axios
* Lucide React

### Backend

* Flask
* Flask-Login
* SQLAlchemy
* REST API Architecture

### Database

* MySQL

---

## Project Structure

```
AI-Assessment-Platform/
│
├── smart_exam_system/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── migrations/
│   └── app.py
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── stores/
│   │   └── utils/
│   └── package.json
│
└── README.md
```

---

## Key Features

* Role-based access control
* School isolation architecture
* Multi-attempt examination system
* Auto submission
* Time limit enforcement
* Tab switch violation detection
* Student result review
* AI analytics dashboard
* Responsive React UI
* RESTful backend architecture

---

## Installation

### Backend

```bash
git clone <repository-url>
cd AI-Assessment-Platform

python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

pip install -r requirements.txt

flask db upgrade

python run.py
```

---

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Environment Variables

Create a `.env` file for backend configuration.

Example:

```
SECRET_KEY=

DATABASE_URL=

GEMINI_API_KEY=

CORS_ORIGINS=http://localhost:3000

TESSERACT_CMD=  
```

---

## Current Status

* Jinja frontend fully migrated to React
* API-first backend architecture
* Modern responsive dashboard
* Production-oriented component structure
* Performance optimized React application

---

## Future Enhancements

* PDF result export
* Shareable result links
* Email notifications
* Real-time monitoring
* AI-powered recommendations
* Advanced analytics

---

## License

This project is intended for educational and portfolio purposes.
