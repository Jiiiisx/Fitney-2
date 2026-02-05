"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from "recharts";
import { Activity, Scale, TrendingDown, TrendingUp } from "lucide-react";

interface ProgressChartsProps {
  weeklyData?: any[];
  isLoading?: boolean;
}

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover/95 backdrop-blur-md border border-border p-3 rounded-xl shadow-xl">
        <p className="text-sm font-semibold text-foreground mb-1">{label}</p>
        <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
            <p className="text-sm text-muted-foreground">
                <span className="font-bold text-foreground">{payload[0].value}</span> mins
            </p>
        </div>
      </div>
    );
  }
  return null;
};

export default function ProgressCharts({ weeklyData, isLoading }: ProgressChartsProps) {
  const [activeTab, setActiveTab] = useState<"workout" | "weight">("workout");
  const [weightData, setWeightData] = useState<any[]>([]);
  const [loadingWeight, setLoadingWeight] = useState(false);

  useEffect(() => {
    if (activeTab === "weight" && weightData.length === 0) {
      setLoadingWeight(true);
      fetch("/api/stats/weight-history")
        .then(res => res.json())
        .then(data => {
          setWeightData(data);
          setLoadingWeight(false);
        });
    }
  }, [activeTab]);

  if (isLoading) {
    return (
        <Card className="bg-card/50 backdrop-blur-sm border-none shadow-sm">
            <CardHeader className="pb-2">
                <div className="h-6 w-48 bg-muted rounded animate-pulse" />
            </CardHeader>
            <CardContent className="h-[300px] flex items-end justify-between px-8 pb-4 gap-4">
                {[...Array(7)].map((_, i) => (
                    <div key={i} className="w-full bg-muted/30 rounded-t-xl animate-pulse" style={{ height: `${((i % 5) + 2) * 10}%` }} />
                ))}
            </CardContent>
        </Card>
    )
  }

  // Ensure we have data for the chart, even if empty
  const data = weeklyData && weeklyData.length > 0 ? weeklyData : [
    { name: "Mon", value: 0 },
    { name: "Tue", value: 0 },
    { name: "Wed", value: 0 },
    { name: "Thu", value: 0 },
    { name: "Fri", value: 0 },
    { name: "Sat", value: 0 },
    { name: "Sun", value: 0 },
  ];

  // Find max value to determine active bar color dynamically if needed
  // const maxValue = Math.max(...data.map((d: any) => d.value));

  return (
    <Card className="bg-card border-none shadow-sm overflow-hidden">
      <CardHeader className="pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
                <CardTitle className="text-lg font-bold">Progress Analytics</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">Track your fitness journey data.</p>
            </div>
            
            <div className="flex bg-muted/50 p-1 rounded-xl self-start sm:self-center">
                <button 
                    onClick={() => setActiveTab("workout")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'workout' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                    <Activity className="w-3.5 h-3.5" /> Workouts
                </button>
                <button 
                    onClick={() => setActiveTab("weight")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'weight' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                    <Scale className="w-3.5 h-3.5" /> Weight
                </button>
            </div>
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:px-6 pb-6">
        <div className="h-[250px] sm:h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            {activeTab === "workout" ? (
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--border)" opacity={0.4} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }} dy={12} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dx={-5} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--muted)', opacity: 0.15, radius: 8 }} />
                <Bar
                  dataKey="value"
                  fill="url(#barGradient)"
                  radius={[8, 8, 8, 8]}
                  barSize={32}
                  animationDuration={1500}
                >
                  {data.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.value > 0 ? "url(#barGradient)" : "transparent"} />
                  ))}
                </Bar>
              </BarChart>
            ) : (
              <AreaChart data={weightData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--border)" opacity={0.4} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }} dy={12} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dx={-5} domain={['dataMin - 2', 'dataMax + 2']} />
                <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    formatter={(val) => [`${val} kg`, 'Weight']}
                />
                <Area 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="#3b82f6" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#lineGradient)" 
                    animationDuration={1500}
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
