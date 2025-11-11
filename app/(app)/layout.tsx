"use client";

import { usePathname } from "next/navigation";
import Header from "./components/Header";
import { cn } from "../lib/utils";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHistoryPage = pathname === "/history" || pathname === "/dashboard";

  return (
    <div
      className={cn(
        "font-poppins",
        isHistoryPage ? "h-screen flex flex-col" : "min-h-screen",
      )}
    >
      <Header />
      <main className={cn(isHistoryPage ? "flex-grow overflow-hidden" : "p-8")}>
        {children}
      </main>
    </div>
  );
}
