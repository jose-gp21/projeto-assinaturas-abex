// src/pages/api/admin/planos.ts (Refatorado)
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

// ✅ Importa as funções do novo serviço de planos
import {
  createNewPlano,
  getPlanos,
  updateExistingPlano,
  deleteExistingPlano,
} from '@/services/planoService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  // ✅ Verificação de role de admin (assumindo que só admins podem gerenciar planos)
  if (!session || !session.user || session.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Acesso proibido. Você não tem permissão de administrador.' });
  }

  // A conexão com o Mongoose já é gerenciada dentro de cada função de serviço

  switch (req.method) {
    case 'POST':
      try {
        const newPlano = await createNewPlano(req.body); // Chama o serviço
        res.status(201).json({ success: true, message: 'Plano criado com sucesso!', data: newPlano });
      } catch (error: any) {
        // ✅ Tratamento de erro mais específico com base nas mensagens do serviço
        if (error.message.includes('obrigatório')) {
          return res.status(400).json({ success: false, message: error.message });
        }
        if (error.message.includes('Já existe um plano com este nome.')) {
            return res.status(409).json({ success: false, message: error.message });
        }
        console.error('Erro na API ao criar plano:', error);
        res.status(500).json({ success: false, message: 'Erro interno do servidor ao criar plano.' });
      }
      break;

    case 'GET':
      try {
        const planos = await getPlanos(); // Chama o serviço
        res.status(200).json({ success: true, data: planos });
      } catch (error: any) {
        console.error('Erro na API ao listar planos:', error);
        res.status(500).json({ success: false, message: 'Erro interno do servidor ao listar planos.' });
      }
      break;

    case 'PUT':
      try {
        const { id, ...updateData } = req.body; // Separa o ID dos dados de atualização
        const updatedPlano = await updateExistingPlano(id, updateData); // Chama o serviço
        res.status(200).json({ success: true, message: 'Plano atualizado com sucesso!', data: updatedPlano });
      } catch (error: any) {
        // ✅ Tratamento de erro mais específico
        if (error.message.includes('obrigatório')) {
            return res.status(400).json({ success: false, message: error.message });
        }
        if (error.message.includes('não encontrado')) {
            return res.status(404).json({ success: false, message: error.message });
        }
        if (error.message.includes('Já existe outro plano com este nome.')) {
            return res.status(409).json({ success: false, message: error.message });
        }
        console.error('Erro na API ao atualizar plano:', error);
        res.status(500).json({ success: false, message: 'Erro interno do servidor ao atualizar plano.' });
      }
      break;

    case 'DELETE':
      try {
        const { id } = req.query; // ID pode vir da query param para DELETE
        if (typeof id !== 'string') { // Garantir que id é string
            return res.status(400).json({ success: false, message: 'ID do plano é obrigatório para exclusão.' });
        }
        await deleteExistingPlano(id); // Chama o serviço
        res.status(200).json({ success: true, message: 'Plano excluído com sucesso!' });
      } catch (error: any) {
        // ✅ Tratamento de erro mais específico
        if (error.message.includes('obrigatório')) {
            return res.status(400).json({ success: false, message: error.message });
        }
        if (error.message.includes('não encontrado')) {
            return res.status(404).json({ success: false, message: error.message });
        }
        console.error('Erro na API ao excluir plano:', error);
        res.status(500).json({ success: false, message: 'Erro interno do servidor ao excluir plano.' });
      }
      break;

    default:
      res.status(405).json({ success: false, message: 'Método não permitido.' });
      break;
  }
}