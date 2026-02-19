import { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useVault } from '../context/VaultContext';

export default function DriftAlert() {
  const { environments, driftEvents, setActiveTab } = useVault();
  const [visible, setVisible] = useState(false);
  const [alertData, setAlertData] = useState(null);

  useEffect(() => {
    // Check for drift on frozen environments
    const frozenWithDrift = environments.find(env => 
      env.status === 'FROZEN' && 
      env.driftScore > 0 &&
      driftEvents.some(drift => drift.environmentId === env.id && !drift.resolved)
    );

    if (frozenWithDrift) {
      const envDrift = driftEvents.filter(d => d.environmentId === frozenWithDrift.id && !d.resolved);
      const criticalCount = envDrift.filter(d => d.severity === 'CRITICAL').length;
      
      setAlertData({
        environment: frozenWithDrift,
        driftCount: envDrift.length,
        criticalCount,
        severity: criticalCount > 0 ? 'CRITICAL' : 'WARNING'
      });
      setVisible(true);
    }
  }, [environments, driftEvents]);

  const handleInvestigate = () => {
    setActiveTab('DRIFT MONITOR');
    setVisible(false);
  };

  const handleDismiss = () => {
    setVisible(false);
  };

  if (!visible || !alertData) return null;

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl px-4">
      <div className={`border-2 ${
        alertData.severity === 'CRITICAL' ? 'border-vt-red' : 'border-vt-amber'
      } bg-vt-bg-dark p-4 shadow-lg animate-pulse`}>
        <div className="flex items-start gap-4">
          <AlertTriangle className={`w-8 h-8 ${
            alertData.severity === 'CRITICAL' ? 'text-vt-red' : 'text-vt-amber'
          }`} />
          
          <div className="flex-1">
            <div className={`text-xl mb-2 ${
              alertData.severity === 'CRITICAL' ? 'text-vt-red' : 'text-vt-amber'
            }`}>
              ⚠ VAULT-TEC EMERGENCY BROADCAST ⚠
            </div>
            
            <div className="text-vt-green mb-2">
              DRIFT DETECTED: {alertData.environment.labName}
            </div>
            
            <div className="text-vt-green-dim text-sm mb-3">
              Severity: {alertData.severity} | Score: {alertData.environment.driftScore}/100 | 
              {alertData.criticalCount > 0 && ` ${alertData.criticalCount} CRITICAL |`}
              {` ${alertData.driftCount} total changes detected`}
            </div>

            <div className="text-vt-amber text-sm mb-3 border-l-2 border-vt-amber pl-3">
              ⚠ PROTOCOL VIOLATION: Environment [{alertData.environment.labName}] is under 
              containment lockdown. Configuration changes detected without authorization.
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleInvestigate}
                className="px-4 py-1 border border-vt-green text-vt-green hover:bg-vt-green hover:text-vt-bg-dark transition-colors"
              >
                [INVESTIGATE]
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-1 border border-vt-green-dim text-vt-green-dim hover:bg-vt-green-dim hover:text-vt-bg-dark transition-colors"
              >
                [DISMISS]
              </button>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="text-vt-green-dim hover:text-vt-green"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
