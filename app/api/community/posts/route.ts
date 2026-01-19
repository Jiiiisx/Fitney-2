import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { posts } from "@/app/lib/schema";
import { verifyAuth } from "@/app/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (auth.error) return auth.error;
    
    const body = await req.json();
    const { content, imageUrl } = body;

    if (!content) {
        return NextResponse.json({ error: "Content cannot be empty" }, { status: 400 });
    }

    const newPost = await db.insert(posts).values({
        userId: auth.user.userId,
        content,
        imageUrl: imageUrl || null, // Optional
    }).returning();

    return NextResponse.json(newPost[0], { status: 201 });

  } catch (error) {
    console.error("CREATE_POST_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
