import { X, Lock, Activity, Clock, Archive, Server, HardDrive } from 'lucide-react';
import { MOCK_SNAPSHOTS } from '../data/mockData';

export default function EnvironmentDetail({ environment, onClose }) {
  const snapshots = MOCK_SNAPSHOTS[environment.id] || [];
  const latestSnapshot = snapshots[0];

  const statusConfig = {
    ACTIVE: { color: 'text-vt-green', icon: Activity, label: 'ACTIVE' },
    FROZEN: { color: 'text-vt-blue-ice', icon: Lock, label: 'FROZEN' },
    STAGING: { color: 'text-vt-amber', icon: Clock, label: 'STAGING' },
    ARCHIVED: { color: 'text-vt-green-dim', icon: Archive, label: 'ARCHIVED' }
  };

  const config = statusConfig[environment.status];
  const StatusIcon = config.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="card-glow bg-vt-bg-dark p-6 max-w-5xl w-full my-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6 pb-4 border-b-2 border-vt-green">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <StatusIcon className={`${config.color} w-6 h-6`} />
              <h2 className="text-3xl text-vt-green">{environment.labName}</h2>
              {environment.status === 'FROZEN' && (
                <span className="px-3 py-1 border-2 border-vt-blue-ice text-vt-blue-ice">
                  FROZEN
                </span>
              )}
            </div>
            <div className="text-vt-green-dim">{environment.facility}</div>
          </div>
          <button
            onClick={onClose}
            className="text-vt-green-dim hover:text-vt-green"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="border border-vt-border p-4 bg-vt-bg-card">
              <div className="text-xl text-vt-green mb-3">ENVIRONMENT INFO</div>
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-vt-green-dim">Experiment ID:</span>
                  <span className="text-vt-green">{environment.experimentId}</span>
                  
                  <span className="text-vt-green-dim">Experiment:</span>
                  <span className="text-vt-green">{environment.experimentName}</span>
                  
                  <span className="text-vt-green-dim">Researcher:</span>
                  <span className="text-vt-green">{environment.researcher.name}</span>
                  
                  <span className="text-vt-green-dim">Role:</span>
                  <span className="text-vt-green">{environment.researcher.role}</span>
                  
                  <span className="text-vt-green-dim">Created:</span>
                  <span className="text-vt-green">{environment.createdAt}</span>
                  
                  <span className="text-vt-green-dim">Last Snapshot:</span>
                  <span className="text-vt-green">{environment.lastSnapshotAt || 'None'}</span>
                  
                  <span className="text-vt-green-dim">Drift Score:</span>
                  <span className={
                    environment.driftScore === 0 ? 'text-vt-green' :
                    environment.driftScore <= 25 ? 'text-vt-green' :
                    environment.driftScore <= 60 ? 'text-vt-amber' : 'text-vt-red'
                  }>
                    {environment.driftScore}/100
                  </span>
                </div>
              </div>
            </div>

            {/* CloudFormation */}
            {environment.cloudformationStackName && (
              <div className="border border-vt-border p-4 bg-vt-bg-card">
                <div className="flex items-center gap-2 text-xl text-vt-green mb-3">
                  <Server className="w-5 h-5" />
                  <span>CLOUDFORMATION STACK</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-vt-green-dim">Stack Name:</span>
                    <span className="text-vt-green">{environment.cloudformationStackName}</span>
                    
                    <span className="text-vt-green-dim">Status:</span>
                    <span className="text-vt-green">{environment.cloudformationStackStatus}</span>
                    
                    <span className="text-vt-green-dim">Resources:</span>
                    <span className="text-vt-green">12 resources</span>
                  </div>
                </div>
              </div>
            )}

            {/* WorkSpaces */}
            {environment.workspaceId && (
              <div className="border border-vt-border p-4 bg-vt-bg-card">
                <div className="flex items-center gap-2 text-xl text-vt-green mb-3">
                  <HardDrive className="w-5 h-5" />
                  <span>WORKSPACES</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-vt-green-dim">Workspace ID:</span>
                    <span className="text-vt-green">{environment.workspaceId}</span>
                    
                    <span className="text-vt-green-dim">Connection:</span>
                    <span className="text-vt-green">AVAILABLE</span>
                    
                    <span className="text-vt-green-dim">Bundle:</span>
                    <span className="text-vt-green">Standard (4 vCPU, 16GB)</span>
                  </div>
                </div>
              </div>
            )}

            {/* Constraints */}
            {environment.constraints.length > 0 && (
              <div className="border-2 border-vt-amber p-4 bg-vt-bg-card">
                <div className="text-xl text-vt-amber mb-3">⚠ CRITICAL CONSTRAINTS</div>
                <ul className="space-y-2">
                  {environment.constraints.map((constraint, index) => (
                    <li key={index} className="text-vt-amber text-sm flex items-start gap-2">
                      <span className="mt-1">⚠</span>
                      <span>{constraint}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Latest Snapshot */}
            {latestSnapshot && (
              <div className="border border-vt-border p-4 bg-vt-bg-card">
                <div className="text-xl text-vt-green mb-3">LATEST SNAPSHOT</div>
                <div className="bg-vt-bg-dark border border-vt-border p-3 font-mono text-xs max-h-96 overflow-y-auto">
                  <div className="text-vt-green-dim mb-2">
                    Captured: {latestSnapshot.capturedAt} by {latestSnapshot.capturedBy}
                  </div>
                  <div className="text-vt-green-dim mb-1">&gt; OS Configuration:</div>
                  <div className="text-vt-green ml-4">  {latestSnapshot.osVersion}</div>
                  <div className="text-vt-green ml-4">  Kernel: {latestSnapshot.kernelVersion}</div>
                  
                  <div className="text-vt-green-dim mt-3 mb-1">&gt; Installed Packages:</div>
                  {latestSnapshot.packages.map((pkg, idx) => (
                    <div key={idx} className="text-vt-green ml-4">
                      ✓ {pkg.name} {pkg.version}
                    </div>
                  ))}
                  
                  <div className="text-vt-green-dim mt-3 mb-1">&gt; Running Services:</div>
                  {latestSnapshot.services.map((svc, idx) => (
                    <div key={idx} className="text-vt-green ml-4">
                      ✓ {svc.name} ({svc.status}) - {svc.version}
                    </div>
                  ))}
                  
                  {latestSnapshot.drivers.length > 0 && (
                    <>
                      <div className="text-vt-green-dim mt-3 mb-1">&gt; Drivers:</div>
                      {latestSnapshot.drivers.map((drv, idx) => (
                        <div key={idx} className="text-vt-green ml-4">
                          ✓ {drv.name} {drv.version}
                        </div>
                      ))}
                    </>
                  )}
                  
                  <div className="text-vt-green-dim mt-3 mb-1">&gt; Environment Variables:</div>
                  {Object.entries(latestSnapshot.environmentVariables).map(([key, value]) => (
                    <div key={key} className="text-vt-green ml-4">
                      {key}={value}
                    </div>
                  ))}
                  
                  <div className="text-vt-green-dim mt-3 mb-1">&gt; Disk Image:</div>
                  <div className="text-vt-green ml-4">Hash: {latestSnapshot.diskImageHash}</div>
                  
                  <div className="text-vt-green mt-3">
                    ═══════════════════════════════════════
                  </div>
                  <div className="text-vt-green">
                    Total Components: {latestSnapshot.totalComponents}
                  </div>
                  <div className="text-vt-green">
                    Verified: {latestSnapshot.verified ? '✓' : '✗'}
                  </div>
                </div>
              </div>
            )}

            {/* Snapshot History */}
            {snapshots.length > 0 && (
              <div className="border border-vt-border p-4 bg-vt-bg-card">
                <div className="text-xl text-vt-green mb-3">SNAPSHOT HISTORY</div>
                <div className="space-y-3">
                  {snapshots.map((snapshot, index) => (
                    <div key={snapshot.id} className="border-l-2 border-vt-green pl-3">
                      <div className="text-vt-green text-sm">{snapshot.capturedAt}</div>
                      <div className="text-vt-green-dim text-xs">
                        By: {snapshot.capturedBy} | Components: {snapshot.totalComponents} | 
                        Hash: {snapshot.diskImageHash.slice(0, 8)}...
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Researcher's Log */}
            <div className="border border-vt-border p-4 bg-vt-bg-card">
              <div className="text-xl text-vt-green mb-3">RESEARCHER'S LOG</div>
              <div className="space-y-3 text-sm">
                <div className="border-l-2 border-vt-green pl-3">
                  <div className="text-vt-green-dim text-xs mb-1">2077.10.20 14:30 - {environment.researcher.name}</div>
                  <div className="text-vt-green">
                    Initial baseline established. All systems nominal. Ready for experiment phase 2.
                  </div>
                </div>
                <div className="border-l-2 border-vt-green pl-3">
                  <div className="text-vt-green-dim text-xs mb-1">2077.10.15 09:00 - {environment.researcher.name}</div>
                  <div className="text-vt-green">
                    Environment configured per protocol. Dependencies verified against requirements.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-vt-border flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-vt-green text-vt-green hover:bg-vt-green hover:text-vt-bg-dark transition-colors"
          >
            [CLOSE]
          </button>
        </div>
      </div>
    </div>
  );
}
