export type EquipmentType =
  | 'dumbbell'
  | 'rope_bands'
  | 'flat_bands'
  | 'bodyweight'
  | 'machine'
  | 'ankle_weights';

export type BandWeight = 'x-light' | 'light' | 'medium' | 'heavy' | 'x-heavy';

export interface Exercise {
  id: string;
  name: string;
  category: string;
  description: string;
  favorite?: boolean;
  equipment: EquipmentType[];
  defaultReps: number;
  defaultSets: number;
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  name: string;
  reps: number;
  sets: number;
  equipment: EquipmentType;
  weight: number | BandWeight | null;
  completedSets: boolean[];
}

export interface SavedWorkout {
  id: string;
  name: string;
  savedAt: string;
  exercises: WorkoutExercise[];
}

export const EQUIPMENT_LABELS: Record<EquipmentType, string> = {
  dumbbell: 'Dumbbell',
  rope_bands: 'Rope Bands',
  flat_bands: 'Flat Bands',
  bodyweight: 'Bodyweight',
  machine: 'Machine',
  ankle_weights: 'Ankle Weights',
};

export const BAND_WEIGHTS: { value: BandWeight; label: string; color: string; textColor: string }[] = [
  { value: 'x-light', label: 'X-Light', color: 'bg-green-600',  textColor: 'text-white' },
  { value: 'light',   label: 'Light',   color: 'bg-blue-600',   textColor: 'text-white' },
  { value: 'medium',  label: 'Medium',  color: 'bg-yellow-400', textColor: 'text-gray-900' },
  { value: 'heavy',   label: 'Heavy',   color: 'bg-red-600',    textColor: 'text-white' },
  { value: 'x-heavy', label: 'X-Heavy', color: 'bg-gray-900',   textColor: 'text-white' },
];

export const NUMERIC_EQUIPMENT: EquipmentType[] = ['dumbbell', 'rope_bands', 'machine', 'ankle_weights'];

export function isNumericEquipment(eq: EquipmentType): boolean {
  return NUMERIC_EQUIPMENT.includes(eq);
}

export function defaultWeightForEquipment(eq: EquipmentType): number | BandWeight | null {
  if (eq === 'flat_bands') return 'light';
  if (eq === 'bodyweight') return null;
  return 0;
}
