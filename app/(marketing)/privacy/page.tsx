"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft, ShieldCheck } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#fff9e6] pt-32 pb-20">
      <div className="container mx-auto px-6 max-w-4xl">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-yellow-700 font-bold mb-8 hover:gap-3 transition-all"
        >
          <ChevronLeft size={20} />
          Back to Home
        </Link>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-yellow-100"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-yellow-100 p-3 rounded-2xl">
              <ShieldCheck className="w-8 h-8 text-yellow-600" />
            </div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Privacy Policy</h1>
          </div>

          <div className="space-y-8 text-gray-700 leading-relaxed">
            <section>
              <h2 className="text-xl font-black text-gray-900 mb-4 uppercase tracking-wider">1. Information We Collect</h2>
              <p>
                Fitney collects information that you provide directly to us when you create an account, 
                log your workouts, or communicate with our AI Coach. This includes your name, email, 
                fitness goals, and health-related data you choose to share.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-gray-900 mb-4 uppercase tracking-wider">2. How We Use Your Data</h2>
              <p>
                We use your information to provide, maintain, and improve our services, including 
                personalizing your fitness plans and providing AI-driven health insights. 
                Your data is encrypted and never sold to third parties.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-gray-900 mb-4 uppercase tracking-wider">3. AI Coaching Data</h2>
              <p>
                When you interact with the Fitney AI Coach, your messages are processed by our 
                AI models to provide relevant health advice. This data is used solely to improve 
                your experience and the accuracy of our AI.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-gray-900 mb-4 uppercase tracking-wider">4. Data Security</h2>
              <p>
                We use industry-standard encryption and security measures to protect your personal information. 
                However, no method of transmission over the Internet is 100% secure.
              </p>
            </section>

            <div className="pt-8 border-t border-gray-100 mt-12">
              <p className="text-sm font-bold text-gray-500 italic">
                Last updated: March 4, 2026. For any questions, contact us at privacy@fitney.app
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
