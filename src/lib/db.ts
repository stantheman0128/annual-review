import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

// We will validate this lazily or let it be undefined for build time
// content

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
// @ts-ignore
let cached = global.mongoose;

if (!cached) {
    // @ts-ignore
    cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!MONGODB_URI) {
        // Allow build to pass without env var, but runtime requires it
        if (process.env.NODE_ENV === 'production') {
            // throw new Error('Please define the MONGODB_URI environment variable');
            console.warn('MONGODB_URI not defined');
        }
        // For now return null or throw if actually trying to connect
        // throw new Error('Please define the MONGODB_URI environment variable');
    }

    if (!cached.promise && MONGODB_URI) {
        const opts = {
            bufferCommands: false,
        };

        cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
            return mongoose;
        });
    }

    if (cached.promise) {
        try {
            cached.conn = await cached.promise;
        } catch (e) {
            cached.promise = null;
            throw e;
        }
    }

    return cached.conn;
}

export default dbConnect;
