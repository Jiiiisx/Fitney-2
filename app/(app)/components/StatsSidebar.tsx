"use client";

import { User } from "lucide-react";
import dynamic from 'next/dynamic';
import { useEffect, useState } from "react";

const DynamicQuickActions = dynamic(() => import('./QuickActions'), { ssr: false });

const CircularProgress = ({ percentage }: { percentage: number }) => {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center w-32 h-32">
      <svg className="absolute w-full h-full" viewBox="0 0 120 120">
        <circle
          className="text-border"
          strokeWidth="10"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="60"
          cy="60"
        />
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
      <div className="absolute flex items-center justify-center w-24 h-24 bg-muted rounded-full">
        <User className="w-12 h-12 text-muted-foreground" />
      </div>
      <div className="absolute top-0 right-0 bg-foreground text-background text-xs font-bold px-2 py-1 rounded-full">
        {percentage}%
      </div>
    </div>
  );
};

const StatsSidebar = () => {
  const [userName, setUserName] = useState("User");
  const [stats, setStats] = useState({ consistencyChange: 0, goalProgress: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Authentication token not found.");
        setLoading(false);
        return;
      }

      try {
        const headers = { 'Authorization': `Bearer ${token}` };
        
        const userRes = await fetch('/api/users/me', { headers });
        if (!userRes.ok) throw new Error('Failed to fetch user data');
        const userData = await userRes.json();
        setUserName(userData.full_name || userData.username);

        const statsRes = await fetch('/api/stats/sidebar', { headers });
        if (!statsRes.ok) throw new Error('Failed to fetch stats');
        const statsData = await statsRes.json();
        setStats(statsData);

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
        <p className="text-muted-foreground">Loading stats...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Statistic</h2>
      </div>

      <div className="flex flex-col items-center text-center">
        <CircularProgress percentage={stats.goalProgress} />
        <h3 className="mt-4 text-xl font-bold text-foreground">
          Good Morning, {userName}! 🔥
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Continue your journey to achieve your target!
        </p>
      </div>

      <div className="text-center bg-muted border border-border rounded-lg p-3">
        <p className="text-sm text-foreground">
          <span className="font-bold">Good job!</span> Your workout consistency
          is {stats.consistencyChange >= 0 ? 'up by' : 'down by'}{' '}
          <span className="font-bold">{Math.abs(stats.consistencyChange)}%</span> from last week.
        </p>
      </div>

      <DynamicQuickActions />
    </div>
  );
};

export default StatsSidebar;
