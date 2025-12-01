'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Dumbbell, Heart, Mountain, Building, Home, Leaf, Zap, Wind } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Define types for onboarding state
interface OnboardingData {
  goal?: string;
  location?: string;
  level?: string;
}

interface OnboardingModalProps {
  onComplete: () => void;
}

const OnboardingModal = ({ onComplete }: OnboardingModalProps) => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({});

  const totalSteps = 4; // 3 questions + 1 welcome screen

  const handleSelect = (field: keyof OnboardingData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
    // Move to next step after a short delay
    setTimeout(() => {
      setStep(prev => prev + 1);
    }, 300);
  };

  const handleFinish = async () => {
    console.log('Onboarding Complete. Final Data:', data);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("No token found");

      // API call to save user preferences and mark onboarding as complete
      await fetch('/api/users/profile/complete-onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data) // Sending the collected data
      });
      
      // Call the parent function to close the modal and refresh user data
      onComplete();

    } catch (error) {
      console.error("Failed to complete onboarding:", error);
      // Optionally, show an error message to the user
      // For now, we'll just close the modal
      onComplete();
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <WelcomeStep key="welcome" onStart={() => setStep(2)} progress={(step -1) / totalSteps} />;
      case 2:
        return <QuestionStep
          key="goal"
          title="Apa tujuan utamamu saat ini?"
          options={[
            { value: 'build_muscle', label: 'Bentuk Otot', icon: Dumbbell, description: 'Fokus pada latihan kekuatan untuk membangun massa otot.' },
            { value: 'lose_weight', label: 'Turun Berat Badan', icon: Wind, description: 'Prioritaskan kardio dan pembakaran kalori.' },
            { value: 'get_fit', label: 'Bugar & Sehat', icon: Heart, description: 'Kombinasi seimbang antara kekuatan dan kardio.' },
          ]}
          onSelect={(value) => handleSelect('goal', value)}
          progress={(step -1) / totalSteps}
        />;
      case 3:
        return <QuestionStep
          key="location"
          title="Di mana kamu biasanya berolahraga?"
          options={[
            { value: 'home', label: 'Di Rumah', icon: Home, description: 'Latihan dengan alat minimal atau tanpa alat.' },
            { value: 'gym', label: 'Di Gym', icon: Building, description: 'Akses penuh ke semua jenis peralatan latihan.' },
          ]}
          onSelect={(value) => handleSelect('location', value)}
          progress={(step -1) / totalSteps}
        />;
      case 4:
        return <QuestionStep
          key="level"
          title="Seperti apa level kebugaranmu?"
          options={[
            { value: 'beginner', label: 'Baru Memulai', icon: Leaf, description: 'Memulai perjalanan kebugaran dari awal.' },
            { value: 'intermediate', label: 'Kadang-kadang', icon: Zap, description: 'Sudah terbiasa dengan beberapa jenis latihan.' },
            { value: 'advanced', label: 'Sudah Rutin', icon: Mountain, description: 'Berlatih secara konsisten dengan intensitas tinggi.' },
          ]}
          onSelect={(value) => handleSelect('level', value)}
          progress={(step -1) / totalSteps}
        />;
      case 5:
        return <FinishStep key="finish" onFinish={handleFinish} />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-lg z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl h-[450px] bg-card rounded-2xl shadow-2xl overflow-hidden">
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Sub-components for each step

const WelcomeStep = ({ onStart, progress }: { onStart: () => void; progress: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
    className="w-full h-full flex flex-col items-center justify-center text-center p-8"
  >
    <div className="w-full mb-8">
      <ProgressBar progress={progress} />
    </div>
    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Selamat Datang di Fitney!</h1>
    <p className="text-gray-600 dark:text-gray-300 mb-8">Hanya 3 langkah singkat untuk pengalaman yang lebih personal.</p>
    <Button onClick={onStart} size="lg">Mulai</Button>
  </motion.div>
);

interface Option {
  value: string;
  label: string;
  icon: React.ElementType;
  description: string;
}

const QuestionStep = ({ title, options, onSelect, progress }: { title: string; options: Option[]; onSelect: (value: string) => void; progress: number }) => (
  <motion.div
    initial={{ opacity: 0, x: 100 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -100 }}
    transition={{ duration: 0.4, type: 'spring', stiffness: 100, damping: 15 }}
    className="w-full h-full flex flex-col p-8"
  >
    <div className="w-full mb-8">
      <ProgressBar progress={progress} />
    </div>
    <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">{title}</h2>
    <div className={`grid grid-cols-1 md:grid-cols-${options.length} gap-4`}>
      {options.map(({ value, label, icon: Icon, description }) => (
        <motion.div
          key={value}
          onClick={() => onSelect(value)}
          className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors duration-200"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Icon className="w-12 h-12 mx-auto text-blue-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{label}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        </motion.div>
      ))}
    </div>
  </motion.div>
);

const FinishStep = ({ onFinish }: { onFinish: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onFinish, 2000); // Automatically finish after 2 seconds
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, type: 'spring' }}
      className="w-full h-full flex flex-col items-center justify-center text-center p-8"
    >
      <CheckCircle className="w-20 h-20 text-green-500 mb-6" />
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Selesai!</h1>
      <p className="text-gray-600 dark:text-gray-300">Profilmu sedang kami siapkan...</p>
    </motion.div>
  );
};

const ProgressBar = ({ progress }: { progress: number }) => (
  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
    <motion.div
      className="bg-blue-500 h-2.5 rounded-full"
      initial={{ width: 0 }}
      animate={{ width: `${progress * 100}%` }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
    />
  </div>
);

export default OnboardingModal;
