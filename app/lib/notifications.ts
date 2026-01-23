import { db } from "./db";
import { notifications } from "./schema";

export type NotificationType = 'like' | 'comment' | 'follow' | 'system';

export async function createNotification({
  recipientId,
  senderId,
  type,
  resourceId,
  message,
  linkUrl
}: {
  recipientId: string;
  senderId?: string;
  type: NotificationType;
  resourceId?: number;
  message: string;
  linkUrl?: string;
}) {
  try {
    // Hindari notifikasi untuk diri sendiri
    if (recipientId === senderId) return;

    await db.insert(notifications).values({
      userId: recipientId,
      senderId: senderId || null,
      type,
      resourceId,
      message,
      linkUrl,
    });
  } catch (error) {
    console.error("FAILED_TO_CREATE_NOTIFICATION", error);
  }
}
