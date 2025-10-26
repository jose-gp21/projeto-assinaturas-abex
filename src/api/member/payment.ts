// src/api/member/payment.ts
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { PaymentService } from "@/services/paymentService";
import { connectMongoose } from "@/lib/mongodb";

/**
 * Endpoint para criar uma preferência de pagamento no Mercado Pago.
 * É usado quando o usuário seleciona um plano e inicia o checkout.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Método não permitido",
    });
  }

  try {
    await connectMongoose();

    // Obtém sessão autenticada
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Não autorizado",
      });
    }

    const { planId } = req.body;

    if (!planId) {
      return res.status(400).json({
        success: false,
        message: "O ID do plano é obrigatório",
      });
    }

    // Cria preferência de pagamento
    const preference = await PaymentService.createPreference(session.user.id, planId);

    return res.status(200).json({
      success: true,
      message: "Preferência de pagamento criada com sucesso",
      data: preference,
    });
  } catch (error: any) {
    console.error("❌ Erro ao criar preferência de pagamento:", error.message);
    return res.status(500).json({
      success: false,
      message: "Erro interno ao criar preferência de pagamento",
      error: error.message,
    });
  }
}
