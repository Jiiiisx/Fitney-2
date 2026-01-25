"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Plus, Utensils, GlassWater } from "lucide-react";
import ActionModal from "./ActionModal";
import { Skeleton } from "@/components/ui/skeleton";

const FormLoadingSkeleton = () => (
  <div className="space-y-4 p-2">
    <Skeleton className="h-8 w-3/4"/>
    <Skeleton className="h-10 w-full"/>
    <Skeleton className="h-8 w-3/4"/>
    <Skeleton className="h-10 w-full"/>
    <Skeleton className="h-10 w-1/2 ml-auto"/>
  </div>
)

const AddWaterForm = dynamic(() => import('./forms/AddWaterForm'), { loading: () => <FormLoadingSkeleton/>});
const AddMealForm = dynamic(() => import('./forms/AddMealForm'), { loading: () => <FormLoadingSkeleton/>});
const LogWorkoutForm = dynamic(() => import('./forms/LogWorkoutForm'), { loading: () => <FormLoadingSkeleton/>});

const actions = [
  {
    id: "log-workout",
    label: "Log Workout",
    icon: Plus,
    color: "bg-blue-100 dark:bg-blue-900/50",
    textColor: "text-blue-600 dark:text-blue-400",
  },
  {
    id: "add-meal",
    label: "Add Meal",
    icon: Utensils,
    color: "bg-green-100 dark:bg-green-900/50",
    textColor: "text-green-600 dark:text-green-400",
  },
  {
    id: "add-water",
    label: "Add Water",
    icon: GlassWater,
    color: "bg-sky-100 dark:bg-sky-900/50",
    textColor: "text-sky-600 dark:text-sky-400",
  },
];

const ActionButton = ({ action, onClick }: { action: (typeof actions)[0], onClick: () => void }) => (
  <button 
    onClick={onClick}
    className="flex flex-col items-center justify-center space-y-2 p-4 bg-card hover:bg-muted rounded-xl transition-colors w-full"
  >
    <div className={`p-3 rounded-full ${action.color}`}>
      <action.icon className={`w-6 h-6 ${action.textColor}`} />
    </div>
    <span className="text-xs font-semibold text-muted-foreground">{action.label}</span>
  </button>
);

export default function QuickActions() {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const closeModal = () => setActiveModal(null);

  const handleActionCompleted = () => {
    closeModal();
    window.location.reload();
  };

  const renderModalContent = () => {
    switch (activeModal) {
      case "add-water":
        return <AddWaterForm onCompleted={handleActionCompleted} />;
      case "add-meal":
        return <AddMealForm onCompleted={handleActionCompleted} />;
      case "log-workout":
        return <LogWorkoutForm onSuccess={handleActionCompleted} onCancel={closeModal} />;
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {actions.map((action) => (
          <ActionButton 
            key={action.label} 
            action={action}
            onClick={() => setActiveModal(action.id)}
          />
        ))}
      </div>

      <ActionModal isOpen={!!activeModal} onClose={closeModal}>
        {renderModalContent()}
      </ActionModal>
    </div>
  );
}
