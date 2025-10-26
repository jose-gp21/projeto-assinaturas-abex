// src/pages/api/member/renew-subscription.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { connectMongoose } from "@/lib/mongodb";
import { SubscriptionService } from "@/services/subscriptionService";
import Subscription from "@/lib/models/Subscription";
import { authOptions } from "../auth/[...nextauth]";

/**
 * Rota responsável por renovar uma assinatura expirada ou cancelada.
 * Usa o SubscriptionService.activateOrRenewSubscription para centralizar a lógica.
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

    // 🔎 Buscar assinatura anterior (expirada ou cancelada)
    const lastSubscription = await Subscription.findOne({
      userId,
      status: { $in: ["cancelled", "expired"] },
    })
      .sort({ updatedAt: -1 })
      .populate("planId");

    if (!lastSubscription) {
      return res.status(404).json({
        success: false,
        message: "Nenhuma assinatura encontrada para renovação.",
      });
    }

    // ✅ Renova ou reativa usando o SubscriptionService centralizado
    const renewedSubscription = await SubscriptionService.activateOrRenewSubscription(
      userId,
      lastSubscription.planId._id.toString()
    );

    console.log("🔄 Subscription renewed:", {
      userId,
      previousSubscriptionId: lastSubscription._id,
      renewedSubscriptionId: renewedSubscription._id,
      planName: lastSubscription.planId.name,
    });

    return res.status(200).json({
      success: true,
      message: `Assinatura renovada com sucesso! Bem-vindo novamente ao plano ${lastSubscription.planId.name}.`,
      data: {
        subscription: renewedSubscription,
        plan: lastSubscription.planId,
        renewedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("❌ Renew Subscription API Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Erro interno ao renovar assinatura",
      error: error.message,
    });
  }
}
