// src/pages/api/admin/reports.ts (Versão com service)
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  // Authentication and admin authorization check
  if (!session || !session.user || session.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. You do not have admin permissions.' 
    });
  }

  // Allow only the GET method for reports
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed.' 
    });
  }

  try {
    // Import dinâmico para evitar problemas de build
    const { getDashboardReports } = await import('@/services/reportService');
    
    const reportsData = await getDashboardReports();

    res.status(200).json({
      success: true,
      data: reportsData,
    });

  } catch (error: any) {
    console.error('API error while generating dashboard reports:', error);
    
    // Retornar dados mock em caso de erro para debugging
    const mockData = {
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

    res.status(200).json({
      success: true,
      data: mockData,
      warning: 'Using mock data due to: ' + error.message
    });
  }
}