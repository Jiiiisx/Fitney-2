"use client";

import { usePathname } from "next/navigation";
import dynamic from 'next/dynamic';
import { cn } from "../lib/utils";

const Header = dynamic(() => import("./components/Header"), { ssr: false });

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFixedLayoutPage =
    pathname === "/history" ||
    pathname === "/dashboard" ||
    pathname === "/settings" ||
    pathname === "/community";

  return (
    <div
      className={cn(
        "font-poppins",
        "bg-gradient-to-b from-yellow-100 to-gray-50 dark:bg-none dark:bg-black",
        isFixedLayoutPage ? "h-screen flex flex-col" : "min-h-screen",
      )}
    >
      <Header />
      <main className={cn(isFixedLayoutPage ? "flex-grow overflow-hidden" : "p-8")}>
        {children}
      </main>
    </div>
  );
}
