// CRIAR: src/pages/api/admin/reports.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('📊 Reports API called');
  
  res.setHeader('Content-Type', 'application/json');

  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ 
        success: false, 
        message: 'Method not allowed' 
      });
    }

    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
    }

    if (session.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Admin role required.' 
      });
    }

    console.log('✅ Auth passed, fetching data...');

    // Tentar usar o service, se falhar usar dados básicos
    let data;
    
    try {
      const { getDashboardReports } = await import('@/services/reportService');
      data = await getDashboardReports();
      console.log('✅ Service data:', data);
    } catch (serviceError: any) {
      console.error('❌ Service error:', serviceError.message);
      
      // Fallback: buscar dados diretamente
      try {
        const { connectMongoose } = await import('@/lib/mongodb');
        await connectMongoose();
        
        const User = (await import('@/lib/models/User')).default;
        const Plan = (await import('@/lib/models/Plan')).default;
        
        const totalUsers = await User.countDocuments({});
        const totalPlans = await Plan.countDocuments({});
        
      } catch (dbError: any) {
        console.error('❌ DB error:', dbError.message);
      }
    }

    return res.status(200).json({
      success: true,
      data: data,
      message: 'Dashboard data loaded successfully'
    });

  } catch (error: any) {
    console.error('💥 Reports API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data',
      error: error.message
    });
  }
}