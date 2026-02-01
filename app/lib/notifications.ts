import { db } from "./db";
import { notifications } from "./schema";

export type ContextType = 'workout_reminder' | 'hydration' | 'streak_save' | 'recovery';

export async function sendSmartNotification(userId: string, type: ContextType, data?: any) {
    let message = "";
    let title = "";

    const hour = new Date().getHours();

    switch (type) {
        case 'workout_reminder':
            if (hour < 12) {
                title = "Morning Energy! ☀️";
                message = "Ready to start your day with a quick session? Your future self will thank you.";
            } else if (hour < 18) {
                title = "Afternoon Boost 🚀";
                message = "Need a break from work? A quick workout is the best way to refocus.";
            } else {
                title = "Finish Strong 🌙";
                message = "Still got some energy left? Let's clear today's plan before you wind down.";
            }
            break;

        case 'hydration':
            if (hour > 20) {
                message = "One last glass of water before bed to stay hydrated through the night. 💧";
            } else {
                message = "Time for a quick sip! Staying hydrated keeps your performance peak.";
            }
            break;

        case 'streak_save':
            message = `You have ${data?.missedCount || 0}/5 misses left this month. Don't let your streak slip away! You can do this. 💪`;
            break;
            
        case 'recovery':
            message = "Today is your Rest Day. Take it easy and let your muscles grow! 🧘‍♂️";
            break;
    }

    // Save to DB
    await db.insert(notifications).values({
        userId,
        type: 'system',
        message: title ? `${title}: ${message}` : message,
        isRead: false,
        createdAt: new Date(),
    });

    return { title, message };
}

export async function createNotification({
    recipientId,
    senderId,
    type,
    message,
    resourceId,
    linkUrl
}: {
    recipientId: string;
    senderId: string;
    type: string;
    message: string;
    resourceId?: number;
    linkUrl?: string;
}) {
    try {
        await db.insert(notifications).values({
            userId: recipientId,
            senderId: senderId,
            type: type,
            resourceId: resourceId,
            message: message,
            linkUrl: linkUrl,
            isRead: false,
            createdAt: new Date(),
        });
        return { success: true };
    } catch (error) {
        console.error("Error creating notification:", error);
        return { success: false };
    }
}