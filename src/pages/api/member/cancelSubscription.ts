// src/pages/api/member/cancel-subscription.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { connectMongoose } from "@/lib/mongodb";
import { SubscriptionService } from "@/services/subscriptionService";
import { authOptions } from "../auth/[...nextauth]";

/**
 * Cancela a assinatura ativa do usuário autenticado.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Content-Type", "application/json");

  try {
    if (req.method !== "POST") {
      return res.status(405).json({
        success: false,
        message: "Método não permitido. Use POST.",
      });
    }

    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Não autorizado. Faça login novamente.",
      });
    }

    await connectMongoose();

    const userId = session.user.id;

    // ✅ Usa o SubscriptionService centralizado
    const cancelledSubscription = await SubscriptionService.cancelSubscription(userId);

    if (!cancelledSubscription) {
      return res.status(404).json({
        success: false,
        message: "Nenhuma assinatura ativa encontrada para cancelamento.",
      });
    }

    console.log("🚫 Subscription cancelled:", {
      userId,
      subscriptionId: cancelledSubscription._id,
      cancelledAt: new Date().toISOString(),
    });

    return res.status(200).json({
      success: true,
      message:
        "Assinatura cancelada com sucesso. O acesso permanecerá até o final do período atual.",
      data: {
        subscriptionId: cancelledSubscription._id,
        status: "cancelled",
        cancelledAt: new Date().toISOString(),
        accessUntil: cancelledSubscription.endDate,
      },
    });
  } catch (error: any) {
    console.error("❌ Cancel Subscription API Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Erro interno ao cancelar assinatura",
      error: error.message,
    });
  }
}
