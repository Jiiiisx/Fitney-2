"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet, Lock, Crown, Smartphone, Zap } from "lucide-react";
import toast from "react-hot-toast";

export default function PremiumTools({ isPremium }: { isPremium: boolean }) {
    const [exporting, setExporting] = useState(false);

    const handleExport = async () => {
        if (!isPremium) {
            toast.error("Premium subscription required for data export.");
            return;
        }

        setExporting(true);
        try {
            const response = await fetch("/api/premium/export");
            if (!response.ok) throw new Error("Export failed");

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `Fitney_Report_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            toast.success("Activity report downloaded!");
        } catch (error) {
            toast.error("Failed to generate report.");
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* CSV EXPORT */}
            <Card className="border-none bg-card/50 backdrop-blur-sm shadow-md overflow-hidden group">
                <CardContent className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                            <FileSpreadsheet className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-bold text-sm">Activity Report</h4>
                            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Export to CSV</p>
                        </div>
                    </div>
                    <Button 
                        onClick={handleExport}
                        disabled={exporting}
                        variant={isPremium ? "default" : "outline"}
                        className="rounded-xl h-10 px-4 font-bold text-xs flex gap-2"
                    >
                        {exporting ? "Generating..." : (
                            <>
                                {isPremium ? <Download className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                                {isPremium ? "Download" : "Unlock"}
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>

            {/* SYNC STATUS PLACEHOLDER */}
            <Card className="border-none bg-card/50 backdrop-blur-sm shadow-md overflow-hidden group">
                <CardContent className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                            <Smartphone className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-bold text-sm">Device Sync</h4>
                            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Apple Health / Google Fit</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {isPremium ? (
                            <span className="text-[10px] font-black bg-blue-500/10 text-blue-600 px-2 py-1 rounded-full uppercase">Active</span>
                        ) : (
                            <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full p-0">
                                <Lock className="w-3 h-3 text-muted-foreground" />
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
