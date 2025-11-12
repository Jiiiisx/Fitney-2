"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Zap, Heart, Award, ArrowRight } from "lucide-react";

interface WorkoutTemplatesProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const templates = [
  {
    id: "tpl1",
    name: "Strength Foundation",
    description: "A 3-day plan focusing on major muscle groups to build a solid base.",
    tags: ["Strength", "Rest"],
    icon: Zap,
    iconColor: "text-blue-500",
  },
  {
    id: "tpl2",
    name: "Cardio Kickstarter",
    description: "Boost your endurance with this 4-day cardio-focused plan.",
    tags: ["Cardio", "Flexibility"],
    icon: Heart,
    iconColor: "text-red-500",
  },
  {
    id: "tpl3",
    name: "Athlete's Week",
    description: "A balanced 5-day plan for serious athletes pushing their limits.",
    tags: ["Strength", "Cardio", "Performance"],
    icon: Award,
    iconColor: "text-yellow-500",
  },
];

const TemplateCard = ({ template }: { template: (typeof templates)[0] }) => (
  <div className="bg-gray-50/80 p-5 rounded-xl border border-gray-200/80 transition-all hover:border-yellow-400 hover:bg-gray-50">
    <div className="flex items-start justify-between">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className={`p-2 bg-white rounded-full border ${template.iconColor.replace('text-', 'border-')}/20`}>
            <template.icon className={`h-5 w-5 ${template.iconColor}`} />
          </div>
          <h3 className="text-lg font-bold text-gray-800">{template.name}</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">{template.description}</p>
        <div className="flex flex-wrap gap-2">
          {template.tags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-0.5 text-xs font-semibold text-gray-700 bg-gray-200 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
      <Button size="sm" variant="ghost" className="h-9 w-9 p-0 group">
        <ArrowRight className="h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1" />
      </Button>
    </div>
  </div>
);

export function WorkoutTemplates({ open, onOpenChange }: WorkoutTemplatesProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-white rounded-2xl shadow-2xl border-neutral-200/70">
        <DialogHeader className="text-left">
          <DialogTitle className="text-2xl font-bold text-gray-900 tracking-tight">
            Workout Templates
          </DialogTitle>
          <DialogDescription className="text-gray-500 pt-1">
            Choose a pre-made plan to kickstart your week.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {templates.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
