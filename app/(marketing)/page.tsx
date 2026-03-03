"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import heroImage from "@/public/assets/hero.png"
import About from "../(marketing)/About";
import BenefitSection from "../(marketing)/BenefitSection";
import Testimonials from "../(marketing)/Testimonials";
import Pricing from "../(marketing)/Pricing";
import Faq from "../(marketing)/Faq";
import ClosingCta from "../(marketing)/ClosingCta";
import Footer from "../(marketing)/Footer";
import { Loader2, Flame, Heart, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate initial mount loading for professional feel
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#fff9e6]">
        <Loader2 className="w-10 h-10 animate-spin text-yellow-500" />
        <p className="text-yellow-800 font-bold tracking-tighter text-2xl animate-pulse">Fitney</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gradient-to-b from-white to-[#fff9e6] min-h-screen flex items-center pt-24 lg:pt-32 pb-20">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">
            <div className="max-w-2xl mx-auto lg:mx-0 text-center lg:text-left flex flex-col items-center lg:items-start">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-800 tracking-tight leading-[1.1]">
                Find your healthiest you with
              </h1>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-yellow-500 mt-0 tracking-tight">
                Fitney
              </h1>
              <p className="text-gray-600 mt-6 text-base sm:text-xl max-w-xl mx-auto lg:mx-0 leading-relaxed opacity-90">
                Track workouts, monitor health, plan meals, and stay motivated.
                A brighter, balanced lifestyle starts here.
              </p>
              <p className="text-gray-500 mt-8 italic text-sm sm:text-base border-l-2 lg:border-l-4 border-yellow-400 pl-4 py-1 inline-block text-left">
                "Start small, stay consistent, and see the change."
              </p>
              <div className="mt-10 flex flex-col sm:flex-row justify-center lg:justify-start gap-4 w-full sm:w-auto px-4 sm:px-0">
                <button className="bg-yellow-400 text-gray-900 font-black px-10 py-4 rounded-full hover:bg-yellow-500 transition-all shadow-xl shadow-yellow-400/30 hover:scale-105 active:scale-95 text-base lg:text-lg w-full sm:w-auto">
                  Get Started
                </button>
                <button className="bg-white/50 backdrop-blur-sm text-gray-700 font-bold px-10 py-4 rounded-full border border-gray-200 hover:bg-white hover:border-gray-300 transition-all text-base lg:text-lg shadow-sm w-full sm:w-auto">
                  Explore Features
                </button>
              </div>
            </div>

            <div className="hidden lg:block w-full max-w-none px-4">
              <div className="relative group">
                {/* Decorative Background Shapes */}
                <motion.div 
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, 0] 
                  }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-20 -right-20 w-64 h-64 bg-yellow-200/30 rounded-full blur-3xl -z-10"
                />
                <motion.div 
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, -5, 0] 
                  }}
                  transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute -bottom-20 -left-20 w-80 h-80 bg-orange-200/20 rounded-full blur-3xl -z-10"
                />

                {/* Main Image Container */}
                <div className="relative z-10">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, rotate: 5 }}
                    animate={{ opacity: 1, scale: 1, rotate: 2 }}
                    transition={{ duration: 0.8 }}
                    whileHover={{ rotate: 0, scale: 1.02 }}
                    className="relative"
                  >
                    <div className="absolute -inset-4 bg-yellow-400/20 rounded-[3rem] blur-2xl -z-10 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                    <Image
                      src={heroImage}
                      width={1200}
                      height={1200}
                      alt="Fitness"
                      className="rounded-[2.5rem] shadow-2xl transition-all duration-500"
                      priority
                    />
                  </motion.div>

                  {/* Floating UI Elements */}
                  <motion.div
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="absolute -right-8 top-10 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/50 z-20"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-orange-100 p-2 rounded-xl">
                        <Flame className="w-6 h-6 text-orange-500" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Calories</p>
                        <p className="text-xl font-black text-gray-800">1,284 kcal</p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.7, duration: 0.8 }}
                    className="absolute -left-12 bottom-20 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/50 z-20"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 p-2 rounded-xl">
                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Goal Reached</p>
                        <p className="text-sm font-bold text-gray-800">Daily Workout</p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.9, duration: 0.8 }}
                    className="absolute right-20 -bottom-10 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/50 z-20"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Heart Rate</p>
                        <div className="flex items-end gap-1">
                          <p className="text-xl font-black text-gray-800">72</p>
                          <p className="text-[10px] font-bold text-red-500 mb-1">BPM</p>
                        </div>
                      </div>
                      <motion.div 
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                      >
                        <Heart className="w-6 h-6 text-red-500 fill-red-500" />
                      </motion.div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <About />
      <BenefitSection />
      <Testimonials />
      <Pricing />
      <Faq />
      <ClosingCta />
      <Footer />
    </>
  );
}
