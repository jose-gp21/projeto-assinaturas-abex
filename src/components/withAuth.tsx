// src/components/withAuth.tsx
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import React, { ComponentType, useEffect } from 'react';

// Define options for the HOC (e.g., if it requires admin role)
interface WithAuthOptions {
  requiresAdmin?: boolean; // If the page can only be accessed by admins
  redirectIfAuthenticated?: boolean; // If the page should redirect if the user is ALREADY authenticated (e.g., login/signup pages)
}

// HOC to protect frontend routes
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
      // If the session is still loading, do nothing
      if (loading) return;

      // Redirect if ALREADY authenticated (for login/signup pages)
      if (options?.redirectIfAuthenticated && isAuthenticated) {
        router.replace('/'); // Redirect to home
        return;
      }

      // If not authenticated and the page doesn't require redirect if authenticated, redirect to login
      if (!isAuthenticated && !options?.redirectIfAuthenticated) {
        router.replace('/auth/signin');
        return;
      }

      // If admin is required and the user is not an admin, redirect (to home or an access denied page)
      if (options?.requiresAdmin && !isAdmin) {
        router.replace('/'); // Or to an "Access Denied" page
        alert('Access denied. You do not have admin permissions to view this page.'); // Alert the user
        return;
      }

    }, [isAuthenticated, isAdmin, loading, router, options]);

    // If NextAuth is still loading or auth/role verification is pending
    if (loading || (!isAuthenticated && !options?.redirectIfAuthenticated) || (options?.requiresAdmin && !isAdmin && isAuthenticated)) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <p className="text-gray-700">Loading...</p>
        </div>
      );
    }

    // Render the original component if conditions are met
    return <WrappedComponent {...props} />;
  };

  // Set a display name for easier debugging in React DevTools
  ComponentWithAuth.displayName = `withAuth(${getDisplayName(WrappedComponent)})`;

  return ComponentWithAuth;
}

// Helper function to get the component's name
function getDisplayName<P extends object>(WrappedComponent: ComponentType<P>): string {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

export default withAuth;