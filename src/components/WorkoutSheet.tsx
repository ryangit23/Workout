import { useState } from 'react';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { WorkoutExercise, Exercise, SavedWorkout } from '../types';
import WorkoutExerciseRow from './WorkoutExerciseRow';
import SavedWorkoutsModal from './SavedWorkoutsModal';

interface Props {
  workoutName: string;
  exercises: WorkoutExercise[];
  savedWorkouts: SavedWorkout[];
  libraryExercises: Exercise[];
  onNameChange: (name: string) => void;
  onExercisesChange: (exercises: WorkoutExercise[]) => void;
  onSave: () => void;
  onLoad: (workout: SavedWorkout) => void;
  onDeleteSaved: (id: string) => void;
  onClear: () => void;
}

export default function WorkoutSheet({
  workoutName,
  exercises,
  savedWorkouts,
  libraryExercises,
  onNameChange,
  onExercisesChange,
  onSave,
  onLoad,
  onDeleteSaved,
  onClear,
}: Props) {
  const [showSaved, setShowSaved] = useState(false);
  const [editingName, setEditingName] = useState(false);

  const { setNodeRef, isOver } = useDroppable({ id: 'workout-drop-zone' });

  function updateExercise(index: number, updated: WorkoutExercise) {
    const next = [...exercises];
    next[index] = updated;
    onExercisesChange(next);
  }

  function removeExercise(index: number) {
    onExercisesChange(exercises.filter((_, i) => i !== index));
  }

  function getAvailableEquipment(item: WorkoutExercise) {
    const lib = libraryExercises.find((ex) => ex.id === item.exerciseId);
    return lib?.equipment ?? [item.equipment];
  }

  const completedCount = exercises.filter((ex) => ex.completedSets.every(Boolean) && ex.completedSets.length > 0).length;

  return (
    <div className="panel flex-1 min-w-0 h-full">
      {/* Header */}
      <div className="px-5 pt-4 pb-3 border-b border-gray-800 flex-shrink-0">
        <div className="flex items-center justify-between gap-3 mb-3">
          {editingName ? (
            <input
              autoFocus
              className="input text-lg font-bold py-1 flex-1"
              value={workoutName}
              onChange={(e) => onNameChange(e.target.value)}
              onBlur={() => setEditingName(false)}
              onKeyDown={(e) => { if (e.key === 'Enter') setEditingName(false); }}
            />
          ) : (
            <button
              onClick={() => setEditingName(true)}
              className="text-xl font-bold text-white hover:text-blue-400 text-left transition-colors truncate"
              title="Click to rename"
            >
              {workoutName}
            </button>
          )}

          <div className="flex gap-2 flex-shrink-0">
            <button onClick={() => setShowSaved(true)} className="btn-secondary text-xs px-3 py-1.5">
              ☰ Saved
            </button>
            <button onClick={onSave} className="btn-primary text-xs px-3 py-1.5">
              ↑ Save
            </button>
            {exercises.length > 0 && (
              <button
                onClick={() => { if (confirm('Clear the current workout?')) onClear(); }}
                className="btn-secondary text-xs px-3 py-1.5 hover:bg-red-800 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {exercises.length > 0 && (
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span>{exercises.length} exercise{exercises.length !== 1 ? 's' : ''}</span>
            <span>·</span>
            <span>{completedCount}/{exercises.length} complete</span>
            {completedCount === exercises.length && exercises.length > 0 && (
              <span className="text-green-400 font-medium">Workout done!</span>
            )}
          </div>
        )}
      </div>

      {/* Drop zone + exercise list */}
      <div
        ref={setNodeRef}
        className={`flex-1 overflow-y-auto p-4 space-y-2 transition-colors ${
          isOver ? 'bg-blue-950/30' : ''
        }`}
      >
        {exercises.length === 0 && (
          <div className={`flex flex-col items-center justify-center h-full text-center transition-all ${
            isOver ? 'scale-105' : ''
          }`}>
            <div className={`w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center mb-4 transition-colors ${
              isOver ? 'border-blue-400 bg-blue-900/30' : 'border-gray-600'
            }`}>
              <span className="text-4xl">{isOver ? '✚' : '+'}</span>
            </div>
            <p className="text-gray-400 text-sm">
              {isOver ? 'Drop to add exercise' : 'Drag exercises here or tap the + button'}
            </p>
          </div>
        )}

        <SortableContext items={exercises.map((e) => e.id)} strategy={verticalListSortingStrategy}>
          {exercises.map((item, index) => (
            <WorkoutExerciseRow
              key={item.id}
              item={item}
              availableEquipment={getAvailableEquipment(item)}
              onChange={(updated) => updateExercise(index, updated)}
              onRemove={() => removeExercise(index)}
            />
          ))}
        </SortableContext>

        {exercises.length > 0 && isOver && (
          <div className="border-2 border-dashed border-blue-500 rounded-xl p-4 text-center text-blue-400 text-sm">
            Drop here to add
          </div>
        )}
      </div>

      {showSaved && (
        <SavedWorkoutsModal
          workouts={savedWorkouts}
          onLoad={onLoad}
          onDelete={onDeleteSaved}
          onClose={() => setShowSaved(false)}
        />
      )}
    </div>
  );
}
