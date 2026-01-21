import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { users, followers } from "@/app/lib/schema";
import { verifyAuth } from "@/app/lib/auth";
import { eq, notInArray, and, ne } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (auth.error) return auth.error;

    const currentUserId = auth.user.userId;

    // 1. Ambil daftar ID user yang sudah difollow
    const following = await db
      .select({ id: followers.userId })
      .from(followers)
      .where(eq(followers.followerId, currentUserId));

    const followingIds = following.map((f) => f.id);
    
    // Tambahkan ID user sendiri agar tidak muncul di saran
    followingIds.push(currentUserId);

    // 2. Ambil user yang TIDAK ada di daftar followingIds
    const suggestions = await db.query.users.findMany({
      where: (users, { notInArray }) => notInArray(users.id, followingIds),
      limit: 5,
      columns: {
        id: true,
        username: true,
        fullName: true,
        imageUrl: true,
        level: true, // Tampilkan level agar lebih menarik
      },
      // Opsional: Order by random atau popularity (butuh logic tambahan)
      // Saat ini kita ambil default order (biasanya by ID atau insertion)
    });

    // Format data untuk frontend (tambah field isFollowing: false)
    const formattedSuggestions = suggestions.map(user => ({
      ...user,
      isFollowing: false
    }));

    return NextResponse.json(formattedSuggestions);

  } catch (error) {
    console.error("GET_SUGGESTIONS_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}