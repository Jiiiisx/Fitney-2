"use client";

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
} from "recharts";

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
        <div className="flex items-center justify-between">
            <div>
                <CardTitle className="text-lg font-bold">Weekly Activity</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">Total workout duration (minutes)</p>
            </div>
            {/* Optional: Add a small badge or total summary here */}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:px-6 pb-6">
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.9} /> {/* Amber-500 */}
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.4} />
                </linearGradient>
                <linearGradient id="barGradientHover" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FBBF24" stopOpacity={1} /> {/* Amber-400 */}
                  <stop offset="95%" stopColor="#FBBF24" stopOpacity={0.6} />
                </linearGradient>
              </defs>

              <CartesianGrid 
                strokeDasharray="4 4" 
                vertical={false} 
                stroke="var(--border)" 
                opacity={0.4} 
              />
              
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                dy={12}
              />
              
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                dx={-5}
              />
              
              <Tooltip 
                content={<CustomTooltip />} 
                cursor={{ fill: 'var(--muted)', opacity: 0.15, radius: 8 }}
              />
              
              <Bar
                dataKey="value"
                fill="url(#barGradient)"
                radius={[8, 8, 8, 8]} // Fully rounded top and slightly rounded bottom if you want floating effect
                barSize={32}
                animationDuration={1500}
                animationEasing="ease-out"
              >
                {data.map((entry: any, index: number) => (
                    <Cell 
                        key={`cell-${index}`} 
                        fill={entry.value > 0 ? "url(#barGradient)" : "transparent"} 
                        className="transition-all duration-300 hover:opacity-80"
                    />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
