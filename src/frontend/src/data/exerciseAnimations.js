import squatAnim      from '../assets/animations/squat.json';
import treadmillAnim  from '../assets/animations/treadmill.json';
import cyclingAnim    from '../assets/animations/Cycling.json';
import barbellCurl    from '../assets/animations/Barbell curl.json';
import chinupAnim     from '../assets/animations/Chinup animation.json';
import legPressAnim   from '../assets/animations/Leg press.json';
import sitUpAnim      from '../assets/animations/Man Doing Sit Up Exercise for ABS.json';
import plankAnim      from '../assets/animations/T Plank Exercise.json';

/**
 * Exact 1:1 map — exercise name from exercises.json → Lottie animation.
 * Only add an entry when the animation visually matches the exact exercise.
 */
export const EXERCISE_ANIMATIONS = {
  // Squat — animation shows standard squat movement
  'Barbell Squat':          squatAnim,
  'Bodyweight Squat':       squatAnim,

  // Treadmill — animation shows person on a treadmill
  'Running, Treadmill':     treadmillAnim,
  'Jogging, Treadmill':     treadmillAnim,
  'Walking, Treadmill':     treadmillAnim,

  // Cycling — animation shows person cycling
  'Bicycling':              cyclingAnim,
  'Bicycling, Stationary':  cyclingAnim,

  // Barbell Curl — animation shows barbell curl
  'Barbell Curl':           barbellCurl,

  // Chin-Up — animation shows chin-up on pull-up bar
  'Chin-Up':                chinupAnim,

  // Leg Press — animation shows leg press machine
  'Leg Press':              legPressAnim,

  // Sit-Up — animation shows sit-up movement
  'Sit-Up':                 sitUpAnim,

  // Plank — animation shows plank hold
  'Plank':                  plankAnim,
};

/**
 * Returns the Lottie animation data for a given exercise name, or null if none exists.
 */
export function getExerciseAnimation(name) {
  return EXERCISE_ANIMATIONS[name] ?? null;
}
