import mongoose from "mongoose";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var __mongooseCache: MongooseCache | undefined;
}

const globalCache = globalThis.__mongooseCache ?? { conn: null, promise: null };
globalThis.__mongooseCache = globalCache;

export async function connectToDb() {
  if (globalCache.conn) return globalCache.conn;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("Missing MONGODB_URI environment variable");
  }

  if (!globalCache.promise) {
    globalCache.promise = mongoose.connect(uri, {
      bufferCommands: false
    });
  }

  globalCache.conn = await globalCache.promise;
  return globalCache.conn;
}
