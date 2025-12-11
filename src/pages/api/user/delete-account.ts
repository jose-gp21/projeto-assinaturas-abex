// src/pages/api/user/delete-account.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { connectMongoose } from '@/lib/mongodb';
import User from '@/lib/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await connectMongoose();

    // @ts-ignore
    const userId = session.user.id;

    // Buscar usuário
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // ✅ LGPD: Remover permanentemente todos os dados do usuário
    // TODO: Adicionar remoção de dados relacionados quando implementar:
    // - Subscriptions (assinaturas)
    // - Payments (pagamentos)
    // - UserContent (conteúdo do usuário)
    // - Comments (comentários)
    // - etc.

    // Exemplo de como remover dados relacionados:
    // await Subscription.deleteMany({ userId });
    // await Payment.deleteMany({ userId });
    // await UserContent.deleteMany({ userId });

    // Deletar o usuário
    await User.findByIdAndDelete(userId);

    return res.status(200).json({ 
      success: true,
      message: 'Account deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    return res.status(500).json({ 
      error: 'Failed to delete account',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}