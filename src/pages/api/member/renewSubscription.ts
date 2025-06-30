// src/pages/api/member/renew-subscription.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { connectMongoose } from '@/lib/mongodb';
import Subscription from '@/lib/models/Subscription';
import User from '@/lib/models/User';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.setHeader('Content-Type', 'application/json');

  try {
    if (req.method !== 'POST') {
      return res.status(405).json({
        success: false,
        message: 'Method not allowed. Use POST.'
      });
    }

    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user || !session.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Please log in.'
      });
    }

    await connectMongoose();

    const userId = session.user.id;

    try {
      // Buscar subscription cancelada ou expirada mais recente
      const lastSubscription = await Subscription.findOne({
        memberId: userId,
        status: { $in: ['Cancelled', 'Expired'] }
      }).sort({ updatedAt: -1 }).populate('planId');

      if (!lastSubscription) {
        return res.status(404).json({
          success: false,
          message: 'No subscription found to renew.'
        });
      }

      // Calcular novas datas
      const startDate = new Date();
      const endDate = new Date();
      
      if (lastSubscription.type === 'Annual') {
        endDate.setFullYear(endDate.getFullYear() + 1);
      } else {
        endDate.setMonth(endDate.getMonth() + 1);
      }

      // Criar nova subscription baseada na anterior
      const newSubscription = await Subscription.create({
        type: lastSubscription.type,
        startDate,
        endDate,
        status: 'Active',
        trialPeriod: false, // Sem trial para renovações
        memberId: userId,
        planId: lastSubscription.planId._id,
      });

      // Atualizar subscription anterior para 'Renewed'
      await Subscription.findByIdAndUpdate(lastSubscription._id, {
        status: 'Renewed',
        updatedAt: new Date()
      });

      // Atualizar status do usuário
      await User.findByIdAndUpdate(userId, {
        subscriptionStatus: 'Active',
        updatedAt: new Date()
      });

      console.log('🔄 Subscription renewed:', {
        userId,
        oldSubscriptionId: lastSubscription._id,
        newSubscriptionId: newSubscription._id,
        planName: lastSubscription.planId.name,
        type: newSubscription.type
      });

      return res.status(200).json({
        success: true,
        message: `Subscription renewed successfully! Welcome back to ${lastSubscription.planId.name}.`,
        data: {
          subscription: newSubscription,
          plan: lastSubscription.planId,
          renewedAt: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('❌ Error renewing subscription:', error);
      return res.status(500).json({
        success: false,
        message: 'Error renewing subscription'
      });
    }

  } catch (error: any) {
    console.error('❌ Renew Subscription API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}