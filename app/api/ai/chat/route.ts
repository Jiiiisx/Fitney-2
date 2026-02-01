import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { users, workoutLogs, foodLogs, foods, userProfiles, userGoals, sleepLogs } from "@/app/lib/schema";
import { eq, desc, sql, and } from "drizzle-orm";
import { verifyAuth } from "@/app/lib/auth";
import { model } from "@/app/lib/gemini"; // Use direct model for startChat
import { format } from "date-fns";

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (auth.error) return auth.error;
    const userId = auth.user.userId;

    // Receive 'mode' to determine the Persona
    const { message, messages, mode = 'briefing' } = await req.json();
    
    // 1. FETCH SHARED MEMORY (The Core Context)
    const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
    const profile = await db.query.userProfiles.findFirst({ where: eq(userProfiles.userId, userId) });
    const goals = await db.select().from(userGoals).where(eq(userGoals.userId, userId));

    // Optimisasi: Hanya ambil 5 log terakhir untuk hemat token
    const recentWorkouts = await db.select().from(workoutLogs)
        .where(eq(workoutLogs.userId, userId))
        .orderBy(desc(workoutLogs.date))
        .limit(5);
    
    const formattedWorkouts = recentWorkouts.map(w => {
        const dateStr = format(new Date(w.date), 'MMM d');
        return `[${dateStr}] ${w.name} (${w.type})`;
    }).join("\n");

    // Sleep (Critical for Recovery mode)
    const lastSleep = await db.query.sleepLogs.findFirst({
        where: eq(sleepLogs.userId, userId),
        orderBy: desc(sleepLogs.date)
    });

    // 2. DEFINE PERSONAS (The "Hats")
    const getPersonaInstruction = (currentMode: string) => {
        const baseIdentity = `You are Fitney AI. User: ${user?.fullName}. Level: ${user?.level}. Goal: ${profile?.mainGoal}.`;
        
        switch (currentMode) {
            case 'fridge':
                return `${baseIdentity} ROLE: Creative Chef. Suggest recipes based on ingredients.`;
            case 'auditor':
                return `${baseIdentity} ROLE: Strength Coach. Analyze volume and form. Workouts: ${formattedWorkouts}`;
            case 'recovery':
                return `${baseIdentity} ROLE: Physio. Sleep: ${lastSleep?.qualityRating || '?'}/5. Suggest recovery protocols.`;
            case 'briefing':
            default:
                return `${baseIdentity} ROLE: Head Coach. Motivate and strategize.`;
        }
    };

    // 3. EFFICIENT CHAT SESSION
    // Limit history to last 6 messages to save input tokens (3 turns)
    let recentHistory = messages ? messages.slice(-6) : [];
    
    // Gemini REQUIREMENT: History must start with a USER message
    // If the first message in our slice is from the bot, remove it.
    if (recentHistory.length > 0 && recentHistory[0].role !== 'user') {
        recentHistory = recentHistory.slice(1);
    }
    
    const chat = model.startChat({
        history: recentHistory.map((m: any) => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }],
        })),
        systemInstruction: getPersonaInstruction(mode),
    });

    // 4. RETRY LOGIC FOR CHAT
    const sendMessageWithRetry = async (msg: string, retries = 2): Promise<string> => {
        try {
            const result = await chat.sendMessage(msg);
            return result.response.text();
        } catch (error: any) {
            const isRateLimited = error.message?.includes("429") || error.message?.includes("503");
            if (isRateLimited && retries > 0) {
                console.log(`Chat busy (429), retrying in 5s... (${retries} left)`);
                await new Promise(resolve => setTimeout(resolve, 5000));
                return sendMessageWithRetry(msg, retries - 1);
            }
            throw error;
        }
    };

    const reply = await sendMessageWithRetry(message);
    console.log(`[AI-CHAT] Mode: ${mode}, Reply Length: ${reply?.length}`);

    return NextResponse.json({ reply });

  } catch (error: any) {
    console.error("AI_CHAT_ERROR", error);
    // Fallback if overloaded
    if (error.status === 429 || error.message?.includes('429')) {
        return NextResponse.json({ reply: "I'm thinking too hard right now (Brain Overload). Ask me again in a minute!" });
    }
    return NextResponse.json({ reply: "My neural link is flickering. Please try again in a few seconds!" });
  }
}