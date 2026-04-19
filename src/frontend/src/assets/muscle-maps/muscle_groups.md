# Muscle groups ↔ SVG zones

Muscle **group keys** match the database / API enum used for `primaryMuscles` and `secondaryMuscles` (see `MUSCLE_GROUP_ENUM` in `src/data/muscleGroups.js`). **SVG path `id`s are unchanged** — this file maps each enum value to the path ids on `Front_map.svg` and `Back_map.svg`.

## Heat map weights

When painting from API data, **`primaryMuscles` → weight 1**, **`secondaryMuscles` → weight 0.5** per group (then expanded to every zone in that group). Overlapping zones take the **max** of contributing groups. Use `expandPrimarySecondaryIntensities()` or pass `primaryMuscles` / `secondaryMuscles` into `MuscleHeatMap`.

---

## Enum → SVG path ids

### abdominals

- ab1_left, ab2_left, ab3_left, ab4_left
- ab1_right, ab2_right, ab3_right, ab4_right
- obliques_left, obliques_right

### abductors

- abductor_left, abductor_right

### adductors

- (none on current maps)

### biceps

- biceps_left, biceps_right

### calves

- calves_left, calves_right
- rear_calves_left, rear_calves_right

### chest

- chest_left, chest_right

### forearms

- forearms_left, forearms_right
- rear_forearms_left, rear_forearms_right

### glutes

- glutes_left, glutes_right

### hamstrings

- hamstrings_left, hamstrings_right

### lats

- lats_left, lats_right

### lower back

- lower_back

### middle back

- traps_mid, traps_lower

### neck

- traps_upper _(back)_
- traps_left, traps_right _(front — upper trap band; closest to a dedicated “neck” read on the silhouette)_

### quadriceps

- quads_left, quads_right

### shoulders

- delts_left, delts_right
- rear_delts_left, rear_delts_right

### traps

- traps_upper, traps_mid, traps_lower
- traps_left, traps_right

### triceps

- triceps_left, triceps_right

---

## Front-only path ids (26)

traps_left, traps_right, chest_left, chest_right, delts_left, delts_right, biceps_left, biceps_right, forearms_left, forearms_right, ab1–ab4 left/right, obliques_left, obliques_right, quads_left, quads_right, abductor_left, abductor_right, calves_left, calves_right

## Back-only path ids (18)

traps_upper, traps_mid, traps_lower, rear_delts_left, rear_delts_right, triceps_left, triceps_right, rear_forearms_left, rear_forearms_right, lats_left, lats_right, lower_back, glutes_left, glutes_right, hamstrings_left, hamstrings_right, rear_calves_left, rear_calves_right
