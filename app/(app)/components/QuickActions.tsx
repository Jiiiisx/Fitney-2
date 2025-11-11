"use client";

import { useState } from "react";
import { Plus, Utensils, GlassWater, Bed } from "lucide-react";
import ActionModal from "./ActionModal";
import AddWaterForm from "./forms/AddWaterForm";
import AddMealForm from "./forms/AddMealForm";
import LogWorkoutForm from "./forms/LogWorkoutForm";
import AddSleepForm from "./forms/AddSleepForm";

const actions = [
  {
    id: "log-workout",
    label: "Log Workout",
    icon: Plus,
    color: "bg-blue-100",
    textColor: "text-blue-600",
  },
  {
    id: "add-meal",
    label: "Add Meal",
    icon: Utensils,
    color: "bg-green-100",
    textColor: "text-green-600",
  },
  {
    id: "add-water",
    label: "Add Water",
    icon: GlassWater,
    color: "bg-sky-100",
    textColor: "text-sky-600",
  },
  {
    id: "add-sleep",
    label: "Add Sleep",
    icon: Bed,
    color: "bg-purple-100",
    textColor: "text-purple-600",
  },
];

const modalContent: { [key: string]: React.ReactNode } = {
    "add-water": <AddWaterForm />,
    "add-meal": <AddMealForm />,
    "log-workout": <LogWorkoutForm />,
    "add-sleep": <AddSleepForm />,
};

const ActionButton = ({ action, onClick }: { action: (typeof actions)[0], onClick: () => void }) => (
  <button 
    onClick={onClick}
    className="flex flex-col items-center justify-center space-y-2 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors w-full"
  >
    <div className={`p-3 rounded-full ${action.color}`}>
      <action.icon className={`w-6 h-6 ${action.textColor}`} />
    </div>
    <span className="text-xs font-semibold text-gray-700">{action.label}</span>
  </button>
);

export default function QuickActions() {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const closeModal = () => setActiveModal(null);

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {actions.map((action) => (
          <ActionButton 
            key={action.label} 
            action={action}
            onClick={() => setActiveModal(action.id)}
          />
        ))}
      </div>

      <ActionModal isOpen={!!activeModal} onClose={closeModal}>
        {activeModal && modalContent[activeModal]}
      </ActionModal>
    </div>
  );
}
