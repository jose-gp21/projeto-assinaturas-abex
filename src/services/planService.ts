// src/services/planService.ts
import Plan from "@/lib/models/Plan";
import { connectMongoose } from "@/lib/mongodb";

/**
 * Cria um novo plano
 */
async function createNewPlan(data: {
  name: string;
  monthlyPrice?: number | null;
  annualPrice?: number | null;
  price?: number | null;
  description: string;
  features?: string[];
  trialDays?: number;
}) {
  await connectMongoose();

  const { name, description } = data;

  if (!name || !description) {
    throw new Error("Plan name and description are required.");
  }

  try {
    const newPlan = await Plan.create({
      name,
      price: data.price || data.monthlyPrice || 0,
      monthlyPrice: data.monthlyPrice || null,
      annualPrice: data.annualPrice || null,
      description,
      features: data.features || [],
      trialDays: data.trialDays || 0,
    });

    console.log("🆕 New plan created:", newPlan.name);
    return newPlan;
  } catch (error: any) {
    if (error.code === 11000) {
      throw new Error("A plan with this name already exists.");
    }
    console.error("❌ Error creating plan:", error);
    throw new Error("Internal error while creating plan.");
  }
}

/**
 * Retorna todos os planos cadastrados
 */
async function getPlans() {
  await connectMongoose();

  try {
    const plans = await Plan.find({});
    return plans;
  } catch (error) {
    console.error("❌ Error fetching plans:", error);
    throw new Error("Internal error while listing plans.");
  }
}

/**
 * Atualiza um plano existente
 */
async function updateExistingPlan(id: string, data: any) {
  await connectMongoose();

  if (!id) {
    throw new Error("Plan ID is required for update.");
  }

  try {
    const updatedPlan = await Plan.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (!updatedPlan) {
      throw new Error("Plan not found.");
    }

    console.log(`🔁 Plan updated: ${updatedPlan.name}`);
    return updatedPlan;
  } catch (error: any) {
    if (error.code === 11000) {
      throw new Error("Another plan with this name already exists.");
    }
    console.error("❌ Error updating plan:", error);
    throw new Error("Internal error while updating plan.");
  }
}

/**
 * Exclui um plano
 */
async function deleteExistingPlan(id: string) {
  await connectMongoose();

  if (!id) {
    throw new Error("Plan ID is required for deletion.");
  }

  try {
    const deletedPlan = await Plan.findByIdAndDelete(id);

    if (!deletedPlan) {
      throw new Error("Plan not found.");
    }

    console.log(`🗑️ Plan deleted: ${deletedPlan.name}`);
    return deletedPlan;
  } catch (error) {
    console.error("❌ Error deleting plan:", error);
    throw new Error("Internal error while deleting plan.");
  }
}

/**
 * Busca um plano pelo ID
 * (usado pelo PaymentService.createPreference)
 */
async function getPlanById(planId: string) {
  await connectMongoose();

  if (!planId) {
    throw new Error("Plan ID is required.");
  }

  try {
    const plan = await Plan.findById(planId);
    if (!plan) {
      throw new Error("Plan not found.");
    }

    return plan;
  } catch (error) {
    console.error("❌ Error fetching plan by ID:", error);
    throw new Error("Internal error while fetching plan by ID.");
  }
}

/**
 * 🔄 Exporta o serviço unificado compatível com PaymentService
 */
export const PlanService = {
  createNewPlan,
  getPlans,
  updateExistingPlan,
  deleteExistingPlan,
  getPlanById,
};

export default PlanService;
