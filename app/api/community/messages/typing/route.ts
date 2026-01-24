import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/app/lib/auth";

// Simpan status typing di memory (Temporary)
// Key: targetId_targetType
// Value: Map<userId, timestamp>
const typingRegistry = new Map<string, Map<string, { name: string, timestamp: number }>>();

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (auth.error) return auth.error;

    const { searchParams } = new URL(req.url);
    const targetId = searchParams.get("targetId");
    const type = searchParams.get("type"); // 'group' or 'direct'

    if (!targetId || !type) return NextResponse.json([]);

    const registryKey = `${targetId}_${type}`;
    const targetMap = typingRegistry.get(registryKey);
    
    if (!targetMap) return NextResponse.json([]);

    const now = Date.now();
    const activeTypers: string[] = [];

    // Bersihkan yang sudah lama (> 5 detik) dan ambil yang aktif
    for (const [uid, data] of targetMap.entries()) {
      if (uid === auth.user.userId) continue; // Jangan hitung diri sendiri

      if (now - data.timestamp < 5000) {
        activeTypers.push(data.name);
      } else {
        targetMap.delete(uid);
      }
    }

    return NextResponse.json(activeTypers);

  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (auth.error) return auth.error;

    const { targetId, type, name } = await req.json();

    if (!targetId || !type) return NextResponse.json({ error: "Missing data" }, { status: 400 });

    const registryKey = `${targetId}_${type}`;
    if (!typingRegistry.has(registryKey)) {
      typingRegistry.set(registryKey, new Map());
    }

    const targetMap = typingRegistry.get(registryKey)!;
    targetMap.set(auth.user.userId, {
      name: name || "Someone",
      timestamp: Date.now()
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
