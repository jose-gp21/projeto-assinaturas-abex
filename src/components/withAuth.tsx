// src/components/withAuth.tsx
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import React, { ComponentType, useEffect } from 'react';

// Define as opções para o HOC (por exemplo, se requer papel de admin)
interface WithAuthOptions {
  requiresAdmin?: boolean; // Se a página só pode ser acessada por admin
  redirectIfAuthenticated?: boolean; // Se a página deve redirecionar se o usuário JÁ estiver autenticado (ex: páginas de login/cadastro)
}

// HOC para proteger rotas no frontend
function withAuth<P extends object>(
  WrappedComponent: ComponentType<P>,
  options?: WithAuthOptions
) {
  const ComponentWithAuth: React.FC<P> = (props) => {
    const { data: session, status } = useSession();
    const router = useRouter();
    const loading = status === 'loading';
    const isAuthenticated = status === 'authenticated';
    const isAdmin = isAuthenticated && session?.user?.role === 'admin';

    useEffect(() => {
      // Se ainda estiver carregando a sessão, não faz nada
      if (loading) return;

      // Caso de redirecionamento se JÁ autenticado (para páginas de login/cadastro)
      if (options?.redirectIfAuthenticated && isAuthenticated) {
        router.replace('/'); // Redireciona para a home
        return;
      }

      // Se não está autenticado e não é uma página que deve redirecionar se autenticado, redireciona para o login
      if (!isAuthenticated && !options?.redirectIfAuthenticated) {
        router.replace('/auth/signin');
        return;
      }

      // Se requer admin e o usuário não é admin, redireciona (para home ou outra página de acesso negado)
      if (options?.requiresAdmin && !isAdmin) {
        router.replace('/'); // Ou para uma página de "Acesso Negado"
        alert('Acesso negado. Você não tem permissão de administrador para esta página.'); // Alerta para o usuário
        return;
      }

    }, [isAuthenticated, isAdmin, loading, router, options]);

    // Se o NextAuth ainda está carregando ou a verificação de auth/role está pendente
    if (loading || (!isAuthenticated && !options?.redirectIfAuthenticated) || (options?.requiresAdmin && !isAdmin && isAuthenticated)) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <p className="text-gray-700">Carregando...</p>
        </div>
      );
    }

    // Renderiza o componente original se as condições forem atendidas
    return <WrappedComponent {...props} />;
  };

  // Define um nome de exibição para facilitar a depuração no React DevTools
  ComponentWithAuth.displayName = `withAuth(${getDisplayName(WrappedComponent)})`;

  return ComponentWithAuth;
}

// Função auxiliar para obter o nome do componente
function getDisplayName<P extends object>(WrappedComponent: ComponentType<P>): string {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

export default withAuth;