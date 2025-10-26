// src/pages/api/member/favorite.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { connectMongoose } from "@/lib/mongodb";
import User from "@/lib/models/User";
import Content from "@/lib/models/Content";
import { authOptions } from "../auth/[...nextauth]";

/**
 * Adiciona ou remove um conteúdo dos favoritos do usuário autenticado.
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

    // 🔎 Verifica se o conteúdo existe
    const content = await Content.findById(contentId);
    if (!content) {
      return res.status(404).json({
        success: false,
        message: "Conteúdo não encontrado.",
      });
    }

    // 🔎 Busca o usuário
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuário não encontrado.",
      });
    }

    // Garante que favoriteContent exista
    if (!Array.isArray(user.favoriteContent)) {
      user.favoriteContent = [];
    }

    const alreadyFavorited = user.favoriteContent
      .map((id: any) => id.toString())
      .includes(contentId.toString());

    let action: "added" | "removed";

    if (alreadyFavorited) {
      // ❌ Remover dos favoritos
      user.favoriteContent = user.favoriteContent.filter(
        (id: any) => id.toString() !== contentId.toString()
      );
      action = "removed";
    } else {
      // ❤️ Adicionar aos favoritos
      user.favoriteContent.push(contentId);
      action = "added";
    }

    await user.save();

    console.log(`❤️ Conteúdo ${action === "added" ? "adicionado aos" : "removido dos"} favoritos:`, {
      userId,
      contentId,
      contentTitle: content.title,
      favoritesTotal: user.favoriteContent.length,
    });

    return res.status(200).json({
      success: true,
      message:
        action === "added"
          ? "Conteúdo adicionado aos favoritos com sucesso."
          : "Conteúdo removido dos favoritos com sucesso.",
      data: {
        contentId,
        isFavorited: action === "added",
        favoritesCount: user.favoriteContent.length,
      },
    });
  } catch (error: any) {
    console.error("❌ Erro na rota de favoritos:", error.message);
    return res.status(500).json({
      success: false,
      message: "Erro interno ao atualizar favoritos.",
      error: error.message,
    });
  }
}
