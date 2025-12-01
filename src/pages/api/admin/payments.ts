// src/pages/api/admin/payments.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { connectMongoose } from '@/lib/mongodb';

// Importe seus models (ajuste conforme sua estrutura)
// import Payment from '@/lib/models/Payment';
// import User from '@/lib/models/User';
// import Plan from '@/lib/models/Plan';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verificar autenticação
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Verificar se é admin
  // @ts-ignore
  if (session.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden - Admin access required' });
  }

  if (req.method === 'GET') {
    try {
      await connectMongoose();

      // 🔥 SUBSTITUIR PELOS SEUS MODELS REAIS
      // const payments = await Payment.find()
      //   .populate('userId', 'name email')
      //   .populate('planId', 'name')
      //   .sort({ createdAt: -1 })
      //   .lean();

      // const formattedPayments = payments.map(payment => ({
      //   id: payment._id.toString(),
      //   userId: payment.userId._id.toString(),
      //   userName: payment.userId.name,
      //   userEmail: payment.userId.email,
      //   planName: payment.planId.name,
      //   amount: payment.amount,
      //   method: payment.paymentMethod,
      //   status: payment.status,
      //   date: payment.createdAt,
      //   transactionId: payment.transactionId || payment._id.toString()
      // }));

      // return res.status(200).json(formattedPayments);

      // 🔥 DADOS MOCK TEMPORÁRIOS (remover depois)
      const mockPayments = [
        {
          id: 'PAY-001',
          userId: 'user-123',
          userName: 'João Silva',
          userEmail: 'joao@email.com',
          planName: 'Premium',
          amount: 79.00,
          method: 'Cartão de Crédito',
          status: 'approved',
          date: new Date().toISOString(),
          transactionId: 'TXN-ABC123'
        },
        {
          id: 'PAY-002',
          userId: 'user-456',
          userName: 'Maria Santos',
          userEmail: 'maria@email.com',
          planName: 'VIP',
          amount: 149.00,
          method: 'PIX',
          status: 'approved',
          date: new Date(Date.now() - 86400000).toISOString(),
          transactionId: 'TXN-DEF456'
        },
        {
          id: 'PAY-003',
          userId: 'user-789',
          userName: 'Pedro Costa',
          userEmail: 'pedro@email.com',
          planName: 'Básico',
          amount: 29.00,
          method: 'Cartão de Crédito',
          status: 'pending',
          date: new Date(Date.now() - 172800000).toISOString(),
          transactionId: 'TXN-GHI789'
        }
      ];

      return res.status(200).json(mockPayments);

    } catch (error) {
      console.error('Error fetching payments:', error);
      return res.status(500).json({ error: 'Failed to fetch payments' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}