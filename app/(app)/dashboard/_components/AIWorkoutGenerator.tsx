"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BrainCircuit, Sparkles, Loader2, CheckCircle2, Lock } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

export default function AIWorkoutGenerator({ isPremium }: { isPremium: boolean }) {
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<'idle' | 'form' | 'generating' | 'success'>('idle');
    const [goal, setGoal] = useState('muscle_gain');

    const handleGenerate = async () => {
        setStep('generating');
        try {
            const res = await fetch("/api/premium/generate-plan", {
                method: "POST",
                body: JSON.stringify({ goal, level: 'intermediate', location: 'gym' })
            });
            if (res.ok) {
                setStep('success');
                toast.success("AI has generated your plan!");
                setTimeout(() => window.location.reload(), 2000);
            } else {
                throw new Error("Failed to generate");
            }
        } catch (error) {
            toast.error("Generation failed. Try again.");
            setStep('form');
        }
    };

    return (
        <Card className="relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background shadow-xl">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <BrainCircuit className="w-32 h-32" />
            </div>
            
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-black">
                    <div className="p-2 bg-primary rounded-lg text-primary-foreground shadow-lg shadow-primary/30">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    Fitney AI Coach
                </CardTitle>
                <p className="text-sm text-muted-foreground font-medium">Get a custom workout plan tailored by AI to your specific needs.</p>
            </CardHeader>

            <CardContent className="relative min-h-[180px] flex flex-col justify-center">
                {!isPremium ? (
                    <div className="flex flex-col items-center text-center py-4">
                        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                            <Lock className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <p className="text-sm font-bold text-foreground mb-1">Exclusive for Pro Members</p>
                        <p className="text-xs text-muted-foreground max-w-[250px] mb-4">Upgrade to unlock AI-powered personal training and advanced analytics.</p>
                        <Link href="/premium">
                            <Button className="rounded-full font-bold px-8">Upgrade to Pro</Button>
                        </Link>
                    </div>
                ) : (
                    <>
                        {step === 'idle' && (
                            <div className="flex flex-col items-center">
                                <Button 
                                    onClick={() => setStep('form')}
                                    className="rounded-2xl h-14 px-10 font-bold text-lg shadow-xl shadow-primary/20 hover:scale-105 transition-transform"
                                >
                                    Build My Personal Plan
                                </Button>
                                <p className="text-[10px] uppercase font-black tracking-widest text-primary mt-4 animate-pulse">Ready to transform?</p>
                            </div>
                        )}

                        {step === 'form' && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                                <div className="grid grid-cols-2 gap-3">
                                    <button 
                                        onClick={() => setGoal('muscle_gain')}
                                        className={`p-4 rounded-2xl border-2 transition-all text-left ${goal === 'muscle_gain' ? 'border-primary bg-primary/10' : 'border-border bg-card'}`}
                                    >
                                        <p className="font-bold text-sm">Muscle Gain</p>
                                        <p className="text-[10px] text-muted-foreground">Focus on strength</p>
                                    </button>
                                    <button 
                                        onClick={() => setGoal('fat_loss')}
                                        className={`p-4 rounded-2xl border-2 transition-all text-left ${goal === 'fat_loss' ? 'border-primary bg-primary/10' : 'border-border bg-card'}`}
                                    >
                                        <p className="font-bold text-sm">Fat Loss</p>
                                        <p className="text-[10px] text-muted-foreground">Focus on cardio</p>
                                    </button>
                                </div>
                                <Button onClick={handleGenerate} className="w-full rounded-xl py-6 font-bold">Generate Now</Button>
                            </div>
                        )}

                        {step === 'generating' && (
                            <div className="flex flex-col items-center text-center space-y-4 py-6">
                                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                                <div>
                                    <p className="font-bold">AI is calculating...</p>
                                    <p className="text-xs text-muted-foreground italic">Analyzing exercises, sets, and rest intervals.</p>
                                </div>
                            </div>
                        )}

                        {step === 'success' && (
                            <div className="flex flex-col items-center text-center space-y-4 py-6 animate-in zoom-in-95">
                                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
                                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                                </div>
                                <div>
                                    <p className="font-bold text-lg">Plan Ready!</p>
                                    <p className="text-sm text-muted-foreground">Your new schedule is now active in the Planner.</p>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}
