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
            "font-poppins",
            "bg-gradient-to-b from-yellow-100 to-gray-50 dark:bg-none dark:bg-black",
            isFixedLayoutPage ? "min-h-screen lg:h-screen lg:flex lg:flex-col" : "min-h-screen",
            )}
        >
            <Toaster position="top-center" reverseOrder={false} />
            <Header />
            <main className={cn({
            "p-6 sm:p-8": !isFixedLayoutPage,
            "lg:flex-grow": isFixedLayoutPage,
            "overflow-y-auto": pathname === "/history",
            "lg:overflow-hidden": isFixedLayoutPage && pathname !== "/history",
            })}>
            {children}
            </main>
            
            {/* Global AI Assistant Widget */}
            <AIAssistantWidget />
        </div>
      </AIProvider>
    </ThemeProvider>
  );
}
