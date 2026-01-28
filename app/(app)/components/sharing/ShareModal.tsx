'use client';

import React, { useRef, useState, useCallback } from 'react';
import { toPng } from 'html-to-image';
import download from 'downloadjs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Share2, Download, X, Camera, ImageIcon } from 'lucide-react';
import WorkoutShareCard, { WorkoutShareData } from './WorkoutShareCard';
import { toast } from 'react-hot-toast';

interface ShareModalProps {
  workoutData: WorkoutShareData;
  trigger?: React.ReactNode; // Optional custom trigger button
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function ShareModal({ workoutData, trigger, isOpen, onOpenChange }: ShareModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState<'classic' | 'photo' | 'fire'>('classic');
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Handle Image Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomImage(reader.result as string);
        setTheme('photo'); // Auto switch to photo theme
      };
      reader.readAsDataURL(file);
    }
  };

  // Generate and Download Image
  const handleDownload = useCallback(async () => {
    if (cardRef.current === null) {
      return;
    }

    setIsGenerating(true);
    const toastId = toast.loading('Generating image...');

    try {
      // Need a small timeout to ensure fonts/images render if freshly switched
      await new Promise(resolve => setTimeout(resolve, 100));

      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2, // High quality for retina/mobile
        canvasWidth: 400,
        canvasHeight: 711,
      });

      download(dataUrl, `fitney-workout-${workoutData.date.toISOString().split('T')[0]}.png`);
      toast.success('Image downloaded!', { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate image.', { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  }, [workoutData.date]);

  // Native Web Share API (Mobile)
  const handleNativeShare = useCallback(async () => {
    if (cardRef.current === null) return;
    
    if (!navigator.share) {
        toast.error('Web Share API not supported on this device. Downloading instead.');
        handleDownload();
        return;
    }

    setIsGenerating(true);
    const toastId = toast.loading('Preparing to share...');

    try {
        const dataUrl = await toPng(cardRef.current, { pixelRatio: 2 });
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], 'fitney-share.png', { type: 'image/png' });

        await navigator.share({
            title: 'My Fitney Workout',
            text: `Just crushed a ${workoutData.workoutName} session on Fitney! 💪`,
            files: [file]
        });
        toast.dismiss(toastId);
    } catch (err) {
        console.error("Share failed", err);
        // Don't show error if user cancelled the share sheet
        if ((err as Error).name !== 'AbortError') {
             toast.error('Could not share directly.', { id: toastId });
        } else {
             toast.dismiss(toastId);
        }
    } finally {
        setIsGenerating(false);
    }
  }, [handleDownload, workoutData.workoutName]);


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-4xl w-full p-0 gap-0 overflow-hidden bg-zinc-950 border-zinc-800 text-white sm:rounded-xl h-[90vh] sm:h-auto flex flex-col sm:flex-row">
        
        {/* LEFT: Preview Section */}
        <div className="flex-1 bg-zinc-900/50 relative flex items-center justify-center p-8 overflow-y-auto min-h-[400px]">
             {/* Scale wrapper to fit the huge card in the modal without scrolling too much */}
             <div className="scale-[0.6] sm:scale-[0.7] md:scale-[0.8] origin-center shadow-2xl rounded-sm">
                <WorkoutShareCard 
                    ref={cardRef} 
                    data={workoutData} 
                    theme={theme} 
                    customImage={customImage}
                />
             </div>
        </div>

        {/* RIGHT: Controls Section */}
        <div className="w-full sm:w-[320px] bg-zinc-950 p-6 flex flex-col border-l border-zinc-800">
            <DialogHeader className="mb-6">
                <DialogTitle>Share Achievement</DialogTitle>
                <p className="text-sm text-zinc-400">Customize your card and share it with friends.</p>
            </DialogHeader>

            {/* Theme Selector */}
            <div className="space-y-4 mb-6">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Select Theme</label>
                <div className="grid grid-cols-3 gap-2">
                    <button 
                        onClick={() => setTheme('classic')}
                        className={`h-16 rounded-lg border-2 flex flex-col items-center justify-center gap-1 transition-all ${theme === 'classic' ? 'border-primary bg-primary/10' : 'border-zinc-800 hover:border-zinc-700'}`}
                    >
                        <div className="w-4 h-4 rounded-full bg-zinc-800"></div>
                        <span className="text-[10px]">Classic</span>
                    </button>
                    <button 
                        onClick={() => setTheme('fire')}
                        className={`h-16 rounded-lg border-2 flex flex-col items-center justify-center gap-1 transition-all ${theme === 'fire' ? 'border-orange-500 bg-orange-500/10' : 'border-zinc-800 hover:border-zinc-700'}`}
                    >
                        <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-orange-500 to-red-500"></div>
                        <span className="text-[10px]">Fire</span>
                    </button>
                    <button 
                        onClick={() => setTheme('photo')}
                        className={`h-16 rounded-lg border-2 flex flex-col items-center justify-center gap-1 transition-all ${theme === 'photo' ? 'border-blue-500 bg-blue-500/10' : 'border-zinc-800 hover:border-zinc-700'}`}
                    >
                        <Camera className="w-4 h-4" />
                        <span className="text-[10px]">Photo</span>
                    </button>
                </div>
            </div>

            {/* Photo Upload (Only for photo theme or always visible as optional) */}
            <div className={`space-y-3 mb-8 transition-all duration-300 ${theme === 'photo' ? 'opacity-100' : 'opacity-50 grayscale'}`}>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Background Photo</label>
                <div className="relative">
                    <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        disabled={theme !== 'photo'}
                    />
                    <div className="w-full h-12 rounded-lg border border-dashed border-zinc-700 flex items-center justify-center gap-2 text-zinc-400 bg-zinc-900/50 hover:bg-zinc-900">
                        <ImageIcon className="w-4 h-4" />
                        <span className="text-sm">Upload Selfie</span>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-auto space-y-3">
                <Button 
                    className="w-full gap-2 font-bold" 
                    size="lg" 
                    onClick={handleNativeShare}
                    disabled={isGenerating}
                >
                    <Share2 className="w-4 h-4" />
                    Share Story
                </Button>
                <Button 
                    variant="outline" 
                    className="w-full gap-2 border-zinc-700 hover:bg-zinc-900 text-zinc-300" 
                    onClick={handleDownload}
                    disabled={isGenerating}
                >
                    <Download className="w-4 h-4" />
                    Save Image
                </Button>
            </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}
