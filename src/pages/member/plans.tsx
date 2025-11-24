// src/pages/member/plans.tsx
import React, { useState } from "react";
import { useRouter } from "next/router";
import { PlanCard, PaymentModal } from "@/components/payment";
import { IPlan } from "@/lib/models/Plan";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import Layout from "@/components/Layout";
import { connectMongoose } from "@/lib/mongodb";
import Plan from "@/lib/models/Plan";

interface PlansPageProps {
  plans: IPlan[];
  currentPlanId?: string;
}

export default function PlansPage({ plans, currentPlanId }: PlansPageProps) {
  const router = useRouter();

  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<IPlan | null>(null);
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");

  const handleSelect = (planId: string, billingType: "monthly" | "annual") => {
    const found = plans.find((p) => p._id.toString() === planId);
    if (!found) return;

    setSelectedPlan(found);
    setBilling(billingType);
    setIsPaymentOpen(true);
  };

  return (
    <Layout activeTab="plans">
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
        {/* Background decorativo */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-purple-500/10 to-blue-500/10 blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Escolha seu{" "}
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Plano Ideal
              </span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Selecione o plano perfeito para suas necessidades e comece a aproveitar todos os benefícios
            </p>
          </div>

          {/* Toggle Mensal / Anual */}
          <div className="flex items-center justify-center gap-4 mb-16">
            <span className={`text-lg font-medium transition-colors ${billing === 'monthly' ? 'text-white' : 'text-slate-500'}`}>
              Mensal
            </span>
            <button
              onClick={() => setBilling(billing === 'monthly' ? 'annual' : 'monthly')}
              className="relative w-16 h-8 bg-slate-700 rounded-full border border-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <span className={`absolute left-1 top-1 w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full shadow-lg transform transition-transform duration-300 ${
                billing === 'annual' ? 'translate-x-8' : ''
              }`}></span>
            </button>
            <span className={`text-lg font-medium transition-colors ${billing === 'annual' ? 'text-white' : 'text-slate-500'}`}>
              Anual
            </span>
            <div className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full text-white text-sm font-medium">
              Economize 20%
            </div>
          </div>

          {/* Lista de Planos */}
          {plans.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Nenhum plano disponível</h3>
              <p className="text-slate-400">Entre em contato com o suporte para mais informações.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {plans.map((plan, index) => (
                <PlanCard
                  key={plan._id.toString()}
                  plan={plan}
                  billing={billing}
                  currentPlanId={currentPlanId}
                  onSelect={handleSelect}
                  isPopular={index === 1}
                />
              ))}
            </div>
          )}

          {/* Informações adicionais */}
          <div className="mt-20 grid md:grid-cols-3 gap-8">
            <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 text-center hover:bg-slate-800/50 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Pagamento Seguro</h3>
              <p className="text-slate-400">Processamento 100% seguro via MercadoPago</p>
            </div>

            <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 text-center hover:bg-slate-800/50 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Garantia de 7 dias</h3>
              <p className="text-slate-400">Cancele quando quiser, sem compromisso</p>
            </div>

            <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 text-center hover:bg-slate-800/50 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Suporte Premium</h3>
              <p className="text-slate-400">Ajuda sempre que você precisar, 24/7</p>
            </div>
          </div>
        </div>

        {/* Modal de Pagamento */}
        {selectedPlan && (
          <PaymentModal
            isOpen={isPaymentOpen}
            onClose={() => {
              setIsPaymentOpen(false);
              setSelectedPlan(null);
            }}
            plans={[selectedPlan]}
            currentPlanId={currentPlanId}
            onPaymentSuccess={() => {
              setIsPaymentOpen(false);
              router.reload();
            }}
          />
        )}
      </div>
    </Layout>
  );
}

/* ======================================================
   SERVER SIDE - CARREGA PLANOS DA API AUTENTICADA
====================================================== */

export async function getServerSideProps(context: any) {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session) {
    return {
      redirect: {
        destination: "/auth/signin",
        permanent: false,
      },
    };
  }

  try {
    // Buscar direto do MongoDB (mais confiável no SSR)
    await connectMongoose();
    
    const plansFromDb = await Plan.find({ isActive: true })
      .sort({ monthlyPrice: 1 })
      .lean()
      .exec();
    
    // Serializar corretamente para o Next.js
    const serializedPlans = JSON.parse(JSON.stringify(plansFromDb));

    console.log('✅ SSR - Planos carregados:', serializedPlans.length);

    return {
      props: {
        plans: serializedPlans,
        currentPlanId: null,
      },
    };
  } catch (err: any) {
    console.error("❌ SSR ERROR:", err.message);
    
    return { 
      props: { 
        plans: [], 
        currentPlanId: null 
      } 
    };
  }
}
