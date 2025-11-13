"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, Bell, User, Search } from "lucide-react";
import { motion } from "framer-motion";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { NotificationPopup } from "./NotificationPopup";

const Header = () => {
  const pathname = usePathname();
  const navItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/history", label: "History" },
    { href: "/planner", label: "Planner" },
    { href: "/goals", label: "Goals" },
    { href: "/community", label: "Community" },
  ];

  return (
    <header className="w-full px-4 pt-6 pb-2">
      <div className="flex items-center justify-between w-full mx-auto bg-card/50 backdrop-blur-sm border rounded-full p-4">
        {/* Logo */}
        <div className="pl-4">
          <Link
            href="/dashboard"
            className="text-3xl font-bold text-foreground tracking-wider"
          >
            Fitney
          </Link>
        </div>

        {/* Navigation */}
        <nav className="relative flex items-center bg-background/60 border rounded-full px-2 py-2">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`relative px-6 py-3 text-lg font-semibold rounded-full transition-colors duration-300 z-10 ${
                pathname === item.href
                  ? "text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.label}
              {pathname === item.href && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute inset-0 bg-primary rounded-full"
                  style={{ zIndex: -1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 25 }}
                />
              )}
            </Link>
          ))}
        </nav>

        {/* User Actions */}
        <div className="flex items-center space-x-3 pr-4">
          <button className="p-4 rounded-full hover:bg-muted/50">
            <Search size={24} className="text-muted-foreground" />
          </button>
          <Link href="/settings" className="p-4 rounded-full hover:bg-muted/50">
            <Settings size={24} className="text-muted-foreground" />
          </Link>
          <Popover>
            <PopoverTrigger asChild>
              <button className="p-4 rounded-full hover:bg-muted/50">
                <Bell size={24} className="text-muted-foreground" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 border-0 shadow-2xl" align="end">
              <NotificationPopup />
            </PopoverContent>
          </Popover>
          <button className="p-4 rounded-full bg-muted">
            <User size={24} className="text-muted-foreground" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
