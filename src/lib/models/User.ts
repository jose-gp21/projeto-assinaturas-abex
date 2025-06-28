// src/lib/models/User.ts
import mongoose from 'mongoose';

// Define a interface para tipagem (opcional, mas recomendado com TypeScript)
export interface IUser extends mongoose.Document {
  nome: string;
  email: string;
  senha: string;
  statusAssinatura: string; // Ex: 'Ativa', 'Inativa', 'Pendente' 
  dataCadastro: Date;
  ultimoAcesso: Date;
}

// Define o Schema do Mongoose
const UserSchema = new mongoose.Schema<IUser>({
  nome: {
    type: String,
    required: [true, 'Por favor, forneça um nome.'],
    maxlength: [60, 'Nome não pode ter mais de 60 caracteres.'],
  },
  email: {
    type: String,
    required: [true, 'Por favor, forneça um e-mail.'],
    unique: true, // Garante que e-mails sejam únicos
    match: [/.+@.+\..+/, 'Por favor, forneça um e-mail válido.'],
  },
  senha: {
    type: String,
    required: [true, 'Por favor, forneça uma senha.'],
    minlength: [6, 'A senha deve ter pelo menos 6 caracteres.'],
    // Em um projeto real, você NÃO armazenaria a senha em texto puro.
    // Ela seria hashed (ex: com bcrypt) antes de ser salva.
    // Para 1 dia, podemos deixar assim, mas lembre-se disso para produção.
  },
  statusAssinatura: {
    type: String,
    enum: ['Ativa', 'Cancelada', 'Suspensa', 'Pendente', 'Inativa'], // Enum de possíveis status 
    default: 'Inativa',
  },
  dataCadastro: {
    type: Date,
    default: Date.now, // Data de criação automática
  },
  ultimoAcesso: {
    type: Date,
    default: Date.now, // Atualizado no login
  },
});

// Verifica se o modelo já foi compilado para evitar recompilação em hot-reload
export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);