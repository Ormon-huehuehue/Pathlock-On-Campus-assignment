'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './hooks/useAuth';
import UnifiedDashboard from "./components/UnifiedDashboard";
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

  // Show UnifiedDashboard for authenticated users
  return (
    <PageTransition>
      <UnifiedDashboard />
    </PageTransition>
  );
}
