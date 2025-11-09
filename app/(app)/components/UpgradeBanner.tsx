'use client';

import { BrainCircuit, BarChartBig, ArrowRight } from 'lucide-react';

const premiumFeatures = [
  {
    icon: BrainCircuit,
    title: 'AI Meal Plan Preview',
    description: 'Your next suggested breakfast is: Oatmeal with berries',
    color: 'text-purple-500',
  },
  {
    icon: BarChartBig,
    title: 'Pro Stats',
    description: 'Unlock body composition tracking to monitor your progress.',
    color: 'text-green-500',
  },
];

const TeaserCard = ({ feature }: { feature: typeof premiumFeatures[0] }) => (
  <div className="bg-white/50 p-6 rounded-xl flex-1">
    <div className="flex items-start">
      <feature.icon className={`w-8 h-8 mr-4 ${feature.color}`} />
      <div>
        <h4 className="font-bold text-gray-800">{feature.title}</h4>
        <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
      </div>
    </div>
  </div>
);


const UpgradeBanner = () => {
  return (
    <div className="bg-gray-100 border border-gray-200/80 rounded-2xl p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg text-gray-800">Unlock Your Full Potential</h3>
        <button className="bg-gray-800 text-white font-bold px-5 py-2 rounded-lg hover:bg-gray-900 transition-colors flex items-center gap-2">
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