"use client";

import { Sparkles } from "lucide-react";

interface DashboardInsightProps {
  insight?: string;
}

export default function DashboardInsight({ insight }: DashboardInsightProps) {
  if (!insight) return null;

  // Highlight numbers/percentages in text to make it more interesting
  const formattedInsight = insight.split(/(\d+%?)/).map((part, index) => 
    /\d+%?/.test(part) ? <span key={index} className="text-green-600 font-bold">{part}</span> : part
  );

  return (
    <div className="w-full bg-white dark:bg-card border border-border rounded-xl p-4 shadow-sm flex items-start gap-3">
      <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-full shrink-0">
        <Sparkles className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
      </div>
      <div>
        <p className="text-sm text-foreground font-medium leading-relaxed">
            {formattedInsight}
        </p>
      </div>
    </div>
  );
}
