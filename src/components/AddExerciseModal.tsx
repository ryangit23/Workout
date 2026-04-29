import { useState, useEffect } from 'react';
import { Exercise, EquipmentType, EQUIPMENT_LABELS } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  exercise?: Exercise | null;
  existingCategories: string[];
  onSave: (exercise: Exercise) => void;
  onClose: () => void;
}

const ALL_EQUIPMENT: EquipmentType[] = [
  'dumbbell', 'rope_bands', 'flat_bands', 'bodyweight', 'machine', 'ankle_weights',
];

const BLANK: Omit<Exercise, 'id'> = {
  name: '',
  category: '',
  description: '',
  equipment: [],
  defaultReps: 10,
  defaultSets: 3,
};

export default function AddExerciseModal({ exercise, existingCategories, onSave, onClose }: Props) {
  const [form, setForm] = useState<Omit<Exercise, 'id'>>(exercise ? { ...exercise } : { ...BLANK });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCatSuggestions, setShowCatSuggestions] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const catSuggestions = existingCategories.filter(
    (c) => c.toLowerCase().includes(form.category.toLowerCase()) && c !== form.category
  );

  function toggleEquipment(eq: EquipmentType) {
    setForm((f) => ({
      ...f,
      equipment: f.equipment.includes(eq)
        ? f.equipment.filter((e) => e !== eq)
        : [...f.equipment, eq],
    }));
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.category.trim()) e.category = 'Category is required';
    if (form.equipment.length === 0) e.equipment = 'Select at least one equipment type';
    if (form.defaultReps < 1) e.defaultReps = 'Must be at least 1';
    if (form.defaultSets < 1) e.defaultSets = 'Must be at least 1';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSave({ id: exercise?.id ?? uuidv4(), ...form, name: form.name.trim(), category: form.category.trim() });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="card w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-700">
          <h2 className="text-lg font-semibold">{exercise ? 'Edit Exercise' : 'New Exercise'}</h2>
          <button onClick={onClose} className="btn-ghost p-2 rounded-lg text-gray-400 hover:text-white">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Exercise Name</label>
            <input
              className="input"
              placeholder="e.g. Bicep Curl"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Category */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
            <input
              className="input"
              placeholder="e.g. Arms, Legs, Core"
              value={form.category}
              onChange={(e) => { setForm((f) => ({ ...f, category: e.target.value })); setShowCatSuggestions(true); }}
              onFocus={() => setShowCatSuggestions(true)}
              onBlur={() => setTimeout(() => setShowCatSuggestions(false), 150)}
            />
            {showCatSuggestions && catSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-xl overflow-hidden">
                {catSuggestions.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className="w-full text-left px-4 py-2.5 hover:bg-gray-600 text-sm text-gray-200"
                    onMouseDown={() => { setForm((f) => ({ ...f, category: cat })); setShowCatSuggestions(false); }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
            {errors.category && <p className="text-red-400 text-xs mt-1">{errors.category}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
            <textarea
              className="input resize-none"
              rows={2}
              placeholder="Brief description of the exercise"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>

          {/* Equipment */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Equipment Used</label>
            <div className="grid grid-cols-2 gap-2">
              {ALL_EQUIPMENT.map((eq) => {
                const checked = form.equipment.includes(eq);
                return (
                  <button
                    key={eq}
                    type="button"
                    onClick={() => toggleEquipment(eq)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm transition-colors ${
                      checked
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                      checked ? 'bg-white border-white' : 'border-gray-400'
                    }`}>
                      {checked && <span className="text-blue-600 text-xs font-bold">✓</span>}
                    </span>
                    {EQUIPMENT_LABELS[eq]}
                  </button>
                );
              })}
            </div>
            {errors.equipment && <p className="text-red-400 text-xs mt-1">{errors.equipment}</p>}
          </div>

          {/* Defaults */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Default Reps</label>
              <input
                type="number"
                min={1}
                max={999}
                className="input"
                value={form.defaultReps}
                onChange={(e) => setForm((f) => ({ ...f, defaultReps: parseInt(e.target.value) || 1 }))}
              />
              {errors.defaultReps && <p className="text-red-400 text-xs mt-1">{errors.defaultReps}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Default Sets</label>
              <input
                type="number"
                min={1}
                max={10}
                className="input"
                value={form.defaultSets}
                onChange={(e) => setForm((f) => ({ ...f, defaultSets: parseInt(e.target.value) || 1 }))}
              />
              {errors.defaultSets && <p className="text-red-400 text-xs mt-1">{errors.defaultSets}</p>}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1">
              {exercise ? 'Save Changes' : 'Add Exercise'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
