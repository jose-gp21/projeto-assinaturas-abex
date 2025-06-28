'use client'
// src/pages/membro/planos.tsx
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import withAuth from "@/components/withAuth";
import Layout from "@/components/Layout";
import {
  Crown,
  Check,
  Star,
  Zap,
  Shield,
  Users,
  Heart,
  Gift,
  Calendar,
  Clock,
  Sparkles,
  Award,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  CreditCard,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { log } from "console";

interface Plano {
  _id: string;
  nome: string;
  valorMensal?: number;
  valorAnual?: number;
  descricao: string;
  beneficios: string[];
  diasTeste?: number;
  popular?: boolean;
  ativo?: boolean;
}

function MembroPlanosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const [selectedBilling, setSelectedBilling] = useState<"mensal" | "anual">(
    "mensal"
  );

  useEffect(() => {
    if (status === "authenticated") {
      fetchPlanos();
    } else if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  const fetchPlanos = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/membro/planos");
      const data = await res.json();
      if (data.success) {
        setPlanos(data.data.filter((plano: Plano) => plano.ativo !== false));
      } else {
        setError(data.message);
      }
    } catch (err: any) {
      setError(err.message || "Erro ao carregar planos.");
    } finally {
      setLoading(false);
    }
  };

  const handleEscolherPlano = async (
    plano: Plano,
    billing: "mensal" | "anual"
  ) => {
    setProcessingPlan(plano._id);

    try {
      // Simular processamento de pagamento
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Aqui você integraria com seu sistema de pagamento
      // Por exemplo: Stripe, PayPal, PagSeguro, etc.

      alert(
        `Plano ${plano.nome} (${billing}) selecionado! Redirecionando para pagamento...`
      );

      // Redirecionar para checkout ou processar pagamento
      // router.push(`/checkout?plano=${plano._id}&billing=${billing}`);
    } catch (err: any) {
      setError("Erro ao processar solicitação. Tente novamente.");
    } finally {
      setProcessingPlan(null);
    }
  };

  const calculateDiscount = (mensal: number, anual: number) => {
    if (!mensal || !anual) return 0;
    return Math.round((1 - anual / (mensal * 12)) * 100);
  };

  const PlanCard = ({
    plano,
    featured = false,
  }: {
    plano: Plano;
    featured?: boolean;
  }) => {
    const isProcessing = processingPlan === plano._id;
    const currentPrice =
      selectedBilling === "anual" ? plano.valorAnual : plano.valorMensal;
    const hasDiscount = plano.valorMensal && plano.valorAnual;
    const discountPercent = hasDiscount
      ? calculateDiscount(plano.valorMensal!, plano.valorAnual!)
      : 1;

    return (
      <div
        className={`relative bg-slate-800/50 backdrop-blur-sm border rounded-3xl p-8 hover:bg-slate-800/70 transition-all duration-300 hover:scale-[1.02] ${
          featured || plano.popular
            ? "border-purple-500/50 shadow-2xl shadow-purple-500/20 ring-1 ring-purple-500/20"
            : "border-slate-700/50"
        }`}
      >
        {/* Popular Badge */}
        {(featured || plano.popular) && (
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg">
              <Star className="w-4 h-4 fill-current" />
              MAIS POPULAR
            </div>
          </div>
        )}

        {/* Free Trial Badge */}
        {plano.diasTeste && (
          <div className="absolute -top-4 right-4">
            <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1">
              <Gift className="w-3 h-3" />
              {plano.diasTeste} dias grátis
            </div>
          </div>
        )}

        {/* Plan Icon */}
        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${
            featured || plano.popular
              ? "bg-gradient-to-r from-purple-500 to-blue-500 shadow-lg shadow-purple-500/25"
              : "bg-gradient-to-r from-slate-600 to-slate-700"
          }`}
        >
          <Crown className="w-8 h-8 text-white" />
        </div>

        {/* Plan Details */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-white mb-3">{plano.nome}</h3>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            {plano.descricao}
          </p>

          {/* Pricing */}
          <div className="mb-6">
            {currentPrice ? (
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-bold text-white">
                  R$ {currentPrice.toFixed(2)}
                </span>
                <span className="text-slate-400">
                  /{selectedBilling === "anual" ? "ano" : "mês"}
                </span>
              </div>
            ) : (
              <div className="text-2xl font-bold text-white mb-2">
                Consulte valores
              </div>
            )}

            {selectedBilling === "anual" &&
              hasDiscount &&
              discountPercent > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-400 line-through">
                    R$ {(plano.valorMensal! * 12).toFixed(2)}/ano
                  </span>
                  <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs font-bold">
                    {discountPercent}% OFF
                  </span>
                </div>
              )}
          </div>
        </div>

        {/* Benefits */}
        <div className="mb-8">
          <h4 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            Benefícios inclusos:
          </h4>
          <ul className="space-y-3">
            {plano.beneficios.map((beneficio, index) => (
              <li key={index} className="flex items-start gap-3 text-sm">
                <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-300">{beneficio}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {plano.valorMensal && (
            <button
              onClick={() => handleEscolherPlano(plano, "mensal")}
              disabled={isProcessing}
              className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                featured || plano.popular
                  ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl hover:scale-105"
                  : "bg-slate-700 hover:bg-slate-600 text-white"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isProcessing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Escolher Plano Mensal
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}

          {plano.valorAnual && (
            <button
              onClick={() => handleEscolherPlano(plano, "anual")}
              disabled={isProcessing}
              className="w-full py-3 px-6 rounded-xl font-medium border border-slate-600 text-slate-300 hover:bg-slate-700/50 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Calendar className="w-4 h-4" />
                  Escolher Plano Anual
                  {discountPercent > 0 && (
                    <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-bold">
                      -{discountPercent}%
                    </span>
                  )}
                </>
              )}
            </button>
          )}
        </div>

        {/* Trial Info */}
        {plano.diasTeste && (
          <div className="mt-4 text-center">
            <p className="text-xs text-slate-500">
              Cancele a qualquer momento durante o período de teste
            </p>
          </div>
        )}
      </div>
    );
  };

  if (status === "loading" || loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-300 text-lg">Carregando planos...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (status === "unauthenticated" || !session) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center bg-red-500/10 border border-red-500/20 rounded-2xl p-8">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <p className="text-red-400 text-lg">
              Acesso negado. Por favor, faça login.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-4 lg:p-6 max-w-7xl space-y-12">
        {/* Hero Section */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 rounded-full text-purple-300 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Escolha seu plano
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-6">
            Desbloqueie Todo o Potencial
          </h1>
          <p className="text-slate-400 text-lg max-w-3xl mx-auto leading-relaxed">
            Escolha o plano perfeito para acelerar seu crescimento. Todos os
            planos incluem acesso completo ao conteúdo premium, suporte
            prioritário e atualizações constantes.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-2 flex">
            <button
              onClick={() => setSelectedBilling("mensal")}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                selectedBilling === "mensal"
                  ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Clock className="w-4 h-4" />
              Mensal
            </button>
            <button
              onClick={() => setSelectedBilling("anual")}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                selectedBilling === "anual"
                  ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Calendar className="w-4 h-4" />
              Anual
              <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-bold">
                Economize até 30%
              </span>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3 max-w-2xl mx-auto">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Plans Grid */}
        {planos.length === 0 ? (
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-12 text-center">
            <Crown className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-400 mb-2">
              Nenhum plano disponível
            </h3>
            <p className="text-slate-500">
              Novos planos serão disponibilizados em breve
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {planos.map((plano, index) => {
              console.log(plano);
              return (
                <PlanCard
                  key={plano._id}
                  plano={plano}
                  featured={plano.popular || index === 1}
                />
              );
            })}
          </div>
        )}

        {/* Benefits Section */}
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-3xl p-8 lg:p-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Por que escolher nossos planos?
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Todos os planos foram cuidadosamente desenvolvidos para oferecer o
              máximo valor e acelerar seus resultados
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Conteúdo Premium
              </h3>
              <p className="text-slate-400 text-sm">
                Acesso exclusivo a materiais de alta qualidade criados por
                especialistas
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Comunidade VIP
              </h3>
              <p className="text-slate-400 text-sm">
                Conecte-se com outros membros e participe de discussões
                exclusivas
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Suporte Prioritário
              </h3>
              <p className="text-slate-400 text-sm">
                Atendimento especializado para tirar suas dúvidas rapidamente
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ainda tem dúvidas?
          </h2>
          <p className="text-slate-400 mb-8">
            Entre em contato conosco para esclarecimentos sobre nossos planos
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
              <Heart className="w-4 h-4" />
              Falar com Suporte
            </button>
            <button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2">
              <Award className="w-4 h-4" />
              Ver Demonstração
            </button>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="text-center py-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-slate-500 text-sm">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Pagamento 100% seguro
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              +10.000 membros ativos
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              98% de satisfação
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default withAuth(MembroPlanosPage);
