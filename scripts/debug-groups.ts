
import { db } from "../app/lib/db";
import { groups, userGroups, users } from "../app/lib/schema";
import { eq } from "drizzle-orm";

async function main() {
  console.log("--- CHECKING GROUPS ---");
  
  // 1. Cek semua grup
  const allGroups = await db.select().from(groups);
  console.log(`Total Groups found: ${allGroups.length}`);
  allGroups.forEach(g => {
    console.log(`- Group: [${g.id}] ${g.name} (Created by: ${g.createdBy})`);
  });

  console.log("\n--- CHECKING MEMBERSHIPS ---");
  // 2. Cek membership
  const allMemberships = await db.select().from(userGroups);
  console.log(`Total Memberships found: ${allMemberships.length}`);
  allMemberships.forEach(m => {
    console.log(`- User ${m.userId} is in Group ${m.groupId}`);
  });

  console.log("\n--- FINISHED ---");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
