import { Exercise, WorkoutExercise, SavedWorkout } from './types';

const KEYS = {
  exercises: 'workout_app_exercises',
  currentWorkout: 'workout_app_current',
  workoutName: 'workout_app_name',
  savedWorkouts: 'workout_app_saved',
} as const;

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export const storage = {
  loadExercises: (): Exercise[] => load(KEYS.exercises, DEFAULT_EXERCISES),
  saveExercises: (exercises: Exercise[]) => save(KEYS.exercises, exercises),

  loadCurrentWorkout: (): WorkoutExercise[] => load(KEYS.currentWorkout, []),
  saveCurrentWorkout: (exercises: WorkoutExercise[]) => save(KEYS.currentWorkout, exercises),

  loadWorkoutName: (): string => load(KEYS.workoutName, 'New Workout'),
  saveWorkoutName: (name: string) => save(KEYS.workoutName, name),

  loadSavedWorkouts: (): SavedWorkout[] => load(KEYS.savedWorkouts, []),
  saveSavedWorkouts: (workouts: SavedWorkout[]) => save(KEYS.savedWorkouts, workouts),
};

const DEFAULT_EXERCISES: Exercise[] = [
  {
    id: 'default-1',
    name: 'Bicep Curl',
    category: 'Arms',
    description: 'Stand with feet shoulder-width apart, curl dumbbells toward shoulders.',
    equipment: ['dumbbell', 'rope_bands'],
    defaultReps: 12,
    defaultSets: 3,
  },
  {
    id: 'default-2',
    name: 'Tricep Overhead Extension',
    category: 'Arms',
    description: 'Hold dumbbell overhead with both hands, lower behind head and extend.',
    equipment: ['dumbbell', 'rope_bands'],
    defaultReps: 12,
    defaultSets: 3,
  },
  {
    id: 'default-3',
    name: 'Lateral Raise',
    category: 'Shoulders',
    description: 'Raise arms out to the sides to shoulder height.',
    equipment: ['dumbbell', 'ankle_weights'],
    defaultReps: 15,
    defaultSets: 3,
  },
  {
    id: 'default-4',
    name: 'Shoulder Press',
    category: 'Shoulders',
    description: 'Press dumbbells overhead from shoulder level.',
    equipment: ['dumbbell', 'machine'],
    defaultReps: 10,
    defaultSets: 3,
  },
  {
    id: 'default-5',
    name: 'Bench Press',
    category: 'Chest',
    description: 'Press dumbbells or barbell from chest to full extension while lying on bench.',
    equipment: ['dumbbell', 'machine'],
    defaultReps: 10,
    defaultSets: 4,
  },
  {
    id: 'default-6',
    name: 'Push-Up',
    category: 'Chest',
    description: 'Lower body to floor and press back up, core tight.',
    equipment: ['bodyweight', 'flat_bands'],
    defaultReps: 15,
    defaultSets: 3,
  },
  {
    id: 'default-7',
    name: 'Bent-Over Row',
    category: 'Back',
    description: 'Hinge at hips, pull dumbbell or band toward hip.',
    equipment: ['dumbbell', 'rope_bands'],
    defaultReps: 12,
    defaultSets: 3,
  },
  {
    id: 'default-8',
    name: 'Lat Pulldown',
    category: 'Back',
    description: 'Pull bar or band down toward chin.',
    equipment: ['machine', 'rope_bands'],
    defaultReps: 12,
    defaultSets: 3,
  },
  {
    id: 'default-9',
    name: 'Squat',
    category: 'Legs',
    description: 'Feet shoulder-width, lower until thighs are parallel, drive through heels.',
    equipment: ['bodyweight', 'dumbbell', 'machine'],
    defaultReps: 12,
    defaultSets: 4,
  },
  {
    id: 'default-10',
    name: 'Lunge',
    category: 'Legs',
    description: 'Step forward, lower back knee toward floor, return to start.',
    equipment: ['bodyweight', 'dumbbell', 'ankle_weights'],
    defaultReps: 10,
    defaultSets: 3,
  },
  {
    id: 'default-11',
    name: 'Glute Bridge',
    category: 'Glutes',
    description: 'Lie on back, feet flat, drive hips up squeezing glutes.',
    equipment: ['bodyweight', 'flat_bands'],
    defaultReps: 15,
    defaultSets: 3,
  },
  {
    id: 'default-12',
    name: 'Donkey Kick',
    category: 'Glutes',
    description: 'On hands and knees, kick leg back and up, squeezing glute at top.',
    equipment: ['bodyweight', 'ankle_weights'],
    defaultReps: 15,
    defaultSets: 3,
  },
  {
    id: 'default-13',
    name: 'Plank',
    category: 'Core',
    description: 'Hold forearm plank position, body in straight line.',
    equipment: ['bodyweight'],
    defaultReps: 1,
    defaultSets: 3,
  },
  {
    id: 'default-14',
    name: 'Crunch',
    category: 'Core',
    description: 'Lie on back, knees bent, curl shoulders toward knees.',
    equipment: ['bodyweight'],
    defaultReps: 20,
    defaultSets: 3,
  },
  {
    id: 'default-15',
    name: 'Calf Raise',
    category: 'Legs',
    description: 'Rise onto toes, lower slowly.',
    equipment: ['bodyweight', 'dumbbell', 'machine'],
    defaultReps: 20,
    defaultSets: 3,
  },
];
