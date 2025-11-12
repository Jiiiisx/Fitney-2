"use client";

import { BrainCircuit, BarChartBig, ArrowRight } from "lucide-react";

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
  <div className="bg-background/50 p-6 rounded-xl flex-1">
    <div className="flex items-start">
      <feature.icon className={`w-8 h-8 mr-4 ${feature.color}`} />
      <div>
        <h4 className="font-bold text-foreground">{feature.title}</h4>
        <p className="text-sm text-secondary-foreground mt-1">{feature.description}</p>
      </div>
    </div>
  </div>
);

const UpgradeBanner = () => {
  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg text-foreground">
          Unlock Your Full Potential
        </h3>
        <button className="bg-primary text-primary-foreground font-bold px-5 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
          <span>Upgrade to Pro</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
      <div className="flex flex-col md:flex-row gap-6">
        {premiumFeatures.map((feature) => (
          <TeaserCard key={feature.title} feature={feature} />
        ))}
      </div>
    </div>
  );
};

export default UpgradeBanner;
