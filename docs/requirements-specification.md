# Requirements Specification
## Intelligent Fitness Application

**Version:** 1.0  
**Related:** [Project Management Plan](project-management-plan.md)

---

## 1. Introduction

This document specifies the functional and non-functional requirements for the Blue Falcons Fitness App (Intelligent Fitness Application). Requirements are traceable to the Project Management Plan and support the three-sprint MVP delivery.

---

## 2. Functional Requirements

### 2.1 User Management

| ID   | Requirement | Priority | Status / Notes |
|------|-------------|----------|----------------|
| FR-1 | The system shall allow users to register with a unique username, email, and password. | Must | Implemented: `POST /api/v1/register` |
| FR-2 | The system shall allow users to authenticate securely (login) and receive an access token. | Must | Implemented: `POST /api/v1/login/access-token` (OAuth2-style, JWT) |
| FR-3 | The system shall store passwords using secure hashing (e.g., bcrypt). | Must | Implemented: passlib/bcrypt |
| FR-4 | The system shall support user profile storage and management. | Must | Implemented: User model; profile data extended via FitnessRecord, FitnessGoal |

### 2.2 Onboarding & Goals

| ID   | Requirement | Priority | Status / Notes |
|------|-------------|----------|----------------|
| FR-5 | The system shall provide an onboarding quiz to capture fitness goals (e.g., weight loss, muscle gain, maintain, improve endurance). | Must | Implemented: `POST/GET/PUT /api/v1/onboarding/quiz`, `GET /api/v1/onboarding/status` |
| FR-6 | The system shall capture and persist user demographics and preferences (age, gender, height, weight, activity level, dietary preferences, allergies, limitations). | Must | Implemented: QuizSubmit schema, FitnessGoal model |
| FR-7 | The system shall compute and store derived health metrics (BMI, BMR, TDEE) from quiz inputs. | Must | Implemented: health_calculations module; stored on FitnessGoal |

### 2.3 Fitness Data & Tracking

| ID   | Requirement | Priority | Status / Notes |
|------|-------------|----------|----------------|
| FR-8 | The system shall allow users to submit fitness/body data (e.g., weight, height, activity level, fitness goal). | Must | Implemented: `POST /api/v1/records` |
| FR-9 | The system shall allow users to retrieve their submitted fitness records. | Must | Implemented: `GET /api/v1/records` |
| FR-10 | The system shall allow users to track completed workouts. | Must | Planned (Sprint 2) |
| FR-11 | The system shall support favorites and completed workout tracking. | Should | Planned (Sprint 2) |

### 2.4 Workout & Nutrition

| ID   | Requirement | Priority | Status / Notes |
|------|-------------|----------|----------------|
| FR-12 | The system shall generate personalized workout plans based on user goals. | Must | Planned (Sprint 2) |
| FR-13 | The system shall generate diet recommendations aligned with fitness objectives. | Must | Planned (Sprint 2) |
| FR-14 | The system shall provide supplement suggestions based on user goals. | Should | Planned (Sprint 2) |
| FR-15 | The system shall organize workouts by muscle group. | Should | Planned (Sprint 2) |

### 2.5 AI Reports & Analytics

| ID   | Requirement | Priority | Status / Notes |
|------|-------------|----------|----------------|
| FR-16 | The system shall generate AI-based fitness/advice reports using user data. | Must | Implemented: `POST /api/v1/reports/generate` (async queue + LLM or mock) |
| FR-17 | The system shall display progress metrics on a personalized dashboard. | Must | Planned (Sprint 3) |
| FR-18 | The system shall allow users to view their report history. | Must | Backend: FitnessReport model; GET endpoint TBD |

### 2.6 Optional / Future

| ID   | Requirement | Priority | Status / Notes |
|------|-------------|----------|----------------|
| FR-19 | The system shall evaluate scanned food items (UPC simulation) relative to user goals. | Could | Planned (Sprint 3, time allowing) |

---

## 3. Non-Functional Requirements

### 3.1 Performance

| ID    | Requirement | Priority |
|-------|-------------|----------|
| NFR-1 | System response time for plan generation shall not exceed 3 seconds where applicable. | Must |
| NFR-2 | Report generation may be asynchronous; user shall receive timely feedback (e.g., “queued” or “processing”). | Must |

### 3.2 Security

| ID    | Requirement | Priority |
|-------|-------------|----------|
| NFR-3 | Passwords shall be securely stored using appropriate hashing techniques (e.g., bcrypt). | Must |
| NFR-4 | Authenticated API endpoints shall require a valid JWT access token. | Must |
| NFR-5 | Users shall only access their own data (records, goals, reports). | Must |

### 3.3 Usability & Maintainability

| ID    | Requirement | Priority |
|-------|-------------|----------|
| NFR-6 | The user interface shall be intuitive and accessible. | Should |
| NFR-7 | The architecture shall be modular to support maintainability and testing. | Must |
| NFR-8 | The system shall follow version control best practices (e.g., Git/Bitbucket). | Must |

### 3.4 Operations

| ID    | Requirement | Priority |
|-------|-------------|----------|
| NFR-9 | The application shall support running without an LLM (mock mode) for development and demo. | Should |
| NFR-10 | API shall be documented (e.g., OpenAPI/Swagger). | Must |

---

## 4. Traceability

- **Epic 1 (User Management):** FR-1–FR-4, NFR-3, NFR-4, NFR-5  
- **Epic 2 (Onboarding):** FR-5–FR-7  
- **Epic 3 (Workout Engine):** FR-10, FR-11, FR-12, FR-15  
- **Epic 4 (Nutrition):** FR-13, FR-14, FR-19  
- **Epic 5 (Dashboard/Analytics):** FR-8, FR-9, FR-16–FR-18, NFR-1, NFR-2  
- **Epic 6 (Testing & Documentation):** NFR-7, NFR-8, NFR-10  

---

## 5. Document History

| Version | Date       | Author | Changes     |
|---------|------------|--------|-------------|
| 1.0     | 2026-03-07 | —      | Initial draft |
