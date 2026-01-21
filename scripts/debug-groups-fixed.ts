import * as dotenv from 'dotenv';
import path from 'path';

// Load .env.local manually
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { db } from "../app/lib/db";
import { groups, userGroups } from "../app/lib/schema";

async function main() {
  console.log("--- DEBUGGING DATABASE CONTENT ---");
  
  // 1. Cek User Groups (Membership)
  const memberships = await db.select().from(userGroups);
  console.log(`\nTotal Memberships (user_groups): ${memberships.length}`);
  memberships.forEach(m => {
    console.log(`- User [${m.userId}] joined Group [${m.groupId}] (Admin: ${m.isAdmin})`);
  });

  // 2. Cek Groups
  const allGroups = await db.select().from(groups);
  console.log(`\nTotal Groups: ${allGroups.length}`);
  allGroups.forEach(g => {
    console.log(`- Group [${g.id}]: ${g.name}`);
  });

  console.log("\n--- END DEBUG ---");
  process.exit(0);
}

main().catch((err) => {
  console.error("Error running script:", err);
  process.exit(1);
});
