'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  Dumbbell, 
  Heart, 
  Mountain, 
  Building, 
  Home, 
  Leaf, 
  Zap, 
  Wind,
  User,
  Users,
  Ruler,
  Weight as WeightIcon,
  Calendar,
  AtSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { fetchWithAuth } from '@/app/lib/fetch-helper';

// Define types for onboarding state
interface OnboardingData {
  username?: string;
  gender?: string;
  dob?: string;
  height?: string;
  weight?: string;
  goal?: string;
  location?: string;
  level?: string;
}

interface OnboardingModalProps {
  onComplete: () => void;
}

const OnboardingModal = ({ onComplete }: OnboardingModalProps) => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    username: '',
    gender: 'male',
    dob: '',
    height: '',
    weight: '',
  });

  const totalSteps = 7; // Welcome + Username + Gender + Physical + Goal + Location + Level

  const handleSelect = (field: keyof OnboardingData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
    setTimeout(() => {
      setStep(prev => prev + 1);
    }, 300);
  };

  const handleNext = () => {
    setStep(prev => prev + 1);
  };

  const handleFinish = async () => {
    try {
      await fetchWithAuth('/api/users/profile/complete-onboarding', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      onComplete();
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
      onComplete();
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <WelcomeStep key="welcome" onStart={handleNext} progress={0} />;
      
      case 2:
        return <UsernameStep 
          key="username"
          data={data}
          setData={setData}
          onNext={handleNext}
          progress={1 / totalSteps}
        />;

      case 3:
        return <QuestionStep
          key="gender"
          title="What is your gender?"
          options={[
            { value: 'male', label: 'Male', icon: User, description: 'Biological male' },
            { value: 'female', label: 'Female', icon: Users, description: 'Biological female' },
          ]}
          onSelect={(value) => handleSelect('gender', value)}
          progress={2 / totalSteps}
        />;

      case 4:
        return <PhysicalStatsStep 
          key="physical"
          data={data}
          setData={setData}
          onNext={handleNext}
          progress={3 / totalSteps}
        />;

      case 5:
        return <QuestionStep
          key="goal"
          title="What is your main goal?"
          options={[
            { value: 'build_muscle', label: 'Build Muscle', icon: Dumbbell, description: 'Focus on strength and mass.' },
            { value: 'lose_weight', label: 'Lose Weight', icon: Wind, description: 'Prioritize calorie burning.' },
            { value: 'get_fit', label: 'Fit & Healthy', icon: Heart, description: 'Balanced health focus.' },
          ]}
          onSelect={(value) => handleSelect('goal', value)}
          progress={4 / totalSteps}
        />;

      case 6:
        return <QuestionStep
          key="location"
          title="Where do you work out?"
          options={[
            { value: 'home', label: 'At Home', icon: Home, description: 'Minimal equipment.' },
            { value: 'gym', label: 'At Gym', icon: Building, description: 'Full equipment access.' },
          ]}
          onSelect={(value) => handleSelect('location', value)}
          progress={5 / totalSteps}
        />;

      case 7:
        return <QuestionStep
          key="level"
          title="Your fitness level?"
          options={[
            { value: 'beginner', label: 'Beginner', icon: Leaf, description: 'Just starting out.' },
            { value: 'intermediate', label: 'Intermediate', icon: Zap, description: 'Train sometimes.' },
            { value: 'advanced', label: 'Advanced', icon: Mountain, description: 'Train consistently.' },
          ]}
          onSelect={(value) => handleSelect('level', value)}
          progress={6 / totalSteps}
        />;

      case 8:
        return <FinishStep key="finish" onFinish={handleFinish} />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xl z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-2xl bg-card rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden border-t sm:border border-border/50 max-h-[95vh] flex flex-col">
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Sub-components

const ProgressBar = ({ progress }: { progress: number }) => (
  <div className="w-full bg-muted rounded-full h-1.5 mb-6 sm:mb-8">
    <motion.div
      className="bg-primary h-full rounded-full"
      initial={{ width: 0 }}
      animate={{ width: `${progress * 100}%` }}
      transition={{ duration: 0.5 }}
    />
  </div>
);

const WelcomeStep = ({ onStart, progress }: { onStart: () => void; progress: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.95 }}
    className="w-full p-8 sm:p-12 flex flex-col items-center text-center"
  >
    <ProgressBar progress={progress} />
    <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-8">
        <Heart className="w-10 h-10 text-primary" />
    </div>
    <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">Welcome to Fitney</h1>
    <p className="text-muted-foreground text-base sm:text-lg mb-10 max-w-sm">Let&apos;s personalize your experience to help you reach your goals faster.</p>
    <Button onClick={onStart} size="lg" className="rounded-2xl px-12 py-7 text-lg font-bold shadow-xl shadow-primary/20 w-full sm:w-auto">
      Get Started
    </Button>
  </motion.div>
);

const UsernameStep = ({ data, setData, onNext, progress }: { data: OnboardingData; setData: any; onNext: () => void; progress: number }) => {
  const isInvalid = !data.username || data.username.length < 3;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full p-6 sm:p-10 flex flex-col items-center"
    >
      <ProgressBar progress={progress} />
      <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6">
        <User className="w-8 h-8 text-blue-500" />
      </div>
      <h2 className="text-2xl sm:text-3xl font-black text-center mb-2 tracking-tight italic">How should we call you?</h2>
      <p className="text-muted-foreground text-sm sm:text-base text-center mb-8">Choose a display name for the community.</p>
      
      <div className="w-full max-w-sm space-y-4 mb-10">
        <div className="space-y-2">
          <Label className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground ml-1">
            Display Name / Username
          </Label>
          <Input 
            type="text" 
            placeholder="e.g. FitWarrior" 
            value={data.username} 
            onChange={(e) => setData({...data, username: e.target.value.replace(/\s+/g, '_')})}
            className="rounded-xl h-14 font-bold text-lg px-6 shadow-none border-2 focus:border-primary"
          />
          <p className="text-[10px] text-muted-foreground ml-1">
            Minimum 3 characters. This will be your identity in Fitney.
          </p>
        </div>
      </div>

      <Button 
        disabled={isInvalid} 
        onClick={onNext}
        className="rounded-2xl px-12 h-14 font-bold text-lg w-full max-w-sm shadow-lg shadow-primary/20"
      >
        That Looks Good
      </Button>
    </motion.div>
  );
};

const QuestionStep = ({ title, options, onSelect, progress }: { title: string; options: any[]; onSelect: (value: string) => void; progress: number }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="w-full p-6 sm:p-10 flex flex-col h-full overflow-y-auto"
  >
    <ProgressBar progress={progress} />
    <h2 className="text-2xl sm:text-3xl font-black text-center mb-8 tracking-tight italic">{title}</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-4">
      {options.map(({ value, label, icon: Icon, description }, idx) => (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          key={value}
          onClick={() => onSelect(value)}
          className="group p-4 sm:p-6 rounded-3xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all text-left sm:text-center flex sm:flex-col items-center gap-4 sm:gap-3"
        >
          <div className="p-3 sm:p-4 bg-muted rounded-2xl group-hover:bg-primary/10 transition-colors shrink-0">
            <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <div className="flex flex-col sm:items-center">
            <h3 className="font-bold text-base sm:text-lg">{label}</h3>
            <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight">{description}</p>
          </div>
        </motion.button>
      ))}
    </div>
  </motion.div>
);

const PhysicalStatsStep = ({ data, setData, onNext, progress }: { data: OnboardingData; setData: any; onNext: () => void; progress: number }) => {
  const isInvalid = !data.dob || !data.height || !data.weight;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full p-6 sm:p-10 h-full overflow-y-auto"
    >
      <ProgressBar progress={progress} />
      <h2 className="text-2xl sm:text-3xl font-black text-center mb-8 tracking-tight italic">Tell us about yourself</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-10">
        <div className="space-y-2">
          <Label className="flex items-center gap-2 font-bold mb-2 uppercase text-[10px] tracking-widest text-muted-foreground">
            <Calendar className="w-3 h-3" /> Birth Date
          </Label>
          <Input 
            type="date" 
            value={data.dob} 
            onChange={(e) => setData({...data, dob: e.target.value})}
            className="rounded-xl h-14 font-bold text-base shadow-none border-2"
          />
        </div>
        <div className="space-y-2">
          <Label className="flex items-center gap-2 font-bold mb-2 uppercase text-[10px] tracking-widest text-muted-foreground">
            <Ruler className="w-3 h-3" /> Height (cm)
          </Label>
          <Input 
            type="number" 
            placeholder="170" 
            value={data.height} 
            onChange={(e) => setData({...data, height: e.target.value})}
            className="rounded-xl h-14 font-bold text-lg shadow-none border-2"
          />
        </div>
        <div className="space-y-2">
          <Label className="flex items-center gap-2 font-bold mb-2 uppercase text-[10px] tracking-widest text-muted-foreground">
            <WeightIcon className="w-3 h-3" /> Weight (kg)
          </Label>
          <Input 
            type="number" 
            placeholder="60" 
            value={data.weight} 
            onChange={(e) => setData({...data, weight: e.target.value})}
            className="rounded-xl h-14 font-bold text-lg shadow-none border-2"
          />
        </div>
      </div>

      <div className="flex justify-center pb-4">
        <Button 
          disabled={isInvalid} 
          onClick={onNext}
          className="rounded-2xl px-12 h-14 font-bold text-lg w-full sm:w-auto shadow-lg shadow-primary/20"
        >
          Continue
        </Button>
      </div>
    </motion.div>
  );
};

const FinishStep = ({ onFinish }: { onFinish: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onFinish, 2000);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full p-16 flex flex-col items-center justify-center text-center"
    >
      <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mb-8">
        <CheckCircle className="w-12 h-12 text-green-500" />
      </div>
      <h1 className="text-4xl font-black tracking-tight mb-2">All Set!</h1>
      <p className="text-muted-foreground text-lg">We&apos;re calculating your custom plan...</p>
    </motion.div>
  );
};

export default OnboardingModal;
