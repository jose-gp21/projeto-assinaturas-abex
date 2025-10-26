// src/pages/api/test_db.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getMongoClient } from '@/lib/mongodb'; // ✅ nova função para obter o client do MongoDB

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const client = await getMongoClient(); // ✅ conexão reaproveitada
    const db = client.db(); // usa o nome do banco definido em dbName no client

    res.status(200).json({
      message: 'Conexão com MongoDB bem-sucedida!',
      dbName: db.databaseName,
    });
  } catch (error) {
    console.error('Erro ao conectar ou operar com o MongoDB:', error);
    res.status(500).json({
      message: 'Falha na conexão ou operação com o banco de dados.',
      error: (error as Error).message,
    });
  }
}
