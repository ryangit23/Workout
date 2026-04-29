import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { v4 as uuidv4 } from 'uuid';

import { Exercise, WorkoutExercise, SavedWorkout, defaultWeightForEquipment } from './types';
import { storage } from './storage';
import Library from './components/Library';
import WorkoutSheet from './components/WorkoutSheet';
import AddExerciseModal from './components/AddExerciseModal';

function buildWorkoutExercise(exercise: Exercise): WorkoutExercise {
  const equipment = exercise.equipment[0] ?? 'bodyweight';
  return {
    id: uuidv4(),
    exerciseId: exercise.id,
    name: exercise.name,
    reps: exercise.defaultReps,
    sets: exercise.defaultSets,
    equipment,
    weight: defaultWeightForEquipment(equipment),
    completedSets: Array(exercise.defaultSets).fill(false),
  };
}

export default function App() {
  const [exercises, setExercises] = useState<Exercise[]>(() => storage.loadExercises());
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>(() => storage.loadCurrentWorkout());
  const [workoutName, setWorkoutName] = useState(() => storage.loadWorkoutName());
  const [savedWorkouts, setSavedWorkouts] = useState<SavedWorkout[]>(() => storage.loadSavedWorkouts());

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [activeDragExercise, setActiveDragExercise] = useState<Exercise | null>(null);

  // Sensors with activation constraints so that taps don't accidentally start drags
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } })
  );

  // ── Exercise library mutations ──────────────────────────────────────────────

  function saveExercises(updated: Exercise[]) {
    setExercises(updated);
    storage.saveExercises(updated);
  }

  function handleSaveExercise(exercise: Exercise) {
    const exists = exercises.some((e) => e.id === exercise.id);
    const updated = exists
      ? exercises.map((e) => (e.id === exercise.id ? exercise : e))
      : [...exercises, exercise];
    saveExercises(updated);
    setShowAddModal(false);
    setEditingExercise(null);
  }

  function handleDeleteExercise(id: string) {
    saveExercises(exercises.filter((e) => e.id !== id));
  }

  function handleToggleFavorite(id: string) {
    saveExercises(exercises.map((e) => e.id === id ? { ...e, favorite: !e.favorite } : e));
  }

  function handleImport(imported: Exercise[]) {
    // Merge: skip duplicates by id, append new ones
    const existing = new Set(exercises.map((e) => e.id));
    const newOnes = imported.filter((e) => !existing.has(e.id));
    saveExercises([...exercises, ...newOnes]);
  }

  // ── Workout mutations ───────────────────────────────────────────────────────

  function saveWorkoutExercises(updated: WorkoutExercise[]) {
    setWorkoutExercises(updated);
    storage.saveCurrentWorkout(updated);
  }

  function handleWorkoutNameChange(name: string) {
    setWorkoutName(name);
    storage.saveWorkoutName(name);
  }

  function addExerciseToWorkout(exercise: Exercise) {
    setWorkoutExercises(prev => {
      const updated = [...prev, buildWorkoutExercise(exercise)];
      storage.saveCurrentWorkout(updated);
      return updated;
    });
  }

  function handleSaveWorkout() {
    if (workoutExercises.length === 0) {
      alert('Add some exercises first!');
      return;
    }
    const workout: SavedWorkout = {
      id: uuidv4(),
      name: workoutName,
      savedAt: new Date().toISOString(),
      exercises: workoutExercises,
    };
    const updated = [...savedWorkouts, workout];
    setSavedWorkouts(updated);
    storage.saveSavedWorkouts(updated);
    alert(`"${workoutName}" saved!`);
  }

  function handleLoadWorkout(workout: SavedWorkout) {
    saveWorkoutExercises(workout.exercises);
    handleWorkoutNameChange(workout.name);
  }

  function handleDeleteSaved(id: string) {
    const updated = savedWorkouts.filter((w) => w.id !== id);
    setSavedWorkouts(updated);
    storage.saveSavedWorkouts(updated);
  }

  function handleClear() {
    saveWorkoutExercises([]);
  }

  // ── Drag and drop ───────────────────────────────────────────────────────────

  function handleDragStart(event: DragStartEvent) {
    if (event.active.data.current?.type === 'library-exercise') {
      setActiveDragExercise(event.active.data.current.exercise as Exercise);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveDragExercise(null);

    if (!over) return;

    const activeType = active.data.current?.type;

    // Library exercise dropped anywhere in the workout sheet
    if (activeType === 'library-exercise') {
      const isOverWorkout =
        over.id === 'workout-drop-zone' ||
        workoutExercises.some((ex) => ex.id === over.id);
      if (isOverWorkout) {
        addExerciseToWorkout(active.data.current!.exercise as Exercise);
      }
      return;
    }

    // Reorder within workout
    if (activeType === 'workout-exercise') {
      if (active.id !== over.id) {
        const oldIndex = workoutExercises.findIndex((e) => e.id === active.id);
        const newIndex = workoutExercises.findIndex((e) => e.id === over.id);
        if (oldIndex !== -1 && newIndex !== -1) {
          saveWorkoutExercises(arrayMove(workoutExercises, oldIndex, newIndex));
        }
      }
    }
  }

  const existingCategories = [...new Set(exercises.map((e) => e.category))].sort();

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-full overflow-hidden">
        <Library
          exercises={exercises}
          onAdd={() => { setEditingExercise(null); setShowAddModal(true); }}
          onEdit={(ex) => { setEditingExercise(ex); setShowAddModal(true); }}
          onDelete={handleDeleteExercise}
          onAddToWorkout={addExerciseToWorkout}
          onToggleFavorite={handleToggleFavorite}
          onImport={handleImport}
        />

        <WorkoutSheet
          workoutName={workoutName}
          exercises={workoutExercises}
          savedWorkouts={savedWorkouts}
          libraryExercises={exercises}
          onNameChange={handleWorkoutNameChange}
          onExercisesChange={saveWorkoutExercises}
          onSave={handleSaveWorkout}
          onLoad={handleLoadWorkout}
          onDeleteSaved={handleDeleteSaved}
          onClear={handleClear}
        />
      </div>

      {/* Drag overlay — shows ghost card while dragging from library */}
      <DragOverlay>
        {activeDragExercise && (
          <div className="card px-4 py-3 shadow-2xl shadow-blue-500/30 border-blue-500 dragging-overlay">
            <p className="font-semibold text-sm text-white">{activeDragExercise.name}</p>
            <p className="text-xs text-gray-400 mt-0.5">{activeDragExercise.category}</p>
          </div>
        )}
      </DragOverlay>

      {showAddModal && (
        <AddExerciseModal
          exercise={editingExercise}
          existingCategories={existingCategories}
          onSave={handleSaveExercise}
          onClose={() => { setShowAddModal(false); setEditingExercise(null); }}
        />
      )}
    </DndContext>
  );
}
