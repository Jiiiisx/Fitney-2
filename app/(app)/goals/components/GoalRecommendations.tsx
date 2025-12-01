// app/components/goals/GoalRecommendations.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

// Using the same GoalTemplate type from the API
type GoalTemplate = {
  title: string;
  category: 'weekly' | 'long_term';
  metric: string;
  target_value: number;
  description: string;
};

interface GoalRecommendationsProps {
  recommendations: GoalTemplate[];
  onAccept: (recommendation: GoalTemplate) => void;
  isLoading: boolean;
}

export function GoalRecommendations({ recommendations, onAccept, isLoading }: GoalRecommendationsProps) {
  if (isLoading) {
    return (
        <div className="bg-card p-6 rounded-2xl border text-center text-muted-foreground">
            <p>Generating personalized recommendations...</p>
        </div>
    );
  }

  if (recommendations.length === 0) {
    return (
        <div className="bg-card p-6 rounded-2xl border text-center text-muted-foreground">
            <p>No recommendations available right now.</p>
            <p className="text-sm">Click "Create Goal" to add your own.</p>
        </div>
    )
  }

  return (
    <section>
      <h2 className="text-3xl font-bold tracking-tight text-foreground mb-2">
        Here are some goals to get you started
      </h2>
      <p className="text-muted-foreground mb-6">Based on your profile, we think these are a great fit. You can accept them or create your own.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((rec, index) => (
          <div key={index} className="bg-card p-6 rounded-2xl border flex flex-col">
            <div className="flex-grow">
                <h3 className="font-semibold text-card-foreground text-lg">{rec.title}</h3>
                <p className="text-muted-foreground text-sm mt-1 mb-4">{rec.description}</p>
            </div>
            <div className="flex items-center justify-between mt-4">
                <div>
                    <span className="font-bold text-xl">{rec.target_value}</span>
                    <span className="text-sm text-muted-foreground ml-1">
                        {rec.metric.replace(/_/g, ' ')}
                    </span>
                </div>
                <Button onClick={() => onAccept(rec)} size="sm">
                    <Check className="w-4 h-4 mr-2" />
                    Accept
                </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
