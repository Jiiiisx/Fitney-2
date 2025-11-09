// app/(app)/components/WorkoutLogger.tsx
'use client';

import { useState } from 'react';
import { PlusCircle, X } from 'lucide-react';
import { logWorkoutAction } from '@/app/actions';

type Exercise = {
  exercise_id: number;
  name: string;
};

export default function WorkoutLogger({ exercises }: { exercises: Exercise[] }) {
  const [isFormVisible, setIsFormVisible] = useState(false);

  const handleFormSubmit = async (formData: FormData) => {
    await logWorkoutAction(formData);
    setIsFormVisible(false);
  };

  if (!isFormVisible) {
    return (
      <button 
        onClick={() => setIsFormVisible(true)}
        className="w-full bg-gray-800 text-white font-bold py-4 rounded-lg hover:bg-gray-900 transition-colors flex items-center justify-center text-lg shadow-lg"
      >
        <PlusCircle className="w-6 h-6 mr-3" />
        Log Today's Workout
      </button>
    );
  }

  return (
    <div className="bg-white/50 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-8">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center"><PlusCircle className="w-6 h-6 mr-3 text-gray-800" />Log Today's Workout</h2>
          <button onClick={() => setIsFormVisible(false)} className="p-2 rounded-full hover:bg-gray-200">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <form action={handleFormSubmit} className="flex flex-wrap gap-4 items-end">
          <div className="flex-grow min-w-[200px]">
            <label htmlFor="exercise" className="block text-sm font-medium text-gray-700 mb-1">Exercise</label>
            <select id="exercise" name="exerciseId" required className="w-full px-4 py-3 bg-gray-100 border-transparent rounded-lg focus:ring-2 focus:ring-gray-500">
              <option value="">Select an exercise...</option>
              {exercises.map((ex) => <option key={ex.exercise_id} value={ex.exercise_id}>{ex.name}</option>)}
            </select>
          </div>
          <div className="flex-grow sm:flex-grow-0 w-full sm:w-24">
            <label htmlFor="sets" className="block text-sm font-medium text-gray-700 mb-1">Sets</label>
            <input type="number" name="sets" id="sets" required className="w-full px-4 py-3 bg-gray-100 border-transparent rounded-lg focus:ring-2 focus:ring-gray-500" />
          </div>
          <div className="flex-grow sm:flex-grow-0 w-full sm:w-24">
            <label htmlFor="reps" className="block text-sm font-medium text-gray-700 mb-1">Reps</label>
            <input type="number" name="reps" id="reps" required className="w-full px-4 py-3 bg-gray-100 border-transparent rounded-lg focus:ring-2 focus:ring-gray-500" />
          </div>
          <div className="flex-grow sm:flex-grow-0 w-full sm:w-24">
            <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
            <input type="number" step="0.25" name="weight" id="weight" required className="w-full px-4 py-3 bg-gray-100 border-transparent rounded-lg focus:ring-2 focus:ring-gray-500" />
          </div>
          <button type="submit" className="w-full sm:w-auto flex-grow bg-gray-800 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-900 transition-colors">Log</button>
        </form>
      </div>
    </div>
  );
}