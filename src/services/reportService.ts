// src/services/reportService.ts (Versão atualizada)
import { connectMongoose } from '@/lib/mongodb';
import User from '@/lib/models/User';
import Subscription from '@/lib/models/Subscription';
import Content from '@/lib/models/Content';
import Plan from '@/lib/models/Plan';

export async function getDashboardReports() {
  try {
    await connectMongoose();

    const [
      totalUsers,
      activeSubscriptions,
      totalPlans,
      totalContent,
      restrictedContent
    ] = await Promise.all([
      User.countDocuments({}).catch(() => 0),
      Subscription.countDocuments({ status: 'Active' }).catch(() => 0),
      Plan.countDocuments({}).catch(() => 0),
      Content.countDocuments({}).catch(() => 0),
      Content.countDocuments({ restricted: true }).catch(() => 0)
    ]);

    // Mock growth data (replace with real calculations later)
    const monthlyGrowth = {
      users: Math.floor(Math.random() * 15) + 5,
      subscriptions: Math.floor(Math.random() * 20) + 8,
      content: Math.floor(Math.random() * 10) + 3
    };

    const revenueData = {
      total: activeSubscriptions * 19.99,
      monthly: activeSubscriptions * 19.99,
      growth: Math.floor(Math.random() * 25) + 10
    };

    return {
      totalUsers,
      activeSubscriptions,
      totalPlans,
      totalContent,
      restrictedContent,
      monthlyGrowth,
      revenueData,
    };
  } catch (error) {
    console.error('Error generating reports in service:', error);
    
    // Return safe fallback data
    return {
      totalUsers: 0,
      activeSubscriptions: 0,
      totalPlans: 0,
      totalContent: 0,
      restrictedContent: 0,
      monthlyGrowth: {
        users: 0,
        subscriptions: 0,
        content: 0
      },
      revenueData: {
        total: 0,
        monthly: 0,
        growth: 0
      }
    };
  }
}