"use client";

import { 
    Radar, 
    RadarChart, 
    PolarGrid, 
    PolarAngleAxis, 
    PolarRadiusAxis, 
    ResponsiveContainer 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface PremiumAnalyticsProps {
    data: any[];
    isPremium: boolean;
}

export default function PremiumAnalytics({ data, isPremium }: PremiumAnalyticsProps) {
    return (
        <Card className="relative overflow-hidden border-none shadow-lg bg-card/50 backdrop-blur-sm group">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-500" />
                    Fitness Balance Analysis
                </CardTitle>
                <p className="text-xs text-muted-foreground">Comprehensive view of your physical health dimensions</p>
            </CardHeader>
            <CardContent className="h-[350px] relative">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                        <PolarGrid stroke="hsl(var(--border))" />
                        <PolarAngleAxis 
                            dataKey="subject" 
                            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 600 }}
                        />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar
                            name="Stats"
                            dataKey="A"
                            stroke="hsl(var(--primary))"
                            fill="hsl(var(--primary))"
                            fillOpacity={0.5}
                            strokeWidth={3}
                        />
                    </RadarChart>
                </ResponsiveContainer>

                {/* PRO OVERLAY */}
                {!isPremium && (
                    <div className="absolute inset-0 bg-background/60 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                            <Lock className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                            Premium Feature <Crown className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                        </h3>
                        <p className="text-sm text-muted-foreground mb-6 max-w-[250px]">
                            Unlock deep insights into your fitness balance and track your evolution over time.
                        </p>
                        <Link href="/premium">
                            <Button className="rounded-full px-8 font-bold shadow-lg shadow-primary/20">
                                Upgrade to Pro
                            </Button>
                        </Link>
                    </div>
                )}
            </CardContent>
            
            {isPremium && data.length > 0 && (
                 <div className="px-6 pb-6 grid grid-cols-2 gap-4">
                    <div className="p-3 bg-primary/5 rounded-2xl border border-primary/10">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Top Strength</p>
                        <p className="text-sm font-bold text-primary">
                            {data.reduce((prev, current) => (prev.A > current.A) ? prev : current)?.subject || 'N/A'}
                        </p>
                    </div>
                    <div className="p-3 bg-orange-500/5 rounded-2xl border border-orange-500/10">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Focus Area</p>
                        <p className="text-sm font-bold text-orange-500">
                            {data.reduce((prev, current) => (prev.A < current.A) ? prev : current)?.subject || 'N/A'}
                        </p>
                    </div>
                 </div>
            )}
        </Card>
    );
}
