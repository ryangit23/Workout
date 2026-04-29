import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  WorkoutExercise,
  EquipmentType,
  BandWeight,
  EQUIPMENT_LABELS,
  BAND_WEIGHTS,
  defaultWeightForEquipment,
} from '../types';

interface Props {
  item: WorkoutExercise;
  availableEquipment: EquipmentType[];
  onChange: (updated: WorkoutExercise) => void;
  onRemove: () => void;
}

export default function WorkoutExerciseRow({ item, availableEquipment, onChange, onRemove }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    data: { type: 'workout-exercise' },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 999 : undefined,
  };

  function update(patch: Partial<WorkoutExercise>) {
    onChange({ ...item, ...patch });
  }

  function handleEquipmentChange(eq: EquipmentType) {
    update({ equipment: eq, weight: defaultWeightForEquipment(eq) });
  }

  function handleSetsChange(sets: number) {
    const completedSets = Array(sets)
      .fill(false)
      .map((_, i) => item.completedSets[i] ?? false);
    update({ sets, completedSets });
  }

  function toggleSet(i: number) {
    const completedSets = [...item.completedSets];
    completedSets[i] = !completedSets[i];
    update({ completedSets });
  }

  const allDone = item.completedSets.length > 0 && item.completedSets.every(Boolean);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`card p-3 transition-colors ${allDone ? 'border-green-700/50 bg-green-950/20' : ''}`}
    >
      <div className="flex items-start gap-2">
        {/* Drag handle */}
        <button
          {...listeners}
          {...attributes}
          className="mt-1 text-gray-600 hover:text-gray-400 cursor-grab active:cursor-grabbing flex-shrink-0 select-none"
          style={{ touchAction: 'none' }}
        >
          ⠿
        </button>

        <div className="flex-1 min-w-0">
          {/* Exercise name + remove */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <h3 className="font-semibold text-white text-sm truncate">{item.name}</h3>
            <button
              onClick={onRemove}
              className="text-gray-600 hover:text-red-400 flex-shrink-0 text-sm px-1"
              title="Remove"
            >
              ✕
            </button>
          </div>

          {/* Controls row */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Equipment selector (only shown when multiple options) */}
            {availableEquipment.length > 1 && (
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-xs text-gray-400">Equip:</span>
                <select
                  value={item.equipment}
                  onChange={(e) => handleEquipmentChange(e.target.value as EquipmentType)}
                  className="bg-gray-700 border border-gray-600 rounded-lg text-xs text-white px-2 py-1.5 focus:outline-none focus:border-blue-500"
                >
                  {availableEquipment.map((eq) => (
                    <option key={eq} value={eq}>{EQUIPMENT_LABELS[eq]}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Weight input */}
            {item.equipment === 'bodyweight' ? (
              <span className="text-xs text-gray-400 italic">Bodyweight</span>
            ) : item.equipment === 'flat_bands' ? (
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-xs text-gray-400">Band:</span>
                <div className="flex gap-1">
                  {BAND_WEIGHTS.map((bw) => {
                    const selected = item.weight === bw.value;
                    return (
                      <button
                        key={bw.value}
                        onClick={() => update({ weight: bw.value as BandWeight })}
                        title={bw.label}
                        className={`h-7 px-2 rounded text-xs font-medium transition-all ${bw.color} ${bw.textColor} ${
                          selected
                            ? 'ring-2 ring-white scale-110'
                            : 'opacity-60 hover:opacity-90'
                        }`}
                      >
                        {bw.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-xs text-gray-400">Wt:</span>
                <input
                  type="number"
                  min={0}
                  step={2.5}
                  value={(item.weight as number) ?? 0}
                  onChange={(e) => update({ weight: parseFloat(e.target.value) || 0 })}
                  className="w-16 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm px-2 py-1.5 text-center focus:outline-none focus:border-blue-500"
                />
                <span className="text-xs text-gray-400">lbs</span>
              </div>
            )}

            {/* Reps */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="text-xs text-gray-400">Reps:</span>
              <input
                type="number"
                min={1}
                max={999}
                value={item.reps}
                onChange={(e) => update({ reps: parseInt(e.target.value) || 1 })}
                className="w-14 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm px-2 py-1.5 text-center focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Sets */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="text-xs text-gray-400">Sets:</span>
              <select
                value={item.sets}
                onChange={(e) => handleSetsChange(parseInt(e.target.value))}
                className="w-14 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm px-2 py-1.5 text-center focus:outline-none focus:border-blue-500"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

            {/* Set completion dots */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="text-xs text-gray-400">Done:</span>
              <div className="flex gap-1.5">
                {item.completedSets.map((done, i) => (
                  <button
                    key={i}
                    onClick={() => toggleSet(i)}
                    className={`w-6 h-6 rounded-full border-2 transition-all active:scale-90 ${
                      done
                        ? 'bg-green-500 border-green-400'
                        : 'bg-transparent border-gray-500 hover:border-gray-300'
                    }`}
                    title={`Set ${i + 1} ${done ? '(done)' : ''}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
