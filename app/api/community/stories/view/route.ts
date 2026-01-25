import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { storyViews } from "@/app/lib/schema";
import { verifyAuth } from "@/app/lib/auth";
import { sql } from "drizzle-orm";

export async function POST(req: NextRequest) {
    try {
        const auth = await verifyAuth(req);
        if (auth.error) return auth.error;

        const body = await req.json();
        const { storyId } = body;

        if (!storyId) return NextResponse.json({ error: "Story ID required" }, { status: 400 });

        // Insert or ignore if already viewed (using raw SQL for ON CONFLICT IGNORE because Drizzle syntax can be tricky with composite keys in some versions)
        await db.insert(storyViews).values({
            userId: auth.user.userId,
            storyId: parseInt(storyId),
        }).onConflictDoNothing();

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("STORY_VIEW_ERROR", error);
        return NextResponse.json({ error: "Failed to record view" }, { status: 500 });
    }
}
