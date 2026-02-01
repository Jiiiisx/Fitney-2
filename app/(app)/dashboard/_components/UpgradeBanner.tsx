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

const UpgradeBanner = () => {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-8 text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-10"><Sparkles className="w-32 h-32" /></div>
      
      <div className="flex flex-col lg:flex-row justify-between lg:items-center mb-8 gap-6 relative z-10">
        <div>
            <h3 className="text-2xl font-black italic tracking-tight mb-2 uppercase">Unlock Your Full Potential</h3>
            <p className="text-zinc-400 font-medium max-w-md text-sm">Join the Elite members and get access to deep AI analytics and personalized coaching.</p>
        </div>
        <Link href="/premium">
            <button className="bg-primary text-primary-foreground font-black px-8 py-4 rounded-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-xl shadow-primary/20">
                <span>GO PREMIUM NOW</span>
                <ArrowRight className="w-5 h-5" />
            </button>
        </Link>
      </div>
      <div className="flex flex-col md:flex-row gap-6 relative z-10 text-zinc-900">
        {premiumFeatures.map((feature) => (
          <TeaserCard key={feature.title} feature={feature} />
        ))}
      </div>
    </div>
  );
};

export default UpgradeBanner;
