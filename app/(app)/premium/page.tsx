"use client";

import { useState, useEffect } from "react";
import { Check, Zap, Crown, Star, ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/app/lib/fetch-helper";

const PLANS = [
    {
        id: 'pro',
        name: 'Fitney PRO',
        price: 'Rp 49.000',
        period: '/bulan',
        desc: 'Cocok untuk pejuang konsistensi harian.',
        features: ['AI Workout Auditor', 'Premium Analytics', 'Prioritas AI Coach', 'Tanpa Iklan'],
        color: 'bg-indigo-500',
        popular: true
    },
    {
        id: 'elite',
        name: 'Fitney ELITE',
        price: 'Rp 499.000',
        period: '/tahun',
        desc: 'Untuk mereka yang serius bertransformasi.',
        features: ['Semua Fitur PRO', 'Badge Eksklusif ELITE', 'Early Access Fitur Baru', 'Simulasi Konsultasi'],
        color: 'bg-purple-600',
        popular: false
    }
];

export default function PremiumPage() {
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
    const [showCheckout, setShowCheckout] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<any>(null);
    const [currentRole, setCurrentRole] = useState<string>("user");
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await fetchWithAuth("/api/users/profile");
                setCurrentRole(data.role);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSelectPlan = (plan: any) => {
        setSelectedPlan(plan);
        setShowCheckout(true);
    };

    const handleMockPayment = async () => {
        setLoadingPlan(selectedPlan.id);
        try {
            // Simulasi proses bank
            await new Promise(resolve => setTimeout(resolve, 2000));

            const res = await fetch("/api/premium/upgrade", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ planId: selectedPlan.id })
            });

            if (res.ok) {
                toast.success(`Berhasil Upgrade ke ${selectedPlan.name}!`);
                router.push("/dashboard");
                router.refresh();
            } else {
                toast.error("Gagal memproses upgrade.");
            }
        } catch (err) {
            toast.error("Terjadi kesalahan sistem.");
        } finally {
            setLoadingPlan(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto py-12 px-6">
            <div className="text-center mb-16 space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-yellow-500/10 text-yellow-600 rounded-full text-xs font-black uppercase tracking-widest border border-yellow-500/20">
                    <Crown className="w-3 h-3" />
                    Premium Experience
                </div>
                <h1 className="text-5xl font-black italic tracking-tighter text-indigo-600 dark:text-indigo-400">LEVEL UP YOUR GAME</h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-medium">Buka seluruh potensi AI Fitney dan raih target kebugaranmu lebih cepat dengan fitur eksklusif.</p>
            </div>

            {!showCheckout ? (
                <div className={`grid gap-8 max-w-4xl mx-auto ${
                    (currentRole === 'pro' || currentRole === 'premium') ? 'grid-cols-1 max-w-md' : 'grid-cols-1 md:grid-cols-2'
                }`}>
                    {PLANS.map((plan) => {
                        // Logic Sembunyikan Paket
                        if ((currentRole === 'pro' || currentRole === 'premium') && plan.id === 'pro') return null;
                        if (currentRole === 'elite') return null;

                        const isEliteUpgrade = (currentRole === 'pro' || currentRole === 'premium') && plan.id === 'elite';

                        return (
                            <motion.div key={plan.id} whileHover={{ y: -10 }} transition={{ type: "spring", stiffness: 300 }}>
                                <Card className={`relative overflow-hidden border-2 ${plan.popular || isEliteUpgrade ? 'border-indigo-500 shadow-2xl shadow-indigo-500/20' : 'border-border'} rounded-[2.5rem]`}>
                                    {(plan.popular && currentRole === 'user') && (
                                        <div className="absolute top-0 right-0 bg-indigo-500 text-white px-6 py-1.5 rounded-bl-2xl text-[10px] font-black uppercase tracking-tighter">Paling Populer</div>
                                    )}
                                    {isEliteUpgrade && (
                                        <div className="absolute top-0 right-0 bg-purple-600 text-white px-6 py-1.5 rounded-bl-2xl text-[10px] font-black uppercase tracking-tighter">Recommended Upgrade</div>
                                    )}
                                    <CardContent className="p-10">
                                        <div className={`w-12 h-12 rounded-2xl ${plan.color} flex items-center justify-center text-white mb-6 shadow-lg`}>
                                            {plan.id === 'pro' ? <Zap className="w-6 h-6" /> : <Crown className="w-6 h-6" />}
                                        </div>
                                        <h3 className="text-2xl font-black mb-2">{plan.name}</h3>
                                        <div className="flex items-baseline gap-1 mb-4">
                                            <span className="text-4xl font-black">{plan.price}</span>
                                            <span className="text-muted-foreground font-bold">{plan.period}</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-8 font-medium">{plan.desc}</p>
                                        
                                        <div className="space-y-4 mb-10">
                                            {plan.features.map(f => (
                                                <div key={f} className="flex items-center gap-3">
                                                    <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                                                        <Check className="w-3 h-3 text-emerald-600" />
                                                    </div>
                                                    <span className="text-sm font-semibold opacity-80">{f}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <Button 
                                            onClick={() => handleSelectPlan(plan)}
                                            className={`w-full rounded-2xl py-7 font-bold text-lg ${plan.id === 'pro' ? 'bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-500/20' : 'bg-purple-600 hover:bg-purple-700 shadow-xl shadow-purple-500/20 text-white'}`}
                                        >
                                            {isEliteUpgrade ? "Upgrade Sekarang" : "Pilih Paket Ini"}
                                        </Button>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}

                    {currentRole === 'elite' && (
                        <div className="col-span-full text-center py-20 bg-purple-500/5 rounded-[3rem] border-2 border-dashed border-purple-500/20">
                            <Crown className="w-16 h-16 text-purple-500 mx-auto mb-4 animate-bounce" />
                            <h2 className="text-3xl font-black italic mb-2">YOU ARE AN ELITE ATHLETE</h2>
                            <p className="text-muted-foreground font-medium">Seluruh fitur Fitney telah terbuka untukmu. Nikmati pengalaman tanpa batas.</p>
                        </div>
                    )}
                </div>
            ) : (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md mx-auto">
                    <Card className="rounded-[2.5rem] border-none shadow-2xl p-8 bg-card">
                        <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                            <ShieldCheck className="w-8 h-8 text-emerald-500" />
                            Simulasi Pembayaran
                        </h2>
                        <div className="bg-muted/50 p-4 rounded-2xl mb-8 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">Paket Terpilih</span>
                                <span className="font-black">{selectedPlan.name}</span>
                            </div>
                            <div className="flex justify-between text-xl">
                                <span className="font-black uppercase italic">Total</span>
                                <span className="font-black text-indigo-600">{selectedPlan.price}</span>
                            </div>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="p-4 border-2 border-indigo-500 rounded-2xl bg-indigo-500/5 flex items-center justify-between cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <div className="w-4 h-4 rounded-full border-4 border-indigo-500" />
                                    <span className="font-bold text-sm text-indigo-600">Simulasi Kartu Kredit (Dev Mode)</span>
                                </div>
                                <Star className="w-4 h-4 text-indigo-500 fill-current" />
                            </div>
                            <p className="text-[10px] text-center text-muted-foreground font-medium px-4">
                                Ini adalah lingkungan simulasi untuk tugas sekolah. Tidak ada dana asli yang akan ditarik.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <Button variant="ghost" onClick={() => setShowCheckout(false)} className="flex-1 rounded-2xl py-6 font-bold">Batal</Button>
                            <Button onClick={handleMockPayment} disabled={!!loadingPlan} className="flex-[2] rounded-2xl py-6 font-bold bg-emerald-600 hover:bg-emerald-700 text-white">
                                {loadingPlan ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : "Bayar Sekarang"}
                            </Button>
                        </div>
                    </Card>
                </motion.div>
            )}
        </div>
    );
}