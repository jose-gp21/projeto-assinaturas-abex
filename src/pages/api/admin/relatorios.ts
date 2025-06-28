// src/pages/api/admin/relatorios.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { connectMongoose } from '@/lib/mongodb'; // ✅ novo import
import User from '@/lib/models/User';
import Assinatura from '@/lib/models/Assinatura';
import Conteudo from '@/lib/models/Conteudo';
import Plano from '@/lib/models/Plano';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user || session.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Acesso proibido. Você não tem permissão de administrador.' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Método não permitido.' });
  }

  await connectMongoose(); // ✅ nova conexão

  try {
    const totalUsers = await User.countDocuments({});
    const activeSubscriptions = await Assinatura.countDocuments({ status: 'Ativa' });
    const totalPlanos = await Plano.countDocuments({});
    const totalConteudo = await Conteudo.countDocuments({});
    const restrictedConteudo = await Conteudo.countDocuments({ restrito: true });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        activeSubscriptions,
        totalPlanos,
        totalConteudo,
        restrictedConteudo,
      },
    });

  } catch (error) {
    console.error('Erro ao gerar relatórios do dashboard:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor ao gerar relatórios.' });
  }
}
