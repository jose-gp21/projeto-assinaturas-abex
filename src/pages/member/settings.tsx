// src/pages/member/settings.tsx
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]';
import { signOut } from 'next-auth/react';
import Layout from '@/components/Layout';
import { useState } from 'react';
import { 
  User, 
  Trash2, 
  AlertTriangle, 
  Shield,
  Mail,
  X,
  Check
} from 'lucide-react';
import { useRouter } from 'next/router';

interface SettingsPageProps {
  user: {
    name: string;
    email: string;
    image?: string;
    createdAt: string;
  };
}

export default function SettingsPage({ user }: SettingsPageProps) {
  const router = useRouter();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [error, setError] = useState('');

  const handleDeleteAccount = async () => {
    if (confirmText !== 'DELETAR') {
      setError('Digite "DELETAR" para confirmar');
      return;
    }

    setIsDeleting(true);
    setError('');

    try {
      const response = await fetch('/api/user/delete-account', {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao deletar conta');
      }

      // Deslogar e redirecionar
      await signOut({ 
        callbackUrl: '/?deleted=true',
        redirect: true 
      });
    } catch (error) {
      console.error('Error deleting account:', error);
      setError(error instanceof Error ? error.message : 'Erro ao deletar conta');
      setIsDeleting(false);
    }
  };

  return (
    <Layout activeTab="settings">
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Configurações da Conta
            </h1>
            <p className="text-slate-400">
              Gerencie suas informações e preferências
            </p>
          </div>

          {/* Perfil do Usuário */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Informações da Conta
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {user.image ? (
                  <img 
                    src={user.image} 
                    alt={user.name}
                    className="w-16 h-16 rounded-full border-2 border-purple-500/30"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                )}
                <div>
                  <p className="text-white font-medium text-lg">{user.name}</p>
                  <p className="text-slate-400 text-sm">{user.email}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-500 text-sm mb-1">Nome</p>
                    <p className="text-white">{user.name}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-sm mb-1">Email</p>
                    <p className="text-white">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-sm mb-1">Membro desde</p>
                    <p className="text-white">
                      {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Zona de Perigo */}
          <div className="bg-red-900/20 border-2 border-red-500/50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Zona de Perigo
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-white font-medium mb-2">Deletar Conta</h3>
                <p className="text-slate-400 text-sm mb-4">
                  Esta ação é <strong className="text-red-400">permanente e irreversível</strong>. 
                  Todos os seus dados serão removidos permanentemente do sistema de acordo com a LGPD.
                </p>
                
                <div className="bg-slate-900/50 rounded-lg p-4 mb-4">
                  <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-purple-400" />
                    O que será deletado:
                  </h4>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                      Todas as suas informações pessoais
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                      Histórico de assinaturas e pagamentos
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                      Acesso a todo conteúdo exclusivo
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                      Todos os dados associados à sua conta
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all duration-200 hover:scale-105"
                >
                  <Trash2 className="w-4 h-4" />
                  Deletar Minha Conta
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Confirmação */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border-2 border-red-500/50 rounded-2xl p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                </div>
                <h3 className="text-2xl font-bold text-white">
                  Confirmar Exclusão
                </h3>
              </div>
              <button 
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setConfirmText('');
                  setError('');
                }}
                className="text-slate-400 hover:text-white"
                disabled={isDeleting}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                <p className="text-red-400 font-medium mb-2">
                  ⚠️ Esta ação não pode ser desfeita!
                </p>
                <p className="text-slate-300 text-sm">
                  Todos os seus dados serão <strong>permanentemente removidos</strong> do sistema 
                  e você será deslogado automaticamente.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Digite <span className="text-red-400 font-bold">DELETAR</span> para confirmar:
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => {
                    setConfirmText(e.target.value);
                    setError('');
                  }}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Digite DELETAR"
                  disabled={isDeleting}
                  autoFocus
                />
              </div>

              {error && (
                <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setConfirmText('');
                  setError('');
                }}
                className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors"
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting || confirmText !== 'DELETAR'}
                className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Deletando...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Deletar Conta
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session || !session.user) {
    return {
      redirect: {
        destination: '/auth/signin',
        permanent: false,
      },
    };
  }

  return {
    props: {
      user: {
        name: session.user.name || 'Usuário',
        email: session.user.email || '',
        image: session.user.image || null,
        // @ts-ignore
        createdAt: session.user.createdAt || new Date().toISOString(),
      },
    },
  };
};