import mongoose from "mongoose";
import { connectMongoose } from "@/lib/mongodb";
import Payment from "@/lib/models/Payment";
import Plan from "@/lib/models/Plan";
import Subscription from "@/lib/models/Subscription";
import User from "@/lib/models/User";
import { SubscriptionService } from "@/services/subscriptionService";

// Import da nova SDK Mercado Pago (v2)
import { MercadoPagoConfig, Preference, Payment as MPPayment } from "mercadopago";

// Instância do cliente Mercado Pago configurado com o token
const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

/**
 * Serviço responsável pelas operações de pagamento:
 * criação de preferências, gravação no banco e processamento de aprovações.
 */
export class PaymentService {
  /**
   * Cria uma preferência de pagamento no Mercado Pago.
   * Retorna o init_point (link para pagamento) e preferenceId.
   */
  static async createPreference(userId: string, planId: string) {
    await connectMongoose();

    const plan = await Plan.findById(planId);
    if (!plan) throw new Error("Plano não encontrado.");

    const preference = new Preference(mpClient);

   const response = await preference.create({
  body: {
    items: [
      {
        id: planId, // campo obrigatório
        title: plan.name,
        quantity: 1,
        currency_id: "BRL",
        unit_price: plan.price,
      },
    ],
    back_urls: {
      success: `${process.env.NEXTAUTH_URL}/payment/success`,
      failure: `${process.env.NEXTAUTH_URL}/payment/failure`,
      pending: `${process.env.NEXTAUTH_URL}/payment/pending`,
    },
    auto_return: "approved",
    metadata: {
      userId,
      planId,
    },
    notification_url: `${process.env.NEXTAUTH_URL}/api/webhooks/mercadopago`,
  },
});


    // Cria o registro inicial (pending)
    await PaymentService.createPaymentRecord(
      {
        id: response.id,
        status: "pending",
        transaction_amount: plan.price,
      },
      userId,
      planId
    );

    return {
      preferenceId: response.id,
      init_point: response.init_point,
    };
  }

  /**
   * Cria um registro Payment no banco de dados.
   */
  static async createPaymentRecord(mpData: any, userId?: string, planId?: string) {
    await connectMongoose();

    const payment = new Payment({
      userId,
      planId,
      mpPaymentId: mpData.id,
      amount: mpData.transaction_amount || 0,
      status: mpData.status || "pending",
      paidAt: mpData.status === "approved" ? new Date() : null,
    });

    await payment.save();
    return payment;
  }

  /**
   * Processa a aprovação do pagamento após o webhook.
   */

    /**
   * Retorna todos os pagamentos de um usuário ordenados do mais recente para o mais antigo.
   */
  static async getUserPayments(userId: string) {
    await connectMongoose();

    if (!userId) {
      throw new Error("User ID é obrigatório para buscar pagamentos.");
    }

    const payments = await Payment.find({ userId })
      .populate("planId", "name price") // inclui nome e preço do plano
      .sort({ createdAt: -1 }); // mais recentes primeiro

    return payments;
  }

  
  static async processPaymentApproval(
    mercadoPagoPaymentId: string,
    meta?: { payment_method_id?: string }
  ) {
    await connectMongoose();

    try {
      const paymentInstance = new MPPayment(mpClient);
      const response = await paymentInstance.get({ id: mercadoPagoPaymentId });
      const paymentData = response;

      if (!paymentData) throw new Error("Pagamento não encontrado na API Mercado Pago.");

      if (paymentData.status !== "approved") {
        console.log(`Pagamento ${mercadoPagoPaymentId} ainda não aprovado (status: ${paymentData.status}).`);
        return;
      }

      // Busca ou cria o registro local
      let payment = await Payment.findOne({ mpPaymentId: mercadoPagoPaymentId });
      if (!payment) {
        const { userId, planId } = (paymentData.metadata || {}) as any;
        payment = await PaymentService.createPaymentRecord(paymentData, userId, planId);
      }

      // Atualiza o status local
      payment.status = "approved";
      payment.paidAt = new Date();
      payment.paymentMethod = meta?.payment_method_id || (paymentData.payment_method_id as string);
      await payment.save();

      const userId = payment.userId?.toString() || (paymentData.metadata as any)?.userId;
      const planId = payment.planId?.toString() || (paymentData.metadata as any)?.planId;

      if (!userId || !planId) {
        console.warn("Webhook recebido sem userId ou planId.");
        return;
      }

      await SubscriptionService.activateOrRenewSubscription(userId, planId);

      console.log(`✅ Pagamento aprovado e assinatura atualizada para o usuário ${userId}.`);
    } catch (err: any) {
      console.error("Erro ao processar pagamento:", err.message);
      throw err;
    }
  }

  /**
   * Busca pagamento pelo ID do MongoDB.
   */
  static async getPaymentById(paymentId: string) {
    await connectMongoose();
    const payment = await Payment.findById(paymentId);
    if (!payment) throw new Error("Pagamento não encontrado.");
    return payment;
  }
}

export default PaymentService;
