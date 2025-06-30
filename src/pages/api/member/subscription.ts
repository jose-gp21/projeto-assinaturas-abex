// src/pages/api/member/subscription.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { connectMongoose } from '@/lib/mongodb';
import Subscription from '@/lib/models/Subscription';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    res.setHeader('Content-Type', 'application/json');

    try {
        const session = await getServerSession(req, res, authOptions);

        if (!session || !session.user || !session.user.id) {
            return res.status(401).json({ 
                success: false, 
                message: 'Unauthorized. Please log in.' 
            });
        }

        await connectMongoose();

        const userId = session.user.id;

        if (req.method === 'GET') {
            try {
                // 🔥 FETCH REAL ACTIVE SUBSCRIPTION FROM DATABASE
                const activeSubscription = await Subscription.findOne({
                    memberId: userId,
                    status: 'Active',
                    startDate: { $lte: new Date() },
                    endDate: { $gte: new Date() }
                }).populate('planId', 'name monthlyPrice annualPrice');

                if (!activeSubscription) {
                    return res.status(200).json({
                        success: true,
                        data: null,
                        message: 'No active subscription found'
                    });
                }

                // ✅ RETURN REAL SUBSCRIPTION DATA
                const subscriptionData = {
                    _id: activeSubscription._id,
                    planId: activeSubscription.planId._id,
                    plan: activeSubscription.planId,
                    status: activeSubscription.status.toLowerCase(),
                    startDate: activeSubscription.startDate.toISOString(),
                    nextBillingDate: activeSubscription.endDate.toISOString(),
                    expirationDate: activeSubscription.endDate.toISOString(),
                    amount: activeSubscription.type === 'Annual' 
                        ? (activeSubscription.planId.annualPrice || 0)
                        : (activeSubscription.planId.monthlyPrice || 0),
                    billing: activeSubscription.type === 'Annual' ? 'annual' : 'monthly'
                };

                console.log('📋 Active subscription found:', {
                    userId,
                    subscriptionId: activeSubscription._id,
                    planName: activeSubscription.planId.name,
                    status: activeSubscription.status
                });

                return res.status(200).json({
                    success: true,
                    data: subscriptionData,
                    message: 'Active subscription found'
                });

            } catch (error) {
                console.error('❌ Error fetching subscription:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Error fetching subscription data'
                });
            }
        }

        return res.status(405).json({
            success: false,
            message: 'Method not allowed'
        });

    } catch (error: any) {
        console.error('❌ Subscription API Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}