// src/pages/api/member/subscribe.ts - IMPLEMENTAÇÃO REAL
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { connectMongoose } from '@/lib/mongodb';
import Plan from '@/lib/models/Plan';
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

    await connectMongoose(); // ✅ CONECTAR AO BANCO

    const { planId, billing } = req.body;

    if (!planId || !billing) {
      return res.status(400).json({
        success: false,
        message: 'Plan ID and billing type are required.'
      });
    }

    if (!['monthly', 'annual'].includes(billing)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid billing type. Use "monthly" or "annual".'
      });
    }

    try {
      const memberId = session.user.id;

      // ✅ BUSCAR O PLANO
      const plan = await Plan.findById(planId);
      if (!plan) {
        return res.status(404).json({
          success: false,
          message: 'Plan not found.'
        });
      }

      // ✅ CANCELAR SUBSCRIPTIONS ATIVAS ANTERIORES
      await Subscription.updateMany(
        { 
          memberId, 
          status: 'Active' 
        },
        { 
          status: 'Cancelled',
          cancellationDate: new Date()
        }
      );

      // ✅ CRIAR NOVA SUBSCRIPTION REAL
      const startDate = new Date();
      const endDate = new Date();
      
      if (billing === 'annual') {
        endDate.setFullYear(endDate.getFullYear() + 1);
      } else {
        endDate.setMonth(endDate.getMonth() + 1);
      }

      const newSubscription = await Subscription.create({
        type: billing === 'annual' ? 'Annual' : 'Monthly',
        startDate,
        endDate,
        status: 'Active', // ✅ STATUS ATIVO
        trialPeriod: plan.trialDays && plan.trialDays > 0,
        memberId,
        planId,
      });

      // ✅ ATUALIZAR STATUS DO USUÁRIO
      await User.findByIdAndUpdate(memberId, { 
        subscriptionStatus: 'Active',
        updatedAt: new Date()
      });

      console.log('🎉 Real subscription created:', {
        userId: memberId,
        planId,
        subscriptionId: newSubscription._id,
        billing,
        status: newSubscription.status
      });

      return res.status(200).json({
        success: true,
        message: `Successfully subscribed to plan with ${billing} billing! 🎉`,
        data: {
          subscriptionId: newSubscription._id,
          planId,
          billing,
          status: 'active',
          startDate: newSubscription.startDate.toISOString(),
          endDate: newSubscription.endDate.toISOString(),
          userId: session.user.id
        }
      });

    } catch (error) {
      console.error('❌ Error creating subscription:', error);
      return res.status(500).json({
        success: false,
        message: 'Error processing subscription'
      });
    }

  } catch (error: any) {
    console.error('❌ Subscribe API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}