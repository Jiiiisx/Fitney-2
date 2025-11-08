// app/(app)/dashboard/page.tsx

import StatsSidebar from '../components/StatsSidebar';
import TodaysPlanBanner from '../components/TodaysPlanBanner';

export default function DashboardPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Main Content Area (Left) - 2/3 width */}
      <div className="lg:col-span-2">
        <TodaysPlanBanner />
      </div>

      {/* Stats Sidebar (Right) - 1/3 width */}
      <div className="lg:col-span-1">
        <StatsSidebar />
      </div>

    </div>
  );
}
