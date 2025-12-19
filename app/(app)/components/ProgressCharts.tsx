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
} from "recharts";

interface ProgressChartsProps {
  weeklyData?: any[];
  isLoading?: boolean;
}

export default function ProgressCharts({ weeklyData, isLoading }: ProgressChartsProps) {
  if (isLoading) {
    return (
        <Card className="bg-card/50 dark:bg-card/80 backdrop-blur-sm border-none shadow-none">
            <CardHeader>
                <CardTitle>Weekly Activity</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center bg-muted/20 animate-pulse rounded-lg">
                Loading charts...
            </CardContent>
        </Card>
    )
  }

  const data = weeklyData && weeklyData.length > 0 ? weeklyData : [
    { name: "Mon", value: 0 },
    { name: "Tue", value: 0 },
    { name: "Wed", value: 0 },
    { name: "Thu", value: 0 },
    { name: "Fri", value: 0 },
    { name: "Sat", value: 0 },
    { name: "Sun", value: 0 },
  ];

  return (
    <Card className="bg-card/50 dark:bg-card/80 backdrop-blur-sm border-none shadow-none">
      <CardHeader>
        <CardTitle>Weekly Activity (Minutes)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
                itemStyle={{ color: "var(--foreground)" }}
                cursor={{ fill: "var(--muted)", opacity: 0.2 }}
              />
              <Bar
                dataKey="value"
                fill="var(--primary)" // Use CSS variable for color
                radius={[4, 4, 0, 0]}
                barSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}