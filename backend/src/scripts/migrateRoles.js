import mongoose from "mongoose";
import { connectDb } from "../config/db.js";
import User from "../models/User.js";
import { normalizeRoles } from "../utils/roles.js";

async function migrateRoles() {
  await connectDb();

  const users = await User.find({
    $or: [
      { roles: { $in: ["reader", "writer", "verified_writer"] } },
      { "verification.status": "verified" },
    ],
  });

  for (const user of users) {
    user.roles = normalizeRoles(user.roles || []);
    if (user.verification?.status === "verified") {
      user.verification.status = "approved";
    }
    await user.save();
    console.log(`Migrated ${user.email}: ${user.roles.join(", ")}`);
  }

  console.log(`Role migration complete. Updated ${users.length} users.`);
  await mongoose.disconnect();
}

migrateRoles().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect();
  process.exit(1);
});
