"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import dynamic from 'next/dynamic';
import { cn } from "../lib/utils";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/app/providers";
import { AIProvider } from "@/app/lib/AIContext";
import AIAssistantWidget from "./components/AIAssistantWidget";

const Header = dynamic(() => import("./components/Header"), { ssr: false });

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFixedLayoutPage =
    pathname === "/history" ||
    pathname === "/dashboard" ||
    pathname === "/settings" ||
    pathname === "/community" ||
    pathname === "/ai-coach";

  useEffect(() => {
    const syncHistory = async () => {
      fetch('/api/planner/sync-history', { method: 'POST' });
    };

    const timer = setTimeout(() => {
      syncHistory();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <ThemeProvider>
      <AIProvider>
        <div
            className={cn(
            "font-poppins relative overflow-x-hidden",
            "bg-[#FFFBEC] dark:bg-black",
            isFixedLayoutPage ? "min-h-screen lg:h-screen lg:flex lg:flex-col" : "min-h-screen",
            )}
        >
            <Toaster position="top-center" reverseOrder={false} />
            
            {/* Background Decorative Blobs for Header Area */}
            <div className="absolute top-0 left-0 w-full h-[40vh] bg-gradient-to-b from-yellow-200/40 to-transparent pointer-events-none" />
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-yellow-300/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-orange-200/20 rounded-full blur-[80px] pointer-events-none" />

            <div className="relative z-30">
              <Header />
            </div>

            <main className={cn(
              "relative z-20 transition-all duration-700",
              isFixedLayoutPage ? "lg:flex-grow" : "",
              (pathname === "/dashboard" || pathname === "/community" || pathname === "/ai-coach") 
                ? "bg-white dark:bg-neutral-950 mt-4 rounded-t-[3.5rem] shadow-[0_-20px_50px_-15px_rgba(0,0,0,0.05)] border-t border-white/50" 
                : "p-6 sm:p-8"
            )}>
              <div className={cn(
                "h-full",
                (pathname === "/dashboard" || pathname === "/community" || pathname === "/ai-coach") ? "p-2 sm:p-4 lg:p-0" : ""
              )}>
                {children}
              </div>
            </main>
            
            {/* Global AI Assistant Widget */}
            <AIAssistantWidget />
        </div>
      </AIProvider>
    </ThemeProvider>
  );
}
