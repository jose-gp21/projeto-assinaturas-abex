// src/services/subscriptionService.ts
import Subscription, { ISubscription } from '@/lib/models/Subscription'; // Importe o modelo e a interface
import Plan from '@/lib/models/Plan'; // Também precisaremos do modelo Plan para popular
import User from '@/lib/models/User'; // E do modelo User para atualizar o status da assinatura
import { connectMongoose } from '@/lib/mongodb'; // Sua função de conexão com o MongoDB

// Função para buscar a assinatura ativa de um membro
export async function getMemberSubscription(memberId: string) {
  if (!memberId) {
    throw new Error('Member ID is required to fetch subscription.');
  }

  await connectMongoose(); // Garante a conexão com o banco de dados

  try {
    // Busca a assinatura mais recente do membro, populando os detalhes do plano
    // Assumimos que o campo de referência no Subscription é 'planId'
    const subscription = await Subscription.findOne({ memberId: memberId })
                                           .sort({ startDate: -1 }) // Pega a mais recente se houver múltiplas
                                           .populate('planId'); // Popula os detalhes do plano

    return subscription;
  } catch (error) {
    console.error('Error fetching member subscription in service:', error);
    throw new Error('Internal error while fetching member subscription.');
  }
}

// Função para criar uma nova assinatura
// Data esperada: { planId: string, billing: 'monthly' | 'annual', memberId: string }
export async function createSubscription(data: { planId: string; billing: 'monthly' | 'annual'; memberId: string; trialPeriod?: boolean }) {
  await connectMongoose();

  const { planId, billing, memberId } = data;

  if (!planId || !billing || !memberId) {
    throw new Error('Plan ID, billing type, and member ID are required to create a subscription.');
  }

  try {
    const plan = await Plan.findById(planId);
    if (!plan) {
      throw new Error('Plan not found.');
    }

    // Calcular datas de início e fim
    const startDate = new Date();
    let endDate = new Date(startDate);
    let amount = 0;

    if (billing === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
      amount = plan.monthlyPrice || 0;
    } else if (billing === 'annual') {
      endDate.setFullYear(endDate.getFullYear() + 1);
      amount = plan.annualPrice || 0;
    } else {
        throw new Error('Invalid billing type provided.');
    }

    // Verificar se já existe uma assinatura ativa para este membro
    const existingActiveSubscription = await Subscription.findOne({
      memberId: memberId,
      status: 'Active'
    });

    if (existingActiveSubscription) {
      throw new Error('Member already has an active subscription.');
    }

    const newSubscription = await Subscription.create({
      type: billing,
      startDate,
      endDate,
      status: 'Active',
      trialPeriod: data.trialPeriod ?? (plan.trialDays ? plan.trialDays > 0 : false), // Usa trialDays do plano se disponível
      memberId,
      planId,
      amount, // Adiciona o valor da transação
      // Outros campos como 'nextBillingDate', 'cancellationDate', 'expirationDate' podem ser calculados ou definidos depois
    });

    // Atualizar o status de assinatura do usuário
    await User.findByIdAndUpdate(memberId, { subscriptionStatus: 'Active' });

    return newSubscription;
  } catch (error: any) {
    if (error.code === 11000) { // Exemplo de erro de duplicidade se aplicável
        throw new Error('A subscription already exists for this member and plan.');
    }
    console.error('Error creating subscription in service:', error);
    throw new Error('Internal error while creating subscription: ' + error.message);
  }
}

// Função para cancelar uma assinatura
export async function cancelSubscription(memberId: string) {
  if (!memberId) {
    throw new Error('Member ID is required to cancel subscription.');
  }

  await connectMongoose();

  try {
    // Encontrar a assinatura ativa do membro
    const activeSubscription = await Subscription.findOne({
      memberId: memberId,
      status: 'Active',
    });

    if (!activeSubscription) {
      throw new Error('No active subscription found for this member.');
    }

    // Atualizar o status da assinatura para 'Canceled' e definir a data de cancelamento
    const canceledSubscription = await Subscription.findByIdAndUpdate(
      activeSubscription._id,
      {
        status: 'Canceled',
        cancellationDate: new Date(),
        expirationDate: activeSubscription.endDate // A expiração pode permanecer a data original de término do período pago
      },
      { new: true }
    );

    // Opcional: Atualizar o status de assinatura do usuário para 'Canceled' ou 'Inactive'
    await User.findByIdAndUpdate(memberId, { subscriptionStatus: 'Canceled' });


    return canceledSubscription;
  } catch (error) {
    console.error('Error canceling subscription in service:', error);
    throw new Error('Internal error while canceling subscription.');
  }
}

// Função para renovar uma assinatura (exemplo simplificado)
export async function renewSubscription(memberId: string) {
  if (!memberId) {
    throw new Error('Member ID is required to renew subscription.');
  }

  await connectMongoose();

  try {
    // Encontrar a assinatura expirada/cancelada mais recente do membro
    const oldSubscription = await Subscription.findOne({
      memberId: memberId,
      status: { $in: ['Expired', 'Canceled'] } // Pode ser 'Expired' ou 'Canceled'
    }).sort({ endDate: -1 }); // Pega a assinatura mais recente que expirou/foi cancelada

    if (!oldSubscription) {
      throw new Error('No expired or canceled subscription found to renew for this member.');
    }

    // Criar uma nova assinatura com base no plano da assinatura antiga
    const plan = await Plan.findById(oldSubscription.planId);
    if (!plan) {
        throw new Error('Associated plan not found for renewal.');
    }

    const startDate = new Date();
    let endDate = new Date(startDate);
    let amount = 0;
    let type: 'Monthly' | 'Annual' = 'Monthly'; // Assume monthly by default or from old subscription

    if (oldSubscription.type === 'Annual' && plan.annualPrice) {
      endDate.setFullYear(endDate.getFullYear() + 1);
      amount = plan.annualPrice;
      type = 'Annual';
    } else if (plan.monthlyPrice) {
      endDate.setMonth(endDate.getMonth() + 1);
      amount = plan.monthlyPrice;
      type = 'Monthly';
    } else {
        throw new Error('Cannot determine billing type for renewal.');
    }


    const newSubscription = await Subscription.create({
      type,
      startDate,
      endDate,
      status: 'Active',
      trialPeriod: false, // Renovação não deve ser período de teste
      memberId,
      planId: oldSubscription.planId,
      amount,
    });

    // Opcional: Atualizar o status de assinatura do usuário para 'Active'
    await User.findByIdAndUpdate(memberId, { subscriptionStatus: 'Active' });

    return newSubscription;

  } catch (error) {
    console.error('Error renewing subscription in service:', error);
    throw new Error('Internal error while renewing subscription.');
  }
}