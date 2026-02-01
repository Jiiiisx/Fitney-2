"use client";

import { useState } from "react";
import { Check, Zap, Crown, Star, ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

const PLANS = [
    {
        id: 'pro',
        name: 'Fitney PRO',
        price: 'Rp 49.000',
        period: '/bulan',
        desc: 'Cocok untuk pejuang konsistensi harian.',
        features: ['AI Workout Auditor', 'Premium Analytics', 'Prioritas AI Coach', 'Tanpa Iklan'],
        color: 'bg-primary',
        popular: true
    },
    {
        id: 'elite',
        name: 'Fitney ELITE',
        price: 'Rp 499.000',
        period: '/tahun',
        desc: 'Untuk mereka yang serius bertransformasi.',
        features: ['Semua Fitur PRO', 'Badge Eksklusif ELITE', 'Early Access Fitur Baru', 'Simulasi Konsultasi'],
        color: 'bg-zinc-900',
        popular: false
    }
];

export default function PremiumPage() {
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
    const [showCheckout, setShowCheckout] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<any>(null);
    const router = useRouter();

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
                toast.success("Pembayaran Berhasil! Selamat datang di Fitney Premium.");
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

    return (
        <div className="max-w-6xl mx-auto py-12 px-6">
            <div className="text-center mb-16 space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-yellow-500/10 text-yellow-600 rounded-full text-xs font-black uppercase tracking-widest border border-yellow-500/20">
                    <Crown className="w-3 h-3" />
                    Premium Experience
                </div>
                <h1 className="text-5xl font-black italic tracking-tighter">LEVEL UP YOUR GAME</h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-medium">Buka seluruh potensi AI Fitney dan raih target kebugaranmu lebih cepat dengan fitur eksklusif.</p>
            </div>

            {!showCheckout ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {PLANS.map((plan) => (
                        <motion.div key={plan.id} whileHover={{ y: -10 }} transition={{ type: "spring", stiffness: 300 }}>
                            <Card className={`relative overflow-hidden border-2 ${plan.popular ? 'border-primary shadow-2xl shadow-primary/20' : 'border-border'} rounded-[2.5rem]`}>
                                {plan.popular && (
                                    <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-6 py-1.5 rounded-bl-2xl text-[10px] font-black uppercase tracking-tighter">Paling Populer</div>
                                )}
                                <CardContent className="p-10">
                                    <div className={`w-12 h-12 rounded-2xl ${plan.color} flex items-center justify-center text-white mb-6`}>
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
                                        className={`w-full rounded-2xl py-7 font-bold text-lg ${plan.id === 'pro' ? 'bg-primary' : 'bg-zinc-900 hover:bg-zinc-800'}`}
                                    >
                                        Pilih Paket Ini
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
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
                                <span className="font-black text-primary">{selectedPlan.price}</span>
                            </div>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="p-4 border-2 border-primary rounded-2xl bg-primary/5 flex items-center justify-between cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <div className="w-4 h-4 rounded-full border-4 border-primary" />
                                    <span className="font-bold text-sm text-primary">Simulasi Kartu Kredit (Dev Mode)</span>
                                </div>
                                <Star className="w-4 h-4 text-primary fill-current" />
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
