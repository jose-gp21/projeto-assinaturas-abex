// src/services/reportService.ts
import { connectMongoose } from '@/lib/mongodb';
import User from '@/lib/models/User';
import Assinatura from '@/lib/models/Subscription';
import Conteudo from '@/lib/models/Content';
import Plano from '@/lib/models/Plan';

// Função para gerar os dados do dashboard de relatórios
export async function getDashboardReports() {
  await connectMongoose(); // Garante a conexão

  try {
    const totalUsers = await User.countDocuments({});
    const activeSubscriptions = await Assinatura.countDocuments({ status: 'Ativa' });
    const totalPlanos = await Plano.countDocuments({});
    const totalConteudo = await Conteudo.countDocuments({});
    const restrictedConteudo = await Conteudo.countDocuments({ restrito: true });

    return {
      totalUsers,
      activeSubscriptions,
      totalPlanos,
      totalConteudo,
      restrictedConteudo,
    };
  } catch (error) {
    console.error('Erro ao gerar relatórios no serviço:', error);
    throw new Error('Erro interno ao buscar dados de relatórios.');
  }
}