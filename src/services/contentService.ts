// src/services/conteudoService.ts
import Conteudo from '@/lib/models/Content'; // Seu modelo Conteudo
import Plano from '@/lib/models/Plan';     // Seu modelo Plano
import { connectMongoose } from '@/lib/mongodb';

// Função para criar conteúdo
export async function createNewContent(data: { titulo: string; descricao: string; tipo: string; url?: string | null; restrito?: boolean; planoId?: string | null }) {
  await connectMongoose(); // Garante a conexão

  const { titulo, descricao, tipo, url, restrito, planoId } = data;

  // Validação de inputs (agora dentro do serviço)
  if (!titulo || !descricao || !tipo) {
    throw new Error('Título, descrição e tipo são obrigatórios para o conteúdo.');
  }

  if (planoId) {
    const planoExistente = await Plano.findById(planoId);
    if (!planoExistente) {
      throw new Error('ID do plano fornecido não existe.');
    }
  }

  const newConteudo = await Conteudo.create({
    titulo,
    descricao,
    dataPublicacao: new Date(),
    tipo,
    url: url || null,
    restrito: typeof restrito === 'boolean' ? restrito : true,
    planoId: planoId || null,
  });

  return newConteudo;
}

// Função para obter conteúdo(s)
export async function getContents(id?: string) {
  await connectMongoose(); // Garante a conexão

  if (id) {
    const conteudo = await Conteudo.findById(id).populate('planoId', 'nome');
    if (!conteudo) {
      throw new Error('Conteúdo não encontrado.');
    }
    return conteudo;
  } else {
    const conteudos = await Conteudo.find({}).populate('planoId', 'nome');
    return conteudos;
  }
}

// Função para atualizar conteúdo
export async function updateContent(id: string, data: any) {
  await connectMongoose(); // Garante a conexão

  if (!id) {
    throw new Error('ID do conteúdo é obrigatório para atualização.');
  }

  if (data.planoId) {
    const planoExistente = await Plano.findById(data.planoId);
    if (!planoExistente) {
      throw new Error('ID do plano fornecido não existe.');
    }
  }

  const updatedConteudo = await Conteudo.findByIdAndUpdate(
    id,
    data, // Passamos o objeto de dados diretamente
    { new: true, runValidators: true }
  );

  if (!updatedConteudo) {
    throw new Error('Conteúdo não encontrado.');
  }

  return updatedConteudo;
}

// Função para deletar conteúdo
export async function deleteContent(id: string) {
  await connectMongoose(); // Garante a conexão

  if (!id) {
    throw new Error('ID do conteúdo é obrigatório para exclusão.');
  }

  const deletedConteudo = await Conteudo.findByIdAndDelete(id);

  if (!deletedConteudo) {
    throw new Error('Conteúdo não encontrado.');
  }

  return deletedConteudo;
}