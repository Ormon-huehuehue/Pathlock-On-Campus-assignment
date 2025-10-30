'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './hooks/useAuth';
import Dashboard from "./components/Dashboard";
import BottomBar from "./components/BottomBar";
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
      <div className="flex min-h-screen w-screen bg-gradient-to-b from-white to-amber-50 items-center justify-center font-sans">
        <Dashboard/>
        <BottomBar />
      </div>
    </PageTransition>
  );
}
