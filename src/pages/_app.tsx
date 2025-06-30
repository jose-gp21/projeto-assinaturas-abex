import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import Head from 'next/head';
import '../styles/globals.css';

function MyApp({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <>
      <Head>
        <title>Abex Clubs - Premium Platform</title>
        <meta name="description" content="Plataforma premium de conteúdo exclusivo" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>👑</text></svg>" />
      </Head>
      
      <SessionProvider session={session}>
        <Component {...pageProps} />
      </SessionProvider>
    </>
  );
}
export default MyApp;