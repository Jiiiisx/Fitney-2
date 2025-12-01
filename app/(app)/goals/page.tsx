"use client";

import { useState, useEffect } from "react";
import PersonalGoals from "./components/PersonalGoals";
import LongTermGoals from "./components/LongTermGoals";
import GoalTimeline from "./components/GoalTimeline";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { GoalFormModal } from "./components/GoalFormModal";
import { GoalRecommendations } from "./components/GoalRecommendations";

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

export type GoalTemplate = {
  title: string;
  category: 'weekly' | 'long_term';
  metric: string;
  target_value: number;
  description: string;
};

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [recommendations, setRecommendations] = useState<GoalTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [recsLoading, setRecsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState<Goal | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Authentication token not found.');

        const response = await fetch('/api/goals', { headers: { 'Authorization': `Bearer ${token}` }});
        if (!response.ok) throw new Error('Failed to fetch goals');
        
        const goalsData = await response.json();
        setGoals(goalsData);

        // If user has no goals, fetch recommendations
        if (goalsData.length === 0) {
          setRecsLoading(true);
          const recsResponse = await fetch('/api/goals/recommendations', { headers: { 'Authorization': `Bearer ${token}` }});
          if (!recsResponse.ok) throw new Error('Failed to fetch recommendations');
          
          const recsData = await recsResponse.json();
          setRecommendations(recsData.recommendations);
          setRecsLoading(false);
        }
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
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
    // ... (logic remains the same)
  };

  const handleAcceptRecommendation = async (recommendation: GoalTemplate) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Authentication token not found.');

        const response = await fetch('/api/goals', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(recommendation),
        });

        if (!response.ok) throw new Error('Failed to accept recommendation');

        const newGoal = await response.json();
        
        // Add new goal to state and clear recommendations
        setGoals(prevGoals => [newGoal, ...prevGoals]);
        setRecommendations([]);

    } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  const weeklyGoals = goals.filter(g => g.category === 'weekly');
  const longTermGoals = goals.filter(g => g.category === 'long_term');

  const renderContent = () => {
    if (loading) {
      return <p>Loading your space...</p>;
    }
    if (error) {
        return <p className="text-red-500">{error}</p>;
    }
    if (goals.length > 0) {
      return (
        <>
          <PersonalGoals goals={weeklyGoals} onEdit={handleOpenEditModal} onDelete={handleGoalDeleted} />
          <LongTermGoals goals={longTermGoals} onEdit={handleOpenEditModal} onDelete={handleGoalDeleted} />
          <GoalTimeline />
        </>
      );
    }
    return (
        <GoalRecommendations 
            recommendations={recommendations} 
            onAccept={handleAcceptRecommendation}
            isLoading={recsLoading}
        />
    );
  }

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
          {renderContent()}
        </div>
      </div>
    </>
  );
}