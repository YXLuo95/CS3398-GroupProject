/**
 * Muscle groups → SVG path ids (see assets/muscle-maps/muscle_groups.md).
 * Keys match primaryMuscles / secondaryMuscles API enum (string literals with spaces).
 * Workout load is tracked per group; expandGroupIntensities() maps to zones for painting.
 */

/** Weight for primaryMuscles when expanding to the heat map (secondary uses `MUSCLE_SECONDARY_WEIGHT`). */
export const MUSCLE_PRIMARY_WEIGHT = 1;
export const MUSCLE_SECONDARY_WEIGHT = 0.5;

/**
 * Allowed muscle group keys (Exercise / workout API enum).
 * @readonly @type {readonly string[]}
 */
export const MUSCLE_GROUP_ENUM = [
  "abdominals",
  "abductors",
  "adductors",
  "biceps",
  "calves",
  "chest",
  "forearms",
  "glutes",
  "hamstrings",
  "lats",
  "lower back",
  "middle back",
  "neck",
  "quadriceps",
  "shoulders",
  "traps",
  "triceps",
];

/** @type {Record<string, string[]>} */
export const MUSCLE_GROUP_ZONES = {
  abdominals: [
    "ab1_left",
    "ab2_left",
    "ab3_left",
    "ab4_left",
    "ab1_right",
    "ab2_right",
    "ab3_right",
    "ab4_right",
    "obliques_left",
    "obliques_right",
  ],
  abductors: ["abductor_left", "abductor_right"],
  /** Inner thigh — no dedicated paths on current maps */
  adductors: [],
  biceps: ["biceps_left", "biceps_right"],
  calves: ["calves_left", "calves_right", "rear_calves_left", "rear_calves_right"],
  chest: ["chest_left", "chest_right"],
  forearms: ["forearms_left", "forearms_right", "rear_forearms_left", "rear_forearms_right"],
  glutes: ["glutes_left", "glutes_right"],
  hamstrings: ["hamstrings_left", "hamstrings_right"],
  lats: ["lats_left", "lats_right"],
  "lower back": ["lower_back"],
  /** Rhomboids / mid-thoracic region — closest available zones */
  "middle back": ["traps_mid", "traps_lower"],
  /** Approximated with upper trapezius zones (no dedicated neck paths) */
  neck: ["traps_upper", "traps_left", "traps_right"],
  quadriceps: ["quads_left", "quads_right"],
  shoulders: ["delts_left", "delts_right", "rear_delts_left", "rear_delts_right"],
  traps: ["traps_upper", "traps_mid", "traps_lower", "traps_left", "traps_right"],
  triceps: ["triceps_left", "triceps_right"],
};

/**
 * @param {Record<string, number>} groupScores 0–1 or raw units (caller normalizes)
 * @returns {Record<string, number>} intensity per SVG zone id
 */
export function expandGroupIntensities(groupScores) {
  /** @type {Record<string, number>} */
  const out = {};
  for (const [group, t] of Object.entries(groupScores)) {
    if (t == null || t <= 0) continue;
    const zones = MUSCLE_GROUP_ZONES[group];
    if (!zones) continue;
    for (const z of zones) {
      out[z] = Math.max(out[z] || 0, t);
    }
  }
  return out;
}

/**
 * Maps API primary/secondary lists to per-group weights, then to SVG zones.
 * If a muscle appears in both lists, primary ({@link MUSCLE_PRIMARY_WEIGHT}) wins.
 *
 * @param {{ primaryMuscles?: string[], secondaryMuscles?: string[] }} muscles
 * @returns {Record<string, number>} per-group weights (1 or 0.5) before zone expansion
 */
export function buildGroupScoresFromPrimarySecondary({
  primaryMuscles = [],
  secondaryMuscles = [],
}) {
  /** @type {Record<string, number>} */
  const groupScores = {};
  for (const m of secondaryMuscles) {
    if (!MUSCLE_GROUP_ZONES[m]) continue;
    groupScores[m] = Math.max(groupScores[m] ?? 0, MUSCLE_SECONDARY_WEIGHT);
  }
  for (const m of primaryMuscles) {
    if (!MUSCLE_GROUP_ZONES[m]) continue;
    groupScores[m] = Math.max(groupScores[m] ?? 0, MUSCLE_PRIMARY_WEIGHT);
  }
  return groupScores;
}

/**
 * @param {{ primaryMuscles?: string[], secondaryMuscles?: string[] }} params
 * @returns {Record<string, number>} intensity per SVG zone id
 */
export function expandPrimarySecondaryIntensities(params) {
  return expandGroupIntensities(buildGroupScoresFromPrimarySecondary(params));
}

/**
 * Resolves either legacy `groupScores` or DB-style primary/secondary arrays to a single per-group map.
 *
 * @param {{ groupScores?: Record<string, number>, primaryMuscles?: string[], secondaryMuscles?: string[] }} workout
 * @returns {Record<string, number>}
 */
export function getWorkoutGroupScores(workout) {
  const hasPs =
    (workout.primaryMuscles?.length ?? 0) > 0 || (workout.secondaryMuscles?.length ?? 0) > 0;
  if (hasPs) return buildGroupScoresFromPrimarySecondary(workout);
  return workout.groupScores ?? {};
}

/**
 * @param {Record<string, number>} scores
 * @returns {Record<string, number>} same keys, values in [0, 1], max value = 1
 */
export function normalizeGroupScores(scores) {
  const vals = Object.values(scores).filter((v) => v > 0);
  if (vals.length === 0) return {};
  const max = Math.max(...vals, 1e-9);
  /** @type {Record<string, number>} */
  const out = {};
  for (const [k, v] of Object.entries(scores)) {
    if (v > 0) out[k] = v / max;
  }
  return out;
}

/**
 * @param {{ groupScores: Record<string, number> }[]} workouts
 * @returns {Record<string, number>}
 */
export function sumGroupScores(workouts) {
  /** @type {Record<string, number>} */
  const out = {};
  for (const w of workouts) {
    const scores = getWorkoutGroupScores(w);
    for (const [k, v] of Object.entries(scores)) {
      out[k] = (out[k] || 0) + v;
    }
  }
  return out;
}

/**
 * @param {{ groupScores: Record<string, number> }[]} workouts
 * @returns {Record<string, number>}
 */
export function aggregateNormalizedGroups(workouts) {
  return normalizeGroupScores(sumGroupScores(workouts));
}
