// src/api/admin/content.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { connectMongoose } from "@/lib/mongodb";
import { authOptions } from "../auth/[...nextauth]";
import Content from "@/lib/models/Content";
import Plan from "@/lib/models/Plan";

/**
 * Rota administrativa para CRUD de conteúdos.
 * Métodos suportados: GET, POST, PUT, DELETE
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Content-Type", "application/json");

  try {
    const session = await getServerSession(req, res, authOptions);

    // ✅ Apenas administradores podem acessar
    if (!session?.user || session.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Acesso negado. Permissões de administrador necessárias.",
      });
    }

    // ✅ Garante conexão ativa com o banco
    await connectMongoose();

    switch (req.method) {
      /**
       * 📘 GET — Listar todos os conteúdos
       */
      case "GET": {
        try {
          const contents = await Content.find({})
            .populate("planId", "name price")
            .sort({ createdAt: -1 });

          return res.status(200).json({
            success: true,
            message: "Conteúdos obtidos com sucesso.",
            data: contents,
          });
        } catch (error: any) {
          console.error("❌ Erro ao listar conteúdos:", error.message);
          return res.status(500).json({
            success: false,
            message: "Erro interno ao listar conteúdos.",
            error: error.message,
          });
        }
      }

      /**
       * 🟢 POST — Criar novo conteúdo
       */
      case "POST": {
        try {
          const { title, description, planId, restricted, thumbnailUrl } = req.body;

          if (!title || !description) {
            return res.status(400).json({
              success: false,
              message: "Título e descrição são obrigatórios.",
            });
          }

          // Se for conteúdo restrito, precisa estar vinculado a um plano
          if (restricted && !planId) {
            return res.status(400).json({
              success: false,
              message: "Conteúdos restritos devem estar vinculados a um plano.",
            });
          }

          if (planId) {
            const planExists = await Plan.findById(planId);
            if (!planExists) {
              return res.status(404).json({
                success: false,
                message: "Plano vinculado não encontrado.",
              });
            }
          }

          const newContent = await Content.create({
            title,
            description,
            planId: planId || null,
            restricted: restricted || false,
            thumbnailUrl: thumbnailUrl || "",
            views: 0,
            lastViewedAt: null,
          });

          console.log("📦 Novo conteúdo criado:", {
            title,
            planId,
            restricted,
          });

          return res.status(201).json({
            success: true,
            message: "Conteúdo criado com sucesso!",
            data: newContent,
          });
        } catch (error: any) {
          console.error("❌ Erro ao criar conteúdo:", error.message);
          return res.status(500).json({
            success: false,
            message: "Erro interno ao criar conteúdo.",
            error: error.message,
          });
        }
      }

      /**
       * 🟡 PUT — Atualizar conteúdo existente
       */
      case "PUT": {
        try {
          const { id, ...updateData } = req.body;

          if (!id) {
            return res.status(400).json({
              success: false,
              message: "O ID do conteúdo é obrigatório para atualização.",
            });
          }

          const updatedContent = await Content.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
          });

          if (!updatedContent) {
            return res.status(404).json({
              success: false,
              message: "Conteúdo não encontrado.",
            });
          }

          console.log("✏️ Conteúdo atualizado:", { id });

          return res.status(200).json({
            success: true,
            message: "Conteúdo atualizado com sucesso!",
            data: updatedContent,
          });
        } catch (error: any) {
          console.error("❌ Erro ao atualizar conteúdo:", error.message);
          return res.status(500).json({
            success: false,
            message: "Erro interno ao atualizar conteúdo.",
            error: error.message,
          });
        }
      }

      /**
       * 🔴 DELETE — Excluir conteúdo
       */
      case "DELETE": {
        try {
          const { id } = req.query;

          if (!id || typeof id !== "string") {
            return res.status(400).json({
              success: false,
              message: "O ID do conteúdo é obrigatório para exclusão.",
            });
          }

          const deletedContent = await Content.findByIdAndDelete(id);

          if (!deletedContent) {
            return res.status(404).json({
              success: false,
              message: "Conteúdo não encontrado.",
            });
          }

          console.log("🗑️ Conteúdo excluído:", { id });

          return res.status(200).json({
            success: true,
            message: "Conteúdo excluído com sucesso.",
            data: deletedContent,
          });
        } catch (error: any) {
          console.error("❌ Erro ao excluir conteúdo:", error.message);
          return res.status(500).json({
            success: false,
            message: "Erro interno ao excluir conteúdo.",
            error: error.message,
          });
        }
      }

      /**
       * 🚫 MÉTODO INVÁLIDO
       */
      default:
        return res.status(405).json({
          success: false,
          message: "Método não permitido.",
        });
    }
  } catch (error: any) {
    console.error("❌ Erro global na rota admin/content:", error.message);
    return res.status(500).json({
      success: false,
      message: "Erro interno do servidor.",
      error: error.message,
    });
  }
}
