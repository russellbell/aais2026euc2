import { useState, useEffect } from 'react';
import { getCurrentUser } from 'aws-amplify/auth';
import { useVault } from './context/VaultContext';
import BootSequence from './components/BootSequence';
import Header from './components/Header';
import EnvironmentCard from './components/EnvironmentCard';
import DriftMonitor from './components/DriftMonitor';
import DriftAlert from './components/DriftAlert';
import VaultLog from './components/VaultLog';
import OnboardingWizard from './components/OnboardingWizard';
import Login from './components/Login';

function App() {
  const { bootComplete, setBootComplete, activeTab, setActiveTab, environments } = useVault();
  const [glitching, setGlitching] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      await getCurrentUser();
      setIsAuthenticated(true);
    } catch {
      setIsAuthenticated(false);
    } finally {
      setCheckingAuth(false);
    }
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleBootComplete = () => {
    setBootComplete();
  };

  const handleTabChange = (tab) => {
    setGlitching(true);
    setTimeout(() => {
      setActiveTab(tab);
      setGlitching(false);
    }, 200);
  };

  // Show loading while checking auth
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-vt-bg-dark flex items-center justify-center">
        <div className="text-vt-green text-2xl">
          &gt; INITIALIZING VAULT-TEC SYSTEMS...
          <span className="cursor ml-2"></span>
        </div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  if (!bootComplete) {
    return <BootSequence onComplete={handleBootComplete} />;
  }

  const tabs = ['ENVIRONMENTS', 'DRIFT MONITOR', 'ONBOARDING', 'VAULT LOG'];

  const statusCounts = environments.reduce((acc, env) => {
    acc[env.status] = (acc[env.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen crt-screen crt-flicker vignette">
      <div className="crt-content">
        <Header />
        
        {/* Drift Alert */}
        <DriftAlert />
        
        {/* Tab Navigation */}
        <nav className="border-b border-vt-border px-6 py-3 sticky top-0 bg-vt-bg-dark z-10">
          <div className="flex gap-6">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`text-xl font-terminal transition-colors ${
                  activeTab === tab
                    ? 'text-vt-green border-b-2 border-vt-green pb-1'
                    : 'text-vt-green-dim hover:text-vt-green'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </nav>

        {/* Content Area */}
        <main className={`p-6 ${glitching ? 'glitch' : ''}`}>
          {activeTab === 'ENVIRONMENTS' && (
            <div>
              {/* Status Summary */}
              <div className="mb-6 flex gap-6 text-lg">
                <span className="text-vt-green">ACTIVE: {statusCounts.ACTIVE || 0}</span>
                <span className="text-vt-blue-ice">FROZEN: {statusCounts.FROZEN || 0}</span>
                <span className="text-vt-amber">STAGING: {statusCounts.STAGING || 0}</span>
                <span className="text-vt-green-dim">ARCHIVED: {statusCounts.ARCHIVED || 0}</span>
              </div>

              {/* Environment Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {environments.map((env) => (
                  <EnvironmentCard key={env.id} environment={env} />
                ))}
              </div>

              {/* Status Footer */}
              <div className="mt-6 border-t border-vt-border pt-4 text-vt-green-dim">
                <div>&gt; System operational. {environments.length} environments tracked.</div>
                <div>&gt; Last drift scan: 2077.10.23 14:30:00 [ALL CLEAR]</div>
              </div>
            </div>
          )}

          {activeTab === 'DRIFT MONITOR' && (
            <DriftMonitor />
          )}

          {activeTab === 'ONBOARDING' && (
            <OnboardingWizard />
          )}

          {activeTab === 'VAULT LOG' && (
            <VaultLog />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
