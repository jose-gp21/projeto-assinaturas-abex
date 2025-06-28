// src/lib/models/Assinatura.ts
import mongoose from 'mongoose';

export interface IAssinatura extends mongoose.Document {
  tipo: string;           // Ex: 'Mensal', 'Anual' 
  dataInicio: Date;
  dataFim: Date;
  status: string;         // Ex: 'Ativa', 'Cancelada', 'Suspensa' 
  periodoTeste: boolean;
  membroId: mongoose.Schema.Types.ObjectId; // Referência ao ID do Membro [cite: 75]
  planoId: mongoose.Schema.Types.ObjectId;   // Referência ao ID do Plano [cite: 75]
}

const AssinaturaSchema = new mongoose.Schema<IAssinatura>({
  tipo: {
    type: String,
    enum: ['Mensal', 'Anual'], // De acordo com seu diagrama de classes 
    required: [true, 'Por favor, especifique o tipo de assinatura.'],
  },
  dataInicio: {
    type: Date,
    required: [true, 'Por favor, forneça a data de início da assinatura.'],
  },
  dataFim: {
    type: Date,
    required: [true, 'Por favor, forneça a data de fim da assinatura.'],
  },
  status: {
    type: String,
    enum: ['Ativa', 'Cancelada', 'Suspensa'], // De acordo com seu diagrama de classes 
    default: 'Ativa',
  },
  periodoTeste: {
    type: Boolean,
    default: false,
  },
  membroId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Referencia o modelo 'User' [cite: 75]
    required: [true, 'ID do membro é obrigatório para a assinatura.'],
  },
  planoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plano', // Referencia o modelo 'Plano' [cite: 75]
    required: [true, 'ID do plano é obrigatório para a assinatura.'],
  },
}, { timestamps: true }); // Adiciona createdAt e updatedAt automaticamente

export default mongoose.models.Assinatura || mongoose.model<IAssinatura>('Assinatura', AssinaturaSchema);