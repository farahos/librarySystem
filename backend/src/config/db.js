import mongoose from "mongoose";
import { env } from "./env.js";
import Story from "../models/Story.js";

export async function connectDb() {
  await mongoose.connect(env.mongoUri);
  if (env.nodeEnv !== "production") {
    await Story.syncIndexes();
  }
  console.log("Mongo connected");
}
