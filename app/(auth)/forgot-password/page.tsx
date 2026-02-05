"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { Turnstile } from '@marsidev/react-turnstile'; // Import Turnstile

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string>(''); // State for Turnstile token

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!turnstileToken && process.env.NODE_ENV === 'production') {
      toast.error("Please complete the security check.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, turnstileToken }), // Include turnstileToken
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setIsSubmitted(true);
      toast.success("Reset link sent!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send reset link");
    } finally {
      setIsLoading(false);
      setTurnstileToken(''); // Reset token after submission
    }
  };

  if (isSubmitted) {
    return (
      <div className="w-full max-w-md mx-auto text-center space-y-6">
        <div className="flex justify-center">
          <div className="bg-green-100 p-3 rounded-full">
            <CheckCircle2 className="text-green-600" size={48} />
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Check Your Email
          </h1>
          <p className="text-slate-500 mt-2">
            If an account exists with <strong>{email}</strong>, we&apos;ve sent a link to reset your password.
          </p>
        </div>
        <div className="pt-4">
          <Link href="/login" className="text-sm font-semibold text-yellow-600 hover:text-yellow-700">
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          Forgot Your Password?
        </h1>
        <p className="text-slate-500 mt-2">
          No problem. Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="name@example.com" 
            required 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
        </div>

        {/* Turnstile component */}
        {process.env.NODE_ENV === 'production' && (
          <Turnstile 
            options={{ sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY! }} 
            onSuccess={setTurnstileToken} 
            onExpire={() => setTurnstileToken('')}
            onVerify={setTurnstileToken}
          />
        )}
        
        <Button 
          type="submit" 
          className="w-full py-6 text-lg font-semibold bg-yellow-400 text-yellow-900 hover:bg-yellow-500"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            "Send Reset Link"
          )}
        </Button>
      </form>

      <div className="text-center mt-8">
        <Link href="/login" className="text-sm text-slate-600 hover:text-slate-900 inline-flex items-center gap-2">
            <ChevronLeft size={14} />
            Back to Sign In
        </Link>
      </div>
    </div>
  );
}
