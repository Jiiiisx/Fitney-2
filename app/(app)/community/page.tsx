import React, { Suspense } from 'react';
import MainFeed from './components/MainFeed';
import { Trophy, Search } from "lucide-react";
import Link from 'next/link';
import { Skeleton } from "@/components/ui/skeleton";

function MainFeedFallback() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Skeleton className="h-[100px] w-full rounded-3xl" />
      <Skeleton className="h-[200px] w-full rounded-3xl" />
      <Skeleton className="h-[400px] w-full rounded-3xl" />
    </div>
  );
}

export default function CommunityDashboard() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      
      {/* HEADER - Compact & Impactful */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-6 rounded-3xl border shadow-sm">
        <div>
          <h1 className="text-3xl font-black italic tracking-tight">Community</h1>
          <p className="text-muted-foreground font-medium text-sm">Share your journey, find inspiration.</p>
        </div>
        <div className="flex gap-2">
            <Link href="/community/challenges" className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-orange-500/20 transition-all hover:scale-105 text-sm">
                <Trophy className="w-4 h-4" />
                <span>Challenges</span>
            </Link>
            <Link href="/community/find-friends" className="bg-muted hover:bg-muted/80 text-foreground px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all text-sm border">
                <Search className="w-4 h-4" />
                <span>Find Friends</span>
            </Link>
        </div>
      </div>

      {/* MAIN FEED */}
      <Suspense fallback={<MainFeedFallback />}>
        <MainFeed />
      </Suspense>
    </div>
  );
}
