"use client";

import { useEffect, useState } from 'react';
import { Lightbulb, Loader2 } from "lucide-react";
import { startOfWeek, endOfWeek, isWithinInterval, parseISO } from 'date-fns';

interface RecommendationsProps {
  planVersion: number;
  onAddFlexibility: () => void;
  onTryTemplate: () => void;
}

type Suggestion = {
  id: string;
  title: string;
  description: string;
  action: () => void;
};

export default function Recommendations({ planVersion, onAddFlexibility, onTryTemplate }: RecommendationsProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSuggestions = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setSuggestions([]);
          return;
        }

        const response = await fetch('/api/users/me/active-plan', {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) {
          setSuggestions([]);
          return;
        }

        const plan = await response.json();
        const newSuggestions: Suggestion[] = [];

        if (plan && plan.schedule) {
          const today = new Date();
          const weekStart = startOfWeek(today, { weekStartsOn: 1 });
          const weekEnd = endOfWeek(today, { weekStartsOn: 1 });

          const thisWeekSchedule = plan.schedule.filter((s: any) => 
            isWithinInterval(parseISO(s.date), { start: weekStart, end: weekEnd })
          );

          const hasFlexibility = thisWeekSchedule.some((s: any) => s.type === 'Flexibility' || s.description?.toLowerCase().includes('flexibility'));
          
          if (!hasFlexibility) {
            newSuggestions.push({
              id: 'add-flexibility',
              title: 'Add a Flexibility session',
              description: 'You haven’t trained mobility this week.',
              action: onAddFlexibility,
            });
          }
        }
        
        // Always add the generic template suggestion
        newSuggestions.push({
          id: 'try-template',
          title: 'Try a "Push Day" Template',
          description: 'A great way to balance your muscle groups.',
          action: onTryTemplate,
        });

        setSuggestions(newSuggestions);

      } catch (error) {
        console.error("Failed to fetch suggestions:", error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [planVersion, onAddFlexibility, onTryTemplate]);

  if (loading) {
    return (
      <div className="bg-card rounded-2xl p-6 h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl p-6 h-full">
      <h2 className="text-xl font-bold mb-4 text-foreground">
        <Lightbulb className="w-5 h-5 inline-block mr-2 text-primary" />
        Suggestions
      </h2>
      <div className="space-y-3">
        {suggestions.length > 0 ? (
          suggestions.map(suggestion => (
            <div key={suggestion.id} onClick={suggestion.action} className="bg-background hover:bg-secondary/80 p-4 rounded-lg cursor-pointer transition-colors">
              <p className="font-semibold text-foreground">{suggestion.title}</p>
              <p className="text-sm text-secondary-foreground">
                {suggestion.description}
              </p>
            </div>
          ))
        ) : (
          <p className="text-sm text-secondary-foreground text-center py-4">No suggestions at the moment. Keep up the great work!</p>
        )}
      </div>
    </div>
  );
}