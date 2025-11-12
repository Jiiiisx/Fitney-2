import LeftSidebar from "./components/LeftSidebar";
import MainFeed from "./components/MainFeed";
import RightSidebar from "./components/RightSidebar";

export default function CommunityPage() {
  return (
    <div className="h-full flex flex-col">
      {/* Main Layout */}
      <div className="flex-grow flex max-w-screen-2xl mx-auto w-full overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-full lg:w-[25%] bg-card overflow-y-auto">
          <div className="p-6">
            <LeftSidebar />
          </div>
        </aside>

        {/* Main Feed */}
        <main className="w-full lg:w-[50%] border-x border-border bg-background overflow-y-auto">
          <div className="p-6">
            <MainFeed />
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="w-full lg:w-[25%] bg-card overflow-y-auto">
          <div className="p-6">
            <RightSidebar />
          </div>
        </aside>
      </div>
    </div>
  );
}