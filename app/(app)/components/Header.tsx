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
import OnboardingModal from "./OnboardingModal";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";

interface UserProfile {
  fullName: string;
  email: string;
  imageUrl?: string;
  hasCompletedOnboarding: boolean;
}

const Avatar = ({ user }: { user: UserProfile | null }) => {
  if (!user) {
    return (
      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
        <User size={24} className="text-muted-foreground" />
      </div>
    );
  }

  if (user.imageUrl) {
    return (
      <img
        src={user.imageUrl}
        alt={user.fullName}
        className="w-12 h-12 rounded-full object-cover"
      />
    );
  }

  const initials = (user.fullName || '')
    .split(" ")
    .filter(n => n)
    .map((n) => n[0])
    .join("")
    .toUpperCase() || '?';

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
  const [level, setLevel] = useState(1); // State for user level
  const [showOnboarding, setShowOnboarding] = useState(false);

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch('/api/users/profile');
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        if (!userData.hasCompletedOnboarding) {
          setShowOnboarding(true);
        }
      }
    } catch (error) {
      console.error("Profile fetch error", error);
    }
  }, []);

  // Fetch gamification stats
  const fetchLevel = useCallback(async () => {
    try {
      const res = await fetch('/api/users/gamification-stats');
      if (res.ok) {
        const gamificationData = await res.json();
        setLevel(gamificationData.level);
      }
    } catch (error) {
      console.error("Stats fetch error", error);
    }
  }, []);

  useEffect(() => {
    fetchUser();
    fetchLevel();
  }, [fetchUser, fetchLevel]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh(); // Refresh to clear server component cache if any
    } catch (error) {
      console.error("Logout failed", error);
      router.push("/login");
    }
  };

  const handleOnboardingComplete = useCallback(() => {
    setShowOnboarding(false);
    fetchUser();
  }, [fetchUser]);

  const navItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/planner", label: "Planner" },
    { href: "/goals", label: "Goals" },
    { href: "/nutrition", label: "Nutrition" },
    { href: "/history", label: "History" },
    { href: "/community", label: "Community" },
  ];

  return (
    <>
      {showOnboarding && <OnboardingModal onComplete={handleOnboardingComplete} />}
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
                className={`relative px-6 py-3 text-lg font-semibold rounded-full transition-colors duration-300 z-10 ${pathname === item.href
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
                <div className="relative">
                  <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                    <Avatar user={user} />
                  </button>
                  <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-card">
                    {level}
                  </span>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-56" align="end">
                <div className="p-4 border-b">
                  <p className="font-bold text-foreground">{user?.fullName || 'Guest'}</p>
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
    </>
  );
};

export default Header;
