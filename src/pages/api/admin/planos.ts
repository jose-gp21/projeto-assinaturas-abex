// src/pages/api/admin/planos.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { connectMongoose } from '@/lib/mongodb'; // ✅ novo import
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import Plano from '@/lib/models/Plano';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user) {
    return res.status(401).json({ success: false, message: 'Não autorizado. Faça login.' });
  }

  await connectMongoose(); // ✅ nova função de conexão

  switch (req.method) {
    case 'POST':
      try {
        const { nome, valorMensal, valorAnual, descricao, beneficios, diasTeste } = req.body;

        if (!nome || !descricao) {
          return res.status(400).json({ success: false, message: 'Nome e descrição do plano são obrigatórios.' });
        }

        const newPlano = await Plano.create({
          nome,
          valorMensal: valorMensal || null,
          valorAnual: valorAnual || null,
          descricao,
          beneficios: beneficios || [],
          diasTeste: diasTeste || 0,
        });

        res.status(201).json({ success: true, message: 'Plano criado com sucesso!', data: newPlano });
      } catch (error: unknown) {
        if (typeof error === 'object' && error !== null && 'code' in error && (error as any).code === 11000) {
          return res.status(409).json({ success: false, message: 'Já existe um plano com este nome.' });
        }
        console.error('Erro ao criar plano:', error);
        res.status(500).json({ success: false, message: 'Erro interno do servidor ao criar plano.' });
      }
      break;

    case 'GET':
      try {
        const planos = await Plano.find({});
        res.status(200).json({ success: true, data: planos });
      } catch (error) {
        console.error('Erro ao listar planos:', error);
        res.status(500).json({ success: false, message: 'Erro interno do servidor ao listar planos.' });
      }
      break;

    case 'PUT':
      try {
        const { id, nome, valorMensal, valorAnual, descricao, beneficios, diasTeste } = req.body;

        if (!id) {
          return res.status(400).json({ success: false, message: 'ID do plano é obrigatório para atualização.' });
        }

        const updatedPlano = await Plano.findByIdAndUpdate(
          id,
          { nome, valorMensal, valorAnual, descricao, beneficios, diasTeste },
          { new: true, runValidators: true }
        );

        if (!updatedPlano) {
          return res.status(404).json({ success: false, message: 'Plano não encontrado.' });
        }

        res.status(200).json({ success: true, message: 'Plano atualizado com sucesso!', data: updatedPlano });
      } catch (error: unknown) {
        if (typeof error === 'object' && error !== null && 'code' in error && (error as any).code === 11000) {
          return res.status(409).json({ success: false, message: 'Já existe outro plano com este nome.' });
        }
        console.error('Erro ao atualizar plano:', error);
        res.status(500).json({ success: false, message: 'Erro interno do servidor ao atualizar plano.' });
      }
      break;

    case 'DELETE':
      try {
        const { id } = req.query;

        if (!id || typeof id !== 'string') {
          return res.status(400).json({ success: false, message: 'ID do plano é obrigatório para exclusão.' });
        }

        const deletedPlano = await Plano.findByIdAndDelete(id);

        if (!deletedPlano) {
          return res.status(404).json({ success: false, message: 'Plano não encontrado.' });
        }

        res.status(200).json({ success: true, message: 'Plano excluído com sucesso!' });
      } catch (error) {
        console.error('Erro ao excluir plano:', error);
        res.status(500).json({ success: false, message: 'Erro interno do servidor ao excluir plano.' });
      }
      break;

    default:
      res.status(405).json({ success: false, message: 'Método não permitido.' });
      break;
  }
}
