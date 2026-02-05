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
    // Jika kita sampai di sini, artinya user ingin membatalkan edit.
    // Kita coba ambil ulang data dari cache/DB.
    setLoading(true);
    try {
      const { profile } = await getNutritionProfile();
      if (profile) {
        setUserData(profile);
      } else {
        // Jika benar-benar tidak ada profile (user baru), 
        // kita tidak bisa kemana-mana selain wizard ini.
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
        <div className="space-y-8 animate-in fade-in duration-500">
          {/* Summary Card Skeleton */}
          <div className="h-80 w-full bg-muted animate-pulse rounded-[2.5rem]" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Meals Skeleton */}
            <div className="md:col-span-2 h-96 bg-muted animate-pulse rounded-3xl" />
            {/* Water Skeleton */}
            <div className="md:col-span-1 h-96 bg-muted animate-pulse rounded-3xl" />
          </div>

          <div className="space-y-4">
            <div className="h-8 w-48 bg-muted animate-pulse rounded-full" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-muted animate-pulse rounded-2xl" />
              ))}
            </div>
          </div>
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
