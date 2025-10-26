// src/api/admin/reports.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { connectMongoose } from "@/lib/mongodb";

/**
 * Rota administrativa de relatórios (dashboard).
 * Retorna métricas agregadas sobre usuários, planos, assinaturas e pagamentos.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Content-Type", "application/json");
  console.log("📊 Admin Reports API chamada...");

  try {
    if (req.method !== "GET") {
      return res.status(405).json({
        success: false,
        message: "Método não permitido. Use GET.",
      });
    }

    const session = await getServerSession(req, res, authOptions);

    if (!session?.user) {
      return res.status(401).json({
        success: false,
        message: "Não autorizado.",
      });
    }

    if (session.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Acesso negado. Apenas administradores podem acessar esta rota.",
      });
    }

    console.log("✅ Autenticação e permissão confirmadas.");

    let data: any = null;

    // 🔹 Tenta usar o serviço de relatórios centralizado
    try {
      const { getDashboardReports } = await import("@/services/reportService");
      data = await getDashboardReports();
      console.log("✅ Dados carregados via reportService.");
    } catch (serviceError: any) {
      console.warn("⚠️ Erro ao carregar service reportService:", serviceError.message);
      console.log("➡️ Usando fallback direto no banco...");

      // 🔹 Fallback direto no banco (se o service não estiver implementado)
      await connectMongoose();

      const User = (await import("@/lib/models/User")).default;
      const Plan = (await import("@/lib/models/Plan")).default;
      const Subscription = (await import("@/lib/models/Subscription")).default;
      const Payment = (await import("@/lib/models/Payment")).default;

      const totalUsers = await User.countDocuments({});
      const totalPlans = await Plan.countDocuments({});
      const totalSubscriptions = await Subscription.countDocuments({});
      const activeSubscriptions = await Subscription.countDocuments({ status: "Active" });
      const totalPayments = await Payment.countDocuments({});
      const approvedPayments = await Payment.find({ status: "approved" });

      const totalRevenue = approvedPayments.reduce((acc, p) => acc + (p.amount || 0), 0);
      const averageRevenue = approvedPayments.length > 0 ? totalRevenue / approvedPayments.length : 0;

      data = {
        totalUsers,
        totalPlans,
        totalSubscriptions,
        activeSubscriptions,
        totalPayments,
        totalRevenue,
        averageRevenue,
      };

      console.log("📈 Fallback data gerado:", data);
    }

    return res.status(200).json({
      success: true,
      message: "Relatórios carregados com sucesso.",
      data,
    });
  } catch (error: any) {
    console.error("💥 Erro na rota admin/reports:", error.message);
    return res.status(500).json({
      success: false,
      message: "Erro interno ao gerar relatórios.",
      error: error.message,
    });
  }
}
