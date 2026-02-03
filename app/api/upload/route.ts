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

    // 1. Validasi Ukuran File (Maksimal 5MB)
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large. Maximum size is 5MB." }, { status: 400 });
    }

    // 2. Validasi Tipe File (Hanya gambar tertentu)
    const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Only JPG, PNG, and WEBP are allowed." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // 3. Sanitasi Nama File & Gunakan Ekstensi yang Aman
    const safeExt = path.extname(file.name).toLowerCase();
    const safeAllowedExts = [".jpg", ".jpeg", ".png", ".webp"];
    if (!safeAllowedExts.includes(safeExt)) {
        return NextResponse.json({ error: "Invalid file extension." }, { status: 400 });
    }

    const filename = Date.now() + "-" + Math.round(Math.random() * 1E9) + safeExt;
    
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
