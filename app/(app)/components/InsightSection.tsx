"use client";

import { Lightbulb } from "lucide-react";
import { useState, useEffect } from "react";

const insights = [
  "You’re most active on Wednesdays — try adding a leg workout today!",
  "You’ve improved your bench press by 10% this month 💪",
  "Great job on consistency! You haven't missed a workout in 7 days.",
  "Your cardio is strong, but maybe show your legs some love today?",
  "Hydration is key! You're close to your water goal for today.",
];

export default function InsightSection() {
  const [insight, setInsight] = useState("");

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * insights.length);
    setInsight(insights[randomIndex]);
  }, []);

  if (!insight) {
    return null; // Render nothing on the server and initial client render
  }

  return (
    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
      <div className="flex">
        <div className="py-1">
          <Lightbulb className="w-6 h-6 text-blue-500" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-semibold text-blue-800">AI Insight</h3>
          <p className="text-sm text-blue-700 mt-1">{insight}</p>
        </div>
      </div>
    </div>
  );
}
