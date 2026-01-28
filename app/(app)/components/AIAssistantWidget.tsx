'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, MessageSquare, BrainCircuit } from 'lucide-react';
import { useAI } from '@/app/lib/AIContext';
import { usePathname } from 'next/navigation';

export default function AIAssistantWidget() {
  const { currentTip, isLoading, briefing } = useAI();
  const [isVisible, setIsVisible] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const pathname = usePathname();

  // Show widget after a short delay
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Show text bubble when tip changes or page changes
  useEffect(() => {
    if (currentTip) {
      setShowBubble(true);
      const timer = setTimeout(() => setShowBubble(false), 8000); // Hide after 8s
      return () => clearTimeout(timer);
    }
  }, [currentTip, pathname]);

  if (!isVisible || isLoading) return null;

  return (
    <div className="fixed bottom-6 left-6 z-[100] flex flex-col items-start gap-3 pointer-events-none">
      <AnimatePresence>
        {showBubble && currentTip && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10, x: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="pointer-events-auto max-w-[280px] bg-white dark:bg-zinc-900 border border-primary/20 shadow-2xl rounded-2xl p-4 relative"
          >
            {/* Speech Bubble Arrow */}
            <div className="absolute -bottom-2 left-6 w-4 h-4 bg-white dark:bg-zinc-900 border-r border-b border-primary/20 rotate-45" />
            
            <div className="flex gap-2">
              <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <p className="text-xs font-medium leading-relaxed text-zinc-700 dark:text-zinc-300">
                {currentTip}
              </p>
            </div>
            <button 
                onClick={() => setShowBubble(false)}
                className="absolute top-1 right-1 p-1 text-muted-foreground hover:text-foreground transition-colors"
            >
                <X className="w-3 h-3" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowBubble(!showBubble)}
        className="pointer-events-auto h-12 w-12 rounded-full bg-gradient-to-br from-zinc-900 to-black dark:from-primary dark:to-yellow-600 flex items-center justify-center shadow-lg border-2 border-white/20 relative group"
      >
        <BrainCircuit className="w-6 h-6 text-white dark:text-zinc-900" />
        
        {/* Readiness Badge */}
        {briefing && (
            <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                <span className="text-[8px] font-bold text-white">{briefing.readinessScore}</span>
            </div>
        )}

        <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping group-hover:hidden" />
      </motion.button>
    </div>
  );
}
