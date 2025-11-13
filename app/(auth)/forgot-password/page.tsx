import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft } from "lucide-react";

export default function ForgotPasswordPage() {
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

      <form className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" type="email" placeholder="name@example.com" required />
        </div>
        <Button type="submit" className="w-full py-6 text-lg font-semibold bg-yellow-400 text-yellow-900 hover:bg-yellow-500">
          Send Reset Link
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
