"use client";

import { useState, useEffect } from 'react';
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

  // Sync internal state with SWR data
  useEffect(() => {
    if (profileData) {
      // Check if user has completed nutrition onboarding (tdee exists)
      if (profileData.userProfile?.tdee) {
        setUserData(profileData.userProfile);
      }
    }
  }, [profileData]);

  const handleWizardComplete = async (wizardData: any) => { 
    // ... logic remains same but calls mutate() at the end
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
        mutate(); // Refresh SWR cache
        toast.success("Nutrition profile saved!");
      } else {
        toast.error(result.error || "Failed to save profile");
      }
    } catch (error) {
      console.error("Failed to save profile", error);
      toast.error("An unexpected error occurred");
    }
  };

  const handleEdit = () => {
    setUserData(null);
  };

  const handleCancel = async () => {
    if (profileData?.userProfile) {
      setUserData(profileData.userProfile);
    }
  };

  const renderContent = () => {
    if (loading && !profileData) {
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
