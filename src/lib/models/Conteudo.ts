// src/lib/models/Conteudo.ts
import mongoose from 'mongoose';

export interface IConteudo extends mongoose.Document {
  titulo: string;
  descricao: string;
  dataPublicacao: Date;
  tipo: string; // Ex: 'Video', 'Artigo', 'Evento' 
  url?: string; // URL do conteúdo (se for externo)
  restrito: boolean; // Se o conteúdo é exclusivo para assinantes 
  planoId?: mongoose.Schema.Types.ObjectId; // Opcional: para qual plano este conteúdo é exclusivo [cite: 75]
}

const ConteudoSchema = new mongoose.Schema<IConteudo>({
  titulo: {
    type: String,
    required: [true, 'Por favor, forneça um título para o conteúdo.'],
    maxlength: [100, 'Título não pode ter mais de 100 caracteres.'],
  },
  descricao: {
    type: String,
    required: [true, 'Por favor, forneça uma descrição para o conteúdo.'],
  },
  dataPublicacao: {
    type: Date,
    default: Date.now,
  },
  tipo: {
    type: String,
    enum: ['Video', 'Artigo', 'Evento', 'Outro'], // Tipos de conteúdo 
    required: [true, 'Por favor, forneça o tipo de conteúdo.'],
  },
  url: {
    type: String,
  },
  restrito: {
    type: Boolean,
    default: true, // Por padrão, conteúdo é restrito
  },
  planoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plano', // Referencia o modelo 'Plano' [cite: 75]
    // Este campo é opcional, pois um conteúdo pode ser restrito mas não exclusivo de um plano específico
    // Ou pode ser para múltiplos planos. Para simplicidade de 1 dia, deixamos assim.
  },
});

export default mongoose.models.Conteudo || mongoose.model<IConteudo>('Conteudo', ConteudoSchema);