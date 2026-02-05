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
  const [prefilledData, setPrefilledData] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    async function checkNutritionProfile() {
      if (!profileData) return;
      
      try {
        const res = await fetchWithAuth('/api/nutrition/profile');
        if (res.profile && res.profile.tdee) {
          setUserData(res.profile);
        } else {
          // If no nutrition profile, pre-fill from general onboarding data
          setPrefilledData({
            gender: profileData.gender || '',
            weight: profileData.weight || '',
            height: profileData.height || '',
            age: profileData.dob ? Math.floor((new Date().getTime() - new Date(profileData.dob).getTime()) / 3.154e+10) : '',
          });
        }
      } catch (err) {
        console.error("Error checking nutrition profile", err);
      } finally {
        setIsChecking(false);
      }
    }

    checkNutritionProfile();
  }, [profileData]);

  const handleWizardComplete = async (wizardData: any) => { 
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
        mutate(); // Refresh SWR
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
    setPrefilledData(userData);
    setUserData(null);
  };

  const handleCancel = () => {
    if (profileData) {
        setUserData(prefilledData?.tdee ? prefilledData : null);
    }
  };

  const renderContent = () => {
    if ((loading || isChecking) && !profileData) {
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
      // Wizard will use prefilledData if available
      return <NutritionWizard onComplete={handleWizardComplete} onCancel={handleCancel} initialData={prefilledData} />;
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