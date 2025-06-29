// src/pages/api/admin/conteudo.ts (Refatorado)
import type { NextApiRequest, NextApiResponse } from 'next';
// Não precisa mais de connectMongoose aqui se cada serviço já chama
// import { connectMongoose } from '@/lib/mongodb'; 
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

// ✅ Importa as funções do novo serviço
import {
  createNewContent,
  getContents,
  updateContent,
  deleteContent,
} from '@/services/contentService'; 

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  // ✅ Verificação de role de admin (se necessário)
  if (!session || !session.user || session.user.role !== 'admin') { // Adicione checagem de role de admin aqui, se for para admins
    return res.status(403).json({ success: false, message: 'Acesso proibido. Faça login como administrador.' });
  }

  // A conexão do Mongoose já está sendo garantida dentro de cada função de serviço

  switch (req.method) {
    case 'POST':
      try {
        const newConteudo = await createNewContent(req.body); // Chama o serviço
        res.status(201).json({ success: true, message: 'Conteúdo criado com sucesso!', data: newConteudo });
      } catch (error: any) {
        // ✅ Tratamento de erro mais específico se o serviço lançar erros com mensagens personalizadas
        if (error.message.includes('obrigatório') || error.message.includes('não existe')) {
          return res.status(400).json({ success: false, message: error.message });
        }
        console.error('Erro ao criar conteúdo na API:', error);
        res.status(500).json({ success: false, message: 'Erro interno do servidor ao criar conteúdo.' });
      }
      break;

    case 'GET':
      try {
        const { id } = req.query;
        const conteudos = await getContents(id as string); // Chama o serviço
        res.status(200).json({ success: true, data: conteudos });
      } catch (error: any) {
        if (error.message.includes('não encontrado')) {
          return res.status(404).json({ success: false, message: error.message });
        }
        console.error('Erro ao listar/buscar conteúdo na API:', error);
        res.status(500).json({ success: false, message: 'Erro interno do servidor ao listar/buscar conteúdo.' });
      }
      break;

    case 'PUT':
      try {
        const { id, ...updateData } = req.body;
        const updatedConteudo = await updateContent(id, updateData); // Chama o serviço
        res.status(200).json({ success: true, message: 'Conteúdo atualizado com sucesso!', data: updatedConteudo });
      } catch (error: any) {
        if (error.message.includes('obrigatório') || error.message.includes('não existe') || error.message.includes('não encontrado')) {
          return res.status(error.message.includes('não encontrado') ? 404 : 400).json({ success: false, message: error.message });
        }
        console.error('Erro ao atualizar conteúdo na API:', error);
        res.status(500).json({ success: false, message: 'Erro interno do servidor ao atualizar conteúdo.' });
      }
      break;

    case 'DELETE':
      try {
        const { id } = req.query;
        await deleteContent(id as string); // Chama o serviço
        res.status(200).json({ success: true, message: 'Conteúdo excluído com sucesso!' });
      } catch (error: any) {
        if (error.message.includes('obrigatório') || error.message.includes('não encontrado')) {
          return res.status(error.message.includes('não encontrado') ? 404 : 400).json({ success: false, message: error.message });
        }
        console.error('Erro ao excluir conteúdo na API:', error);
        res.status(500).json({ success: false, message: 'Erro interno do servidor ao excluir conteúdo.' });
      }
      break;

    default:
      res.status(405).json({ success: false, message: 'Método não permitido.' });
      break;
  }
}