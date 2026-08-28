# AI Recruitment System

An AI-powered recruitment platform designed to simplify and automate the candidate recruitment process.

The system helps HR and recruiters manage candidates, process resumes, create job descriptions, rank candidates, conduct AI-assisted interviews, and manage recruitment activities through a centralized web application.

---

## 🚀 Features

### 🔐 Recruiter Authentication

- Recruiter signup and registration
- Recruiter login
- JWT-based authentication
- Protected recruiter dashboard
- Forgot password functionality
- Password reset using a secure reset token
- Password reset token expiration
- Secure password hashing
- Recruiter account activation/deactivation

---

### 📄 Resume Management

- Upload candidate resumes
- Resume processing and text extraction
- OCR support for scanned/image-based resumes
- Candidate information extraction
- Candidate profile management

---

### 👤 Candidate Management

- View all candidates
- View individual candidate details
- Edit candidate information
- Manage candidate profiles
- Store candidate information in the database

---

### 💼 Job Description

- Create and manage job descriptions
- Use job requirements for candidate evaluation
- Generate recruitment-related content using AI

---

### 📊 Candidate Ranking

- Evaluate candidates based on job requirements
- AI-assisted candidate ranking
- Compare candidates based on extracted resume information
- Help recruiters identify suitable candidates

---

### 🤖 AI Recruiter / Chatbot

- AI-powered recruitment assistant
- Recruiters can interact with the AI through a chatbot interface
- Generate recruitment-related responses
- Assist recruiters with candidate-related tasks
- Support configurable LLM providers

The LLM used by the application can be configured according to the organization's requirements.

---

### 🎤 AI Candidate Interview

- Generate candidate interview links
- Candidates can access interviews through unique interview links
- Candidate interview page is publicly accessible through the generated link
- Candidates can answer interview questions without accessing the recruiter dashboard
- Interview responses can be processed by the recruitment system

---

### 📧 Email Support

The system includes an email service for features such as password-reset emails.

Email configuration is environment-based rather than hardcoded.

The application can be configured to work with different SMTP-compatible email providers, such as:

- Gmail
- Microsoft Outlook / Microsoft 365
- Zoho Mail
- Other SMTP-compatible email services

The email provider can be configured using environment variables.

---

## 🏗️ System Architecture

The application consists of a frontend, backend, database, and configurable AI/LLM components.

```text
                    ┌─────────────────────┐
                    │      Recruiter      │
                    │       (HR User)     │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   React Frontend    │
                    │                     │
                    │  Login / Signup     │
                    │  Dashboard          │
                    │  Candidates         │
                    │  Ranking            │
                    │  Interviews         │
                    │  Chatbot            │
                    └──────────┬──────────┘
                               │
                               │ API Requests
                               ▼
                    ┌─────────────────────┐
                    │    FastAPI Backend  │
                    │                     │
                    │ Authentication      │
                    │ Resume Processing   │
                    │ Candidate APIs      │
                    │ Interview APIs      │
                    │ AI Services         │
                    └───────┬───────┬─────┘
                            │       │
                ┌───────────┘       └────────────┐
                ▼                                ▼
       ┌─────────────────┐              ┌─────────────────┐
       │   PostgreSQL    │              │    LLM / AI     │
       │    Database     │              │                 │
       │                 │              │ Ollama / Other  │
       │ Recruiters      │              │ Configurable    │
       │ Candidates      │              │ LLM Provider    │
       │ Interviews      │              └─────────────────┘
       └─────────────────┘