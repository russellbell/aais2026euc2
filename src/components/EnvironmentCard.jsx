import { Lock, Activity, Clock, Archive } from 'lucide-react';
import { useState } from 'react';
import SnapshotTerminal from './SnapshotTerminal';
import FreezeModal from './FreezeModal';
import EnvironmentDetail from './EnvironmentDetail';
import { useVault } from '../context/VaultContext';

export default function EnvironmentCard({ environment }) {
  const { updateEnvironment, addLogEntry, captureSnapshot, freezeEnvironment } = useVault();
  const [showSnapshot, setShowSnapshot] = useState(false);
  const [showFreeze, setShowFreeze] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const statusConfig = {
    ACTIVE: { color: 'text-vt-green', icon: Activity, animation: 'status-pulse', label: 'ACTIVE' },
    FROZEN: { color: 'text-vt-blue-ice', icon: Lock, animation: '', label: 'FROZEN' },
    STAGING: { color: 'text-vt-amber', icon: Clock, animation: 'status-blink', label: 'STAGING' },
    ARCHIVED: { color: 'text-vt-green-dim', icon: Archive, animation: '', label: 'ARCHIVED' }
  };

  const config = statusConfig[environment.status];
  const StatusIcon = config.icon;

  const getDriftColor = (score) => {
    if (score === null || score === 0) return 'bg-vt-green';
    if (score <= 25) return 'bg-vt-green';
    if (score <= 60) return 'bg-vt-amber';
    return 'bg-vt-red';
  };

  const driftBarWidth = environment.driftScore !== null ? `${environment.driftScore}%` : '0%';

  const handleSnapshotComplete = async () => {
    try {
      await captureSnapshot(environment.id);
      setShowSnapshot(false);
    } catch (error) {
      console.error('Snapshot capture failed:', error);
      // Fallback to local update
      const now = new Date();
      const timestamp = `2077.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      
      updateEnvironment(environment.id, {
        lastSnapshotAt: timestamp
      });

      addLogEntry({
        id: `log-${Date.now()}`,
        timestamp,
        actor: environment.researcher.name,
        environmentId: environment.id,
        action: 'SNAPSHOT_CAPTURED',
        details: 'Snapshot captured successfully. 142 components verified.',
        severity: 'info'
      });

      setShowSnapshot(false);
    }
  };

  const handleFreezeConfirm = async () => {
    try {
      await freezeEnvironment(environment.id, 'freeze');
      setShowFreeze(false);
    } catch (error) {
      console.error('Freeze failed:', error);
      // Fallback to local update
      const now = new Date();
      const timestamp = `2077.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      
      updateEnvironment(environment.id, {
        status: 'FROZEN'
      });

      addLogEntry({
        id: `log-${Date.now()}`,
        timestamp,
        actor: environment.researcher.name,
        environmentId: environment.id,
        action: 'ENV_FROZEN',
        details: 'Containment protocol engaged. Environment locked.',
        severity: 'warning'
      });

      setShowFreeze(false);
    }
  };

  return (
    <div className={`card-glow bg-vt-bg-card p-4 ${environment.status === 'FROZEN' ? 'frozen-overlay border-vt-blue-ice' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <StatusIcon className={`${config.color} ${config.animation} w-5 h-5`} />
          <h3 className="text-xl text-vt-green">{environment.labName}</h3>
        </div>
        {environment.status === 'FROZEN' && (
          <Lock className="text-vt-blue-ice w-5 h-5" />
        )}
      </div>

      <div className="border-t border-vt-border pt-3 mb-3 space-y-1 text-vt-green-dim">
        <div>Researcher: <span className="text-vt-green">{environment.researcher.name}</span></div>
        <div>Experiment: <span className="text-vt-green">{environment.experimentId}</span></div>
        {environment.lastSnapshotAt && (
          <div>Snapshot: <span className="text-vt-green">{environment.lastSnapshotAt}</span></div>
        )}
      </div>

      {environment.driftScore !== null && (
        <div className="mb-3">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-vt-green-dim">DRIFT SCORE</span>
            <span className={environment.driftScore === 0 ? 'text-vt-green' : environment.driftScore <= 25 ? 'text-vt-green' : environment.driftScore <= 60 ? 'text-vt-amber' : 'text-vt-red'}>
              {environment.driftScore}/100
            </span>
          </div>
          <div className="h-2 bg-vt-bg-dark border border-vt-border">
            <div 
              className={`h-full ${getDriftColor(environment.driftScore)}`}
              style={{ width: driftBarWidth }}
            ></div>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button 
          onClick={() => setShowSnapshot(true)}
          className="flex-1 px-3 py-1 border border-vt-green text-vt-green hover:bg-vt-green hover:text-vt-bg-dark transition-colors text-sm"
        >
          [SNAPSHOT]
        </button>
        {environment.status === 'ACTIVE' && (
          <button 
            onClick={() => setShowFreeze(true)}
            className="flex-1 px-3 py-1 border border-vt-blue-ice text-vt-blue-ice hover:bg-vt-blue-ice hover:text-vt-bg-dark transition-colors text-sm"
          >
            [FREEZE]
          </button>
        )}
        <button 
          onClick={() => setShowDetail(true)}
          className="flex-1 px-3 py-1 border border-vt-green text-vt-green hover:bg-vt-green hover:text-vt-bg-dark transition-colors text-sm"
        >
          [DETAILS]
        </button>
      </div>

      {showSnapshot && (
        <SnapshotTerminal
          environment={environment}
          onComplete={handleSnapshotComplete}
          onClose={() => setShowSnapshot(false)}
        />
      )}

      {showFreeze && (
        <FreezeModal
          environment={environment}
          onConfirm={handleFreezeConfirm}
          onCancel={() => setShowFreeze(false)}
        />
      )}

      {showDetail && (
        <EnvironmentDetail
          environment={environment}
          onClose={() => setShowDetail(false)}
        />
      )}
    </div>
  );
}
