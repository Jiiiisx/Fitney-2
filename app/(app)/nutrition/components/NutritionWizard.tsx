"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Cake, Weight, Ruler, Activity } from "lucide-react";
import { Gender, ActivityLevel } from "@/app/lib/nutrition-calculator";

interface WizardData {
  gender: Gender;
  age: string;
  weight: string;
  height: string;
  activityLevel: ActivityLevel;
}

interface NutritionWizardProps {
  onComplete: (data: WizardData) => void;
}

const steps = [
  { id: 'gender', title: 'What is your gender?', icon: User },
  { id: 'age', title: 'What is your age?', icon: Cake },
  { id: 'measurements', title: 'What are your measurements?', icon: Weight },
  { id: 'activity', title: 'How active are you?', icon: Activity },
];

export default function NutritionWizard({ onComplete }: NutritionWizardProps) {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<WizardData>({
    gender: 'male',
    age: '',
    weight: '',
    height: '',
    activityLevel: 'sedentary',
  });

  const nextStep = () => setStep(prev => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 0));

  const handleFinish = () => {
    // Basic validation before completing
    if (formData.age && formData.weight && formData.height) {
      onComplete(formData);
    } else {
      // Simple alert for now, can be improved
      alert("Please fill in all fields.");
    }
  };

  const currentStepInfo = steps[step];

  return (
    <div className="w-full max-w-2xl mx-auto bg-card p-8 rounded-2xl shadow-lg">
      <div className="flex items-center justify-center space-x-4 mb-8">
        {steps.map((s, index) => (
          <div key={s.id} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${step >= index ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              <s.icon className="w-5 h-5" />
            </div>
            {index < steps.length - 1 && <div className={`w-16 h-0.5 transition-colors ${step > index ? 'bg-primary' : 'bg-muted'}`} />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-2xl font-bold text-center mb-6">{currentStepInfo.title}</h2>
          
          {step === 0 && (
            <div className="max-w-xs mx-auto">
              <Select onValueChange={(value: Gender) => setFormData(prev => ({ ...prev, gender: value }))} defaultValue={formData.gender}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {step === 1 && (
            <div className="max-w-xs mx-auto">
              <Label htmlFor="age">Age (years)</Label>
              <Input id="age" type="number" placeholder="e.g., 25" value={formData.age} onChange={e => setFormData(prev => ({ ...prev, age: e.target.value }))} />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 max-w-xs mx-auto">
              <div>
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input id="weight" type="number" placeholder="e.g., 70" value={formData.weight} onChange={e => setFormData(prev => ({ ...prev, weight: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="height">Height (cm)</Label>
                <Input id="height" type="number" placeholder="e.g., 175" value={formData.height} onChange={e => setFormData(prev => ({ ...prev, height: e.target.value }))} />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="max-w-xs mx-auto">
              <Select onValueChange={(value: ActivityLevel) => setFormData(prev => ({ ...prev, activityLevel: value }))} defaultValue={formData.activityLevel}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedentary">Sedentary (little or no exercise)</SelectItem>
                  <SelectItem value="lightly_active">Lightly Active (1-3 days/week)</SelectItem>
                  <SelectItem value="moderately_active">Moderately Active (3-5 days/week)</SelectItem>
                  <SelectItem value="very_active">Very Active (6-7 days/week)</SelectItem>
                  <SelectItem value="super_active">Super Active (very hard exercise/physical job)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={prevStep} disabled={step === 0}>
          Back
        </Button>
        {step < steps.length - 1 ? (
          <Button onClick={nextStep}>Next</Button>
        ) : (
          <Button onClick={handleFinish}>Finish</Button>
        )}
      </div>
    </div>
  );
}
