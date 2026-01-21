import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { verifyAuth } from "@/app/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (auth.error) return auth.error;

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file received." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Buat nama file unik: timestamp-random.ext
    const filename = Date.now() + "-" + Math.round(Math.random() * 1E9) + path.extname(file.name);
    
    // Path penyimpanan (Local public folder)
    // Catatan: Di production (Vercel/Netlify), filesystem bersifat ephemeral. 
    // Untuk production, gunakan AWS S3, Cloudinary, atau UploadThing.
    const uploadDir = path.join(process.cwd(), "public/uploads/posts");
    
    // Pastikan folder ada
    try {
        await mkdir(uploadDir, { recursive: true });
    } catch (e) {
        // Ignore if exists
    }

    const filepath = path.join(uploadDir, filename);

    await writeFile(filepath, buffer);

    // Return URL publik
    const fileUrl = `/uploads/posts/${filename}`;

    return NextResponse.json({ url: fileUrl }, { status: 201 });

  } catch (error) {
    console.error("UPLOAD_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
