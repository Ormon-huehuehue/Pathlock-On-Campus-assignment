'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import BottomBar from "../components/BottomBar";
import PageTransition from "../components/ui/PageTransition";
import GlobalLoader from "../components/ui/GlobalLoader";
import SmartScheduler from "../components/SmartScheduler";
import { ScheduleResponse } from '../types/projects';

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

  const handleScheduleGenerated = (schedule: ScheduleResponse) => {
    // Handle schedule generation success
    console.log('Schedule generated:', schedule);
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
      <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
        <div className="container mx-auto px-4 py-8 pb-24">
          <SmartScheduler 
            projectId={1}
            onScheduleGenerated={handleScheduleGenerated}
          />
        </div>
        <BottomBar onCreateProject={handleCreateProject} />
      </div>
    </PageTransition>
  );
}