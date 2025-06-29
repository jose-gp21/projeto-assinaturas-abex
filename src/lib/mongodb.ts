// src/lib/mongodb.ts
import mongoose from 'mongoose'; // <-- Keep Mongoose here
import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME;

if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}
if (!dbName) {
  throw new Error('Please define the MONGODB_DB_NAME environment variable inside .env.local');
}

// Global declaration to cache the Mongoose connection
declare global {
  var _mongooseClientPromise: Promise<typeof mongoose> | undefined;
  var _mongoClientPromise: Promise<MongoClient> | undefined; // Keep this if next-auth still depends on it
}

let cachedMongoosePromise: Promise<typeof mongoose> | undefined;

/**
 * Connects to the MongoDB database using Mongoose.
 * Reuses the connection in development to avoid multiple connections.
 */
export async function connectMongoose() { // Renamed for clarity and to avoid conflicts
  if (cachedMongoosePromise) {
    console.log('Using cached Mongoose connection');
    return cachedMongoosePromise;
  }

  // If no cache or in production, establish a new connection
  if (process.env.NODE_ENV === 'development') {
    if (!global._mongooseClientPromise) {
      global._mongooseClientPromise = mongoose.connect(uri as string, { dbName: dbName }).then((m) => {
        console.log('Successfully established Mongoose connection for development cache.');
        return m;
      });
    }
    cachedMongoosePromise = global._mongooseClientPromise;
  } else {
    cachedMongoosePromise = mongoose.connect(uri as string, { dbName: dbName }).then((m) => {
      console.log('Successfully established Mongoose connection for production.');
      return m;
    });
  }

  await cachedMongoosePromise; // Wait for the connection to be established
  return cachedMongoosePromise;
}

// Optional: If next-auth still requires `MongoClient` via `clientPromise` in `[...nextauth].ts`
// Keep this part if you are passing `MongoClient.connect(process.env.MONGODB_URI as string)`
// directly to the NextAuth adapter.
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export async function getMongoClient() { // New function to get the MongoClient
  const connectedClient = await clientPromise;
  return connectedClient;
}