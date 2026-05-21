import { useState } from 'react';
import { JoinTeamView } from '../components/onboarding/JoinTeamView';
import { CreateTeamView } from '../components/onboarding/CreateTeamView';
import { AnalyzingLoader } from '../components/onboarding/AnalyzingLoader';

import { useAuthStore } from '../store/authStore';
import { Navigate } from 'react-router-dom';

export type OnboardingView = 'join' | 'create' | 'analyzing';

export function OnboardingPage() {
  const [currentView, setCurrentView] = useState<OnboardingView>('join');
  const user = useAuthStore((state) => state.user);

  if (user?.teamCode) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8 transition-all duration-300 relative overflow-hidden min-h-[450px] flex flex-col">
        {currentView === 'join' && (
          <JoinTeamView onViewChange={setCurrentView} />
        )}
        {currentView === 'create' && (
          <CreateTeamView onViewChange={setCurrentView} />
        )}
        {currentView === 'analyzing' && (
          <AnalyzingLoader />
        )}
      </div>
    </div>
  );
}
