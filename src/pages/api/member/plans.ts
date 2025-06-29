// src/pages/api/member/plans.ts
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

  await connectMongoose(); // ✅ centralized connection

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
        const { planId } = req.body;
        const memberId = session.user.id;

        if (!planId) {
          return res.status(400).json({ success: false, message: 'Plan ID is required.' });
        }

        const plan = await Plan.findById(planId);
        if (!plan) {
          return res.status(404).json({ success: false, message: 'Plan not found.' });
        }

        const startDate = new Date();
        const endDate = new Date();
        endDate.setFullYear(endDate.getFullYear() + 1);

        const newSubscription = await Subscription.create({
          type: plan.annualValue ? 'Annual' : (plan.monthlyValue ? 'Monthly' : 'Other'),
          startDate,
          endDate,
          status: 'Active',
          trialPeriod: plan.trialDays && plan.trialDays > 0,
          memberId,
          planId,
        });

        await User.findByIdAndUpdate(memberId, { subscriptionStatus: 'Active' });

        res.status(201).json({
          success: true,
          message: `You have successfully subscribed to the plan "${plan.name}" (simulated)!`,
          data: newSubscription,
        });

      } catch (error) {
        console.error('Error selecting plan:', error);
        res.status(500).json({ success: false, message: 'Internal server error while selecting plan.' });
      }
      break;

    default:
      res.status(405).json({ success: false, message: 'Method not allowed.' });
      break;
  }
}
