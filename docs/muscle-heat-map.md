# Muscle heat map (frontend)

**Audience:** Developers joining the project or wiring workouts / analytics to the body map.  
**Related requirement:** FR-15 (organize workouts by muscle group) — visualization layer.  
**Related architecture:** [System overview](architecture.md) § Frontend.

---

## 1. What it does

The heat map shows **front** and/or **back** silhouettes. Each colored region is an SVG `<path>` with an **`id`** that matches our zone naming. **Intensity** (0–1) per zone controls fill and stroke color: higher values read as “more load” for that area.

Workouts and APIs should use the **same muscle group strings as the DB** (see `MUSCLE_GROUP_ENUM` in `muscleGroups.js`, e.g. `chest`, `lats`, `"lower back"`). The UI expands each group to **one or many SVG zone ids** (e.g. `chest_left`, `chest_right`) before painting.

---

## 2. Where the code lives

| Piece | Path |
|--------|------|
| React component | `src/frontend/src/components/MuscleHeatMap.jsx` |
| Group → zone mapping + aggregators | `src/frontend/src/data/muscleGroups.js` |
| Inkscape source SVGs (edit here, then run strip script) | `src/muscle-map-sources/*.inkscape.svg` (see `scripts/strip_svg_inkscape.py`) |
| SVG assets (stripped for web; bundled by Vite) | `src/frontend/src/assets/muscle-maps/Front_map.svg`, `Back_map.svg` |
| Human-readable zone / group list | `src/frontend/src/assets/muscle-maps/muscle_groups.md` |

---

## 3. How data flows into the map

1. **Input (preferred for DB-shaped data):** `primaryMuscles` and `secondaryMuscles` — arrays of enum strings. **Primary → weight 1**, **secondary → weight 0.5** per group (`MUSCLE_PRIMARY_WEIGHT` / `MUSCLE_SECONDARY_WEIGHT`). Use `expandPrimarySecondaryIntensities()` or pass these props into `MuscleHeatMap` directly.
2. **Input (numeric per group):** `groupIntensities` — keys are **muscle group** names from `MUSCLE_GROUP_ZONES`. Values are numbers ≥ 0 (typically 0–1 after normalization, or raw units you normalize yourself).
3. **Expand:** `expandGroupIntensities()` copies each group’s score to **every SVG path id** in that group; if a zone appears in multiple groups, the **max** wins.
4. **Input (alternate):** `intensities` — already keyed by **SVG path id**. Used when the group-based inputs are empty or omitted.
5. **Paint:** After the SVG is inlined into the DOM, `paintZones()` walks `#layer2 path[id]`, skips `body_outline`, and sets `fill` / `stroke` from each path’s intensity.

**Normalization (optional, for display):**

- `normalizeGroupScores(scores)` — scales positive values so the largest is `1.0`.
- `sumGroupScores(workouts)` then `normalizeGroupScores()` — pattern for “combined week” style aggregates (e.g. analytics over many sessions). Each workout can use either **`groupScores`** or **`primaryMuscles` / `secondaryMuscles`**; `getWorkoutGroupScores()` normalizes to a single per-group map for aggregation.

---

## 4. Component API (`MuscleHeatMap`)

| Prop | Type | Default | Notes |
|------|------|---------|--------|
| `bothSides` | boolean | `false` | If true, renders front + back in one row (e.g. plan summary on Workouts). |
| `side` | `'front' \| 'back'` | `'front'` | Used when `bothSides` is false. |
| `primaryMuscles` | `string[]` | — | DB enum; weight 1 per group when expanding (preferred when set). |
| `secondaryMuscles` | `string[]` | — | DB enum; weight 0.5 per group when expanding. |
| `groupIntensities` | `Record<string, number>` | — | Explicit weights per muscle group (used when primary/secondary are absent). |
| `intensities` | `Record<string, number>` | `{}` | Per-SVG-zone ids when not using groups. |
| `className`, `style` | — | — | Passed to the outer wrapper. |

---

## 5. SVG conventions (do not break without updating the component)

- Muscle paths live under **`#layer2`**.
- Each colored muscle is a **`<path id="…">`** with a stable id (see `muscle_groups.md`).
- **`body_outline`** is the silhouette outline and is **not** heat-colored.

If you edit maps in Inkscape (or similar), save sources under **`src/muscle-map-sources/`** (`*.inkscape.svg`), run **`python scripts/strip_svg_inkscape.py`**, then commit the updated files under `src/frontend/src/assets/muscle-maps/`. Keep path **`id`s** stable or update `MUSCLE_GROUP_ZONES` and `muscle_groups.md` together.

---

## 6. Seeing it in the app

With the frontend dev server running (`npm run dev` in `src/frontend`), open **`/workouts`** while logged in with an active plan. The plan-level heat map and per-exercise maps use `MuscleHeatMap` with real plan data.

---

## 7. Integrating real workouts (backend / DB)

There is **no dedicated API yet**; the contract in code today is:

- Prefer **`primaryMuscles` / `secondaryMuscles`** arrays (same enum as exercises in the DB). The heat map maps them to weights **1** and **0.5** and expands to SVG zones.
- Alternatively, persist **`groupScores: Record<string, number>`** per workout using keys from `MUSCLE_GROUP_ZONES`.
- The frontend can **`normalizeGroupScores`** for a single session or **`aggregateNormalizedGroups`** for a date range; **`getWorkoutGroupScores`** accepts either shape per workout.

The Workouts page already adapts plan exercises to `groupIntensities`; other screens can use the same helpers from `muscleGroups.js` with your API response.

---

## 8. Document history

| Version | Date | Notes |
|---------|------|--------|
| 1.0 | 2026-04-12 | Initial developer guide |
| 1.1 | 2026-04-19 | Removed standalone demo page; heat map lives on Workouts. |
| 1.2 | 2026-04-19 | Renamed `src/component` → `src/muscle-map-sources` (Inkscape inputs). |
