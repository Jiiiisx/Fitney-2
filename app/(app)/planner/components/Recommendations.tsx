"use client";

import { useEffect, useState } from 'react';
import { Lightbulb, Loader2, Sparkles, Plus, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from 'react-hot-toast';
import { fetchWithAuth } from "@/app/lib/fetch-helper";

interface RecommendationsProps {
  planVersion: number;
  onAddFlexibility: () => void;
  onTryTemplate: () => void;
}

type Recommendation = {
  title: string;
  category: 'weekly' | 'long_term';
  metric: string;
  target_value: number;
  description: string;
};

export default function Recommendations({ planVersion, onAddFlexibility, onTryTemplate }: RecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        const data = await fetchWithAuth('/api/goals/recommendations');
        setRecommendations(data.recommendations || []);
      } catch (error) {
        console.error("Failed to fetch suggestions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [planVersion]);

  const handleAddGoal = async (rec: Recommendation) => {
    try {
        await fetchWithAuth('/api/goals', {
            method: 'POST',
            body: JSON.stringify({
                title: rec.title,
                category: rec.category,
                metric: rec.metric,
                target_value: rec.target_value,
                end_date: rec.category === 'weekly' ? new Date(new Date().setDate(new Date().getDate() + 7)).toISOString() : null
            })
        });

        toast.success("Goal added successfully!");
        // Optionally trigger a refresh of GoalTracker here via a callback or context
    } catch (e) {
        toast.error("Error adding goal.");
    }
  };

  if (loading) {
    return (
      <div className="bg-card rounded-3xl p-6 h-full flex items-center justify-center min-h-[200px] border shadow-sm">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="bg-card rounded-3xl p-6 h-full border shadow-sm flex flex-col">
      <h2 className="text-xl font-bold mb-6 text-foreground flex items-center gap-2">
        <Lightbulb className="w-5 h-5 text-yellow-500 fill-yellow-500/20" />
        Smart Suggestions
      </h2>
      
      <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px] scrollbar-hide">
        {recommendations.length > 0 ? (
          recommendations.map((rec, index) => (
            <div key={index} className="bg-background border hover:border-primary/30 p-4 rounded-xl transition-all group relative overflow-hidden">
               {/* Decorative background element */}
               <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Sparkles className="w-12 h-12" />
               </div>

              <div className="relative z-10">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-semibold text-foreground text-sm">{rec.title}</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-medium uppercase tracking-wide">
                        {rec.category.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                    {rec.description}
                  </p>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full h-8 text-xs hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={() => handleAddGoal(rec)}
                  >
                    <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Goal
                  </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full py-8 text-center space-y-3">
             <div className="p-3 bg-muted rounded-full">
                <Target className="w-6 h-6 text-muted-foreground" />
             </div>
             <p className="text-sm text-muted-foreground">Set your profile goals to get recommendations.</p>
          </div>
        )}
      </div>
    </div>
  );
}