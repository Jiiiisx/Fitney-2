"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Dumbbell, Star, TrendingUp, Trophy, Award, Bell, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

const stats = [
    { name: 'Active Users', value: '10K+', icon: Users },
    { name: 'Workouts Logged', value: '1M+', icon: Dumbbell },
    { name: 'App Rating', value: '4.9★', icon: Star },
];

const features = [
    { text: "Track your progress visually", icon: TrendingUp },
    { text: "Join fitness challenges", icon: Trophy },
    { text: "Earn rewards for consistency", icon: Award },
    { text: "Build habits with reminders", icon: Bell },
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
    }, 4000); // Auto-slide every 4 seconds
    return () => clearInterval(timer);
  }, []);

  const CurrentFeatureIcon = features[currentFeature].icon;

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-gradient-to-b from-white to-[#fff9e6]">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-col items-center justify-center gap-8 p-12">
        <div className="w-full max-w-md flex flex-col items-center">
            <div className="space-y-10 text-center">
                {/* Feature Carousel */}
                <div className="h-24 flex items-center justify-center">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentFeature}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5 }}
                            className="flex flex-col items-center gap-4"
                        >
                            <CurrentFeatureIcon className="w-10 h-10 text-yellow-500" strokeWidth={1.5} />
                            <p className="text-2xl text-slate-700 font-medium leading-relaxed">
                                {features[currentFeature].text}
                            </p>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-6 text-center">
                    {stats.map((stat) => {
                        const StatIcon = stat.icon;
                        return (
                            <div key={stat.name} className="bg-white/50 p-4 rounded-lg border border-slate-200/80">
                                <StatIcon className="w-8 h-8 mx-auto text-yellow-500" strokeWidth={1.5} />
                                <p className="text-xl font-bold text-slate-800 mt-2">{stat.value}</p>
                                <p className="text-xs text-slate-500">{stat.name}</p>
                            </div>
                        );
                    })}
                </div>

                <p className="text-sm text-slate-500 italic pt-10">
                    “The only bad workout is the one that didn’t happen.”
                </p>

                <div className="pt-10">
                    <Button asChild variant="ghost" className="text-slate-600">
                        <Link href="/">
                            <ChevronLeft className="w-4 h-4 mr-2" />
                            Back to Home
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
      </div>

      {/* Right Panel (Form) */}
      <div className="flex flex-col items-center justify-center p-6 sm:p-8 relative">
        {/* Mobile Back Button */}
        <div className="absolute top-6 left-6 lg:hidden">
            <Button asChild variant="ghost" size="sm" className="text-slate-600 px-2">
                <Link href="/">
                    <ChevronLeft className="w-5 h-5 mr-1" />
                    Back
                </Link>
            </Button>
        </div>

        <AnimatePresence mode="wait">
            <motion.div
                key={pathname}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-md pt-8 lg:pt-0"
            >
                {children}
            </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
