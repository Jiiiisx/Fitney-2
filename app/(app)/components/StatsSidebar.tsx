"use client";

import dynamic from 'next/dynamic';
import { useEffect, useState, useMemo } from "react";

const DynamicQuickActions = dynamic(() => import('./QuickActions'), { ssr: false });

const CircularProgress = ({ percentage, level }: { percentage: number; level: number }) => {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center w-32 h-32">
      <svg className="absolute w-full h-full" viewBox="0 0 120 120">
        <circle className="text-border" strokeWidth="10" stroke="currentColor" fill="transparent" r={radius} cx="60" cy="60" />
        <circle
          className="text-primary"
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="60"
          cy="60"
          transform="rotate(-90 60 60)"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-xs text-muted-foreground">Level</span>
        <span className="text-4xl font-bold text-foreground">{level}</span>
      </div>
    </div>
  );
};

// Helper untuk mendapatkan sapaan berdasarkan waktu
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
};

// Helper untuk mendapatkan pesan motivasi acak
const getRandomQuote = () => {
  const quotes = [
    "Continue your journey to achieve your target!",
    "Small steps every day add up to big results.",
    "Your only limit is your mind.",
    "Don't stop until you're proud.",
    "Sweat now, shine later!",
    "Consistency is the key to success.",
    "Make today count!"
  ];
  return quotes[Math.floor(Math.random() * quotes.length)];
};

const StatsSidebar = () => {
  const [userName, setUserName] = useState("User");
  const [stats, setStats] = useState({
    level: 1,
    progressPercentage: 0,
    consistencyChange: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [quote, setQuote] = useState("Continue your journey to achieve your target!");
  const [greeting, setGreeting] = useState("Hello");

  useEffect(() => {
    // Set client-side only data to prevent hydration mismatch
    setQuote(getRandomQuote());
    setGreeting(getGreeting());
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch user profile untuk nama
        const userRes = await fetch('/api/users/profile', {
          credentials: 'include'
        });
        if (userRes.ok) {
          const userData = await userRes.json();
          // Ambil nama depan saja agar tidak kepanjangan
          const fullName = userData.full_name || userData.username || "User";
          setUserName(fullName.split(' ')[0]);
        }

        // Fetch stats
        const statsRes = await fetch('/api/stats/sidebar', {
          credentials: 'include'
        });
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

      } catch (err: any) {
        console.error("Failed to fetch sidebar data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4 animate-pulse">
        <div className="rounded-full bg-muted h-32 w-32"></div>
        <div className="h-6 w-3/4 bg-muted rounded"></div>
        <div className="h-4 w-1/2 bg-muted rounded"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-8">
      <div className="flex flex-col items-center text-center">
        <CircularProgress
          percentage={stats.progressPercentage}
          level={stats.level}
        />
        <h3 className="mt-4 text-xl font-bold text-foreground">
          {greeting}, {userName}! 🔥
        </h3>
        <p className="mt-1 text-sm text-muted-foreground px-4">
          {quote}
        </p>
      </div>

      <div className="text-center bg-card border border-border rounded-xl p-4 shadow-sm">
        <p className="text-sm text-foreground">
          <span className="font-bold text-primary">Good job!</span> Your workout consistency
          is {stats.consistencyChange >= 0 ? 'up by' : 'down by'}{' '}
          <span className={stats.consistencyChange >= 0 ? "font-bold text-green-500" : "font-bold text-red-500"}>
            {Math.abs(stats.consistencyChange)}%
          </span> from last week.
        </p>
      </div>

      <div className="w-full">
        <DynamicQuickActions />
      </div>
    </div>
  );
};

export default StatsSidebar;
