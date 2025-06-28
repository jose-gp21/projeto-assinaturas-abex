// src/lib/mongodb.ts
import mongoose from 'mongoose'; // <-- Mantenha o Mongoose aqui
import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME;

if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}
if (!dbName) {
  throw new Error('Please define the MONGODB_DB_NAME environment variable inside .env.local');
}

// Declaração global para cachear a conexão do Mongoose
declare global {
  var _mongooseClientPromise: Promise<typeof mongoose> | undefined;
  var _mongoClientPromise: Promise<MongoClient> | undefined; // Mantenha isso se o next-auth ainda depender
}

let cachedMongoosePromise: Promise<typeof mongoose> | undefined;

/**
 * Conecta ao banco de dados MongoDB usando Mongoose.
 * Reutiliza a conexão em desenvolvimento para evitar múltiplas conexões.
 */
export async function connectMongoose() { // Renomeado para evitar conflito e ser mais claro
  if (cachedMongoosePromise) {
    console.log('Using cached Mongoose connection');
    return cachedMongoosePromise;
  }

  // Se não houver cache ou em produção, estabelece uma nova conexão
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

  await cachedMongoosePromise; // Espera a conexão ser estabelecida
  return cachedMongoosePromise;
}

// Opcional: Se o next-auth ainda precisar de `MongoClient` via `clientPromise` em `[...nextauth].ts`
// Mantenha essa parte se você estiver passando `MongoClient.connect(process.env.MONGODB_URI as string)`
// diretamente para o adaptador do NextAuth.
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

export async function getMongoClient() { // Nova função para obter o MongoClient
  const connectedClient = await clientPromise;
  return connectedClient;
}