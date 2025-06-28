// src/pages/api/membro/conteudo.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { connectMongoose } from '@/lib/mongodb';

import '@/lib/models';
import User from '@/lib/models/User';
import Conteudo from '@/lib/models/Conteudo';
import Plano from '@/lib/models/Plano';

import { authOptions } from '../auth/[...nextauth]';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user || !session.user.id) {
    return res.status(401).json({ success: false, message: 'Não autorizado. Faça login.' });
  }

  await connectMongoose(); // Conecte ao Mongoose

  switch (req.method) {
    case 'GET': // Listar conteúdos para o membro (com verificação de acesso)
      try {
        const { id } = req.query;

        // Busca o usuário logado para verificar o status da assinatura
        const membro = await User.findById(session.user.id);
        const hasActiveSubscription = membro?.statusAssinatura === 'Ativa';

        let conteudos;

        if (id) {
          // O populate ('planoId', 'nome') agora deve funcionar.
          const conteudo = await Conteudo.findById(id as string).populate('planoId', 'nome');

          if (!conteudo) {
            return res.status(404).json({ success: false, message: 'Conteúdo não encontrado.' });
          }

          // Verifica se o conteúdo é restrito e se o membro tem assinatura ativa
          if (conteudo.restrito && !hasActiveSubscription) {
            return res.status(403).json({ success: false, message: 'Acesso negado. Este conteúdo é exclusivo para assinantes ativos.' });
          }

          res.status(200).json({ success: true, data: conteudo });

        } else {
          // O populate ('planoId', 'nome') agora deve funcionar.
          conteudos = await Conteudo.find({
            $or: [
              { restrito: false }, // Conteúdos não restritos (públicos)
              { restrito: true, 'planoId': { $exists: true } }, // Conteúdos restritos associados a um plano
              { restrito: true, 'planoId': null }, // Conteúdos restritos não associados a nenhum plano específico
            ]
          }).populate('planoId', 'nome');

          // Filtrar no servidor para garantir que só o autorizado seja enviado
          const filteredConteudos = conteudos.filter(c => {
            if (!c.restrito) return true;
            return hasActiveSubscription;
          });

          res.status(200).json({ success: true, data: filteredConteudos });
        }
      } catch (error) {
        console.error('Erro ao listar/buscar conteúdo para membro:', error);
        res.status(500).json({ success: false, message: 'Erro interno do servidor ao listar/buscar conteúdo.' });
      }
      break;

    default:
      res.status(405).json({ success: false, message: 'Método não permitido.' });
      break;
  }
}