import Papa from 'papaparse';
import { v4 as uuidv4 } from 'uuid';
import { Exercise, EquipmentType } from '../types';

const ALL_EQUIPMENT: EquipmentType[] = [
  'dumbbell', 'rope_bands', 'flat_bands', 'bodyweight', 'machine', 'ankle_weights',
];

interface CsvRow {
  name?: string;
  category?: string;
  description?: string;
  equipment?: string;
  defaultReps?: string;
  defaultSets?: string;
}

export function exportExercisesToCsv(exercises: Exercise[]): void {
  const rows = exercises.map((ex) => ({
    name: ex.name,
    category: ex.category,
    description: ex.description,
    equipment: ex.equipment.join(';'),
    defaultReps: ex.defaultReps,
    defaultSets: ex.defaultSets,
  }));

  const csv = Papa.unparse(rows, { header: true });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `workout-library-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function importExercisesFromCsv(file: File): Promise<Exercise[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const exercises: Exercise[] = results.data.map((row) => {
            const rawEquipment = (row.equipment ?? '')
              .split(';')
              .map((e) => e.trim().toLowerCase())
              .filter((e): e is EquipmentType => ALL_EQUIPMENT.includes(e as EquipmentType));

            return {
              id: uuidv4(),
              name: (row.name ?? '').trim(),
              category: (row.category ?? '').trim(),
              description: (row.description ?? '').trim(),
              equipment: rawEquipment.length > 0 ? rawEquipment : ['bodyweight'],
              defaultReps: parseInt(row.defaultReps ?? '10', 10) || 10,
              defaultSets: parseInt(row.defaultSets ?? '3', 10) || 3,
            };
          });

          const valid = exercises.filter((e) => e.name.length > 0);
          resolve(valid);
        } catch (err) {
          reject(err);
        }
      },
      error: (err) => reject(err),
    });
  });
}
