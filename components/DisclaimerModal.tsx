"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, CheckCircle2, Info, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DisclaimerModal() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Check if user has already accepted the disclaimer
        const hasSeenDisclaimer = localStorage.getItem("fitney_disclaimer_accepted");
        if (!hasSeenDisclaimer) {
            const timer = setTimeout(() => setIsOpen(true), 1500); // Auto-popup after 1.5s
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem("fitney_disclaimer_accepted", "true");
        setIsOpen(false);
    };

    return (
        <>
            {/* Small Floating Info Button */}
            <div className="fixed bottom-6 right-6 z-[998]">
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsOpen(true)}
                    className="w-10 h-10 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md border border-primary/20 rounded-full flex items-center justify-center shadow-lg text-primary hover:bg-white transition-colors"
                    title="Project Information"
                >
                    <HelpCircle className="w-5 h-5" />
                </motion.button>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[999] flex items-center justify-center p-6">
                        {/* Backdrop */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />

                        {/* Modal Content */}
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden border border-primary/10"
                        >
                            {/* Decorative Background Icon */}
                            <div className="absolute -top-10 -right-10 opacity-5">
                                <ShieldAlert className="w-40 h-40" />
                            </div>

                            <div className="relative z-10 text-center space-y-6">
                                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                                    <Info className="w-8 h-8 text-primary" />
                                </div>

                                <div className="space-y-2">
                                    <h2 className="text-2xl font-black italic tracking-tight uppercase">Project Disclaimer</h2>
                                    <div className="h-1 w-12 bg-primary rounded-full mx-auto" />
                                </div>

                                <div className="space-y-4 text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
                                    <p>
                                        Welcome to <span className="text-foreground font-bold">Fitney</span>.
                                    </p>
                                    <p className="text-sm text-left">
                                        This project is developed entirely for <span className="text-primary font-bold">educational purposes and portfolio demonstration</span>. All AI features, payment systems, and data within this application are simulations.
                                    </p>
                                    <p className="text-xs italic bg-muted p-3 rounded-2xl border border-border text-left">
                                        "Fitney is not intended to provide real medical advice or professional health guidance."
                                    </p>
                                </div>

                                <Button 
                                    onClick={handleAccept}
                                    className="w-full rounded-2xl py-7 font-bold text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                >
                                    <CheckCircle2 className="w-5 h-5 mr-2" />
                                    Got it, I understand!
                                </Button>
                                
                                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">
                                    Developed by Fitney Team
                                </p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
