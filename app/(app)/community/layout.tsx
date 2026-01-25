

import LeftSidebar from "./components/LeftSidebar";
import RightSidebar from "./components/RightSidebar";
import CommunityLayoutWrapper from "./components/CommunityLayoutWrapper";

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full flex flex-col">
      <CommunityLayoutWrapper
        leftSidebar={<LeftSidebar />}
        rightSidebar={<RightSidebar />}
      >
        {children}
      </CommunityLayoutWrapper>
    </div>
  );
}
