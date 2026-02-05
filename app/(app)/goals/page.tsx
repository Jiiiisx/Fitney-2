"use client";

import { useState, useEffect } from "react";
import { FeaturedGoalCard } from "./components/FeaturedGoalCard";
import { NewGoalCard } from "./components/NewGoalCard";
import GoalTimeline from "./components/GoalTimeline";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { GoalFormModal } from "./components/GoalFormModal";
import { GoalRecommendations } from "./components/GoalRecommendations";
import { Card, CardContent } from "@/components/ui/card";
import { fetchWithAuth } from "@/app/lib/fetch-helper";
import { useAI } from "@/app/lib/AIContext";

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
  const { sayActionTip } = useAI();
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
        const goalsData = await fetchWithAuth('/api/goals');
        setGoals(goalsData);

        if (goalsData.length === 0) {
          setRecsLoading(true);
          const recsData = await fetchWithAuth('/api/goals/recommendations');
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
    sayActionTip('add_goal');
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
    const previousGoals = goals;
    setGoals(goals.filter(g => g.id !== goalId));

    try {
      await fetchWithAuth(`/api/goals/${goalId}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.error("Failed to delete goal:", err);
      setGoals(previousGoals);
      alert("Failed to delete goal. Please try again.");
    }
  };
  
  const handleAcceptRecommendation = async (recommendation: GoalTemplate) => {
    try {
        const newGoal = await fetchWithAuth('/api/goals', {
            method: 'POST',
            body: JSON.stringify(recommendation),
        });
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

    if (goals.length === 0) {
      return (
        <GoalRecommendations 
            recommendations={recommendations} 
            onAccept={handleAcceptRecommendation}
            onCreateCustom={handleOpenCreateModal}
            isLoading={recsLoading}
        />
      );
    }

    return (
      <div className="space-y-10">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
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
            <div className="xl:col-span-1 space-y-4">
                 <h2 className="text-lg font-semibold text-muted-foreground">Progress Streak</h2>
                 <div className="h-full">
                    <GoalTimeline />
                 </div>
            </div>
        </div>

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
                
                <button 
                    onClick={handleOpenCreateModal}
                    className="group relative flex flex-col items-center justify-center gap-4 rounded-[2rem] border-4 border-dashed border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900/50 p-8 hover:border-primary hover:bg-primary/5 transition-all duration-500 min-h-[260px] shadow-sm hover:shadow-xl overflow-hidden"
                >
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-neutral-50 dark:bg-neutral-800 group-hover:bg-primary group-hover:rotate-90 transition-all duration-500 shadow-inner">
                        <Plus className="h-8 w-8 text-muted-foreground group-hover:text-white transition-colors" />
                    </div>
                    <div className="text-center relative z-10">
                      <p className="font-black text-lg text-neutral-900 dark:text-white group-hover:text-primary transition-colors">Add New Goal</p>
                      <p className="text-xs font-bold text-muted-foreground opacity-60">Start your next challenge</p>
                    </div>
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
      <div className="min-h-screen bg-gradient-to-b from-neutral-50/50 to-white dark:from-black dark:to-neutral-950">
        <div className="max-w-[1600px] mx-auto space-y-8 overflow-y-auto px-6 py-10 md:p-12 scrollbar-hide animate-in fade-in duration-700">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-1">
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-neutral-900 dark:text-white">Your Goals</h1>
                <p className="text-muted-foreground font-medium text-sm md:text-base">Track your progress and stay consistent.</p>
              </div>
              <Button 
                onClick={handleOpenCreateModal}
                className="rounded-full h-12 px-6 font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-95"
              >
                <Plus className="w-5 h-5 mr-2 stroke-[3px]" /> Create New Goal
              </Button>
          </div>
          
          <div className="h-px bg-neutral-200 dark:bg-neutral-800/50 w-full" />
          
          {renderContent()}
        </div>
      </div>
    </>
  );
}
