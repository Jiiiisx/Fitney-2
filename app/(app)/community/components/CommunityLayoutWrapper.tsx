"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";

interface CommunityLayoutWrapperProps {
  children: React.ReactNode; // Feed content
  rightSidebar: React.ReactNode;
  leftSidebar: React.ReactNode;
}

export default function CommunityLayoutWrapper({
  children,
  rightSidebar,
  leftSidebar,
}: CommunityLayoutWrapperProps) {
  const [mobileTab, setMobileTab] = useState<"feed" | "discover">("feed");
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      {/* --- DESKTOP LAYOUT (Unchanged) --- */}
      <div className="hidden lg:flex flex-grow flex-col lg:flex-row max-w-screen-2xl mx-auto w-full lg:overflow-hidden h-auto lg:h-[calc(100vh-64px)]">
        {/* Left Sidebar */}
        <aside className="w-[25%] bg-card overflow-y-auto border-r border-border custom-scrollbar">
          <div className="p-6">
            {leftSidebar}
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="w-[50%] bg-background lg:overflow-y-auto custom-scrollbar relative" id="main-feed-container">
          <div className="p-6 h-full">
            {children}
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="w-[25%] bg-card lg:overflow-y-auto border-l border-border custom-scrollbar">
          <div className="p-6">
            {rightSidebar}
          </div>
        </aside>
      </div>

      {/* --- MOBILE LAYOUT (Tabs) --- */}
      <div className="flex lg:hidden flex-col min-h-screen">
        
        {/* Mobile Tab Navigation (Floating Segmented Control) */}
        <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md pt-4 pb-2 px-6">
          <div className="flex bg-muted/50 p-1 rounded-full relative">
            <button
              onClick={() => setMobileTab("feed")}
              className={cn(
                "flex-1 py-2 text-sm font-bold rounded-full relative z-10 transition-colors duration-200",
                mobileTab === "feed" ? "text-primary-foreground" : "text-muted-foreground"
              )}
            >
              Feed
              {mobileTab === "feed" && (
                <motion.div
                  layoutId="active-community-tab"
                  className="absolute inset-0 bg-primary rounded-full shadow-sm -z-10"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
            <button
              onClick={() => setMobileTab("discover")}
              className={cn(
                "flex-1 py-2 text-sm font-bold rounded-full relative z-10 transition-colors duration-200",
                mobileTab === "discover" ? "text-primary-foreground" : "text-muted-foreground"
              )}
            >
              Discover
              {mobileTab === "discover" && (
                <motion.div
                  layoutId="active-community-tab"
                  className="absolute inset-0 bg-primary rounded-full shadow-sm -z-10"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Content Area */}
        <div className="flex-1">
          {mobileTab === "feed" ? (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="p-6 min-h-[50vh]"
            >
              {children}
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="p-6"
            >
              {/* Reuse Right Sidebar content for Discover tab */}
              {rightSidebar}
              
              {/* Also show Left Sidebar content (Groups/Profile) below right sidebar content on mobile discover */}
              <div className="mt-8 pt-8 border-t border-border">
                 {leftSidebar}
              </div>
            </motion.div>
          )}
        </div>

        {/* Scroll to Top Button (Mobile Feed Only) */}
        <AnimatePresence>
          {showScrollTop && mobileTab === "feed" && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={scrollToTop}
              className="fixed bottom-6 right-6 z-50 p-3 bg-primary text-primary-foreground rounded-full shadow-lg shadow-primary/20 lg:hidden"
            >
              <ArrowUp className="w-6 h-6" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
