// src/lib/models/index.ts
// Este arquivo serve para garantir que todos os seus modelos Mongoose
// sejam carregados e seus Schemas registrados quando este arquivo for importado.

import './User';       // Importa o modelo User
import './Administrador'; // Importa o modelo Administrador
import './Plano';       // Importa o modelo Plano
import './Assinatura';  // Importa o modelo Assinatura
import './Conteudo';    // Importa o modelo Conteudo

// Você não precisa exportar nada daqui, apenas a importação já força o carregamento dos arquivos
// e o registro dos Schemas pelo Mongoose (devido às linhas 'mongoose.models.X || mongoose.model<I...>(...)')