// src/lib/mongodb.ts
import mongoose from "mongoose";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME;

if (!uri) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}
if (!dbName) {
  throw new Error("Please define the MONGODB_DB_NAME environment variable inside .env.local");
}

// ✅ Define globals safely for TypeScript
declare global {
  // eslint-disable-next-line no-var
  var _mongooseClientPromise: Promise<typeof mongoose> | undefined;
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let cachedMongoosePromise: Promise<typeof mongoose> | undefined;

/**
 * Conecta ao MongoDB via Mongoose.
 * Reutiliza a conexão em ambiente de desenvolvimento.
 */
export async function connectMongoose(): Promise<typeof mongoose> {
  if (cachedMongoosePromise) {
    return cachedMongoosePromise;
  }

  if (process.env.NODE_ENV === "development") {
    if (!global._mongooseClientPromise) {
      global._mongooseClientPromise = mongoose
        .connect(uri as string, { dbName })
        .then((m) => {
          console.log("✅ Mongoose conectado (cache de desenvolvimento)");
          return m;
        })
        .catch((err) => {
          console.error("❌ Erro ao conectar Mongoose (dev):", err.message);
          throw err;
        });
    }
    cachedMongoosePromise = global._mongooseClientPromise;
  } else {
    cachedMongoosePromise = mongoose
      .connect(uri as string, { dbName })
      .then((m) => {
        console.log("✅ Mongoose conectado (produção)");
        return m;
      })
      .catch((err) => {
        console.error("❌ Erro ao conectar Mongoose (produção):", err.message);
        throw err;
      });
  }

  return cachedMongoosePromise;
}

/**
 * Mantém também uma conexão MongoClient padrão (necessária se NextAuth usar o adapter nativo)
 */
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect().then((c) => {
      console.log("✅ MongoClient conectado (cache de desenvolvimento)");
      return c;
    });
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect().then((c) => {
    console.log("✅ MongoClient conectado (produção)");
    return c;
  });
}

/**
 * Retorna o cliente Mongo nativo (usado por NextAuth)
 */
export async function getMongoClient(): Promise<MongoClient> {
  return await clientPromise;
}
