import { X } from 'lucide-react';

export default function FreezeModal({ environment, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
      <div className="card-glow bg-vt-bg-dark p-6 max-w-2xl w-full border-2 border-vt-blue-ice">
        <div className="flex items-center justify-between mb-4">
          <div className="text-2xl text-vt-blue-ice">
            ❄ INITIATE CONTAINMENT PROTOCOL?
          </div>
          <button
            onClick={onCancel}
            className="text-vt-green-dim hover:text-vt-green"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <div className="text-vt-green">
            This will lock environment <span className="text-vt-blue-ice font-bold">{environment.labName}</span>.
          </div>

          <div className="border-l-4 border-vt-blue-ice pl-4 text-vt-green-dim">
            <div className="mb-2">Once frozen, the following restrictions apply:</div>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>All configuration modifications will be blocked</li>
              <li>Package installations and updates will be prevented</li>
              <li>Service configuration changes will be denied</li>
              <li>Drift detection will trigger emergency alerts</li>
              <li>Principal Investigator override required to unfreeze</li>
            </ul>
          </div>

          <div className="bg-vt-bg-card border border-vt-border p-3">
            <div className="text-vt-green-dim text-sm mb-2">Current Environment Status:</div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Experiment: <span className="text-vt-green">{environment.experimentId}</span></div>
              <div>Researcher: <span className="text-vt-green">{environment.researcher.name}</span></div>
              <div>Last Snapshot: <span className="text-vt-green">{environment.lastSnapshotAt || 'None'}</span></div>
              <div>Drift Score: <span className="text-vt-green">{environment.driftScore}/100</span></div>
            </div>
          </div>

          {!environment.lastSnapshotAt && (
            <div className="border border-vt-amber text-vt-amber p-3 text-sm">
              ⚠ WARNING: No snapshot exists for this environment. 
              It is recommended to capture a snapshot before freezing.
            </div>
          )}
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-6 py-2 border border-vt-green-dim text-vt-green-dim hover:bg-vt-green-dim hover:text-vt-bg-dark transition-colors"
          >
            [CANCEL]
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 border-2 border-vt-blue-ice text-vt-blue-ice hover:bg-vt-blue-ice hover:text-vt-bg-dark transition-colors font-bold"
          >
            [ENGAGE CONTAINMENT]
          </button>
        </div>
      </div>
    </div>
  );
}
