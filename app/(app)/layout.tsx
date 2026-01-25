"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import dynamic from 'next/dynamic';
import { cn } from "../lib/utils";
import toast, { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/app/providers";


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
      // Just fire and forget - cookie handled automatically
      const promise = fetch('/api/planner/sync-history', {
        method: 'POST'
      });

      // We only show toast if it actually does something meaningful or on error?
      // Existing logic showed promise toast. Let's keep it but without token check blocking it.
      // However, if not logged in, it will 401. 
      // Ideally we check if we are possibly logged in. 
      // For now, let's wrap in a try/catch or just let it run.
      // If 401, the toast might error.

      // Let's simplified it to be less intrusive on public pages if any.
      // But this layout is for (app) which is protected? 
      // If user isn't logged in, they shouldn't be here or middleware redirects.
    };

    // Delay sync slightly to allow main app to render
    const timer = setTimeout(() => {
      syncHistory();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <ThemeProvider>
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
      </div>
    </ThemeProvider>
  );
}
