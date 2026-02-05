"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setIsSuccess(true);
      toast.success("Password reset successfully!");
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className="w-full max-w-md mx-auto text-center space-y-6">
        <div className="flex justify-center">
          <div className="bg-red-100 p-3 rounded-full">
            <AlertCircle className="text-red-600" size={48} />
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Invalid Link
          </h1>
          <p className="text-slate-500 mt-2">
            The password reset link is invalid or has expired.
          </p>
        </div>
        <div className="pt-4">
          <Link href="/forgot-password" size="sm" className="text-sm font-semibold text-yellow-600 hover:text-yellow-700">
            Request a new link
          </Link>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="w-full max-w-md mx-auto text-center space-y-6">
        <div className="flex justify-center">
          <div className="bg-green-100 p-3 rounded-full">
            <CheckCircle2 className="text-green-600" size={48} />
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Password Reset
          </h1>
          <p className="text-slate-500 mt-2">
            Your password has been successfully reset. You can now log in with your new password.
          </p>
          <p className="text-slate-400 text-xs mt-4">
            Redirecting to login page...
          </p>
        </div>
        <div className="pt-4">
          <Link href="/login" className="text-sm font-semibold text-yellow-600 hover:text-yellow-700">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          Reset Password
        </h1>
        <p className="text-slate-500 mt-2">
          Enter your new password below.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="password">New Password</Label>
          <Input 
            id="password" 
            type="password" 
            placeholder="••••••••" 
            required 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <Input 
            id="confirmPassword" 
            type="password" 
            placeholder="••••••••" 
            required 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <Button 
          type="submit" 
          className="w-full py-6 text-lg font-semibold bg-yellow-400 text-yellow-900 hover:bg-yellow-500"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Resetting...
            </>
          ) : (
            "Reset Password"
          )}
        </Button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="w-full max-w-md mx-auto text-center py-12">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-slate-400" />
        <p className="mt-4 text-slate-500">Loading...</p>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
