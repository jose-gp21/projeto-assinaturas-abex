// src/pages/api/auth/[...nextauth].ts
import NextAuth, { type AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import { MongoClient } from 'mongodb';
import User from '../../../lib/models/User'; // Importe o modelo User aqui para usar no callback JWT
import { connectMongoose } from '@/lib/mongodb';

await connectMongoose(); 
// Garante que a URI do MongoDB esteja definida
const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

// A promessa do cliente MongoDB para o adaptador do NextAuth.
// O adaptador NextAuth gerencia sua própria conexão.
const clientPromise = MongoClient.connect(uri);

// Obter a lista de e-mails de administradores das variáveis de ambiente
// Separamos por vírgula e removemos espaços em branco para ter um array de e-mails limpos.
const adminEmails = process.env.ADMIN_EMAILS ?
  process.env.ADMIN_EMAILS.split(',').map(email => email.trim()) :
  [];

// Objeto de opções de autenticação para o NextAuth
export const authOptions: AuthOptions = {
  // Provedores de autenticação (neste caso, Google)
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],

  // Adaptador para persistir sessões e usuários no MongoDB
  adapter: MongoDBAdapter(clientPromise),

  // Estratégia de sessão: 'jwt' para uso com tokens JWT
  session: {
    strategy: 'jwt',
    // Opcional: configurar o tempo de expiração do JWT, etc.
    // maxAge: 30 * 24 * 60 * 60, // 30 dias
  },

  // Callbacks: Funções que são executadas em momentos específicos do ciclo de autenticação
  callbacks: {
    // Chamado após o usuário ser autenticado por um provedor (ex: Google)
    async signIn({ user }) {
      // Retorna `true` para permitir o login.
      // Retorna `false` ou uma URL para redirecionar se o login for negado.
      return true;
    },

    // Chamado quando um JWT (JSON Web Token) é criado ou atualizado.
    // É aqui que adicionamos dados personalizados ao token que virão da base de dados.
    async jwt({ token, user }) {
      // `user` está presente apenas na primeira vez que o JWT é criado (após o signIn).
      if (user) {
        token.id = user.id; // O ID do usuário do MongoDB é adicionado ao token

        // Buscar o usuário completo do nosso modelo User no DB para obter o statusAssinatura.
        // O `user.id` vindo do NextAuth aqui é o `_id` do documento no MongoDB.
        const userInDb = await User.findById(user.id);

        if (userInDb) {
          // Adiciona o status da assinatura do usuário ao token
          token.statusAssinatura = userInDb.statusAssinatura;
        }

        // Atribui uma 'role' (papel) ao token com base no e-mail do usuário.
        // Se o e-mail estiver na lista de ADMIN_EMAILS, a role será 'admin'. Caso contrário, 'member'.
        if (user.email && adminEmails.includes(user.email)) {
          token.role = 'admin';
        } else {
          token.role = 'member';
        }
      }
      return token; // Retorna o token (com dados personalizados)
    },

    // Chamado sempre que uma sessão é verificada ou atualizada (ex: `useSession` no frontend).
    // Ele adiciona as propriedades do token à sessão que será exposta ao cliente.
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string; // Garante que 'id' é string
        session.user.role = token.role as string; // Garante que 'role' é string
        session.user.statusAssinatura = token.statusAssinatura as string; // Garante que 'statusAssinatura' é string
      }
      return session; // Retorna a sessão (com dados personalizados)
    },
  },

  // Páginas personalizadas para o NextAuth (opcional, mas recomendado para UI customizada)
  pages: {
    signIn: '/auth/signin', // Redireciona para esta página para login
    // signOut: '/auth/signout', // Página de saída
    // error: '/auth/error', // Página para erros de autenticação
    // verifyRequest: '/auth/verify-request', // Para autenticação por e-mail/magic link
    // newUser: '/auth/new-user', // Para usuários que fazem login pela primeira vez
  },

  // Ativa o modo de depuração em desenvolvimento para logs detalhados
  debug: process.env.NODE_ENV === 'development',
};

// Exporta o handler padrão do NextAuth
export default NextAuth(authOptions);

// =====================================================================
// DECLARAÇÕES DE TIPO (PARA TYPESCRIPT)
// Isso estende os tipos padrão do NextAuth para incluir nossas propriedades personalizadas
// =====================================================================

declare module 'next-auth' {
  /**
   * Extensão para a interface Session, que é retornada por `useSession`,
   * `getSession` e recebida como prop no `SessionProvider`.
   */
  interface Session {
    user: {
      id: string; // ID do usuário do MongoDB
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string; // Ex: 'admin', 'member'
      statusAssinatura?: string; // Ex: 'Ativa', 'Inativa', 'Pendente'
    };
  }
}

declare module 'next-auth/jwt' {
  /**
   * Extensão para a interface JWT, retornada pelo callback `jwt` e `getToken`,
   * quando usando sessões JWT.
   */
  interface JWT {
    id: string; // ID do usuário do MongoDB
    role?: string; // Ex: 'admin', 'member'
    statusAssinatura?: string; // Ex: 'Ativa', 'Inativa', 'Pendente'
  }
}