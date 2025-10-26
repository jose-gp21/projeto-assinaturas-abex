// src/pages/api/member/subscribe.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { connectMongoose } from "@/lib/mongodb";
import { SubscriptionService } from "@/services/subscriptionService";
import { PlanService } from "@/services/planService";
import { authOptions } from "../auth/[...nextauth]";

/**
 * Cria uma nova assinatura para o usuário autenticado.
 * Se já existir uma assinatura ativa, ela é cancelada antes da nova.
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

    const { planId } = req.body;

    if (!planId) {
      return res.status(400).json({
        success: false,
        message: "O ID do plano é obrigatório.",
      });
    }

    await connectMongoose();

    // 🔎 Verifica se o plano existe
    const plan = await PlanService.getPlanById(planId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plano não encontrado.",
      });
    }

    // ✅ Cancela assinaturas anteriores
    await SubscriptionService.cancelSubscription(session.user.id);

    // ✅ Cria nova assinatura ativa
    const subscription = await SubscriptionService.createSubscription({
      userId: session.user.id,
      planId: plan._id.toString(),
    });

    console.log("🎉 Nova assinatura criada:", {
      userId: session.user.id,
      planId,
      subscriptionId: subscription._id,
      status: subscription.status,
    });

    return res.status(200).json({
      success: true,
      message: `Assinatura criada com sucesso para o plano "${plan.name}"! 🎉`,
      data: {
        subscriptionId: subscription._id,
        plan: {
          id: plan._id,
          name: plan.name,
          price: plan.price,
        },
        status: subscription.status,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
      },
    });
  } catch (error: any) {
    console.error("❌ Erro ao criar assinatura:", error.message);
    return res.status(500).json({
      success: false,
      message: "Erro interno ao criar assinatura",
      error: error.message,
    });
  }
}
