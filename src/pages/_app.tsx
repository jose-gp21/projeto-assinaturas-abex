// src/pages/_app.tsx
import '../styles/globals.css'; // Certifique-se de que seus estilos globais estão importados
import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react'; // <-- Importe o SessionProvider

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    // Envolve todo o aplicativo com SessionProvider
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}

export default MyApp;