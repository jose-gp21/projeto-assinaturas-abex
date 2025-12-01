// src/pages/admin/payments.tsx
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]';
import Layout from '@/components/Layout';
import PaymentsDashboard from '@/components/admin/PaymentsDashboard';

export default function AdminPaymentsPage() {
  return (
    <Layout activeTab="admin">
      <PaymentsDashboard />
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  // Verificar se está autenticado e se é admin
  if (!session) {
    return {
      redirect: {
        destination: '/auth/signin',
        permanent: false,
      },
    };
  }

  // Verificar se é admin (ajuste conforme seu modelo de usuário)
  // @ts-ignore
  if (session.user.role !== 'admin') {
    return {
      redirect: {
        destination: '/member/content',
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};