import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { connectMongoose } from "@/lib/mongodb";
import Plan from "@/lib/models/Plan";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Content-Type", "application/json");

  try {
    if (req.method !== "GET") {
      return res.status(405).json({
        success: false,
        message: "Método não permitido. Use GET.",
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

    const plans = await Plan.find({ isActive: true }).sort({ price: 1 });

    return res.status(200).json({
      success: true,
      data: plans,
    });
  } catch (error: any) {
    console.error("❌ Erro ao buscar planos:", error.message);
    return res.status(500).json({
      success: false,
      message: "Erro interno ao buscar planos.",
      error: error.message,
    });
  }
}
