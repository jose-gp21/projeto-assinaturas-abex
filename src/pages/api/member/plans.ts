// src/pages/api/member/plans.ts - VERSÃO CORRIGIDA
import type { NextApiRequest, NextApiResponse } from 'next';
import { connectMongoose } from '@/lib/mongodb';
import Plan from '@/lib/models/Plan';
import Subscription from '@/lib/models/Subscription';
import User from '@/lib/models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user || !session.user.id) {
    return res.status(401).json({ success: false, message: 'Unauthorized. Please log in.' });
  }

  await connectMongoose();

  switch (req.method) {
    case 'GET':
      try {
        const plans = await Plan.find({});
        res.status(200).json({ success: true, data: plans });
      } catch (error) {
        console.error('Error fetching plans for member:', error);
        res.status(500).json({ success: false, message: 'Internal server error while fetching plans.' });
      }
      break;

    case 'POST':
      try {
        const { planId, billing } = req.body; // ✅ Aceitar billing do frontend
        const memberId = session.user.id;

        if (!planId) {
          return res.status(400).json({ success: false, message: 'Plan ID is required.' });
        }

        const plan = await Plan.findById(planId);
        if (!plan) {
          return res.status(404).json({ success: false, message: 'Plan not found.' });
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

        const startDate = new Date();
        const endDate = new Date();

        // ✅ DETERMINAR TIPO CORRETO BASEADO NO PLANO E BILLING
        let subscriptionType: string;
        
        if (billing === 'annual' || plan.annualPrice) {
          subscriptionType = 'Annual';
          endDate.setFullYear(endDate.getFullYear() + 1);
        } else if (billing === 'monthly' || plan.monthlyPrice) {
          subscriptionType = 'Monthly';
          endDate.setMonth(endDate.getMonth() + 1);
        } else {
          // ✅ FALLBACK para planos sem preço definido
          subscriptionType = 'Monthly';
          endDate.setMonth(endDate.getMonth() + 1);
        }

        console.log('🔧 Creating subscription:', {
          planId,
          billing,
          subscriptionType,
          hasAnnualPrice: !!plan.annualPrice,
          hasMonthlyPrice: !!plan.monthlyPrice
        });

        // ✅ CRIAR NOVA SUBSCRIPTION COM TIPO VÁLIDO
        const newSubscription = await Subscription.create({
          type: subscriptionType, // ✅ Só 'Annual' ou 'Monthly'
          startDate,
          endDate,
          status: 'Active',
          trialPeriod: plan.trialDays && plan.trialDays > 0,
          memberId,
          planId,
        });

        // ✅ ATUALIZAR STATUS DO USUÁRIO
        await User.findByIdAndUpdate(memberId, { 
          subscriptionStatus: 'Active',
          updatedAt: new Date()
        });

        console.log('🎉 Subscription created successfully:', {
          userId: memberId,
          planId,
          subscriptionId: newSubscription._id,
          type: newSubscription.type,
          status: newSubscription.status
        });

        res.status(201).json({
          success: true,
          message: `You have successfully subscribed to the plan "${plan.name}"! 🎉`,
          data: {
            subscription: newSubscription,
            plan: plan,
            accessGranted: true
          },
        });

      } catch (error) {
        console.error('❌ Error selecting plan:', error);
        res.status(500).json({ success: false, message: 'Internal server error while selecting plan.' });
      }
      break;

    default:
      res.status(405).json({ success: false, message: 'Method not allowed.' });
      break;
  }
}