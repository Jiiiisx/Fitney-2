"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft, FileText } from "lucide-react";

export default function TermsPage() {
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
              <FileText className="w-8 h-8 text-yellow-600" />
            </div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Terms of Service</h1>
          </div>

          <div className="space-y-8 text-gray-700 leading-relaxed">
            <section>
              <h2 className="text-xl font-black text-gray-900 mb-4 uppercase tracking-wider">1. Acceptance of Terms</h2>
              <p>
                By accessing or using Fitney, you agree to be bound by these Terms of Service. 
                If you do not agree to all of these terms, do not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-gray-900 mb-4 uppercase tracking-wider">2. Medical Disclaimer</h2>
              <p className="bg-yellow-50 p-4 rounded-xl border-l-4 border-yellow-400 font-medium">
                Fitney is not a medical organization. The AI Coach provides general wellness 
                information and should not be used as a substitute for professional medical advice, 
                diagnosis, or treatment. Always consult with a doctor before starting any new exercise program.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-gray-900 mb-4 uppercase tracking-wider">3. User Accounts</h2>
              <p>
                You are responsible for maintaining the confidentiality of your account password 
                and for all activities that occur under your account. You must be at least 13 years old 
                to use Fitney.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-gray-900 mb-4 uppercase tracking-wider">4. Prohibited Conduct</h2>
              <p>
                You agree not to use Fitney for any unlawful purpose or to interfere with the 
                operation of our services. Harassment of other users in the community is strictly prohibited.
              </p>
            </section>

            <div className="pt-8 border-t border-gray-100 mt-12">
              <p className="text-sm font-bold text-gray-500 italic">
                Last updated: March 4, 2026. For any questions, contact us at legal@fitney.app
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
