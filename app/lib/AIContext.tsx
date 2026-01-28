'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface AIBriefing {
  readinessScore: number;
  topInsight: string;
  contextualTips: {
    nutrition: string[];
    planner: string[];
    community: string[];
    general: string[];
    actions?: {
        add_workout?: string;
        search_recipe?: string;
        log_water?: string;
    };
  };
}

interface AIContextType {
  briefing: AIBriefing | null;
  currentTip: string;
  isLoading: boolean;
  sayActionTip: (actionKey: 'add_workout' | 'search_recipe' | 'log_water') => void;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export function AIProvider({ children }: { children: React.ReactNode }) {
  const [briefing, setBriefing] = useState<AIBriefing | null>(null);
  const [currentTip, setCurrentTip] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    async function fetchBriefing() {
      try {
        const res = await fetch('/api/ai/briefing');
        if (res.ok) {
          const data = await res.json();
          setBriefing(data);
          setCurrentTip(data.topInsight);
        }
      } catch (err) {
        console.error("AI Provider failed to fetch briefing", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchBriefing();
  }, []);

  const sayActionTip = (actionKey: 'add_workout' | 'search_recipe' | 'log_water') => {
    if (briefing?.contextualTips?.actions?.[actionKey]) {
        setCurrentTip(briefing.contextualTips.actions[actionKey]!);
    }
  };

  // Update tip based on page location
  useEffect(() => {
    if (!briefing || !briefing.contextualTips) {
        if (briefing?.topInsight) setCurrentTip(briefing.topInsight);
        return;
    }

    let tips: string[] = [];
    const path = pathname.toLowerCase();
    
    if (path.includes('nutrition')) tips = briefing.contextualTips.nutrition || [];
    else if (path.includes('planner')) tips = briefing.contextualTips.planner || [];
    else if (path.includes('community')) tips = briefing.contextualTips.community || [];
    
    if (tips && tips.length > 0) {
      // Pick a random tip from the category
      const randomTip = tips[Math.floor(Math.random() * tips.length)];
      setCurrentTip(randomTip);
    } else if (briefing.topInsight) {
      setCurrentTip(briefing.topInsight);
    }
  }, [pathname, briefing]);

  return (
    <AIContext.Provider value={{ briefing, currentTip, isLoading, sayActionTip }}>
      {children}
    </AIContext.Provider>
  );
}

export const useAI = () => {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};
