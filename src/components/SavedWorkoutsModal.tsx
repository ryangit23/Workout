import { SavedWorkout } from '../types';

interface Props {
  workouts: SavedWorkout[];
  onLoad: (workout: SavedWorkout) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export default function SavedWorkoutsModal({ workouts, onLoad, onDelete, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="card w-full max-w-md max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-700">
          <h2 className="text-lg font-semibold">Saved Workouts</h2>
          <button onClick={onClose} className="btn-ghost p-2 rounded-lg text-gray-400 hover:text-white">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {workouts.length === 0 && (
            <p className="text-center text-gray-500 py-8 text-sm">No saved workouts yet.</p>
          )}
          {[...workouts].reverse().map((w) => (
            <div key={w.id} className="bg-gray-800 border border-gray-700 rounded-xl p-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-white text-sm truncate">{w.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(w.savedAt).toLocaleDateString(undefined, {
                    weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                  })}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{w.exercises.length} exercise{w.exercises.length !== 1 ? 's' : ''}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => { onLoad(w); onClose(); }}
                  className="btn-primary text-xs px-3 py-1.5"
                >
                  Load
                </button>
                <button
                  onClick={() => { if (confirm(`Delete "${w.name}"?`)) onDelete(w.id); }}
                  className="btn-secondary text-xs px-2 py-1.5 hover:bg-red-700 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
