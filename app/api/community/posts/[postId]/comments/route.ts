import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { postComments } from "@/app/lib/schema";
import { verifyAuth } from "@/app/lib/auth";
import { desc, asc } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const auth = await verifyAuth(req);
    if (auth.error) return auth.error;

    const { postId } = await params;
    const postIdInt = parseInt(postId);

    if (isNaN(postIdInt)) {
      return NextResponse.json({ error: "Invalid Post ID" }, { status: 400 });
    }

    // Mengambil komentar menggunakan Relations API Drizzle
    const comments = await db.query.postComments.findMany({
      where: (comments, { eq }) => eq(comments.postId, postIdInt),
      orderBy: [asc(postComments.createdAt)], // Komentar lama di atas
      with: {
        user: {
          columns: {
            id: true,
            username: true,
            fullName: true,
            imageUrl: true,
          }
        }
      }
    });

    return NextResponse.json(comments);

  } catch (error) {
    console.error("GET_COMMENTS_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const auth = await verifyAuth(req);
    if (auth.error) return auth.error;

    const { postId } = await params;
    const postIdInt = parseInt(postId);
    const body = await req.json();
    const { content } = body;

    if (isNaN(postIdInt)) {
      return NextResponse.json({ error: "Invalid Post ID" }, { status: 400 });
    }

    if (!content || content.trim() === "") {
        return NextResponse.json({ error: "Comment content is required" }, { status: 400 });
    }

    // Insert komentar baru
    const newComment = await db.insert(postComments).values({
        postId: postIdInt,
        userId: auth.user.userId,
        content: content.trim(),
    }).returning();

    // Fetch user info untuk dikembalikan ke frontend (biar UI bisa langsung update tanpa refetch)
    const user = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, auth.user.userId),
        columns: {
            id: true,
            username: true,
            fullName: true,
            imageUrl: true,
        }
    });

    return NextResponse.json({
        ...newComment[0],
        user
    }, { status: 201 });

  } catch (error) {
    console.error("CREATE_COMMENT_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}