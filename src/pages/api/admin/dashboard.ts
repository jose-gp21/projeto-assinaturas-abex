// src/pages/api/admin/reports.ts (Refactored)
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

// ✅ Import the function from the new report service
import { getDashboardReports } from '@/services/reportService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  // Authentication and admin authorization check
  if (!session || !session.user || session.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied. You do not have admin permissions.' });
  }

  // Allow only the GET method for reports
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed.' });
  }

  // Mongoose connection is already managed within the service function

  try {
    // ✅ Call the service function to fetch the reports
    const reportsData = await getDashboardReports();

    res.status(200).json({
      success: true,
      data: reportsData,
    });

  } catch (error: any) { // Use 'any' to capture generic service errors for now
    console.error('API error while generating dashboard reports:', error);
    res.status(500).json({ success: false, message: error.message || 'Internal server error while generating reports.' });
  }
}