"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Settings, Bell, User, LogOut, Menu, X, Search, Trophy, Users as UsersIcon, ExternalLink, Crown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { NotificationPopup } from "./NotificationPopup";
import OnboardingModal from "./OnboardingModal";
import UserAvatar from "./UserAvatar";
import { useEffect, useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { fetchWithAuth } from "@/app/lib/fetch-helper";
import toast from "react-hot-toast";
import useSWR from 'swr';

interface UserProfile {
  fullName: string;
  email: string;
  imageUrl?: string;
  hasCompletedOnboarding: boolean;
}

const Avatar = ({ user }: { user: UserProfile | null }) => {
  return <UserAvatar user={user} size="lg" />;
};

// SWR Fetcher
const fetcher = (url: string) => fetch(url).then(res => res.json());

const Header = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [level, setLevel] = useState(1); // State for user level
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationSound, setNotificationSound] = useState("default");
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const lastNotifId = useRef<number | null>(null);

  const navItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/ai-coach", label: "AI Coach" },
    { href: "/planner", label: "Planner" },
    { href: "/goals", label: "Goals" },
    { href: "/nutrition", label: "Nutrition" },
    { href: "/history", label: "History" },
    { href: "/community", label: "Community" },
  ];

  // SWR Polling
  const { data: notifications } = useSWR('/api/notifications', fetcher, {
    refreshInterval: 5000, // Poll every 5s
    revalidateOnFocus: true,
    dedupingInterval: 2000,
  });

  // Track first user interaction to allow audio playback
  useEffect(() => {
    const handleFirstInteraction = () => {
      setHasInteracted(true);
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };

    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      const userData = await fetchWithAuth('/api/users/profile');
      setUser(userData);
      
      const settings = await fetchWithAuth('/api/users/settings');
      setNotificationSound(settings.notificationSound || "default");

      if (!userData.hasCompletedOnboarding) {
        setShowOnboarding(true);
      }
    } catch (error) {
      console.error("Profile fetch error", error);
    }
  }, []);

  const playNotificationSound = useCallback((soundName: string) => {
    if (soundName === 'mute' || !hasInteracted) return;
    
    const audio = new Audio(`/sounds/${soundName}.wav`);
    audio.play().catch(err => {
      console.log("Autoplay blocked or audio failed.");
    });
  }, [hasInteracted]);

  const fetchLevel = useCallback(async () => {
    try {
      const gamificationData = await fetchWithAuth('/api/users/gamification-stats');
      setLevel(gamificationData.level);
    } catch (error) {
      console.error("Stats fetch error", error);
    }
  }, []);

  useEffect(() => {
    try {
      if (notifications && Array.isArray(notifications)) {
        const unread = notifications.filter((n: any) => !n.isRead);
        setUnreadCount(unread.length);

        if (unread.length > 0) {
          const newest = unread[0];
          if (newest.id !== lastNotifId.current) {
             if (lastNotifId.current !== null) {
                playNotificationSound(notificationSound);
                toast.success(`${newest.sender?.fullName || 'System'}: ${newest.message}`, {
                  icon: '🔔',
                  duration: 5000,
                  position: 'top-right'
                });
             }
             lastNotifId.current = newest.id;
          }
        }
      }
    } catch (err) {
      console.error("Notification filter error:", err);
    }
  }, [notifications, notificationSound, playNotificationSound]);

  useEffect(() => {
    fetchUser();
    fetchLevel();
  }, [fetchUser, fetchLevel]);

  const handleLogout = async () => {
    try {
      await fetchWithAuth("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed", error);
      router.push("/login");
    }
  };

  const handleOnboardingComplete = useCallback(() => {
    setShowOnboarding(false);
    window.location.reload(); // Force reload to sync all components
  }, []);

  return (
    <>
      {showOnboarding && <OnboardingModal onComplete={handleOnboardingComplete} />}
      
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-md lg:hidden"
          >
            <div className="p-8 h-full flex flex-col">
              <div className="flex items-center justify-between mb-12">
                <Link href="/dashboard" className="text-3xl font-black" onClick={() => setIsMobileMenuOpen(false)}>Fitney</Link>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-muted rounded-full">
                  <X size={24} />
                </button>
              </div>
              
              <nav className="flex flex-col gap-4">
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`text-3xl font-bold py-2 ${pathname === item.href ? 'text-primary' : 'text-muted-foreground'}`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              <div className="mt-auto pt-8 border-t">
                <div className="flex items-center gap-4 mb-8">
                  <Avatar user={user} />
                  <div>
                    <p className="font-bold text-lg">{user?.fullName || 'User'}</p>
                    <p className="text-sm text-muted-foreground">Level {level}</p>
                  </div>
                </div>
                <Button variant="destructive" className="w-full py-6 rounded-2xl font-bold" onClick={handleLogout}>
                  <LogOut className="mr-2 w-5 h-5" /> Sign Out
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="w-full px-6 lg:px-8 pt-6 pb-2">
        <div className="flex items-center justify-between w-full mx-auto bg-card/50 backdrop-blur-sm border rounded-3xl lg:rounded-full p-3 lg:p-4">
          <div className="flex items-center gap-2 pl-2">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 hover:bg-muted rounded-xl"
              aria-label="Open mobile menu"
            >
              <Menu size={24} />
            </button>
            <Link
              href="/dashboard"
              className="text-2xl lg:text-3xl font-black text-foreground tracking-tight shrink-0"
            >
              Fitney
            </Link>
          </div>

          <nav className="hidden lg:flex items-center bg-background/60 border rounded-full px-2 py-2">
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

          <div className="flex items-center space-x-1 lg:space-x-3 pr-2 lg:pr-4">
            
            <Popover>
              <PopoverTrigger asChild>
                <button 
                  className="p-2 lg:p-4 rounded-full hover:bg-muted/50 relative transition-colors"
                  aria-label="Notifications"
                >
                  <Bell size={20} className="lg:w-6 lg:h-6 text-muted-foreground" />
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 lg:top-3 lg:right-3 bg-red-500 text-white text-[10px] font-bold w-4 h-4 lg:w-5 lg:h-5 flex items-center justify-center rounded-full border-2 border-card">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 border-0 shadow-2xl" align="end">
                <NotificationPopup />
              </PopoverContent>
            </Popover>

            <div className="hidden lg:block">
              <Popover>
                <PopoverTrigger asChild>
                  <div className="relative cursor-pointer">
                    <button 
                      className="rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      aria-label="User profile menu"
                    >
                      <Avatar user={user} />
                    </button>
                    <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-card">
                      {level}
                    </span>
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-2 rounded-2xl" align="end">
                  <div className="p-4 border-b mb-2">
                    <p className="font-bold text-foreground leading-tight">{user?.fullName || 'Guest'}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                  
                  <Link href="/settings">
                    <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl py-6 font-semibold">
                        <Settings size={18} className="text-muted-foreground" />
                        Settings
                    </Button>
                  </Link>

                  <div className="h-px bg-border my-1" />

                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 rounded-xl py-6 font-semibold text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={handleLogout}
                  >
                    <LogOut size={18} />
                    Log Out
                  </Button>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;