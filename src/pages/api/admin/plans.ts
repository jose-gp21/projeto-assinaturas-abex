// src/pages/api/admin/plans.ts (Refactored)
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

// ✅ Import functions from the new plans service
import {
  createNewPlan,
  getPlans,
  updateExistingPlan,
  deleteExistingPlan,
} from '@/services/planService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  // ✅ Admin role verification (assuming only admins can manage plans)
  if (!session || !session.user || session.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied. You do not have admin permissions.' });
  }

  // Mongoose connection is already managed within each service function

  switch (req.method) {
    case 'POST':
      try {
        const newPlan = await createNewPlan(req.body); // Call the service
        res.status(201).json({ success: true, message: 'Plan created successfully!', data: newPlan });
      } catch (error: any) {
        // ✅ More specific error handling based on service messages
        if (error.message.includes('required')) {
          return res.status(400).json({ success: false, message: error.message });
        }
        if (error.message.includes('A plan with this name already exists.')) {
          return res.status(409).json({ success: false, message: error.message });
        }
        console.error('API error while creating plan:', error);
        res.status(500).json({ success: false, message: 'Internal server error while creating plan.' });
      }
      break;

    case 'GET':
      try {
        const plans = await getPlans(); // Call the service
        res.status(200).json({ success: true, data: plans });
      } catch (error: any) {
        console.error('API error while listing plans:', error);
        res.status(500).json({ success: false, message: 'Internal server error while listing plans.' });
      }
      break;

    case 'PUT':
      try {
        const { id, ...updateData } = req.body; // Separate the ID from the update data
        const updatedPlan = await updateExistingPlan(id, updateData); // Call the service
        res.status(200).json({ success: true, message: 'Plan updated successfully!', data: updatedPlan });
      } catch (error: any) {
        // ✅ More specific error handling
        if (error.message.includes('required')) {
          return res.status(400).json({ success: false, message: error.message });
        }
        if (error.message.includes('not found')) {
          return res.status(404).json({ success: false, message: error.message });
        }
        if (error.message.includes('Another plan with this name already exists.')) {
          return res.status(409).json({ success: false, message: error.message });
        }
        console.error('API error while updating plan:', error);
        res.status(500).json({ success: false, message: 'Internal server error while updating plan.' });
      }
      break;

    case 'DELETE':
      try {
        const { id } = req.query; // ID can come from the query param for DELETE
        if (typeof id !== 'string') { // Ensure id is a string
          return res.status(400).json({ success: false, message: 'Plan ID is required for deletion.' });
        }
        await deleteExistingPlan(id); // Call the service
        res.status(200).json({ success: true, message: 'Plan deleted successfully!' });
      } catch (error: any) {
        // ✅ More specific error handling
        if (error.message.includes('required')) {
          return res.status(400).json({ success: false, message: error.message });
        }
        if (error.message.includes('not found')) {
          return res.status(404).json({ success: false, message: error.message });
        }
        console.error('API error while deleting plan:', error);
        res.status(500).json({ success: false, message: 'Internal server error while deleting plan.' });
      }
      break;

    default:
      res.status(405).json({ success: false, message: 'Method not allowed.' });
      break;
  }
}