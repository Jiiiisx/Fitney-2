"use client";

import { useState, useEffect, useCallback } from 'react';
import NutritionWizard from './components/NutritionWizard';
import NutritionResults from './components/NutritionResults';
import { calculateTDEE } from '@/app/lib/nutrition-calculator';
import { saveNutritionProfile } from '@/app/actions/nutrition';
import { toast } from 'react-hot-toast';
import useSWR from 'swr';
import { fetchWithAuth } from '@/app/lib/fetch-helper';

export default function NutritionPage() {
  const { data: profileData, isLoading: loading, mutate } = useSWR('/api/users/profile', (url) => fetchWithAuth(url));
  const [userData, setUserData] = useState<any>(null);
  const [prefilledData, setPrefilledData] = useState<any>(null);
  const [isSmartLoading, setIsSmartLoading] = useState(true);

  const calculateAge = (dob: string) => {
    if (!dob) return 25;
    return Math.floor((new Date().getTime() - new Date(dob).getTime()) / 3.154e+10);
  };

  const handleWizardComplete = useCallback(async (wizardData: any) => { 
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
        mutate(); 
        toast.success("Nutrition profile saved!");
      } else {
        toast.error(result.error || "Failed to save profile");
      }
    } catch (error) {
      console.error("Failed to save profile", error);
      toast.error("An unexpected error occurred");
    }
  }, [mutate]);

  useEffect(() => {
    async function initNutrition() {
      if (!profileData) return;

      // 1. If we already have specific nutrition data, show results
      if (profileData.nutritionProfile && profileData.nutritionProfile.tdee) {
        setUserData(profileData.nutritionProfile);
        setIsSmartLoading(false);
        return;
      }

      // 2. SMART AUTO-INIT: If user has physical data from main onboarding but NO nutrition profile
      // We can auto-calculate and save a baseline to avoid the wizard
      if (profileData.gender && profileData.weight && profileData.height && profileData.dob) {
        console.log("Smart Auto-initializing nutrition profile...");
        
        const wizardData = {
            gender: profileData.gender,
            age: calculateAge(profileData.dob).toString(),
            weight: profileData.weight.toString(),
            height: profileData.height.toString(),
            activityLevel: 'lightly_active', // Default safe baseline
            mainGoal: profileData.mainGoal || 'Maintenance'
        };

        // Automatically complete the wizard in the background
        await handleWizardComplete(wizardData);
        setIsSmartLoading(false);
      } else {
        // 3. If data is missing even from general profile, prepare pre-filled wizard
        setPrefilledData({
          gender: profileData.gender || 'male',
          weight: profileData.weight || '',
          height: profileData.height || '',
          age: profileData.dob ? calculateAge(profileData.dob).toString() : '',
        });
        setIsSmartLoading(false);
      }
    }

    initNutrition();
  }, [profileData, handleWizardComplete]);

  const handleEdit = () => {
    setPrefilledData(userData);
    setUserData(null);
  };

  const renderContent = () => {
    if ((loading || isSmartLoading) && !userData) {
      return (
        <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-muted-foreground animate-pulse">Analyzing your nutrition plan...</p>
        </div>
      );
    }

    if (userData) {
      return <NutritionResults userData={userData} onEdit={handleEdit} />;
    } else {
      return <NutritionWizard onComplete={handleWizardComplete} initialData={prefilledData} />;
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