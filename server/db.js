import mongoose from "mongoose";
import { seed } from "./seed.js";

// On Vercel each request may run in a fresh or a reused ("warm") function.
// Caching the connection on globalThis lets warm requests skip reconnecting.
const cached = globalThis.__mongo ??= { conn: null, promise: null };

export async function connectDb() {
  if (cached.conn) return cached.conn;
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not set");

  cached.promise ??= mongoose
    .connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DB || "mcdonals", serverSelectionTimeoutMS: 10000 })
    .then(async m => { await seed(); return m; });

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null; // let the next request retry
    throw err;
  }
  return cached.conn;
}
