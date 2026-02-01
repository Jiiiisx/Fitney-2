import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { users } from "@/app/lib/schema";
import { eq } from "drizzle-orm";
import { verifyAdmin } from "@/app/lib/auth";

export async function PATCH(
    req: NextRequest,
    context: { params: Promise<{ userId: string }> }
) {
    try {
        const auth = await verifyAdmin(req);
        if (auth.error) return auth.error;

        const { userId } = await context.params;
        const { role } = await req.json();

        if (!role) return NextResponse.json({ error: "Role is required" }, { status: 400 });

        await db.update(users).set({ role }).where(eq(users.id, userId));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("ADMIN_USER_UPDATE_ERROR", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ userId: string }> }
) {
    try {
        const auth = await verifyAdmin(req);
        if (auth.error) return auth.error;

        const { userId } = await context.params;

        // Prevent self-deletion
        if (userId === auth.user.userId) {
            return NextResponse.json({ error: "You cannot delete your own admin account" }, { status: 403 });
        }

        await db.delete(users).where(eq(users.id, userId));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("ADMIN_USER_DELETE_ERROR", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}