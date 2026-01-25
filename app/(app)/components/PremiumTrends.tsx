"use client";

import { 
    LineChart, 
    Line, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown, Scale, Utensils, Lock, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PremiumTrendsProps {
    data: any[];
    isPremium: boolean;
}

export default function PremiumTrends({ data, isPremium }: PremiumTrendsProps) {
    return (
        <Card className="relative overflow-hidden border-none shadow-lg bg-card/50 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingDown className="w-5 h-5 text-primary" />
                    Trend Correlation Analysis
                </CardTitle>
                <p className="text-xs text-muted-foreground">Correlation between daily calorie intake and weight fluctuation (Last 30 Days)</p>
            </CardHeader>
            <CardContent className="h-[300px] relative">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis 
                            dataKey="date" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} 
                            interval={6}
                        />
                        <YAxis 
                            yAxisId="left" 
                            axisLine={false} 
                            tickLine={false} 
                            domain={['dataMin - 2', 'dataMax + 2']}
                            tick={{ fontSize: 10, fill: '#3b82f6' }}
                        />
                        <YAxis 
                            yAxisId="right" 
                            orientation="right" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fill: '#10b981' }}
                        />
                        <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                        <Line 
                            yAxisId="left" 
                            type="monotone" 
                            dataKey="weight" 
                            name="Weight (kg)" 
                            stroke="#3b82f6" 
                            strokeWidth={3} 
                            dot={{ r: 4, fill: '#3b82f6' }}
                            connectNulls
                        />
                        <Line 
                            yAxisId="right" 
                            type="monotone" 
                            dataKey="calories" 
                            name="Calories (kcal)" 
                            stroke="#10b981" 
                            strokeWidth={3} 
                            dot={{ r: 4, fill: '#10b981' }}
                            connectNulls
                        />
                    </LineChart>
                </ResponsiveContainer>

                {!isPremium && (
                    <div className="absolute inset-0 bg-background/60 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                            <Scale className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="font-bold mb-1 flex items-center gap-2 text-sm">
                            Correlation Insights <Crown className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        </h3>
                        <p className="text-[10px] text-muted-foreground mb-4 max-w-[200px]">
                            Understand how your nutrition directly affects your physical progress.
                        </p>
                        <Button size="sm" className="rounded-full font-bold h-8 text-xs">Unlock Analysis</Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
