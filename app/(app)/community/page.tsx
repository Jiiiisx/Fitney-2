import LeftSidebar from "./components/LeftSidebar";
import MainFeed from "./components/MainFeed";
import RightSidebar from "./components/RightSidebar";

export default function CommunityPage() {
  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">
            Community Hub
          </h1>
          <p className="text-lg text-gray-500 mt-1">
            Connect, share, and get motivated with the Fitney community.
          </p>
        </header>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-3">
            <LeftSidebar />
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-6">
            <MainFeed />
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-3">
            <RightSidebar />
          </div>
        </div>
      </div>
    </div>
  );
}