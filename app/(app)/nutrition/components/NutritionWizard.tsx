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
    <div className="w-full max-w-2xl mx-auto bg-card p-6 sm:p-10 rounded-[2.5rem] border shadow-xl shadow-black/5 flex flex-col min-h-[500px]">
      {/* Responsive Progress Header */}
      <div className="flex items-center justify-between mb-10 px-2">
        {steps.map((s, index) => (
          <div key={s.id} className="flex items-center flex-1 last:flex-none">
            <motion.div 
              initial={false}
              animate={{ 
                scale: step === index ? 1.2 : 1,
                backgroundColor: step >= index ? 'var(--primary)' : 'var(--muted)'
              }}
              className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors shadow-sm`}
            >
              <s.icon className={`w-5 h-5 ${step >= index ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
            </motion.div>
            {index < steps.length - 1 && (
              <div className="flex-1 mx-2 h-1 bg-muted rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: step > index ? '100%' : '0%' }}
                  className="h-full bg-primary"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex-grow flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full"
          >
            <h2 className="text-2xl sm:text-3xl font-black text-center mb-8 tracking-tight italic">
              {currentStepInfo.title}
            </h2>
            
            <div className="max-w-md mx-auto w-full">
              {step === 0 && (
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { val: 'male', label: 'Male', icon: User },
                    { val: 'female', label: 'Female', icon: User }
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      onClick={() => setFormData(prev => ({ ...prev, gender: opt.val as any }))}
                      className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${
                        formData.gender === opt.val 
                        ? 'border-primary bg-primary/5 ring-4 ring-primary/10' 
                        : 'border-border hover:border-muted-foreground/30 bg-muted/20'
                      }`}
                    >
                      <opt.icon className={`w-8 h-8 ${formData.gender === opt.val ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className="font-bold">{opt.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <Label htmlFor="age" className="font-bold text-muted-foreground uppercase text-[10px] tracking-widest ml-1">Age (Years)</Label>
                  <Input 
                    id="age" 
                    type="number" 
                    placeholder="e.g., 25" 
                    value={formData.age} 
                    onChange={e => setFormData(prev => ({ ...prev, age: e.target.value }))}
                    className="h-14 rounded-2xl text-xl font-bold border-2 focus:border-primary px-6"
                  />
                </div>
              )}

              {step === 2 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="weight" className="font-bold text-muted-foreground uppercase text-[10px] tracking-widest ml-1">Weight (kg)</Label>
                    <Input 
                      id="weight" 
                      type="number" 
                      placeholder="70" 
                      value={formData.weight} 
                      onChange={e => setFormData(prev => ({ ...prev, weight: e.target.value }))} 
                      className="h-14 rounded-2xl text-xl font-bold border-2 px-6"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height" className="font-bold text-muted-foreground uppercase text-[10px] tracking-widest ml-1">Height (cm)</Label>
                    <Input 
                      id="height" 
                      type="number" 
                      placeholder="175" 
                      value={formData.height} 
                      onChange={e => setFormData(prev => ({ ...prev, height: e.target.value }))} 
                      className="h-14 rounded-2xl text-xl font-bold border-2 px-6"
                    />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="grid gap-3">
                  {[
                    { id: 'sedentary', label: 'Sedentary', desc: 'Little or no exercise' },
                    { id: 'lightly_active', label: 'Lightly Active', desc: '1-3 days/week' },
                    { id: 'moderately_active', label: 'Moderately Active', desc: '3-5 days/week' },
                    { id: 'very_active', label: 'Very Active', desc: '6-7 days/week' },
                    { id: 'super_active', label: 'Super Active', desc: 'Athlete/Physical job' },
                  ].map((lvl) => (
                    <button
                      key={lvl.id}
                      onClick={() => setFormData(prev => ({ ...prev, activityLevel: lvl.id as any }))}
                      className={`p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between ${
                        formData.activityLevel === lvl.id 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:bg-muted/30'
                      }`}
                    >
                      <div>
                        <p className="font-bold text-sm">{lvl.label}</p>
                        <p className="text-[10px] text-muted-foreground">{lvl.desc}</p>
                      </div>
                      {formData.activityLevel === lvl.id && <div className="w-2 h-2 rounded-full bg-primary" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex gap-4 mt-10">
        <Button 
          variant="outline" 
          onClick={prevStep} 
          disabled={step === 0}
          className="h-14 rounded-2xl px-8 font-bold border-2"
        >
          Back
        </Button>
        {step < steps.length - 1 ? (
          <Button 
            onClick={nextStep} 
            className="h-14 rounded-2xl flex-grow font-bold text-lg shadow-lg shadow-primary/20"
          >
            Next
          </Button>
        ) : (
          <Button 
            onClick={handleFinish}
            className="h-14 rounded-2xl flex-grow font-bold text-lg shadow-lg shadow-primary/20"
          >
            Finish
          </Button>
        )}
      </div>
    </div>
  );
}
