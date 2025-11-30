"use client";

import { useState, useEffect } from 'react';
import NutritionWizard from './components/NutritionWizard';
import NutritionResults from './components/NutritionResults';
import { calculateTDEE } from '@/app/lib/nutrition-calculator';

const LOCAL_STORAGE_KEY = 'fitneyNutritionData';

export default function NutritionPage() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true); // To prevent flash of content

  useEffect(() => {
    // On initial mount, check if data exists in local storage
    try {
      const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedData) {
        setUserData(JSON.parse(savedData));
      }
    } catch (error) {
      console.error("Failed to read from local storage", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleWizardComplete = (wizardData: any) => {
    const tdee = calculateTDEE({
      ...wizardData,
      age: parseInt(wizardData.age, 10),
      weight: parseFloat(wizardData.weight),
      height: parseFloat(wizardData.height),
    });

    const dataToSave = { ...wizardData, tdee };
    
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
      setUserData(dataToSave);
    } catch (error) {
      console.error("Failed to save to local storage", error);
    }
  };

  const handleEdit = () => {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      setUserData(null);
    } catch (error) {
      console.error("Failed to remove from local storage", error);
    }
  };

  const renderContent = () => {
    if (loading) {
      return <div className="text-center p-12">Loading...</div>;
    }

    if (userData) {
      return <NutritionResults userData={userData} onEdit={handleEdit} />;
    } else {
      return <NutritionWizard onComplete={handleWizardComplete} />;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <main>
        {renderContent()}
      </main>
    </div>
  );
}
