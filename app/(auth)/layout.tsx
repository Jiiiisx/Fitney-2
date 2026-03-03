"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { TrendingUp, Trophy, Award, Bell, ChevronLeft, Star, Heart, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import DisclaimerModal from "@/components/DisclaimerModal";

const features = [
    { 
        text: "Track your progress visually", 
        icon: TrendingUp, 
        color: "bg-orange-500",
        description: "Watch your health journey unfold with beautiful charts."
    },
    { 
        text: "Join fitness challenges", 
        icon: Trophy, 
        color: "bg-yellow-500",
        description: "Compete with others and push your limits together."
    },
    { 
        text: "Earn rewards for consistency", 
        icon: Award, 
        color: "bg-green-500",
        description: "Your hard work deserves recognition. Get badges & XP."
    },
    { 
        text: "Build habits with reminders", 
        icon: Bell, 
        color: "bg-blue-500",
        description: "Stay on track with personalized smart notifications."
    },
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentFeature, setCurrentFeature] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const feature = features[currentFeature];
  const Icon = feature.icon;

  return (
    <div className="min-h-screen w-full bg-[#fff9e6] flex items-center justify-center p-0 lg:p-8 overflow-x-hidden">
      <DisclaimerModal />
      
      {/* Background Decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vh] bg-yellow-200 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vh] bg-orange-200 rounded-full blur-[120px] animate-pulse delay-1000"></div>
      </div>

      {/* Main Unified Card */}
      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative w-full max-w-6xl min-h-[100vh] lg:min-h-[85vh] bg-white lg:rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(251,191,36,0.15)] flex flex-col lg:flex-row overflow-hidden z-10"
      >
        {/* Left Side: Visual Experience (Hidden on Mobile) */}
        <div className="hidden lg:flex lg:w-[45%] bg-[#1a1a1a] relative overflow-hidden flex-col justify-between p-16">
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-500/20 via-transparent to-transparent"></div>
                <div className="grid grid-cols-8 gap-4 opacity-10">
                    {Array.from({ length: 64 }).map((_, i) => (
                        <div key={i} className="h-12 border border-white/10 rounded-lg"></div>
                    ))}
                </div>
            </div>

            <div className="z-10">
                <Link href="/" className="inline-flex items-center gap-2 group">
                    <div className="bg-yellow-400 p-2.5 rounded-2xl shadow-lg shadow-yellow-400/20 group-hover:scale-110 transition-transform">
                        <ChevronLeft className="w-5 h-5 text-yellow-950" />
                    </div>
                    <span className="font-black text-2xl text-white tracking-tighter">Fitney</span>
                </Link>
            </div>

            <div className="z-10 relative">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentFeature}
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 30 }}
                        transition={{ duration: 0.6, type: "spring" }}
                        className="space-y-8"
                    >
                        <div className={`${feature.color} w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl shadow-black/50`}>
                            <Icon className="w-10 h-10 text-white" strokeWidth={2.5} />
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-5xl font-black text-white tracking-tight leading-[1.1]">
                                {feature.text}
                            </h2>
                            <p className="text-xl text-gray-400 font-medium max-w-xs leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Progress Indicators */}
                <div className="flex gap-3 mt-12">
                    {features.map((_, i) => (
                        <div 
                            key={i} 
                            className={`h-1.5 rounded-full transition-all duration-500 ${
                                i === currentFeature ? "w-12 bg-yellow-400" : "w-3 bg-white/20"
                            }`}
                        />
                    ))}
                </div>
            </div>

            <div className="z-10 flex flex-col gap-6">
                <div className="flex items-center gap-6 text-[11px] font-black text-gray-500 uppercase tracking-[0.2em]">
                    <Link href="/privacy" className="hover:text-yellow-400 transition-colors">Privacy Policy</Link>
                    <Link href="/terms" className="hover:text-yellow-400 transition-colors">Terms of Service</Link>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex -space-x-3">
                        {[1,2,3].map(i => (
                            <div key={i} className="w-8 h-8 rounded-full border-2 border-[#1a1a1a] bg-gray-800 flex items-center justify-center overflow-hidden">
                                <div className="w-full h-full bg-gradient-to-br from-yellow-400 to-orange-500 opacity-80"></div>
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-gray-400 font-bold tracking-tight">
                        Joined by <span className="text-white">10k+</span> fitness enthusiasts
                    </p>
                </div>
            </div>
        </div>

        {/* Right Side: Authentication Area */}
        <div className="flex-1 flex flex-col relative bg-white overflow-y-auto">
            {/* Mobile Header */}
            <div className="lg:hidden flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white/80 backdrop-blur-md z-20">
                <Link href="/" className="font-black text-2xl text-yellow-500 tracking-tighter">Fitney</Link>
                <Button asChild variant="ghost" size="sm" className="font-bold">
                    <Link href="/"><ChevronLeft className="w-4 h-4 mr-1" />Back</Link>
                </Button>
            </div>

            <div className="flex-1 flex flex-col justify-center p-8 sm:p-12 lg:p-20">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={pathname}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4 }}
                        className="w-full max-w-md mx-auto"
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Mobile Footer Links */}
            <div className="lg:hidden p-8 flex flex-col items-center gap-4 border-t border-gray-50 bg-gray-50/50">
                <div className="flex gap-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <Link href="/privacy">Privacy</Link>
                    <Link href="/terms">Terms</Link>
                </div>
                <p className="text-[10px] text-gray-300 font-bold">&copy; 2026 Fitney Inc.</p>
            </div>
        </div>
      </motion.div>
    </div>
  );
}
