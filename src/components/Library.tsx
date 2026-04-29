import { useState, useRef } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Exercise, EquipmentType, EQUIPMENT_LABELS } from '../types';
import { exportExercisesToCsv, importExercisesFromCsv } from '../utils/csv';

interface Props {
  exercises: Exercise[];
  onAdd: () => void;
  onEdit: (exercise: Exercise) => void;
  onDelete: (id: string) => void;
  onAddToWorkout: (exercise: Exercise) => void;
  onToggleFavorite: (id: string) => void;
  onImport: (exercises: Exercise[]) => void;
}

const EQUIPMENT_ICONS: Record<EquipmentType, string> = {
  dumbbell: '🏋️',
  rope_bands: '🔁',
  flat_bands: '📏',
  bodyweight: '🧍',
  machine: '⚙️',
  ankle_weights: '🦵',
};

function DraggableExerciseCard({
  exercise,
  onEdit,
  onDelete,
  onAddToWorkout,
  onToggleFavorite,
}: {
  exercise: Exercise;
  onEdit: (e: Exercise) => void;
  onDelete: (id: string) => void;
  onAddToWorkout: (e: Exercise) => void;
  onToggleFavorite: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `lib-${exercise.id}`,
    data: { type: 'library-exercise', exercise },
  });

  const cardStyle = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={cardStyle}
      className="bg-gray-750 border border-gray-700 rounded-lg p-3 flex items-start gap-2 group"
    >
      {/* Drag handle — touchAction:none scoped here so the rest of the card stays scrollable */}
      <button
        {...listeners}
        {...attributes}
        style={{ touchAction: 'none' }}
        className="mt-0.5 text-gray-500 hover:text-gray-300 cursor-grab active:cursor-grabbing flex-shrink-0 p-1 -ml-1 rounded"
        title="Drag to workout"
      >
        ⠿
      </button>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-white truncate">{exercise.name}</p>
        {exercise.description && (
          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{exercise.description}</p>
        )}
        <div className="flex flex-wrap gap-1 mt-1.5">
          {exercise.equipment.map((eq) => (
            <span
              key={eq}
              title={EQUIPMENT_LABELS[eq]}
              className="text-xs bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded"
            >
              {EQUIPMENT_ICONS[eq]} {EQUIPMENT_LABELS[eq]}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1 flex-shrink-0">
        <button
          onClick={() => onAddToWorkout(exercise)}
          className="w-7 h-7 bg-blue-600 hover:bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-base leading-none"
          title="Add to workout"
        >
          +
        </button>
        <button
          onClick={() => onToggleFavorite(exercise.id)}
          className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm transition-colors ${
            exercise.favorite
              ? 'bg-yellow-500 hover:bg-yellow-400 text-white'
              : 'bg-gray-700 hover:bg-yellow-500 text-gray-400 hover:text-white'
          }`}
          title={exercise.favorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          ★
        </button>
        <button
          onClick={() => onEdit(exercise)}
          className="w-7 h-7 bg-gray-600 hover:bg-gray-500 rounded-lg flex items-center justify-center text-gray-200 text-xs"
          title="Edit"
        >
          ✎
        </button>
        <button
          onClick={() => { if (confirm(`Delete "${exercise.name}"?`)) onDelete(exercise.id); }}
          className="w-7 h-7 bg-gray-700 hover:bg-red-700 rounded-lg flex items-center justify-center text-gray-400 hover:text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity"
          title="Delete"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

interface CategoryGroupProps {
  category: string;
  isFavorites?: boolean;
  exercises: Exercise[];
  onEdit: (e: Exercise) => void;
  onDelete: (id: string) => void;
  onAddToWorkout: (e: Exercise) => void;
  onToggleFavorite: (id: string) => void;
}

function CategoryGroup({ category, isFavorites, exercises, onEdit, onDelete, onAddToWorkout, onToggleFavorite }: CategoryGroupProps) {
  const [open, setOpen] = useState(true);

  return (
    <div className={`border rounded-xl overflow-hidden ${isFavorites ? 'border-yellow-600/50' : 'border-gray-700'}`}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center justify-between px-4 py-3 text-left ${
          isFavorites ? 'bg-yellow-900/30 hover:bg-yellow-900/40' : 'bg-gray-800 hover:bg-gray-750'
        }`}
      >
        <span className={`font-semibold text-sm ${isFavorites ? 'text-yellow-400' : 'text-gray-200'}`}>
          {isFavorites ? '★ ' : ''}{category}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 bg-gray-700 px-2 py-0.5 rounded-full">{exercises.length}</span>
          <span className="text-gray-400 text-sm">{open ? '▾' : '▸'}</span>
        </div>
      </button>

      {open && (
        <div className="bg-gray-900 p-2 space-y-2">
          {exercises.map((ex) => (
            <DraggableExerciseCard
              key={ex.id}
              exercise={ex}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddToWorkout={onAddToWorkout}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Library({ exercises, onAdd, onEdit, onDelete, onAddToWorkout, onToggleFavorite, onImport }: Props) {
  const [search, setSearch] = useState('');
  const importRef = useRef<HTMLInputElement>(null);

  const filtered = search.trim()
    ? exercises.filter(
        (ex) =>
          ex.name.toLowerCase().includes(search.toLowerCase()) ||
          ex.category.toLowerCase().includes(search.toLowerCase())
      )
    : exercises;

  const favorites = filtered.filter((ex) => ex.favorite);

  const grouped = filtered.reduce<Record<string, Exercise[]>>((acc, ex) => {
    const cat = ex.category || 'Uncategorized';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(ex);
    return acc;
  }, {});

  const sortedCategories = Object.keys(grouped).sort();

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const imported = await importExercisesFromCsv(file);
      onImport(imported);
      alert(`Imported ${imported.length} exercise(s).`);
    } catch {
      alert('Failed to import CSV. Please check the file format.');
    }
    e.target.value = '';
  }

  return (
    <div className="panel h-full border-r border-gray-800" style={{ width: 380, minWidth: 340 }}>
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-800 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-white">Exercise Library</h2>
          <button onClick={onAdd} className="btn-primary text-xs px-3 py-1.5">+ New</button>
        </div>

        <input
          className="input mb-3"
          placeholder="Search exercises…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="flex gap-2">
          <button
            onClick={() => exportExercisesToCsv(exercises)}
            className="btn-secondary text-xs flex-1"
          >
            ↑ Export CSV
          </button>
          <button
            onClick={() => importRef.current?.click()}
            className="btn-secondary text-xs flex-1"
          >
            ↓ Import CSV
          </button>
          <input ref={importRef} type="file" accept=".csv" className="hidden" onChange={handleImport} />
        </div>
      </div>

      {/* Exercise list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {sortedCategories.length === 0 && (
          <div className="text-center text-gray-500 py-12 text-sm">
            {search ? 'No matches found.' : 'Library is empty. Add an exercise to get started.'}
          </div>
        )}
        {favorites.length > 0 && (
          <CategoryGroup
            key="__favorites__"
            category="Favorites"
            isFavorites
            exercises={favorites}
            onEdit={onEdit}
            onDelete={onDelete}
            onAddToWorkout={onAddToWorkout}
            onToggleFavorite={onToggleFavorite}
          />
        )}
        {sortedCategories.map((cat) => (
          <CategoryGroup
            key={cat}
            category={cat}
            exercises={grouped[cat]}
            onEdit={onEdit}
            onDelete={onDelete}
            onAddToWorkout={onAddToWorkout}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>
    </div>
  );
}
