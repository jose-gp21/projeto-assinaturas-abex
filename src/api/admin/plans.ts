// src/api/admin/plans.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { connectMongoose } from "@/lib/mongodb";
import { PlanService } from "@/services/planService";

/**
 * Rota administrativa para CRUD de planos.
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
       * 📘 GET — Listar todos os planos
       */
      case "GET": {
        try {
          const plans = await PlanService.getPlans();
          return res.status(200).json({
            success: true,
            message: "Planos obtidos com sucesso.",
            data: plans,
          });
        } catch (error: any) {
          console.error("❌ Erro ao listar planos:", error.message);
          return res.status(500).json({
            success: false,
            message: "Erro interno ao listar planos.",
            error: error.message,
          });
        }
      }

      /**
       * 🟢 POST — Criar novo plano
       */
      case "POST": {
        try {
          const body = req.body;
          const newPlan = await PlanService.createNewPlan(body);

          return res.status(201).json({
            success: true,
            message: "Plano criado com sucesso!",
            data: newPlan,
          });
        } catch (error: any) {
          console.error("❌ Erro ao criar plano:", error.message);
          if (error.message.includes("required")) {
            return res.status(400).json({ success: false, message: error.message });
          }
          if (error.message.includes("already exists")) {
            return res.status(409).json({ success: false, message: error.message });
          }
          return res.status(500).json({
            success: false,
            message: "Erro interno ao criar plano.",
            error: error.message,
          });
        }
      }

      /**
       * 🟡 PUT — Atualizar plano existente
       */
      case "PUT": {
        try {
          const { id, ...updateData } = req.body;

          if (!id) {
            return res.status(400).json({
              success: false,
              message: "O ID do plano é obrigatório para atualização.",
            });
          }

          const updatedPlan = await PlanService.updateExistingPlan(id, updateData);

          return res.status(200).json({
            success: true,
            message: "Plano atualizado com sucesso!",
            data: updatedPlan,
          });
        } catch (error: any) {
          console.error("❌ Erro ao atualizar plano:", error.message);
          if (error.message.includes("not found")) {
            return res.status(404).json({ success: false, message: error.message });
          }
          if (error.message.includes("already exists")) {
            return res.status(409).json({ success: false, message: error.message });
          }
          return res.status(500).json({
            success: false,
            message: "Erro interno ao atualizar plano.",
            error: error.message,
          });
        }
      }

      /**
       * 🔴 DELETE — Excluir plano
       */
      case "DELETE": {
        try {
          const { id } = req.query;

          if (!id || typeof id !== "string") {
            return res.status(400).json({
              success: false,
              message: "O ID do plano é obrigatório para exclusão.",
            });
          }

          const deletedPlan = await PlanService.deleteExistingPlan(id);

          return res.status(200).json({
            success: true,
            message: "Plano excluído com sucesso.",
            data: deletedPlan,
          });
        } catch (error: any) {
          console.error("❌ Erro ao excluir plano:", error.message);
          if (error.message.includes("not found")) {
            return res.status(404).json({ success: false, message: error.message });
          }
          return res.status(500).json({
            success: false,
            message: "Erro interno ao excluir plano.",
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
    console.error("❌ Erro global em /api/admin/plans:", error.message);
    return res.status(500).json({
      success: false,
      message: "Erro interno do servidor.",
      error: error.message,
    });
  }
}
