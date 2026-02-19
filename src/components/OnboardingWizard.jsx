import { useState } from 'react';
import { ChevronRight, ChevronLeft, CheckCircle, AlertTriangle } from 'lucide-react';
import { useVault } from '../context/VaultContext';

export default function OnboardingWizard() {
  const { environments, addLogEntry, updateEnvironment } = useVault();
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedEnv, setSelectedEnv] = useState(null);
  const [newResearcher, setNewResearcher] = useState({ name: '', role: '' });
  const [acknowledged, setAcknowledged] = useState(false);
  const [provisioning, setProvisioning] = useState(false);
  const [provisioningComplete, setProvisioningComplete] = useState(false);

  const availableEnvironments = environments.filter(
    env => env.status === 'ACTIVE' || env.status === 'FROZEN'
  );

  const selectedEnvironment = environments.find(env => env.id === selectedEnv);

  const handleNext = () => {
    if (currentStep === 1 && selectedEnv && newResearcher.name && newResearcher.role) {
      setCurrentStep(2);
    } else if (currentStep === 2 && acknowledged) {
      setCurrentStep(3);
      startProvisioning();
    } else if (currentStep === 3 && provisioningComplete) {
      setCurrentStep(4);
      completeOnboarding();
    }
  };

  const handleBack = () => {
    if (currentStep > 1 && currentStep < 4) {
      setCurrentStep(currentStep - 1);
    }
  };

  const startProvisioning = () => {
    setProvisioning(true);
    // Simulate provisioning delay
    setTimeout(() => {
      setProvisioning(false);
      setProvisioningComplete(true);
    }, 5000);
  };

  const completeOnboarding = () => {
    const now = new Date();
    const timestamp = `2077.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    
    addLogEntry({
      id: `log-${Date.now()}`,
      timestamp,
      actor: 'SYSTEM',
      environmentId: selectedEnv,
      action: 'RESEARCHER_ASSIGNED',
      details: `Vault Dweller Orientation complete. ${newResearcher.name} assigned to environment.`,
      severity: 'info'
    });
  };

  const resetWizard = () => {
    setIsActive(false);
    setCurrentStep(1);
    setSelectedEnv(null);
    setNewResearcher({ name: '', role: '' });
    setAcknowledged(false);
    setProvisioning(false);
    setProvisioningComplete(false);
  };

  if (!isActive) {
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-2xl text-vt-green mb-2">&gt; VAULT DWELLER ORIENTATION</h2>
          <div className="text-vt-green-dim">Onboard new researchers to existing environments</div>
        </div>

        <div className="card-glow bg-vt-bg-card p-8 text-center">
          <div className="text-6xl mb-4">⚙</div>
          <div className="text-2xl text-vt-green mb-4">VAULT-TEC RESEARCHER ONBOARDING</div>
          <div className="text-vt-green-dim mb-6 max-w-2xl mx-auto">
            This orientation process will assign a new researcher to an existing environment,
            provide complete briefing materials, and provision secure access credentials.
          </div>
          <button
            onClick={() => setIsActive(true)}
            className="px-8 py-3 border-2 border-vt-green text-vt-green hover:bg-vt-green hover:text-vt-bg-dark transition-colors text-xl"
          >
            [BEGIN VAULT DWELLER ORIENTATION]
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl text-vt-green mb-2">&gt; VAULT DWELLER ORIENTATION</h2>
        <div className="flex items-center gap-2 text-vt-green-dim">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`px-3 py-1 border ${
                currentStep === step ? 'border-vt-green text-vt-green bg-vt-green-glow' :
                currentStep > step ? 'border-vt-green text-vt-green' :
                'border-vt-border text-vt-green-dim'
              }`}>
                STEP {step}/4
              </div>
              {step < 4 && <ChevronRight className="w-4 h-4 mx-1" />}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Vault Assignment */}
      {currentStep === 1 && (
        <div className="card-glow bg-vt-bg-card p-6">
          <div className="text-xl text-vt-green mb-4">STEP 1: VAULT ASSIGNMENT</div>
          
          <div className="mb-6">
            <label className="block text-vt-green mb-2">Select Target Environment:</label>
            <select
              value={selectedEnv || ''}
              onChange={(e) => setSelectedEnv(e.target.value)}
              className="w-full bg-vt-bg-dark border border-vt-border text-vt-green px-4 py-2 focus:outline-none focus:border-vt-green"
            >
              <option value="">-- Select Environment --</option>
              {availableEnvironments.map(env => (
                <option key={env.id} value={env.id}>
                  {env.labName} ({env.status}) - {env.experimentId}
                </option>
              ))}
            </select>
          </div>

          {selectedEnvironment && (
            <div className="mb-6 border border-vt-border p-4 bg-vt-bg-dark">
              <div className="text-vt-green mb-2">Environment Summary:</div>
              <div className="grid grid-cols-2 gap-2 text-sm text-vt-green-dim">
                <div>Lab: <span className="text-vt-green">{selectedEnvironment.labName}</span></div>
                <div>Status: <span className="text-vt-green">{selectedEnvironment.status}</span></div>
                <div>Experiment: <span className="text-vt-green">{selectedEnvironment.experimentId}</span></div>
                <div>Current Researcher: <span className="text-vt-green">{selectedEnvironment.researcher.name}</span></div>
                <div>Drift Score: <span className="text-vt-green">{selectedEnvironment.driftScore}/100</span></div>
                <div>Last Snapshot: <span className="text-vt-green">{selectedEnvironment.lastSnapshotAt || 'None'}</span></div>
              </div>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-vt-green mb-2">New Researcher Name:</label>
            <input
              type="text"
              value={newResearcher.name}
              onChange={(e) => setNewResearcher({ ...newResearcher, name: e.target.value })}
              placeholder="Dr. [Name]"
              className="w-full bg-vt-bg-dark border border-vt-border text-vt-green px-4 py-2 focus:outline-none focus:border-vt-green placeholder-vt-green-dim"
            />
          </div>

          <div className="mb-6">
            <label className="block text-vt-green mb-2">Role:</label>
            <input
              type="text"
              value={newResearcher.role}
              onChange={(e) => setNewResearcher({ ...newResearcher, role: e.target.value })}
              placeholder="Research Scientist"
              className="w-full bg-vt-bg-dark border border-vt-border text-vt-green px-4 py-2 focus:outline-none focus:border-vt-green placeholder-vt-green-dim"
            />
          </div>

          <div className="flex justify-between">
            <button
              onClick={resetWizard}
              className="px-6 py-2 border border-vt-green-dim text-vt-green-dim hover:bg-vt-green-dim hover:text-vt-bg-dark transition-colors"
            >
              [CANCEL]
            </button>
            <button
              onClick={handleNext}
              disabled={!selectedEnv || !newResearcher.name || !newResearcher.role}
              className="px-6 py-2 border border-vt-green text-vt-green hover:bg-vt-green hover:text-vt-bg-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              [NEXT] →
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Environment Briefing */}
      {currentStep === 2 && selectedEnvironment && (
        <div className="card-glow bg-vt-bg-card p-6">
          <div className="text-xl text-vt-green mb-4">STEP 2: ENVIRONMENT BRIEFING</div>
          
          <div className="mb-6">
            <div className="text-vt-green mb-2">Latest Snapshot Data:</div>
            <div className="bg-vt-bg-dark border border-vt-border p-4 font-mono text-sm max-h-64 overflow-y-auto">
              <div className="text-vt-green-dim">&gt; OS: Ubuntu 20.04.5 LTS</div>
              <div className="text-vt-green-dim">&gt; Kernel: 5.15.0-56-generic</div>
              <div className="text-vt-green-dim">&gt; Python: 3.8.12</div>
              <div className="text-vt-green-dim">&gt; NumPy: 1.21.0</div>
              <div className="text-vt-green-dim">&gt; SciPy: 1.7.3</div>
              <div className="text-vt-green-dim">&gt; Total Components: 142</div>
              <div className="text-vt-green">&gt; Status: VERIFIED ✓</div>
            </div>
          </div>

          {selectedEnvironment.constraints.length > 0 && (
            <div className="mb-6 border-2 border-vt-amber p-4 bg-vt-bg-dark">
              <div className="flex items-center gap-2 text-vt-amber mb-3">
                <AlertTriangle className="w-5 h-5" />
                <div className="font-bold">CRITICAL CONSTRAINTS</div>
              </div>
              <ul className="space-y-2">
                {selectedEnvironment.constraints.map((constraint, index) => (
                  <li key={index} className="text-vt-amber text-sm flex items-start gap-2">
                    <span>⚠</span>
                    <span>{constraint}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mb-6">
            <div className="text-vt-green mb-2">Drift History:</div>
            <div className="bg-vt-bg-dark border border-vt-border p-4">
              <div className="text-vt-green-dim text-sm">
                Current Drift Score: <span className="text-vt-green">{selectedEnvironment.driftScore}/100</span>
              </div>
              {selectedEnvironment.driftScore === 0 ? (
                <div className="text-vt-green text-sm mt-2">✓ No drift detected. Environment is clean.</div>
              ) : (
                <div className="text-vt-amber text-sm mt-2">⚠ Active drift detected. Review required.</div>
              )}
            </div>
          </div>

          <div className="mb-6 flex items-start gap-2">
            <input
              type="checkbox"
              id="acknowledge"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              className="mt-1"
            />
            <label htmlFor="acknowledge" className="text-vt-green cursor-pointer">
              I acknowledge that I have reviewed the environment configuration, constraints, and drift status.
              I understand the critical requirements for maintaining this environment.
            </label>
          </div>

          <div className="flex justify-between">
            <button
              onClick={handleBack}
              className="px-6 py-2 border border-vt-green-dim text-vt-green-dim hover:bg-vt-green-dim hover:text-vt-bg-dark transition-colors"
            >
              ← [BACK]
            </button>
            <button
              onClick={handleNext}
              disabled={!acknowledged}
              className="px-6 py-2 border border-vt-green text-vt-green hover:bg-vt-green hover:text-vt-bg-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              [NEXT] →
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Access Provisioning */}
      {currentStep === 3 && (
        <div className="card-glow bg-vt-bg-card p-6">
          <div className="text-xl text-vt-green mb-4">STEP 3: ACCESS PROVISIONING</div>
          
          {!provisioningComplete ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4 animate-spin">⚙</div>
              <div className="text-vt-green text-xl mb-2">
                {provisioning ? 'DEPLOYING VAULT-TEC STANDARD ISSUE WORKSTATION...' : 'INITIALIZING...'}
              </div>
              <div className="text-vt-green-dim text-sm space-y-1">
                <div>&gt; Cloning environment snapshot...</div>
                <div>&gt; Configuring access credentials...</div>
                <div>&gt; Establishing secure connection...</div>
                <div>&gt; Verifying system integrity...</div>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 text-vt-green text-xl mb-6">
                <CheckCircle className="w-6 h-6" />
                <span>WORKSTATION DEPLOYED. ACCESS READY.</span>
              </div>

              <div className="bg-vt-bg-dark border border-vt-border p-4 mb-6">
                <div className="text-vt-green mb-3">Workspace Configuration:</div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="text-vt-green-dim">Bundle: <span className="text-vt-green">VAULT-TEC STANDARD ISSUE</span></div>
                  <div className="text-vt-green-dim">vCPU: <span className="text-vt-green">4 cores</span></div>
                  <div className="text-vt-green-dim">Memory: <span className="text-vt-green">16 GB RAM</span></div>
                  <div className="text-vt-green-dim">Storage: <span className="text-vt-green">100 GB SSD</span></div>
                  <div className="text-vt-green-dim">Workspace ID: <span className="text-vt-green">ws-{selectedEnv?.slice(-8)}</span></div>
                  <div className="text-vt-green-dim">Status: <span className="text-vt-green">AVAILABLE</span></div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleNext}
                  className="px-6 py-2 border border-vt-green text-vt-green hover:bg-vt-green hover:text-vt-bg-dark transition-colors"
                >
                  [COMPLETE ORIENTATION] →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 4: Orientation Complete */}
      {currentStep === 4 && selectedEnvironment && (
        <div className="card-glow bg-vt-bg-card p-6">
          <div className="text-center py-8">
            <div className="text-6xl mb-4">✓</div>
            <div className="text-3xl text-vt-green mb-6">ORIENTATION COMPLETE</div>
            
            <div className="max-w-2xl mx-auto mb-8 bg-vt-bg-dark border border-vt-green p-6">
              <div className="text-xl text-vt-green mb-4">ASSIGNMENT SUMMARY</div>
              <div className="grid grid-cols-2 gap-4 text-left">
                <div className="text-vt-green-dim">Researcher:</div>
                <div className="text-vt-green">{newResearcher.name}</div>
                
                <div className="text-vt-green-dim">Role:</div>
                <div className="text-vt-green">{newResearcher.role}</div>
                
                <div className="text-vt-green-dim">Environment:</div>
                <div className="text-vt-green">{selectedEnvironment.labName}</div>
                
                <div className="text-vt-green-dim">Experiment:</div>
                <div className="text-vt-green">{selectedEnvironment.experimentId}</div>
                
                <div className="text-vt-green-dim">Workspace ID:</div>
                <div className="text-vt-green">ws-{selectedEnv?.slice(-8)}</div>
                
                <div className="text-vt-green-dim">Access Status:</div>
                <div className="text-vt-green">GRANTED ✓</div>
              </div>
            </div>

            <div className="text-vt-green-dim mb-6">
              All orientation materials have been logged to the Vault Log.
              Emergency contacts and support documentation are available in the environment detail panel.
            </div>

            <button
              onClick={resetWizard}
              className="px-8 py-3 border-2 border-vt-green text-vt-green hover:bg-vt-green hover:text-vt-bg-dark transition-colors text-xl"
            >
              [RETURN TO DASHBOARD]
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
