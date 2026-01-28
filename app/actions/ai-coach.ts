"use server";

import { db } from "@/app/lib/db";
import { aiChatSessions, aiChatMessages } from "@/app/lib/schema";
import { eq, desc, and } from "drizzle-orm";
import { cookies } from "next/headers";
import { getUserFromToken } from "@/app/lib/auth";

// Helper: Get authenticated user ID
async function getAuthUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  const user = await getUserFromToken(token);
  return user?.userId;
}

export async function getOrCreateTodaySession() {
  const userId = await getAuthUserId();
  if (!userId) return { error: "Unauthorized" };

  try {
    // Cari sesi terbaru user ini
    const existingSession = await db.query.aiChatSessions.findFirst({
      where: eq(aiChatSessions.userId, userId),
      orderBy: [desc(aiChatSessions.updatedAt)],
    });

    // Jika ada sesi dan dibuat hari ini (opsional: atau dalam 24 jam terakhir), gunakan itu.
    // Untuk simplisitas, kita pakai sesi terakhir saja dulu.
    if (existingSession) {
        return { sessionId: existingSession.id };
    }

    // Jika tidak ada, buat baru
    const [newSession] = await db.insert(aiChatSessions).values({
      userId: userId,
      title: "New Chat",
    }).returning();

    return { sessionId: newSession.id };

  } catch (error) {
    console.error("Failed to get/create AI session:", error);
    return { error: "Failed to initialize chat" };
  }
}

export async function saveChatMessage(sessionId: number, role: "user" | "assistant", content: string) {
  const userId = await getAuthUserId();
  if (!userId) return { error: "Unauthorized" };

  try {
      // Security check: pastikan sesi ini milik user
      const session = await db.query.aiChatSessions.findFirst({
          where: and(eq(aiChatSessions.id, sessionId), eq(aiChatSessions.userId, userId))
      });

      if (!session) return { error: "Session not found or access denied" };

      await db.insert(aiChatMessages).values({
          sessionId,
          role,
          content
      });

      // Update timestamp sesi agar naik ke atas di list (jika nanti ada list history)
      await db.update(aiChatSessions)
        .set({ updatedAt: new Date() })
        .where(eq(aiChatSessions.id, sessionId));

      return { success: true };
  } catch (error) {
      console.error("Failed to save message:", error);
      return { error: "Failed to save message" };
  }
}

export async function getChatHistory(sessionId: number) {
    const userId = await getAuthUserId();
    if (!userId) return { error: "Unauthorized" };

    try {
        const messages = await db.query.aiChatMessages.findMany({
            where: eq(aiChatMessages.sessionId, sessionId),
            orderBy: (aiChatMessages, { asc }) => [asc(aiChatMessages.createdAt)],
        });

        return { messages };
    } catch (error) {
        console.error("Failed to fetch history:", error);
        return { error: "Failed to fetch history" };
    }
}
