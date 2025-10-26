// src/pages/api/member/content.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { connectMongoose } from "@/lib/mongodb";

import "@/lib/models";
import User from "@/lib/models/User";
import Content from "@/lib/models/Content";
import Subscription from "@/lib/models/Subscription";

import { authOptions } from "../auth/[...nextauth]";

/**
 * Lista conteúdos ou retorna um conteúdo específico com base na assinatura e favoritos do usuário.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) {
    return res.status(401).json({
      success: false,
      message: "Não autorizado. Faça login novamente.",
    });
  }

  await connectMongoose();

  switch (req.method) {
    case "GET":
      try {
        const { id } = req.query;

        // 🔎 Buscar usuário e favoritos
        const user = await User.findById(session.user.id);
        const userFavorites: string[] = user?.favoriteContent || [];

        // 🔥 Buscar assinatura ativa
        const activeSubscription = await Subscription.findOne({
          userId: session.user.id,
          status: "active",
          startDate: { $lte: new Date() },
          endDate: { $gte: new Date() },
        }).populate("planId", "name");

        const hasActiveSubscription = !!activeSubscription;
        const userPlanId = activeSubscription?.planId?._id?.toString();

        console.log("🔍 Verificando acesso de usuário:", {
          userId: session.user.id,
          hasActiveSubscription,
          userPlanId,
          subscriptionStatus: activeSubscription?.status,
          favoritesCount: userFavorites.length,
        });

        // 🔹 Buscar conteúdo específico
        if (id) {
          const content = await Content.findById(id as string).populate("planId", "name");

          if (!content) {
            return res.status(404).json({
              success: false,
              message: "Conteúdo não encontrado.",
            });
          }

          const hasAccess = !content.restricted || hasActiveSubscription;
          if (content.restricted && !hasAccess) {
            return res.status(403).json({
              success: false,
              message: "Acesso negado. Este conteúdo é exclusivo para assinantes ativos.",
            });
          }

          const contentWithAccess = {
            ...content.toObject(),
            hasAccess,
            isFavorite: userFavorites.includes(content._id.toString()),
          };

          return res.status(200).json({
            success: true,
            message: "Conteúdo carregado com sucesso.",
            data: contentWithAccess,
          });
        }

        // 🔹 Buscar todos os conteúdos
        const contents = await Content.find({}).populate("planId", "name");
        const contentsWithAccess = contents.map((content) => {
          const hasAccess = !content.restricted || hasActiveSubscription;
          const isFavorite = userFavorites.includes(content._id.toString());

          return {
            ...content.toObject(),
            hasAccess,
            isFavorite,
          };
        });

        console.log("📋 Resumo de acesso a conteúdos:", {
          totalContents: contentsWithAccess.length,
          accessibleContents: contentsWithAccess.filter((c) => c.hasAccess).length,
          restrictedContents: contentsWithAccess.filter((c) => !c.hasAccess).length,
          favoriteContents: contentsWithAccess.filter((c) => c.isFavorite).length,
        });

        return res.status(200).json({
          success: true,
          message: "Lista de conteúdos carregada com sucesso.",
          data: contentsWithAccess,
        });
      } catch (error: any) {
        console.error("❌ Erro ao listar conteúdo:", error.message);
        return res.status(500).json({
          success: false,
          message: "Erro interno ao listar conteúdos.",
          error: error.message,
        });
      }

    default:
      return res.status(405).json({
        success: false,
        message: "Método não permitido.",
      });
  }
}
