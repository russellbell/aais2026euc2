import { useState, useEffect } from 'react';
import { Play, X } from 'lucide-react';
import { useVault } from '../context/VaultContext';

export default function DemoMode() {
  const [isRunning, setIsRunning] = useState(false);
  const [step, setStep] = useState(0);
  const [message, setMessage] = useState('');
  const { setActiveTab, updateEnvironment, addDriftEvent, addLogEntry } = useVault();

  const demoSteps = [
    {
      message: 'Initializing demo scenario...',
      action: () => setActiveTab('ENVIRONMENTS'),
      delay: 2000
    },
    {
      message: 'Monitoring Lab West Tek 12 (ACTIVE)...',
      action: () => {},
      delay: 2000
    },
    {
      message: 'Simulating unauthorized package update...',
      action: () => {
        const now = new Date();
        const timestamp = `2077.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
        
        // Update drift score
        updateEnvironment('env-westtek-12', { driftScore: 45 });

        // Add new drift event
        addDriftEvent({
          id: `drift-demo-${Date.now()}`,
          environmentId: 'env-westtek-12',
          detectedAt: timestamp,
          severity: 'CRITICAL',
          parameter: 'python3.tensorflow.version',
          expectedValue: '2.8.0',
          actualValue: '2.11.0',
          category: 'package',
          resolved: false
        });

        // Add log entry
        addLogEntry({
          id: `log-demo-${Date.now()}`,
          timestamp,
          actor: 'SYSTEM',
          environmentId: 'env-westtek-12',
          action: 'DRIFT_DETECTED',
          details: 'CRITICAL drift detected: TensorFlow version changed 2.8.0→2.11.0',
          severity: 'critical'
        });
      },
      delay: 3000
    },
    {
      message: 'DRIFT DETECTED! Emergency alert triggered.',
      action: () => {},
      delay: 2000
    },
    {
      message: 'Navigating to Drift Monitor...',
      action: () => setActiveTab('DRIFT MONITOR'),
      delay: 2000
    },
    {
      message: 'Demo complete. Investigate the drift details above.',
      action: () => {},
      delay: 3000
    }
  ];

  useEffect(() => {
    if (isRunning && step < demoSteps.length) {
      const currentStep = demoSteps[step];
      setMessage(currentStep.message);
      
      const timer = setTimeout(() => {
        currentStep.action();
        setStep(step + 1);
      }, currentStep.delay);

      return () => clearTimeout(timer);
    } else if (isRunning && step >= demoSteps.length) {
      setTimeout(() => {
        setIsRunning(false);
        setStep(0);
        setMessage('');
      }, 2000);
    }
  }, [isRunning, step]);

  const startDemo = () => {
    setIsRunning(true);
    setStep(0);
  };

  const stopDemo = () => {
    setIsRunning(false);
    setStep(0);
    setMessage('');
  };

  return (
    <>
      {!isRunning ? (
        <button
          onClick={startDemo}
          className="flex items-center gap-2 px-4 py-2 border-2 border-vt-amber text-vt-amber hover:bg-vt-amber hover:text-vt-bg-dark transition-colors"
        >
          <Play className="w-4 h-4" />
          [DEMO MODE]
        </button>
      ) : (
        <div className="fixed top-24 right-8 z-[60] bg-vt-bg-dark p-6 max-w-lg border-4 border-vt-amber shadow-[0_0_30px_rgba(255,176,0,0.5)]">
          <div className="flex items-start justify-between mb-3">
            <div className="text-vt-amber font-bold text-xl">⚡ DEMO MODE ACTIVE ⚡</div>
            <button
              onClick={stopDemo}
              className="text-vt-amber hover:text-vt-green transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="text-vt-green text-lg mb-3 min-h-[60px]">
            &gt; {message}
            <span className="cursor ml-1"></span>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-vt-amber text-sm">
              Step {step + 1} of {demoSteps.length}
            </div>
            <div className="h-2 w-32 bg-vt-bg-card border border-vt-amber">
              <div 
                className="h-full bg-vt-amber transition-all duration-300"
                style={{ width: `${((step + 1) / demoSteps.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
