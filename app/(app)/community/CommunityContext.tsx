"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type ViewMode = "feed" | "group_chat";

interface CommunityContextType {
  activeView: ViewMode;
  selectedGroupId: number | null;
  selectedGroupName: string | null;
  navigateToFeed: () => void;
  navigateToGroupChat: (groupId: number, groupName: string) => void;
}

const CommunityContext = createContext<CommunityContextType | undefined>(undefined);

export function CommunityProvider({ children }: { children: ReactNode }) {
  const [activeView, setActiveView] = useState<ViewMode>("feed");
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [selectedGroupName, setSelectedGroupName] = useState<string | null>(null);

  const navigateToFeed = () => {
    setActiveView("feed");
    setSelectedGroupId(null);
    setSelectedGroupName(null);
  };

  const navigateToGroupChat = (groupId: number, groupName: string) => {
    setSelectedGroupId(groupId);
    setSelectedGroupName(groupName);
    setActiveView("group_chat");
  };

  return (
    <CommunityContext.Provider value={{ activeView, selectedGroupId, selectedGroupName, navigateToFeed, navigateToGroupChat }}>
      {children}
    </CommunityContext.Provider>
  );
}

export function useCommunityNavigation() {
  const context = useContext(CommunityContext);
  if (!context) {
    throw new Error("useCommunityNavigation must be used within a CommunityProvider");
  }
  return context;
}
