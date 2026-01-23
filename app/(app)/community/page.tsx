"use client";

import LeftSidebar from "./components/LeftSidebar";
import MainFeed from "./components/MainFeed";
import RightSidebar from "./components/RightSidebar";
import GroupChatView from "./components/GroupChatView";
import FindFriendsView from "./components/FindFriendsView";
import UserProfileView from "./components/UserProfileView";
import { CommunityProvider, useCommunityNavigation } from "./CommunityContext";

// Inner component to consume Context
const CommunityContent = () => {
  const { activeView } = useCommunityNavigation();

  const renderContent = () => {
    switch (activeView) {
      case "group_chat":
        return <GroupChatView />;
      case "find_friends":
        return <FindFriendsView />;
      case "user_profile":
        return <UserProfileView />;
      case "feed":
      default:
        return <MainFeed />;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Main Layout */}
      <div className="flex-grow flex max-w-screen-2xl mx-auto w-full overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-full lg:w-[25%] bg-card overflow-y-auto hidden lg:block border-r border-border">
          <div className="p-6">
            <LeftSidebar />
          </div>
        </aside>

        {/* Main Center Area (Switchable) */}
        <main className="w-full lg:w-[50%] bg-background overflow-y-auto">
          <div className="p-6 h-full">
            {renderContent()}
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="w-full lg:w-[25%] bg-card overflow-y-auto hidden lg:block border-l border-border">
          <div className="p-6">
            <RightSidebar />
          </div>
        </aside>
      </div>
    </div>
  );
};

export default function CommunityPage() {
  return (
    <CommunityProvider>
      <CommunityContent />
    </CommunityProvider>
  );
}