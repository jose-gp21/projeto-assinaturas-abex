// src/pages/api/admin/conteudo.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { connectMongoose } from '@/lib/mongodb'; // ✅ novo import
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import Plano from '@/lib/models/Plano';
import Conteudo from '@/lib/models/Conteudo';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user) {
    return res.status(401).json({ success: false, message: 'Não autorizado. Faça login como administrador.' });
  }

  await connectMongoose(); // ✅ nova função de conexão

  switch (req.method) {
    case 'POST':
      try {
        const { titulo, descricao, tipo, url, restrito, planoId } = req.body;

        if (!titulo || !descricao || !tipo) {
          return res.status(400).json({ success: false, message: 'Título, descrição e tipo são obrigatórios para o conteúdo.' });
        }

        if (planoId) {
          const planoExistente = await Plano.findById(planoId);
          if (!planoExistente) {
            return res.status(400).json({ success: false, message: 'ID do plano fornecido não existe.' });
          }
        }

        const newConteudo = await Conteudo.create({
          titulo,
          descricao,
          dataPublicacao: new Date(),
          tipo,
          url: url || null,
          restrito: typeof restrito === 'boolean' ? restrito : true,
          planoId: planoId || null,
        });

        res.status(201).json({ success: true, message: 'Conteúdo criado com sucesso!', data: newConteudo });
      } catch (error: any) {
        console.error('Erro ao criar conteúdo:', error);
        res.status(500).json({ success: false, message: 'Erro interno do servidor ao criar conteúdo.' });
      }
      break;

    case 'GET':
      try {
        const { id } = req.query;
        let conteudos;

        if (id) {
          conteudos = await Conteudo.findById(id as string).populate('planoId', 'nome');
          if (!conteudos) {
            return res.status(404).json({ success: false, message: 'Conteúdo não encontrado.' });
          }
          res.status(200).json({ success: true, data: conteudos });
        } else {
          conteudos = await Conteudo.find({}).populate('planoId', 'nome');
          res.status(200).json({ success: true, data: conteudos });
        }
      } catch (error) {
        console.error('Erro ao listar/buscar conteúdo:', error);
        res.status(500).json({ success: false, message: 'Erro interno do servidor ao listar/buscar conteúdo.' });
      }
      break;

    case 'PUT':
      try {
        const { id, titulo, descricao, tipo, url, restrito, planoId } = req.body;

        if (!id) {
          return res.status(400).json({ success: false, message: 'ID do conteúdo é obrigatório para atualização.' });
        }

        if (planoId) {
          const planoExistente = await Plano.findById(planoId);
          if (!planoExistente) {
            return res.status(400).json({ success: false, message: 'ID do plano fornecido não existe.' });
          }
        }

        const updatedConteudo = await Conteudo.findByIdAndUpdate(
          id,
          { titulo, descricao, tipo, url, restrito, planoId },
          { new: true, runValidators: true }
        );

        if (!updatedConteudo) {
          return res.status(404).json({ success: false, message: 'Conteúdo não encontrado.' });
        }

        res.status(200).json({ success: true, message: 'Conteúdo atualizado com sucesso!', data: updatedConteudo });
      } catch (error) {
        console.error('Erro ao atualizar conteúdo:', error);
        res.status(500).json({ success: false, message: 'Erro interno do servidor ao atualizar conteúdo.' });
      }
      break;

    case 'DELETE':
      try {
        const { id } = req.query;

        if (!id) {
          return res.status(400).json({ success: false, message: 'ID do conteúdo é obrigatório para exclusão.' });
        }

        const deletedConteudo = await Conteudo.findByIdAndDelete(id as string);

        if (!deletedConteudo) {
          return res.status(404).json({ success: false, message: 'Conteúdo não encontrado.' });
        }

        res.status(200).json({ success: true, message: 'Conteúdo excluído com sucesso!' });
      } catch (error) {
        console.error('Erro ao excluir conteúdo:', error);
        res.status(500).json({ success: false, message: 'Erro interno do servidor ao excluir conteúdo.' });
      }
      break;

    default:
      res.status(405).json({ success: false, message: 'Método não permitido.' });
      break;
  }
}
