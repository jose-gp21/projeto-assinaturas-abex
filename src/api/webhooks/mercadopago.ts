import type { NextApiRequest, NextApiResponse } from "next";
import { connectMongoose } from "@/lib/mongodb";
import PaymentService from "@/services/paymentService";

/**
 * Webhook do Mercado Pago
 *
 * Recebe notificações de eventos como criação e atualização de pagamentos.
 * Sempre retorna 200 para o Mercado Pago confirmar o recebimento.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // O Mercado Pago envia o webhook via POST
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  await connectMongoose();

  try {
    const body = req.body;
    console.log("📩 Webhook Mercado Pago recebido:", JSON.stringify(body, null, 2));

    // Existem dois formatos possíveis: event.type ou query.type
    const eventType = body.type || req.query.type;

    // A notificação de pagamento vem assim:
    // { action: 'payment.updated', data: { id: '123456789' } }
    if (eventType === "payment" || body.action?.includes("payment")) {
      const paymentId =
        body.data?.id ||
        body.resource ||
        req.query["data.id"] ||
        req.query.id;

      if (!paymentId) {
        console.warn("⚠️ Webhook recebido sem paymentId válido.");
        return res.status(400).json({ message: "Missing paymentId" });
      }

      // O campo opcional payment_method_id pode vir em algumas versões
      const paymentMethodId =
        body.data?.payment_method_id ||
        body.payment_method_id ||
        undefined;

      console.log(`🔎 Processando pagamento ID: ${paymentId}`);

      // Chama o serviço que valida e atualiza o pagamento/assinatura
      await PaymentService.processPaymentApproval(paymentId.toString(), {
        payment_method_id: paymentMethodId,
      });

      console.log(`✅ Webhook processado com sucesso para pagamento ${paymentId}`);
    } else {
      console.log("ℹ️ Webhook ignorado — tipo não é pagamento:", eventType);
    }

    // Sempre retornar 200 OK, mesmo se não for evento relevante
    return res.status(200).json({ received: true });
  } catch (error: any) {
    console.error("❌ Erro ao processar webhook Mercado Pago:", error.message);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
}
