// app/(app)/components/QuickAccess.tsx
import { PlusCircle, History, BookOpen, Trophy } from "lucide-react";
import React from "react";

const links = [
  {
    icon: <PlusCircle className="w-8 h-8 text-green-600" />,
    title: "Log New Workout",
    description: "Add a new training session.",
    href: "#", // We can link this to a new page later
    bgColor: "bg-green-100",
  },
  {
    icon: <History className="w-8 h-8 text-blue-600" />,
    title: "View History",
    description: "Review your past workouts.",
    href: "#",
    bgColor: "bg-blue-100",
  },
  {
    icon: <BookOpen className="w-8 h-8 text-orange-600" />,
    title: "Nutrition Planner",
    description: "Plan and track your meals.",
    href: "#",
    bgColor: "bg-orange-100",
  },
  {
    icon: <Trophy className="w-8 h-8 text-yellow-600" />,
    title: "Start a Challenge",
    description: "Join a new weekly challenge.",
    href: "#",
    bgColor: "bg-yellow-100",
  },
];

const QuickAccessCard = ({ link }: { link: (typeof links)[0] }) => (
  <a
    href={link.href}
    className="block bg-white/50 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 hover:bg-white/80 transition-colors"
  >
    <div className={`p-3 rounded-lg inline-block ${link.bgColor}`}>
      {link.icon}
    </div>
    <h3 className="font-bold text-gray-800 mt-4">{link.title}</h3>
    <p className="text-sm text-gray-500 mt-1">{link.description}</p>
  </a>
);

const QuickAccess = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Access</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {links.map((link) => (
          <QuickAccessCard key={link.title} link={link} />
        ))}
      </div>
    </div>
  );
};

export default QuickAccess;
