import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/app/lib/auth";

export async function GET(req: NextRequest) {
    const auth = await verifyAuth(req);
    if (auth.error) return auth.error;

    return NextResponse.json({
        userId: auth.user.userId,
        email: auth.user.email,
    });
}
