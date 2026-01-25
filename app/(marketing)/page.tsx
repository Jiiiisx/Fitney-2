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
import { Loader2 } from "lucide-react";

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
      <div className="bg-gradient-to-b from-white to-[#fff9e6] min-h-screen lg:h-screen flex items-center pt-24 lg:pt-0">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20 text-center lg:text-left">
            <div className="order-2 lg:order-1 max-w-2xl mx-auto lg:mx-0">
              <div className="inline-block bg-yellow-200 rounded-full px-4 py-1 text-sm font-bold text-yellow-800 mb-6 shadow-sm">
                Introducing Fitney
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-gray-800 tracking-tight leading-[1.1]">
                Find your healthiest you with
              </h1>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-yellow-500 mt-2 tracking-tight">
                Fitney
              </h1>
              <p className="text-gray-600 mt-6 text-lg sm:text-xl max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Track workouts, monitor health, plan meals, and stay motivated.
                A brighter, balanced lifestyle starts here.
              </p>
              <p className="text-gray-500 mt-8 italic text-sm sm:text-base border-l-4 border-yellow-400 pl-4 py-1 inline-block text-left">
                "Start small, stay consistent, and see the change."
              </p>
              <div className="mt-10 flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
                <button className="bg-yellow-400 text-gray-900 font-black px-10 py-4 rounded-full hover:bg-yellow-500 transition-all shadow-xl shadow-yellow-400/30 hover:scale-105 active:scale-95 text-lg">
                  Get Started
                </button>
                <button className="bg-white/50 backdrop-blur-sm text-gray-700 font-bold px-10 py-4 rounded-full border border-gray-200 hover:bg-white hover:border-gray-300 transition-all text-lg shadow-sm">
                  Explore Features
                </button>
              </div>
            </div>
            <div className="order-1 lg:order-2 w-full max-w-sm sm:max-w-md lg:max-w-none px-4">
              <div className="relative">
                <div className="absolute -inset-4 bg-yellow-400/20 rounded-[3rem] blur-3xl -z-10 animate-pulse"></div>
                <Image
                  src={heroImage}
                  width={1200}
                  height={1200}
                  alt="Fitness"
                  className="rounded-[2.5rem] shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500"
                  priority
                />
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
