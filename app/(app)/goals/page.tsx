"use client";

import { useState, useEffect } from "react";
import PersonalGoals from "./components/PersonalGoals";
import LongTermGoals from "./components/LongTermGoals";
import GoalTimeline from "./components/GoalTimeline";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { GoalFormModal } from "./components/GoalFormModal";

// Define the Goal type based on our new schema
export interface Goal {
  id: number;
  user_id: string;
  title: string;
  category: 'weekly' | 'long_term';
  metric: string;
  target_value: number;
  current_value: number;
  start_date: string;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState<Goal | null>(null);

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication token not found. Please log in.');
        }

        const response = await fetch('/api/goals', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Unauthorized. Your session may have expired.');
          }
          throw new Error('Failed to fetch goals');
        }
        const data = await response.json();
        setGoals(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchGoals();
  }, []);

  const handleOpenCreateModal = () => {
    setGoalToEdit(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (goal: Goal) => {
    setGoalToEdit(goal);
    setModalOpen(true);
  };

  const handleSaveGoal = (savedGoal: Goal) => {
    const isEditing = goals.some(g => g.id === savedGoal.id);
    if (isEditing) {
      setGoals(goals.map(g => g.id === savedGoal.id ? savedGoal : g));
    } else {
      setGoals([savedGoal, ...goals]);
    }
  };

  const handleGoalDeleted = async (goalId: number) => {
    if (!confirm('Are you sure you want to delete this goal?')) {
        return;
    }

    const originalGoals = goals;
    setGoals(prevGoals => prevGoals.filter(g => g.id !== goalId));

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found.');
      }

      const response = await fetch(`/api/goals/${goalId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        console.error('Failed to delete goal from server.');
        setGoals(originalGoals); // Revert UI on failure
      }
    } catch (err) {
      console.error('An error occurred while deleting the goal.', err);
      setGoals(originalGoals); // Revert UI on failure
    }
  };

  const weeklyGoals = goals.filter(g => g.category === 'weekly');
  const longTermGoals = goals.filter(g => g.category === 'long_term');

  return (
    <>
      <GoalFormModal 
        open={isModalOpen} 
        onOpenChange={setModalOpen}
        onSave={handleSaveGoal}
        goalToEdit={goalToEdit}
      />
      <div className="h-full">
        <div className="space-y-8 overflow-y-auto p-8 scrollbar-hide">
          <div className="flex items-center justify-between">
              <h1 className="text-4xl font-bold tracking-tight">Your Goals</h1>
              <Button onClick={handleOpenCreateModal}>
                  <Plus className="w-5 h-5 mr-2" />
                  Create Goal
              </Button>
          </div>
          
          {loading && <p>Loading goals...</p>}
          {error && <p className="text-red-500">{error}</p>}
          
          {!loading && !error && (
              <>
                  <PersonalGoals goals={weeklyGoals} onEdit={handleOpenEditModal} onDelete={handleGoalDeleted} />
                  <LongTermGoals goals={longTermGoals} onEdit={handleOpenEditModal} onDelete={handleGoalDeleted} />
                  <GoalTimeline />
              </>
          )}
        </div>
      </div>
    </>
  );
}