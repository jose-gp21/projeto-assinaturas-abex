// src/api/admin/dashboard.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { connectMongoose } from "@/lib/mongodb";
import { getDashboardReports } from "@/services/reportService";

/**
 * Endpoint para o painel do administrador.
 * Retorna estatísticas agregadas do sistema (usuários, planos, pagamentos, etc).
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // ✅ Autenticação via NextAuth
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user) {
      return res.status(401).json({
        success: false,
        message: "Não autorizado. Faça login novamente.",
      });
    }

    if (session.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Acesso negado. Permissões de administrador necessárias.",
      });
    }

    if (req.method !== "GET") {
      return res.status(405).json({
        success: false,
        message: "Método não permitido. Use GET.",
      });
    }

    await connectMongoose();

    // ✅ Obtém os relatórios via serviço dedicado
    const reportsData = await getDashboardReports();

    console.log("📊 Dashboard reports generated successfully:", {
      timestamp: new Date().toISOString(),
      metrics: Object.keys(reportsData),
    });

    return res.status(200).json({
      success: true,
      message: "Relatórios do painel obtidos com sucesso.",
      data: reportsData,
    });
  } catch (error: any) {
    console.error("❌ Erro ao gerar relatórios do painel:", error.message);
    return res.status(500).json({
      success: false,
      message: "Erro interno ao gerar relatórios do painel.",
      error: error.message,
    });
  }
}
