// src/pages/api/member/payment-history.ts
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { PaymentService } from "@/services/paymentService";
import { connectMongoose } from "@/lib/mongodb";

/**
 * Retorna o histórico de pagamentos do usuário autenticado.
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

    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Não autorizado",
      });
    }

    const payments = await PaymentService.getUserPayments(session.user.id);

    return res.status(200).json({
      success: true,
      message: "Histórico de pagamentos obtido com sucesso",
      data: payments,
    });
  } catch (error: any) {
    console.error("❌ Erro ao buscar histórico de pagamentos:", error.message);
    return res.status(500).json({
      success: false,
      message: "Erro interno do servidor ao buscar pagamentos",
      error: error.message,
    });
  }
}
