'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import BottomBar from "../components/BottomBar";
import PageTransition from "../components/ui/PageTransition";
import GlobalLoader from "../components/ui/GlobalLoader";

export default function SchedulerPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect unauthenticated users to login page
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleCreateProject = () => {
    // Navigate back to main page and trigger modal
    router.push('/');
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return <GlobalLoader message="Checking authentication..." />;
  }

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <PageTransition>
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <div className="w-full max-w-3xl p-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Smart Scheduler</h1>
            <p className="text-gray-600 mb-8">
              Task scheduling and optimization coming soon...
            </p>
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <div className="text-gray-500">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-lg font-medium mb-2">Smart Scheduler</p>
                <p className="text-sm">This feature will be implemented in a future task.</p>
              </div>
            </div>
          </div>
        </div>
        <BottomBar onCreateProject={handleCreateProject} />
      </div>
    </PageTransition>
  );
}