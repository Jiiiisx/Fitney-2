import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { users } from "@/app/lib/schema";
import { verifyAuth } from "@/app/lib/auth";
import { eq } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const auth = await verifyAuth(req);
    if (auth.error) return auth.error;

    const { userId } = await params;

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: {
        id: true,
        username: true,
        fullName: true,
        imageUrl: true,
        level: true,
      }
    });

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);

  } catch (error) {
    console.error("GET_USER_PROFILE_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
