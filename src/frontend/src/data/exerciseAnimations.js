import squatAnim    from '../assets/animations/squat.json';
import pushupAnim   from '../assets/animations/push_up.json';
import treadmillAnim from '../assets/animations/treadmill.json';
import cyclingAnim  from '../assets/animations/Cycling.json';

/**
 * Maps exact exercise names (from exercises.json / DB) to Lottie animation data.
 * Add more entries here as new animation JSONs are downloaded.
 */
export const EXERCISE_ANIMATIONS = {
  // Squat variations
  'Barbell Squat':               squatAnim,
  'Bodyweight Squat':            squatAnim,
  'Barbell Full Squat':          squatAnim,
  'Barbell Hack Squat':          squatAnim,
  'Barbell Side Split Squat':    squatAnim,
  'Dumbbell Squat':              squatAnim,
  'Goblet Squat':                squatAnim,

  // Push-up variations
  'Push-Up':                     pushupAnim,
  'Close-Grip Push-Up off of a Dumbbell': pushupAnim,
  'Decline Push-Up':             pushupAnim,
  'Incline Push-Up':             pushupAnim,
  'Incline Push-Up Close-Grip':  pushupAnim,
  'Wide-Grip Push-Up':           pushupAnim,
  'Clock Push-Up':               pushupAnim,
  'Handstand Push-Ups':          pushupAnim,

  // Treadmill / running cardio
  'Running, Treadmill':          treadmillAnim,
  'Jogging, Treadmill':          treadmillAnim,

  // Cycling cardio
  'Bicycling':                   cyclingAnim,
  'Bicycling, Stationary':       cyclingAnim,
  'Recumbent Bike':              cyclingAnim,
};

/**
 * Returns the Lottie animation data for a given exercise name, or null if none exists.
 */
export function getExerciseAnimation(name) {
  return EXERCISE_ANIMATIONS[name] ?? null;
}
