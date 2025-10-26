// src/pages/api/member/subscription.ts
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { SubscriptionService } from "@/services/subscriptionService";
import { connectMongoose } from "@/lib/mongodb";

/**
 * Retorna a assinatura ativa do usuário autenticado.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      message: "Método não permitido",
    });
  }

  try {
    await connectMongoose();

    // Recupera sessão autenticada
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Não autorizado",
      });
    }

    // Busca assinatura ativa
    const subscription = await SubscriptionService.getUserActiveSubscription(session.user.id);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Nenhuma assinatura ativa encontrada",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Assinatura ativa encontrada com sucesso",
      data: subscription,
    });
  } catch (error: any) {
    console.error("❌ Erro ao buscar assinatura do usuário:", error.message);
    return res.status(500).json({
      success: false,
      message: "Erro interno ao buscar assinatura",
      error: error.message,
    });
  }
}
