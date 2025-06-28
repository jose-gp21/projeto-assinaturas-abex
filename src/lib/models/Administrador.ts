// src/lib/models/Administrador.ts
import mongoose from 'mongoose';

export interface IAdministrador extends mongoose.Document {
  nome: string;
  email: string;
  senha: string;
  nivelAcesso: string; // Ex: 'Admin Total', 'Gerente Conteúdo' 
}

const AdministradorSchema = new mongoose.Schema<IAdministrador>({
  nome: {
    type: String,
    required: [true, 'Por favor, forneça um nome para o administrador.'],
    maxlength: [60, 'Nome não pode ter mais de 60 caracteres.'],
  },
  email: {
    type: String,
    required: [true, 'Por favor, forneça um e-mail para o administrador.'],
    unique: true,
    match: [/.+@.+\..+/, 'Por favor, forneça um e-mail válido.'],
  },
  senha: {
    type: String,
    required: [true, 'Por favor, forneça uma senha para o administrador.'],
    minlength: [6, 'A senha deve ter pelo menos 6 caracteres.'],
  },
  nivelAcesso: {
    type: String,
    enum: ['Super Admin', 'Gestor de Conteudo', 'Gerente Financeiro'], // Exemplo de níveis 
    default: 'Gestor de Conteudo',
  },
});

export default mongoose.models.Administrador || mongoose.model<IAdministrador>('Administrador', AdministradorSchema);