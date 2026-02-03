import { db } from "../app/lib/db";
import { users } from "../app/lib/schema";
import { eq } from "drizzle-orm";
import * as dotenv from "dotenv";

dotenv.config();

async function makeAdmin(email: string) {
  try {
    console.log(`Promoting ${email} to admin...`);
    
    const result = await db.update(users)
      .set({ role: 'admin' })
      .where(eq(users.email, email))
      .returning();

    if (result.length === 0) {
      console.error("User not found with that email!");
    } else {
      console.log("Success! User is now an admin.");
      console.log(result[0]);
    }
  } catch (error) {
    console.error("Error promoting user:", error);
  }
}

// Ganti email di bawah ini dengan email yang kamu daftarkan
const targetEmail = "razzymuflih5@gmail.com"; 
makeAdmin(targetEmail);
