import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { posts, hashtags, postHashtags } from "@/app/lib/schema";
import { verifyAuth } from "@/app/lib/auth";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
    try {
        const auth = await verifyAuth(req);
        if (auth.error) return auth.error;

        const body = await req.json();
        const { content, images } = body;

        if (!content && (!images || images.length === 0)) {
            return NextResponse.json({ error: "Post must have content or images" }, { status: 400 });
        }

        // 1. Buat Post
        const newPost = await db.insert(posts).values({
            userId: auth.user.userId,
            content,
            images: images || [],
        }).returning();

        const postId = newPost[0].id;

        // 2. Ekstrak Hashtags
        // Mencari kata yang dimulai dengan # diikuti huruf/angka/underscore
        const regex = /#(\w+)/g;
        const matches = [...content.matchAll(regex)];
        const uniqueTags = new Set(matches.map(m => m[1].toLowerCase())); // Normalize to lowercase

        // 3. Simpan Hashtags (jika ada)
        if (uniqueTags.size > 0) {
            for (const tag of uniqueTags) {
                // Cek apakah hashtag sudah ada
                let hashtagRecord = await db.select().from(hashtags).where(eq(hashtags.tag, tag)).limit(1);
                let hashtagId;

                if (hashtagRecord.length === 0) {
                    // Insert baru
                    const newHashtag = await db.insert(hashtags).values({ tag }).returning();
                    hashtagId = newHashtag[0].id;
                } else {
                    hashtagId = hashtagRecord[0].id;
                }

                // Link Post ke Hashtag
                await db.insert(postHashtags).values({
                    postId: postId,
                    hashtagId: hashtagId,
                });
            }
        }

        return NextResponse.json(newPost[0], { status: 201 });

    } catch (error) {
        console.error("CREATE_POST_ERROR", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}