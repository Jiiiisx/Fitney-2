"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { Turnstile } from "@marsidev/react-turnstile";

// Premium Google Icon
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.11c-.22-.67-.35-1.39-.35-2.11s.13-1.44.35-2.11V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.83z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.83c.87-2.6 3.3-4.51 6.16-4.51z" fill="#EA4335"/>
  </svg>
);

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [turnstileToken, setTurnstileToken] = useState<string>("");

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleGoogleLogin = () => {
    if (typeof window !== 'undefined' && (window as any).google) {
      const google = (window as any).google;
      google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
        ux_mode: "popup"
      });
      google.accounts.id.prompt(); // Also show one-tap if available
      
      // Explicitly trigger the selector for the custom button
      // Use a hidden div to render the standard button but trigger it manually
      // or use the 'prompt' which is standard for custom UI.
    }
  };

  const handleGoogleResponse = async (response: any) => {
    try {
      setLoading(true);
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.user.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      } else {
        const data = await res.json();
        setError(data.error || 'Google login failed');
        setLoading(false);
      }
    } catch (err) {
      setError('Something went wrong with Google login');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!turnstileToken) {
      setError("Please complete the security check.");
      return;
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier, password, turnstileToken }),
      });

      if (res.ok) {
        const data = await res.json();
        const user = data.user;
        
        if (user.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      } else {
        const data = await res.json();
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('Something went wrong');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium animate-pulse">
            {error ? "Error occurred..." : "Securing connection..."}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black text-neutral-900 tracking-tighter">
          Welcome Back
        </h1>
        <p className="text-muted-foreground mt-2 font-medium">
          Continue your fitness journey with Fitney.
        </p>
      </div>

      <div className="space-y-8">
        {/* Custom Premium Google Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full h-14 bg-white dark:bg-neutral-900 border-2 border-neutral-100 dark:border-neutral-800 rounded-2xl flex items-center justify-center gap-3 font-bold text-neutral-700 dark:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all active:scale-[0.98] shadow-sm hover:shadow-xl hover:shadow-neutral-200/50 dark:hover:shadow-black/20 group"
        >
          <div className="bg-white p-1.5 rounded-lg shadow-sm group-hover:scale-110 transition-transform duration-300">
            <GoogleIcon />
          </div>
          Sign in with Google
        </button>

        <div className="flex items-center gap-4">
          <div className="flex-grow h-px bg-neutral-100 dark:bg-neutral-800"></div>
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">OR</span>
          <div className="flex-grow h-px bg-neutral-100 dark:bg-neutral-800"></div>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="identifier" className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Email or Username</Label>
            <Input 
              id="identifier" 
              type="text" 
              placeholder="yourname or name@example.com" 
              required 
              value={identifier} 
              onChange={(e) => setIdentifier(e.target.value)}
              className="h-14 rounded-2xl border-2 focus:border-primary px-6 font-medium"
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <Label htmlFor="password" title="Password" className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground">Password</Label>
              <Link href="/forgot-password" title="Forgot Password?" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">
                Forgot Password?
              </Link>
            </div>
            <div className="relative group">
              <Input 
                id="password" 
                type={showPassword ? "text" : "password"} 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                className="h-14 rounded-2xl border-2 focus:border-primary px-6 pr-14 font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-neutral-900 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          
          <div className="flex justify-center py-2">
            <Turnstile 
              siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!} 
              onVerify={(token) => setTurnstileToken(token)}
            />
          </div>

          {error && <p className="text-red-500 text-xs font-bold text-center bg-red-50 dark:bg-red-950/20 py-3 rounded-xl border border-red-100 dark:border-red-900/30">{error}</p>}
          
          <Button type="submit" className="w-full h-14 text-lg font-black rounded-2xl bg-yellow-400 text-yellow-950 hover:bg-yellow-500 shadow-lg shadow-yellow-400/20 active:scale-[0.98] transition-all">
            Sign In
          </Button>
          
          <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">
            <Lock size={12} />
            Encrypted & Secured
          </div>
        </form>
      </div>

      <p className="text-center text-sm font-medium text-muted-foreground mt-10">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-black text-primary hover:underline">
          Sign Up
        </Link>
      </p>
    </div>
  );
}