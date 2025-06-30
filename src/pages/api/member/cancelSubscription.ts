// src/pages/api/member/cancel-subscription.ts
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
      // Buscar subscription ativa
      const activeSubscription = await Subscription.findOne({
        memberId: userId,
        status: 'Active'
      });

      if (!activeSubscription) {
        return res.status(404).json({
          success: false,
          message: 'No active subscription found to cancel.'
        });
      }

      // Cancelar a subscription
      await Subscription.findByIdAndUpdate(activeSubscription._id, {
        status: 'Cancelled',
        cancellationDate: new Date(),
        updatedAt: new Date()
      });

      // Atualizar status do usuário
      await User.findByIdAndUpdate(userId, {
        subscriptionStatus: 'Cancelled',
        updatedAt: new Date()
      });

      console.log('🚫 Subscription cancelled:', {
        userId,
        subscriptionId: activeSubscription._id,
        cancelledAt: new Date().toISOString()
      });

      return res.status(200).json({
        success: true,
        message: 'Subscription cancelled successfully. You will retain access until the end of your billing period.',
        data: {
          subscriptionId: activeSubscription._id,
          status: 'Cancelled',
          cancelledAt: new Date().toISOString(),
          accessUntil: activeSubscription.endDate
        }
      });

    } catch (error) {
      console.error('❌ Error cancelling subscription:', error);
      return res.status(500).json({
        success: false,
        message: 'Error cancelling subscription'
      });
    }

  } catch (error: any) {
    console.error('❌ Cancel Subscription API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}