"use client";

import LeftSidebar from "./components/LeftSidebar";
import RightSidebar from "./components/RightSidebar";

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-grow flex max-w-screen-2xl mx-auto w-full overflow-hidden h-[calc(100vh-64px)]">
        {/* Left Sidebar */}
        <aside className="w-full lg:w-[25%] bg-card overflow-y-auto hidden lg:block border-r border-border custom-scrollbar">
          <div className="p-6">
            <LeftSidebar />
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="w-full lg:w-[50%] bg-background overflow-y-auto custom-scrollbar relative" id="main-feed-container">
          <div className="p-6 h-full min-h-screen">
            {children}
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="w-full lg:w-[25%] bg-card overflow-y-auto hidden lg:block border-l border-border custom-scrollbar">
          <div className="p-6">
            <RightSidebar />
          </div>
        </aside>
      </div>
    </div>
  );
}
