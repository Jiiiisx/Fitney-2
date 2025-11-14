"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Settings, Bell, User, Search, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { NotificationPopup } from "./NotificationPopup";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface UserProfile {
  full_name: string;
  email: string;
  profile_picture_url?: string;
}

const Avatar = ({ user }: { user: UserProfile | null }) => {
  if (!user) {
    return (
      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
        <User size={24} className="text-muted-foreground" />
      </div>
    );
  }

  if (user.profile_picture_url) {
    return (
      <img
        src={user.profile_picture_url}
        alt={user.full_name}
        className="w-12 h-12 rounded-full object-cover"
      />
    );
  }

  const initials = user.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
      <span className="text-primary-foreground font-bold text-lg">{initials}</span>
    </div>
  );
};


const Header = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        const res = await fetch('/api/users/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        }
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const navItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/history", label: "History" },
    { href: "/planner", label: "Planner" },
    { href: "/goals", label: "Goals" },
    { href: "/nutrition", label: "Nutrition" },
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
          
          <Popover>
            <PopoverTrigger asChild>
              <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                <Avatar user={user} />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-56" align="end">
              <div className="p-4 border-b">
                <p className="font-bold text-foreground">{user?.full_name}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
              <Button
                variant="ghost"
                className="w-full justify-start p-4"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
              </Button>
            </PopoverContent>
          </Popover>

        </div>
      </div>
    </header>
  );
};

export default Header;
