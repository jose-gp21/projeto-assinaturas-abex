// src/lib/models/Plano.ts
import mongoose from 'mongoose';

export interface IPlano extends mongoose.Document {
  nome: string;
  valorMensal?: number; // Valor opcional, se for apenas anual 
  valorAnual?: number;  // Valor opcional, se for apenas mensal 
  descricao: string;
  beneficios: string[]; // Array de strings para os benefícios 
  diasTeste?: number;   // Dias de teste, opcional 
}

const PlanoSchema = new mongoose.Schema<IPlano>({
  nome: {
    type: String,
    required: [true, 'Por favor, forneça o nome do plano.'],
    unique: true,
  },
  valorMensal: {
    type: Number,
    min: 0,
  },
  valorAnual: {
    type: Number,
    min: 0,
  },
  descricao: {
    type: String,
    required: [true, 'Por favor, forneça uma descrição para o plano.'],
  },
  beneficios: {
    type: [String], // Array de strings
    default: [],
  },
  diasTeste: {
    type: Number,
    min: 0,
  },
});

export default mongoose.models.Plano || mongoose.model<IPlano>('Plano', PlanoSchema);