import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { db } from "../app/lib/db";
import { posts, postLikes, postComments } from "../app/lib/schema";
import { sql, eq } from "drizzle-orm";

async function syncCounts() {
  console.log("🔄 Syncing likes and comments counts...");

  const allPosts = await db.select({ id: posts.id }).from(posts);

  for (const post of allPosts) {
    const [likes] = await db
      .select({ count: sql<number>`count(*)` })
      .from(postLikes)
      .where(eq(postLikes.postId, post.id));

    const [comments] = await db
      .select({ count: sql<number>`count(*)` })
      .from(postComments)
      .where(eq(postComments.postId, post.id));

    await db
      .update(posts)
      .set({
        likesCount: Number(likes.count),
        commentsCount: Number(comments.count),
      })
      .where(eq(posts.id, post.id));
    
    console.log(`✅ Post ID ${post.id}: ${likes.count} likes, ${comments.count} comments synced.`);
  }

  console.log("✨ All counts synced successfully.");
  process.exit(0);
}

syncCounts().catch(err => {
  console.error("❌ Sync failed:", err);
  process.exit(1);
});
