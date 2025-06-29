// src/pages/api/member/content.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { connectMongoose } from '@/lib/mongodb';

import '@/lib/models';
import User from '@/lib/models/User';
import Content from '@/lib/models/Content';
import Plan from '@/lib/models/Plan';

import { authOptions } from '../auth/[...nextauth]';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user || !session.user.id) {
    return res.status(401).json({ success: false, message: 'Unauthorized. Please log in.' });
  }

  await connectMongoose(); // Connect to Mongoose

  switch (req.method) {
    case 'GET': // List content for the member (with access verification)
      try {
        const { id } = req.query;

        // Fetch the logged-in user to verify subscription status
        const member = await User.findById(session.user.id);
        const hasActiveSubscription = member?.subscriptionStatus === 'Active';

        let contents;

        if (id) {
          // The populate ('planId', 'name') should now work.
          const content = await Content.findById(id as string).populate('planId', 'name');

          if (!content) {
            return res.status(404).json({ success: false, message: 'Content not found.' });
          }

          // Check if the content is restricted and if the member has an active subscription
          if (content.restricted && !hasActiveSubscription) {
            return res.status(403).json({ success: false, message: 'Access denied. This content is exclusive to active subscribers.' });
          }

          res.status(200).json({ success: true, data: content });

        } else {
          // The populate ('planId', 'name') should now work.
          contents = await Content.find({
            $or: [
              { restricted: false }, // Non-restricted (public) content
              { restricted: true, 'planId': { $exists: true } }, // Restricted content associated with a plan
              { restricted: true, 'planId': null }, // Restricted content not associated with any specific plan
            ]
          }).populate('planId', 'name');

          // Filter on the server to ensure only authorized content is sent
          const filteredContents = contents.filter(c => {
            if (!c.restricted) return true;
            return hasActiveSubscription;
          });

          res.status(200).json({ success: true, data: filteredContents });
        }
      } catch (error) {
        console.error('Error listing/fetching content for member:', error);
        res.status(500).json({ success: false, message: 'Internal server error while listing/fetching content.' });
      }
      break;

    default:
      res.status(405).json({ success: false, message: 'Method not allowed.' });
      break;
  }
}