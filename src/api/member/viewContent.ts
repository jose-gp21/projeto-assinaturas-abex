// src/pages/api/member/view-content.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { connectMongoose } from "@/lib/mongodb";
import Content from "@/lib/models/Content";
import { authOptions } from "../auth/[...nextauth]";

/**
 * Incrementa o contador de visualizações de um conteúdo
 * e registra a última data de visualização.
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

    const { contentId } = req.body;
    const userId = session.user.id;

    if (!contentId) {
      return res.status(400).json({
        success: false,
        message: "O ID do conteúdo é obrigatório.",
      });
    }

    // 🔹 Atualiza contador e data de visualização
    const content = await Content.findByIdAndUpdate(
      contentId,
      {
        $inc: { views: 1 },
        $set: { lastViewedAt: new Date() },
      },
      { new: true }
    );

    if (!content) {
      return res.status(404).json({
        success: false,
        message: "Conteúdo não encontrado.",
      });
    }

    const totalViews = typeof content.views === "number" ? content.views : 0;

    console.log("👁️ Visualização registrada:", {
      userId,
      contentId,
      titulo: content.title,
      totalViews,
      timestamp: new Date().toISOString(),
    });

    return res.status(200).json({
      success: true,
      message: "Visualização registrada com sucesso.",
      data: {
        contentId,
        views: totalViews,
        viewedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("❌ Erro na API de visualização de conteúdo:", error.message);
    return res.status(500).json({
      success: false,
      message: "Erro interno ao registrar visualização de conteúdo.",
      error: error.message,
    });
  }
}
