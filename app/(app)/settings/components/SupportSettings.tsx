"use client";

import { useState } from "react";
import { AlertTriangle, Send, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

export default function SupportSettings() {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState({
    targetType: "system",
    reason: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!report.reason) return toast.error("Please provide a reason");

    setLoading(true);
    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        body: JSON.stringify({
          targetType: report.targetType,
          targetId: "system_feedback", // For general reports
          reason: report.reason,
        }),
      });

      if (response.ok) {
        toast.success("Report submitted. Thank you for your feedback!");
        setReport({ targetType: "system", reason: "" });
      } else {
        throw new Error("Failed to submit");
      }
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-card border rounded-3xl p-8 shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-red-500/10 text-red-500 rounded-2xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Report an Issue</h3>
            <p className="text-sm text-muted-foreground">Found a bug or inappropriate content? Let us know.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold ml-1">Type of Issue</label>
            <select 
              className="w-full bg-muted/50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 transition-all outline-none"
              value={report.targetType}
              onChange={e => setReport({...report, targetType: e.targetType})}
            >
              <option value="system">Bug / System Issue</option>
              <option value="post">Inappropriate Content (Post)</option>
              <option value="user">User Behavior</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold ml-1">Details</label>
            <textarea 
              rows={5}
              required
              className="w-full bg-muted/50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 transition-all outline-none resize-none"
              placeholder="Please describe the issue in detail..."
              value={report.reason}
              onChange={e => setReport({...report, reason: e.target.value})}
            />
          </div>

          <Button 
            disabled={loading}
            className="w-full rounded-2xl py-6 font-bold flex gap-2 items-center justify-center"
          >
            {loading ? "Sending..." : (
              <>
                <Send className="w-4 h-4" /> Send Report
              </>
            )}
          </Button>
        </form>
      </div>

      <div className="bg-primary/5 border border-primary/10 rounded-3xl p-8 flex items-start gap-4">
        <ShieldCheck className="w-8 h-8 text-primary shrink-0" />
        <div>
          <h4 className="font-bold text-primary">Your Privacy Matters</h4>
          <p className="text-sm text-muted-foreground mt-1">
            Reports are handled anonymously by our moderation team. We take your safety seriously and will review your report within 24 hours.
          </p>
        </div>
      </div>
    </div>
  );
}
