import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/app/lib/auth";
import { db } from "@/app/lib/db";
import { users } from "@/app/lib/schema";
import { eq } from "drizzle-orm";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { ImageUp } from "lucide-react";

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (auth.error) return auth.error;
    const userId = auth.user.userId;

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file received" }, { status: 400 });
    }

    // Relaxed validation: Allow any image type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Invalid file type. Only images allowed." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const filename = `avatar-${userId}-${Date.now()}${path.extname(file.name)}`;

    const uploadDir = path.join(process.cwd(), "public/uploads/avatars");
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, filename);

    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/avatars/${filename}`;

    await db.update(users)
      .set({ imageUrl: publicUrl })
      .where(eq(users.id, userId));

    return NextResponse.json({
      message: "Profile photo updated",
      imageUrl: publicUrl
    });
  } catch (error) {
    console.error("UPLOAD_ERROR", error);
    return NextResponse.json({ message: "Internal Server Error"}, { status: 500 });
  }
}