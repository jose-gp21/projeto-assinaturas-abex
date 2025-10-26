// src/services/subscriptionService.ts
import Subscription from "@/lib/models/Subscription";
import Plan from "@/lib/models/Plan";
import User from "@/lib/models/User";
import { connectMongoose } from "@/lib/mongodb";

/**
 * Obtém a assinatura ativa de um usuário.
 */
async function getUserActiveSubscription(userId: string) {
  if (!userId) {
    throw new Error("User ID is required to fetch subscription.");
  }

  await connectMongoose();

  try {
    const subscription = await Subscription.findOne({
      userId,
      status: "active",
    })
      .sort({ startDate: -1 })
      .populate("planId");

    return subscription;
  } catch (error) {
    console.error("❌ Error fetching user subscription:", error);
    throw new Error("Internal error while fetching user subscription.");
  }
}

/**
 * Cria uma nova assinatura manualmente (ex: onboarding ou testes).
 */
async function createSubscription(data: { planId: string; userId: string }) {
  const { planId, userId } = data;

  if (!planId || !userId) {
    throw new Error("Plan ID and User ID are required to create a subscription.");
  }

  await connectMongoose();

  try {
    const plan = await Plan.findById(planId);
    if (!plan) throw new Error("Plan not found.");

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(startDate.getMonth() + 1); // padrão: 1 mês de duração

    // Cancela outras assinaturas ativas
    await Subscription.updateMany(
      { userId, status: "active" },
      { status: "cancelled" }
    );

    // Cria nova assinatura
    const newSubscription = await Subscription.create({
      userId,
      planId,
      startDate,
      endDate,
      status: "active",
    });

    // Atualiza o status do usuário
    await User.findByIdAndUpdate(userId, {
      subscriptionStatus: "active",
      updatedAt: new Date(),
    });

    console.log("🎉 Subscription created:", {
      subscriptionId: newSubscription._id,
      userId,
      planId,
    });

    return newSubscription;
  } catch (error: any) {
    console.error("❌ Error creating subscription:", error);
    throw new Error("Internal error while creating subscription: " + error.message);
  }
}

/**
 * Cancela a assinatura ativa de um usuário.
 */
async function cancelSubscription(userId: string) {
  if (!userId) {
    throw new Error("User ID is required to cancel subscription.");
  }

  await connectMongoose();

  try {
    const activeSubscription = await Subscription.findOne({
      userId,
      status: "active",
    });

    if (!activeSubscription) {
      throw new Error("No active subscription found for this user.");
    }

    const cancelledSubscription = await Subscription.findByIdAndUpdate(
      activeSubscription._id,
      { status: "cancelled" },
      { new: true }
    );

    await User.findByIdAndUpdate(userId, {
      subscriptionStatus: "cancelled",
      updatedAt: new Date(),
    });

    console.log("🚫 Subscription cancelled:", {
      subscriptionId: cancelledSubscription?._id,
      userId,
    });

    return cancelledSubscription;
  } catch (error) {
    console.error("❌ Error cancelling subscription:", error);
    throw new Error("Internal error while cancelling subscription.");
  }
}

/**
 * Atualiza assinaturas expiradas automaticamente.
 */
async function checkExpiredSubscriptions() {
  await connectMongoose();

  try {
    const now = new Date();

    const expiredSubscriptions = await Subscription.find({
      status: "active",
      endDate: { $lt: now },
    });

    if (expiredSubscriptions.length > 0) {
      await Subscription.updateMany(
        { status: "active", endDate: { $lt: now } },
        { status: "expired" }
      );

      const userIds = expiredSubscriptions.map((s) => s.userId);
      await User.updateMany(
        { _id: { $in: userIds } },
        { subscriptionStatus: "expired", updatedAt: new Date() }
      );

      console.log(`⏰ Updated ${expiredSubscriptions.length} expired subscriptions`);
    }

    return expiredSubscriptions.length;
  } catch (error) {
    console.error("❌ Error checking expired subscriptions:", error);
    throw new Error("Internal error while checking expired subscriptions.");
  }
}

/**
 * Ativa ou renova uma assinatura (usado pelo PaymentService após pagamento aprovado).
 */
async function activateOrRenewSubscription(userId: string, planId: string) {
  await connectMongoose();

  try {
    const plan = await Plan.findById(planId);
    if (!plan) throw new Error("Plan not found for renewal.");

    const now = new Date();

    // Verifica se já existe uma assinatura ativa
    let existing = await Subscription.findOne({ userId, planId, status: "active" });

    if (existing) {
      // Renova assinatura existente
      existing.endDate = new Date(now.setMonth(now.getMonth() + 1));
      await existing.save();

      console.log(`🔁 Subscription renewed for user ${userId}`);
    } else {
      // Cria nova assinatura
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(startDate.getMonth() + 1);

      existing = await Subscription.create({
        userId,
        planId,
        startDate,
        endDate,
        status: "active",
      });

      console.log(`🟢 New subscription activated for user ${userId}`);
    }

    // Atualiza o status do usuário
    await User.findByIdAndUpdate(userId, {
      subscriptionStatus: "active",
      updatedAt: new Date(),
    });

    return existing;
  } catch (error: any) {
    console.error("❌ Error activating or renewing subscription:", error.message);
    throw new Error("Internal error while activating/renewing subscription.");
  }
}

/**
 * 🔄 Exporta o serviço unificado compatível com PaymentService
 */
export const SubscriptionService = {
  getUserActiveSubscription,
  createSubscription,
  cancelSubscription,
  checkExpiredSubscriptions,
  activateOrRenewSubscription,
};

export default SubscriptionService;
