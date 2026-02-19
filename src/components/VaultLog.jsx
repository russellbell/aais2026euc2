import { useState } from 'react';
import { Filter, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { useVault } from '../context/VaultContext';

export default function VaultLog() {
  const { auditLog, environments } = useVault();
  const [filterEnv, setFilterEnv] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="text-vt-red w-4 h-4" />;
      case 'warning': return <AlertTriangle className="text-vt-amber w-4 h-4" />;
      case 'info': return <CheckCircle className="text-vt-green w-4 h-4" />;
      default: return <Info className="text-vt-green w-4 h-4" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-vt-red';
      case 'warning': return 'text-vt-amber';
      case 'info': return 'text-vt-green';
      default: return 'text-vt-green';
    }
  };

  const getActionLabel = (action) => {
    const labels = {
      'SNAPSHOT_CAPTURED': 'SNAPSHOT',
      'ENV_FROZEN': 'FREEZE',
      'ENV_UNFROZEN': 'UNFREEZE',
      'DRIFT_DETECTED': 'DRIFT',
      'DRIFT_RESOLVED': 'RESOLVED',
      'STATE_CHANGED': 'STATE',
      'RESEARCHER_ASSIGNED': 'ASSIGNED',
      'ACCESS_PROVISIONED': 'ACCESS',
      'NOTE_ADDED': 'NOTE'
    };
    return labels[action] || action;
  };

  const filteredLog = auditLog.filter(entry => {
    if (filterEnv !== 'all' && entry.environmentId !== filterEnv) return false;
    if (filterSeverity !== 'all' && entry.severity !== filterSeverity) return false;
    return true;
  });

  const activeFilters = [filterEnv !== 'all', filterSeverity !== 'all'].filter(Boolean).length;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl text-vt-green mb-2">&gt; VAULT LOG — Audit Trail</h2>
        <div className="text-vt-green-dim">Complete system activity log with filtering</div>
      </div>

      {/* Filter Bar */}
      <div className="card-glow bg-vt-bg-card p-4 mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="text-vt-green w-5 h-5" />
            <span className="text-vt-green">FILTERS:</span>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-vt-green-dim text-sm">Environment:</label>
            <select
              value={filterEnv}
              onChange={(e) => setFilterEnv(e.target.value)}
              className="bg-vt-bg-dark border border-vt-border text-vt-green px-3 py-1 focus:outline-none focus:border-vt-green"
            >
              <option value="all">All</option>
              {environments.map(env => (
                <option key={env.id} value={env.id}>{env.labName}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-vt-green-dim text-sm">Severity:</label>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="bg-vt-bg-dark border border-vt-border text-vt-green px-3 py-1 focus:outline-none focus:border-vt-green"
            >
              <option value="all">All</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          {activeFilters > 0 && (
            <>
              <span className="px-2 py-1 bg-vt-green text-vt-bg-dark text-sm">
                {activeFilters} active
              </span>
              <button
                onClick={() => {
                  setFilterEnv('all');
                  setFilterSeverity('all');
                }}
                className="text-vt-green-dim hover:text-vt-green text-sm"
              >
                [CLEAR]
              </button>
            </>
          )}
        </div>
      </div>

      {/* Log Entries */}
      <div className="card-glow bg-vt-bg-card p-4">
        <div className="space-y-3 font-mono text-sm max-h-[600px] overflow-y-auto">
          {filteredLog.map((entry, index) => {
            const env = environments.find(e => e.id === entry.environmentId);
            const isCritical = entry.severity === 'critical' || 
                             (entry.action === 'DRIFT_DETECTED' && env?.status === 'FROZEN');

            return (
              <div
                key={entry.id}
                className={`flex items-start gap-3 pb-3 ${
                  index < filteredLog.length - 1 ? 'border-b border-vt-border' : ''
                } ${isCritical ? 'bg-vt-red-glow p-2 -m-2 mb-1' : ''}`}
              >
                <div className="flex items-center gap-2 min-w-[180px]">
                  <span className="text-vt-green-dim">[{entry.timestamp}]</span>
                </div>

                <div className="flex items-center gap-2 min-w-[100px]">
                  {getSeverityIcon(entry.severity)}
                  <span className={`px-2 py-0.5 border ${
                    entry.severity === 'critical' ? 'border-vt-red text-vt-red' :
                    entry.severity === 'warning' ? 'border-vt-amber text-vt-amber' :
                    'border-vt-green text-vt-green'
                  } text-xs`}>
                    {getActionLabel(entry.action)}
                  </span>
                </div>

                <div className="flex-1">
                  <div className={getSeverityColor(entry.severity)}>
                    {env && <span className="text-vt-green-dim">{env.labName} — </span>}
                    {entry.details}
                  </div>
                  <div className="text-vt-green-dim text-xs mt-1">
                    Actor: {entry.actor}
                  </div>
                </div>

                {isCritical && (
                  <div className="text-vt-red text-xs border border-vt-red px-2 py-1">
                    ⚠ PROTOCOL VIOLATION
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredLog.length === 0 && (
          <div className="text-center text-vt-green-dim py-8">
            NO ENTRIES MATCH CURRENT FILTERS
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="mt-4 text-vt-green-dim text-sm">
        &gt; Showing {filteredLog.length} of {auditLog.length} total entries
      </div>
    </div>
  );
}
