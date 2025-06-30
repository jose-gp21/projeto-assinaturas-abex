// src/pages/api/member/view-content.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { connectMongoose } from '@/lib/mongodb';
import Content from '@/lib/models/Content';
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

    await connectMongoose();

    const { contentId } = req.body;
    const userId = session.user.id;

    if (!contentId) {
      return res.status(400).json({
        success: false,
        message: 'Content ID is required.'
      });
    }

    try {
      // Atualizar contador de views do conteúdo
      const content = await Content.findByIdAndUpdate(
        contentId,
        { 
          $inc: { views: 1 },
          $set: { lastViewedAt: new Date() }
        },
        { new: true }
      );

      if (!content) {
        return res.status(404).json({
          success: false,
          message: 'Content not found.'
        });
      }

      console.log('👁️ Content view tracked:', {
        userId,
        contentId,
        contentTitle: content.title,
        totalViews: content.views
      });

      return res.status(200).json({
        success: true,
        message: 'View tracked successfully.',
        data: {
          contentId,
          views: content.views,
          viewedAt: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('❌ Error tracking view:', error);
      return res.status(500).json({
        success: false,
        message: 'Error tracking content view'
      });
    }

  } catch (error: any) {
    console.error('❌ View Content API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}