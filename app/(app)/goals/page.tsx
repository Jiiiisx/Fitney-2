"use client";

import { useState, useEffect } from "react";
import { FeaturedGoalCard } from "./components/FeaturedGoalCard";
import { NewGoalCard } from "./components/NewGoalCard"; // Use the new universal card
import GoalTimeline from "./components/GoalTimeline";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { GoalFormModal } from "./components/GoalFormModal";
import { GoalRecommendations } from "./components/GoalRecommendations";
import { Card, CardContent } from "@/components/ui/card";

// Interfaces remain the same
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

  // Handler functions remain the same
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
    // Optimistic update
    const previousGoals = goals;
    setGoals(goals.filter(g => g.id !== goalId));

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No auth token');

      const res = await fetch(`/api/goals/${goalId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        throw new Error('Failed to delete');
      }
    } catch (err) {
      console.error("Failed to delete goal:", err);
      // Revert if failed
      setGoals(previousGoals);
      alert("Failed to delete goal. Please try again.");
    }
  };
  
  const handleAcceptRecommendation = async (recommendation: GoalTemplate) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Authentication token not found.');
        const response = await fetch('/api/goals', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(recommendation),
        });
        if (!response.ok) throw new Error('Failed to accept recommendation');
        const newGoal = await response.json();
        setGoals(prevGoals => [newGoal, ...prevGoals]);
        setRecommendations([]);
    } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  const weeklyGoals = goals.filter(g => g.category === 'weekly');
  const longTermGoals = goals.filter(g => g.category === 'long_term');
  const featuredGoal = weeklyGoals.length > 0 ? weeklyGoals[0] : null;
  const otherWeeklyGoals = weeklyGoals.slice(1);


  // RENDER FUNCTION: Completely refactored for new layout
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex h-64 items-center justify-center">
            <div className="flex flex-col items-center gap-2">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <p className="text-muted-foreground animate-pulse">Loading your goals...</p>
            </div>
        </div>
      );
    }
    if (error) {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-600 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400">
                <p>{error}</p>
            </div>
        );
    }

    // Empty State
    if (goals.length === 0) {
      return (
        <GoalRecommendations 
            recommendations={recommendations} 
            onAccept={handleAcceptRecommendation}
            isLoading={recsLoading}
        />
      );
    }

    return (
      <div className="space-y-10">
        
        {/* Top Section: Hero & Timeline */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Featured Hero (2/3 width) */}
            <div className="xl:col-span-2 space-y-4">
                <h2 className="text-lg font-semibold text-muted-foreground flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                    Current Focus
                </h2>
                {featuredGoal ? (
                    <FeaturedGoalCard goal={featuredGoal} />
                ) : (
                    <div className="h-full min-h-[200px] flex items-center justify-center rounded-2xl border-2 border-dashed bg-muted/30">
                        <p className="text-muted-foreground">No featured goal set.</p>
                    </div>
                )}
            </div>

            {/* Timeline Sidebar (1/3 width) */}
            <div className="xl:col-span-1 space-y-4">
                 <h2 className="text-lg font-semibold text-muted-foreground">Progress Streak</h2>
                 <div className="h-full">
                    <GoalTimeline />
                 </div>
            </div>
        </div>

        {/* Active Goals Grid */}
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">Active Goals</h2>
                <div className="text-sm text-muted-foreground">
                    {otherWeeklyGoals.length + longTermGoals.length} total
                </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {otherWeeklyGoals.map(goal => (
                    <NewGoalCard key={goal.id} goal={goal} onEdit={handleOpenEditModal} onDelete={handleGoalDeleted} />
                ))}
                {longTermGoals.map(goal => (
                    <NewGoalCard key={goal.id} goal={goal} onEdit={handleOpenEditModal} onDelete={handleGoalDeleted} />
                ))}
                
                {/* Add New Placeholder Card */}
                <button 
                    onClick={handleOpenCreateModal}
                    className="group relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-muted-foreground/25 bg-muted/10 p-6 hover:border-primary hover:bg-primary/5 transition-all duration-300 min-h-[200px]"
                >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted group-hover:bg-primary/20 transition-colors">
                        <Plus className="h-6 w-6 text-muted-foreground group-hover:text-primary" />
                    </div>
                    <p className="font-medium text-muted-foreground group-hover:text-primary">Add New Goal</p>
                </button>
            </div>
        </div>
      </div>
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
        <div className="space-y-6 overflow-y-auto p-6 md:p-8 scrollbar-hide">
          <div className="flex items-center justify-between">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Your Goals</h1>
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