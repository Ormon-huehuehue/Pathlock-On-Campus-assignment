'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './hooks/useAuth';
import Dashboard from "./components/Dashboard";
import PageTransition from "./components/ui/PageTransition";
import GlobalLoader from "./components/ui/GlobalLoader";

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect unauthenticated users to login page
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return <GlobalLoader message="Checking authentication..." />;
  }

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  // Show Dashboard for authenticated users
  return (
    <PageTransition>
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <Dashboard/>
      </div>
    </PageTransition>
  );
}
