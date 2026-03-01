import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bdie';

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is not set');
}

// ─────────────────────────────────────────────────────────────────────────────
// Next.js hot-reloads each module during development, which causes multiple
// mongoose connections. We cache the connection on the global object to reuse
// it across hot-reloads. In production this pattern avoids exhausting the
// MongoDB Atlas connection pool.
// ─────────────────────────────────────────────────────────────────────────────
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global._mongooseCache ?? { conn: null, promise: null };
global._mongooseCache = cached;

export async function connectDB(): Promise<typeof mongoose> {
  // Return existing connection immediately
  if (cached.conn) return cached.conn;

  // If a connection is in-flight, await it (prevents multiple parallel connects)
  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      maxPoolSize: 10,       // limit concurrent connections
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongooseInstance) => {
        console.log('[DB] Connected to MongoDB');
        return mongooseInstance;
      })
      .catch((err) => {
        cached.promise = null; // reset so next call retries
        console.error('[DB] Connection failed:', err.message);
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
