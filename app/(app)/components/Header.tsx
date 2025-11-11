"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, Bell, User, Search } from "lucide-react";
import { motion } from "framer-motion";

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
      <div className="flex items-center justify-between w-full mx-auto bg-white/50 backdrop-blur-sm border border-gray-200/50 rounded-full p-4">
        {/* Logo */}
        <div className="pl-4">
          <Link
            href="/dashboard"
            className="text-3xl font-bold text-gray-800 tracking-wider"
          >
            Fitney
          </Link>
        </div>

        {/* Navigation */}
        <nav className="relative flex items-center bg-white/60 border border-gray-200/50 rounded-full px-2 py-2">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`relative px-6 py-3 text-lg font-semibold rounded-full transition-colors duration-300 z-10 ${
                pathname === item.href
                  ? "text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {item.label}
              {pathname === item.href && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute inset-0 bg-gray-800 rounded-full"
                  style={{ zIndex: -1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 25 }}
                />
              )}
            </Link>
          ))}
        </nav>

        {/* User Actions */}
        <div className="flex items-center space-x-3 pr-4">
          <button className="p-4 rounded-full hover:bg-gray-200/50">
            <Search size={24} className="text-gray-600" />
          </button>
          <button className="p-4 rounded-full hover:bg-gray-200/50">
            <Settings size={24} className="text-gray-600" />
          </button>
          <button className="p-4 rounded-full hover:bg-gray-200/50">
            <Bell size={24} className="text-gray-600" />
          </button>
          <button className="p-4 rounded-full bg-gray-200/70">
            <User size={24} className="text-gray-600" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
