# Falcon Fitness Frontend

React + Vite frontend for the Blue Falcons Fitness App.

---

## Current Frontend Features

- Authentication pages (`/login`, `/signup`)
- Core app pages (`/dashboard`, `/profile`, `/about`, `/features`)
- Onboarding quiz (`/quiz`)
- Workouts and details (`/workouts`, `/workouts/:slug`)
- Nutrition and diet plan pages (`/nutrition`, `/nutrition/:slug`, `/diet-plan`)
- Reports and history (`/reports`, `/history`)
- Community forum (`/forum`, `/forum/:postId`)
- Chat (`/chat`)
- Premium/upgrade flow (`/upgrade`)
- Fallback 404 route

---

## Tech Stack

- React
- React Router
- Vite
- Axios
- JavaScript + CSS

---

## Configuration

Create `src/frontend/.env`:

```env
VITE_API_URL=http://localhost:8000
```

If unset, some modules fall back to `http://localhost:8000`, but setting `VITE_API_URL` is recommended for all environments.

---

## Development

From `src/frontend`:

```bash
npm install
npm run dev
```

Default dev URL: `http://localhost:5173`

---

## Build and Preview

From `src/frontend`:

```bash
npm run build
npm run preview
```