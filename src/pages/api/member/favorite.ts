// src/pages/api/member/favorite.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { connectMongoose } from '@/lib/mongodb';
import User from '@/lib/models/User';
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
      // Verificar se o conteúdo existe
      const content = await Content.findById(contentId);
      if (!content) {
        return res.status(404).json({
          success: false,
          message: 'Content not found.'
        });
      }

      // Buscar usuário
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found.'
        });
      }

      // Inicializar favoriteContent se não existir
      if (!user.favoriteContent) {
        user.favoriteContent = [];
      }

      const isFavorited = user.favoriteContent.includes(contentId);
      let action: string;

      if (isFavorited) {
        // Remover dos favoritos
        user.favoriteContent = user.favoriteContent.filter(
          (id: string) => id.toString() !== contentId.toString()
        );
        action = 'removed';
      } else {
        // Adicionar aos favoritos
        user.favoriteContent.push(contentId);
        action = 'added';
      }

      await user.save();

      console.log(`❤️ Content ${action} to/from favorites:`, {
        userId,
        contentId,
        contentTitle: content.title,
        action
      });

      return res.status(200).json({
        success: true,
        message: `Content ${action} ${action === 'added' ? 'to' : 'from'} favorites successfully.`,
        data: {
          contentId,
          isFavorited: !isFavorited,
          action,
          favoritesCount: user.favoriteContent.length
        }
      });

    } catch (error) {
      console.error('❌ Error toggling favorite:', error);
      return res.status(500).json({
        success: false,
        message: 'Error updating favorites'
      });
    }

  } catch (error: any) {
    console.error('❌ Favorite API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}