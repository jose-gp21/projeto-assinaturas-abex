// src/pages/api/member/content.ts - VERSÃO ATUALIZADA COM FAVORITOS
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { connectMongoose } from '@/lib/mongodb';

import '@/lib/models';
import User from '@/lib/models/User';
import Content from '@/lib/models/Content';
import Plan from '@/lib/models/Plan';
import Subscription from '@/lib/models/Subscription';

import { authOptions } from '../auth/[...nextauth]';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user || !session.user.id) {
    return res.status(401).json({ success: false, message: 'Unauthorized. Please log in.' });
  }

  await connectMongoose();

  switch (req.method) {
    case 'GET':
      try {
        const { id } = req.query;

        // 🔥 BUSCAR O USUÁRIO E SUBSCRIPTION ATIVA
        const member = await User.findById(session.user.id);
        
        // Buscar subscription ativa do usuário
        const activeSubscription = await Subscription.findOne({
          memberId: session.user.id,
          status: 'Active',
          startDate: { $lte: new Date() },
          endDate: { $gte: new Date() }
        }).populate('planId');

        const hasActiveSubscription = !!activeSubscription;
        const userPlanId = activeSubscription?.planId?._id?.toString();

        // ✅ OBTER LISTA DE FAVORITOS DO USUÁRIO
        const userFavorites = member?.favoriteContent || [];

        console.log('🔍 User access check:', {
          userId: session.user.id,
          hasActiveSubscription,
          userPlanId,
          subscriptionStatus: activeSubscription?.status,
          favoritesCount: userFavorites.length
        });

        let contents;

        if (id) {
          // BUSCAR CONTEÚDO ESPECÍFICO
          const content = await Content.findById(id as string).populate('planId', 'name');

          if (!content) {
            return res.status(404).json({ success: false, message: 'Content not found.' });
          }

          // ✅ VERIFICAR ACESSO IMEDIATO
          const contentHasAccess = !content.restricted || hasActiveSubscription;

          if (content.restricted && !hasActiveSubscription) {
            return res.status(403).json({ 
              success: false, 
              message: 'Access denied. This content is exclusive to active subscribers.' 
            });
          }

          // Adicionar propriedades hasAccess e isFavorite
          const contentWithAccess = {
            ...content.toObject(),
            hasAccess: contentHasAccess,
            isFavorite: userFavorites.includes(content._id.toString())
          };

          res.status(200).json({ success: true, data: contentWithAccess });

        } else {
          // BUSCAR TODOS OS CONTEÚDOS
          contents = await Content.find({}).populate('planId', 'name');

          // ✅ ADICIONAR PROPRIEDADES hasAccess E isFavorite A CADA CONTEÚDO
          const contentsWithAccess = contents.map(content => {
            const contentObj = content.toObject();
            
            // Lógica de acesso:
            // 1. Se não é restrito = sempre tem acesso
            // 2. Se é restrito + tem subscription ativa = tem acesso
            // 3. Se é restrito + não tem subscription = não tem acesso
            const contentHasAccess = !content.restricted || hasActiveSubscription;

            // Verificar se está nos favoritos
            const isFavorite = userFavorites.includes(content._id.toString());

            return {
              ...contentObj,
              hasAccess: contentHasAccess,
              isFavorite: isFavorite
            };
          });

          console.log('📋 Content access summary:', {
            totalContents: contentsWithAccess.length,
            accessibleContents: contentsWithAccess.filter(c => c.hasAccess).length,
            restrictedContents: contentsWithAccess.filter(c => !c.hasAccess).length,
            favoriteContents: contentsWithAccess.filter(c => c.isFavorite).length
          });

          res.status(200).json({ success: true, data: contentsWithAccess });
        }
      } catch (error) {
        console.error('❌ Error listing/fetching content for member:', error);
        res.status(500).json({ 
          success: false, 
          message: 'Internal server error while listing/fetching content.' 
        });
      }
      break;

    default:
      res.status(405).json({ success: false, message: 'Method not allowed.' });
      break;
  }
}