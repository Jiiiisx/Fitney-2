"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import dynamic from 'next/dynamic';
import { cn } from "../lib/utils";
import toast, { Toaster } from "react-hot-toast";


const Header = dynamic(() => import("./components/Header"), { ssr: false });

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFixedLayoutPage =
    pathname === "/history" ||
    pathname === "/dashboard" ||
    pathname === "/settings" ||
    pathname === "/community";

  useEffect(() => {
    const syncHistory = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      const promise = fetch('/api/planner/sync-history', { 
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      toast.promise(promise, {
        loading: 'Checking for past workouts to sync...',
        success: (res) => {
          // We can inspect the response if we want.
          // For now, let's assume success means it worked or there was nothing to sync.
          return 'History is up to date!';
        },
        error: 'Could not sync history.',
      });
    };

    // Delay sync slightly to allow main app to render
    const timer = setTimeout(() => {
      syncHistory();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={cn(
        "font-poppins",
        "bg-gradient-to-b from-yellow-100 to-gray-50 dark:bg-none dark:bg-black",
        isFixedLayoutPage ? "h-screen flex flex-col" : "min-h-screen",
      )}
    >
      <Toaster position="top-center" reverseOrder={false} />
      <Header />
      <main className={cn({
        "p-8": !isFixedLayoutPage,
        "flex-grow": isFixedLayoutPage,
        "overflow-y-auto": pathname === "/history",
        "overflow-hidden": isFixedLayoutPage && pathname !== "/history",
      })}>
        {children}
      </main>
    </div>
  );
}
