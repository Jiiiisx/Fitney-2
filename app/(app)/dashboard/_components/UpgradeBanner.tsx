"use client";

import { BrainCircuit, BarChartBig, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

const premiumFeatures = [
  {
    icon: BrainCircuit,
    title: "AI Meal Plan Preview",
    description: "Your next suggested breakfast is: Oatmeal with berries",
    color: "text-primary",
  },
  {
    icon: BarChartBig,
    title: "Pro Stats",
    description: "Unlock body composition tracking to monitor your progress.",
    color: "text-primary",
  },
];

const TeaserCard = ({ feature }: { feature: (typeof premiumFeatures)[0] }) => (
  <div className="bg-background/50 p-6 rounded-xl flex-1 border border-border/50">
    <div className="flex items-start">
      <feature.icon className={`w-8 h-8 mr-4 ${feature.color}`} />
      <div>
        <h4 className="font-bold text-foreground">{feature.title}</h4>
        <p className="text-sm text-muted-foreground mt-1">{feature.description}</p>
      </div>
    </div>
  </div>
);

const UpgradeBanner = ({ currentRole }: { currentRole: string }) => {
  const isPro = currentRole === 'pro' || currentRole === 'premium';
  
  return (
    <div className={`bg-gradient-to-br ${isPro ? 'from-purple-600 to-violet-800' : 'from-indigo-600 to-purple-700'} border border-white/10 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-500/20`}>
      <div className="absolute top-0 right-0 p-8 opacity-10"><Sparkles className="w-32 h-32" /></div>
      
      <div className="flex flex-col lg:flex-row justify-between lg:items-center mb-8 gap-6 relative z-10">
        <div>
            <h3 className="text-2xl font-black italic tracking-tight mb-2 uppercase">
                {isPro ? 'Become an Elite Legend' : 'Unlock Your Full Potential'}
            </h3>
            <p className="text-white/70 font-medium max-w-md text-sm">
                {isPro 
                    ? 'Get exclusive ELITE badges, early access to new features, and specialized training protocols.' 
                    : 'Join the Elite members and get access to deep AI analytics and personalized coaching.'
                }
            </p>
        </div>
        <Link href="/premium">
            <button className="bg-white text-indigo-600 font-black px-8 py-4 rounded-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-xl shadow-white/10 whitespace-nowrap">
                <span>{isPro ? 'UPGRADE TO ELITE' : 'GO PREMIUM NOW'}</span>
                <ArrowRight className="w-5 h-5" />
            </button>
        </Link>
      </div>
      <div className="flex flex-col md:flex-row gap-6 relative z-10 text-white">
        {premiumFeatures.map((feature) => (
          <TeaserCard key={feature.title} feature={feature} />
        ))}
      </div>
    </div>
  );
};

export default UpgradeBanner;
