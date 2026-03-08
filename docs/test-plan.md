# Test Plan
## Intelligent Fitness Application (Blue Falcons Fitness App)

**Version:** 1.0  
**Related:** [Project Management Plan](project-management-plan.md) §9 (QA Plan), [Requirements Specification](requirements-specification.md)

---

## 1. Purpose and Scope

This test plan defines the approach to verifying the Blue Falcons Fitness App against the requirements and quality goals in the PMP. It covers unit, integration, API, and manual UI testing, and can be extended with automated acceptance tests as the project grows.

---

## 2. Test Objectives

- Validate functional requirements (registration, login, quiz, fitness records, report generation).
- Validate non-functional requirements (security, response behavior, modularity).
- Support regression safety before releases and sprint demos.
- Provide a clear structure for logging and tracking test results (e.g. in Jira or a test log).

---

## 3. Test Levels and Types

### 3.1 Unit Tests

**Scope:** Isolated functions and small modules (e.g. health calculations, security helpers, pure business logic).

**Targets (examples):**

| Component | What to test |
|-----------|----------------------|
| `src/core/health_calculations.py` | `calculate_bmi`, `calculate_bmr`, `calculate_tdee` for known inputs (edge cases: zero height, each activity level, male/female/other). |
| `src/core/security.py` | Password hash and verify (round-trip, wrong password fails). |
| Validation logic in schemas | Invalid payloads rejected (e.g. age out of range, missing required fields). |

**Environment:** pytest (or unittest); no DB/Redis required for pure functions; mock DB for code that touches sessions if needed.

**Success criteria:** All unit tests pass; coverage can be tracked for critical modules (e.g. health_calculations, security).

---

### 3.2 Integration Tests

**Scope:** Components working together: API + database, API + Redis, background worker + queue + DB.

**Targets (examples):**

| Scenario | What to test |
|----------|----------------------|
| Database | Create User, FitnessRecord, FitnessGoal, FitnessReport via CRUD; verify relationships and constraints. |
| Auth flow | Register → Login → access protected endpoint with token; access without token returns 401. |
| Quiz flow | Submit quiz → GET quiz → PUT quiz; verify BMI/BMR/TDEE stored and updated. |
| Report queue | Enqueue report task; worker consumes and persists FitnessReport (optional: mock LLM). |

**Environment:** pytest (or similar); real or test SQLite DB; Redis (local or test instance). Use test config/DB URL to avoid touching production data.

**Success criteria:** All integration tests pass; no leftover test data in shared DB when using a dedicated test database.

---

### 3.3 API (Contract) Tests

**Scope:** HTTP API behavior: status codes, response shape, and basic error handling.

**Targets:**

| Area | Examples |
|------|----------|
| Auth | POST `/api/v1/register` (201, 400 duplicate); POST `/api/v1/login/access-token` (200 with token, 401 invalid). |
| Fitness records | POST `/api/v1/records` with valid/invalid body (201 vs 422); GET `/api/v1/records` with/without token (200 vs 401). |
| Onboarding | POST/GET/PUT `/api/v1/onboarding/quiz`, GET `/api/v1/onboarding/status` (auth required; 200/201/404/400 as specified). |
| Reports | POST `/api/v1/reports/generate` (202 when data exists; 400 when no records). |
| Health | GET `/health` returns 200 and expected keys. |

**Tools:** pytest with `httpx` or `requests` against a running app or TestClient; or Postman/Insomnia collections for manual runs.

**Success criteria:** Documented endpoints behave as in FastAPI’s OpenAPI docs (`/docs`); errors return expected status and body shape.

---

### 3.4 Manual UI Testing

**Scope:** Frontend flows in the browser (navigation, forms, future API integration).

**Targets (current and planned):**

| Flow | Steps to verify |
|------|------------------|
| Navigation | All routes load (Home, Features, About, Login, Sign Up); links and back behavior. |
| Registration / Login | When wired: submit form, check token storage, redirect or error message. |
| Onboarding quiz | When wired: submit quiz, see success/error; view/retake quiz. |
| Dashboard / Records | When implemented: view records, request report, view report history. |

**Environment:** Local dev (backend + frontend); browser(s) per team policy.

**Success criteria:** No broken layouts or console errors; critical user paths complete without blocking bugs. Findings logged (e.g. Jira) and prioritized.

---

### 3.5 Acceptance Testing

**Scope:** Align with user stories and acceptance criteria in Jira.

**Approach:** For each story (or feature), define 1–3 acceptance criteria and a short test procedure (steps + expected result). Run after feature is merged or at end of sprint.

**Examples:**

- “As a user I can register so that I have an account” → Register with valid data → 201 and user in DB; login with same credentials returns token.
- “As a user I can complete the onboarding quiz so that my goals are saved” → Submit quiz → GET quiz returns same data with BMI/BMR/TDEE; status returns completed.

**Success criteria:** All acceptance criteria for the sprint are verified and signed off (e.g. by Product Owner or lead).

---

## 4. Test Environment and Data

- **Backend:** Python 3.x; dependencies from `requirements.txt`; `.env` for config (use a test `.env` or override for test DB/Redis if needed).
- **Database:** Prefer a separate SQLite file or in-memory DB for automated tests to avoid polluting dev data.
- **Redis:** Local or Docker; optionally a dedicated DB index for tests.
- **Frontend:** Local build (`npm run dev` or `npm run build`); no special test env required for manual UI testing initially.

---

## 5. Test Execution and Schedule

| Phase | When | Who | Notes |
|-------|------|-----|--------|
| Unit | On commit or PR (dev machines or CI) | Developer | Fast feedback. |
| Integration | On PR or before merge to main | Developer / QA | Requires DB + Redis. |
| API | On PR or before release; also manual smoke | Developer / QA | Can be automated with TestClient or HTTP client. |
| Manual UI | Per sprint or before demo | Dev / QA / PO | Follow checklist derived from §3.4. |
| Acceptance | End of sprint / feature complete | Team / PO | Per story acceptance criteria. |

Defects found during any phase should be logged (e.g. Jira) and linked to requirements or user stories where applicable.

---

## 6. Deliverables and Traceability

- **Test cases / checklist:** Can be maintained in Jira (test cases or checklist in stories) or in a simple list in this repo (e.g. `docs/test-cases.md`).
- **Results:** Pass/fail and notes (sprint test log or Jira).
- **Traceability:** Requirements (e.g. [Requirements Specification](requirements-specification.md)) and PMP §9 (QA) are the source; this plan maps test levels to those requirements.

---

## 7. Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Flaky tests (e.g. timing with async/Redis) | Use timeouts, retries, or mocks where appropriate; keep integration tests stable. |
| Test data leaking into dev | Use separate test DB/Redis index and cleanup in test teardown. |
| Limited automation early | Start with API tests and health-calculation unit tests; add integration and UI automation incrementally. |

---

## 8. Document History

| Version | Date       | Author | Changes     |
|---------|------------|--------|-------------|
| 1.0     | 2026-03-07 | —      | Initial draft |
