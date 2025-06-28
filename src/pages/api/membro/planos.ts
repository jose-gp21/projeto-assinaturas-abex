// src/pages/api/membro/planos.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { connectMongoose } from '@/lib/mongodb'; // ✅ nova função de conexão
import Plano from '@/lib/models/Plano';
import Assinatura from '@/lib/models/Assinatura';
import User from '@/lib/models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user || !session.user.id) {
    return res.status(401).json({ success: false, message: 'Não autorizado. Faça login.' });
  }

  await connectMongoose(); // ✅ conexão centralizada

  switch (req.method) {
    case 'GET':
      try {
        const planos = await Plano.find({});
        res.status(200).json({ success: true, data: planos });
      } catch (error) {
        console.error('Erro ao listar planos para membro:', error);
        res.status(500).json({ success: false, message: 'Erro interno do servidor ao listar planos.' });
      }
      break;

    case 'POST':
      try {
        const { planoId } = req.body;
        const membroId = session.user.id;

        if (!planoId) {
          return res.status(400).json({ success: false, message: 'ID do plano é obrigatório.' });
        }

        const plano = await Plano.findById(planoId);
        if (!plano) {
          return res.status(404).json({ success: false, message: 'Plano não encontrado.' });
        }

        const dataInicio = new Date();
        const dataFim = new Date();
        dataFim.setFullYear(dataFim.getFullYear() + 1);

        const novaAssinatura = await Assinatura.create({
          tipo: plano.valorAnual ? 'Anual' : (plano.valorMensal ? 'Mensal' : 'Outro'),
          dataInicio,
          dataFim,
          status: 'Ativa',
          periodoTeste: plano.diasTeste && plano.diasTeste > 0,
          membroId,
          planoId,
        });

        await User.findByIdAndUpdate(membroId, { statusAssinatura: 'Ativa' });

        res.status(201).json({
          success: true,
          message: `Você assinou o plano "${plano.nome}" com sucesso (simulado)!`,
          data: novaAssinatura,
        });

      } catch (error) {
        console.error('Erro ao escolher plano:', error);
        res.status(500).json({ success: false, message: 'Erro interno do servidor ao escolher plano.' });
      }
      break;

    default:
      res.status(405).json({ success: false, message: 'Método não permitido.' });
      break;
  }
}
