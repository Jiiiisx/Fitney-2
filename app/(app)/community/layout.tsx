

import LeftSidebar from "./components/LeftSidebar";
import RightSidebar from "./components/RightSidebar";

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-grow flex flex-col lg:flex-row max-w-screen-2xl mx-auto w-full lg:overflow-hidden h-auto lg:h-[calc(100vh-64px)]">
        {/* Left Sidebar */}
        <aside className="w-full lg:w-[25%] bg-card overflow-y-auto hidden lg:block border-r border-border custom-scrollbar">
          <div className="p-6">
            <LeftSidebar />
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="w-full lg:w-[50%] bg-background lg:overflow-y-auto custom-scrollbar relative" id="main-feed-container">
          <div className="p-4 sm:p-6 h-full">
            {children}
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="w-full lg:w-[25%] bg-card lg:overflow-y-auto border-t lg:border-t-0 lg:border-l border-border custom-scrollbar">
          <div className="p-6">
            <RightSidebar />
          </div>
        </aside>
      </div>
    </div>
  );
}
