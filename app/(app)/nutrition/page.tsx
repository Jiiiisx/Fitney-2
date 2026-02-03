"use client";

import { useState, useEffect } from 'react';
import NutritionWizard from './components/NutritionWizard';
import NutritionResults from './components/NutritionResults';
import { calculateTDEE } from '@/app/lib/nutrition-calculator';
import { saveNutritionProfile, getNutritionProfile } from '@/app/actions/nutrition';
import { toast } from 'react-hot-toast';

export default function NutritionPage() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { profile, error } = await getNutritionProfile();
        if (error) {
          console.error(error);
        } else if (profile) {
          setUserData(profile);
        }
      } catch (error) {
        console.error("Failed to load nutrition profile", error);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleWizardComplete = async (wizardData: any) => { 
    setLoading(true);
    try {
      const tdee = calculateTDEE({
        ...wizardData,
        age: parseInt(wizardData.age, 10),
        weight: parseFloat(wizardData.weight),
        height: parseFloat(wizardData.height),
      });

      const result = await saveNutritionProfile({
        ...wizardData,
        age: parseInt(wizardData.age, 10),
        weight: parseFloat(wizardData.weight),
        height: parseFloat(wizardData.height),
        tdee
      });

      if (result.success) {
        setUserData({ ...wizardData, tdee });
        toast.success("Nutrition profile saved!");
      } else {
        toast.error(result.error || "Failed to save profile");
      }
    } catch (error) {
      console.error("Failed to save profile", error);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setUserData(null);
  };

  const handleCancel = async () => {
    setLoading(true);
    try {
      const { profile } = await getNutritionProfile();
      if (profile) {
        setUserData(profile);
      } else {
        // If no profile exists, just keep the wizard open
        setUserData(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-muted-foreground animate-pulse">Synchronizing nutrition data...</p>
        </div>
      );
    }

    if (userData) {
      return <NutritionResults userData={userData} onEdit={handleEdit} />;
    } else {
      return <NutritionWizard onComplete={handleWizardComplete} onCancel={handleCancel} />;
    }
  };

  return (
    <div className="p-6 sm:p-6 lg:p-8">
      <main>
        {renderContent()}
      </main>
    </div>
  );
}
