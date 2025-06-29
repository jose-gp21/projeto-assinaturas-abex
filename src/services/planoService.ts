// src/services/planoService.ts
import Plano from '@/lib/models/Plan'; // Seu modelo Plano
import { connectMongoose } from '@/lib/mongodb';

// Função para criar um novo plano
export async function createNewPlano(data: {
  nome: string;
  valorMensal?: number | null;
  valorAnual?: number | null;
  descricao: string;
  beneficios?: string[];
  diasTeste?: number;
}) {
  await connectMongoose(); // Garante a conexão

  const { nome, descricao } = data;

  // Validação de inputs (agora dentro do serviço)
  if (!nome || !descricao) {
    throw new Error('Nome e descrição do plano são obrigatórios.');
  }

  try {
    const newPlano = await Plano.create({
      nome,
      valorMensal: data.valorMensal || null,
      valorAnual: data.valorAnual || null,
      descricao,
      beneficios: data.beneficios || [],
      diasTeste: data.diasTeste || 0,
    });
    return newPlano;
  } catch (error: any) {
    if (error.code === 11000) { // Código de erro para duplicidade no MongoDB (se 'nome' for unique)
      throw new Error('Já existe um plano com este nome.');
    }
    console.error('Erro ao criar plano no serviço:', error);
    throw new Error('Erro interno ao criar plano.');
  }
}

// Função para obter planos
export async function getPlanos() {
  await connectMongoose(); // Garante a conexão

  try {
    const planos = await Plano.find({});
    return planos;
  } catch (error) {
    console.error('Erro ao buscar planos no serviço:', error);
    throw new Error('Erro interno ao listar planos.');
  }
}

// Função para atualizar um plano existente
export async function updateExistingPlano(id: string, data: any) {
  await connectMongoose(); // Garante a conexão

  if (!id) {
    throw new Error('ID do plano é obrigatório para atualização.');
  }

  try {
    const updatedPlano = await Plano.findByIdAndUpdate(
      id,
      data,
      { new: true, runValidators: true }
    );

    if (!updatedPlano) {
      throw new Error('Plano não encontrado.');
    }
    return updatedPlano;
  } catch (error: any) {
    if (error.code === 11000) { // Código de erro para duplicidade no MongoDB
      throw new Error('Já existe outro plano com este nome.');
    }
    console.error('Erro ao atualizar plano no serviço:', error);
    throw new Error('Erro interno ao atualizar plano.');
  }
}

// Função para deletar um plano
export async function deleteExistingPlano(id: string) {
  await connectMongoose(); // Garante a conexão

  if (!id) {
    throw new Error('ID do plano é obrigatório para exclusão.');
  }

  try {
    const deletedPlano = await Plano.findByIdAndDelete(id);

    if (!deletedPlano) {
      throw new Error('Plano não encontrado.');
    }
    return deletedPlano;
  } catch (error) {
    console.error('Erro ao excluir plano no serviço:', error);
    throw new Error('Erro interno ao excluir plano.');
  }
}