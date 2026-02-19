import { useState } from 'react';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { useVault } from '../context/VaultContext';

export default function DriftMonitor() {
  const { environments, driftEvents } = useVault();
  const [selectedEnv, setSelectedEnv] = useState(null);

  const activeEnvironments = environments.filter(env => env.status !== 'ARCHIVED');

  const getEnvDriftEvents = (envId) => {
    return driftEvents.filter(event => event.environmentId === envId && !event.resolved);
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'CRITICAL': return <AlertTriangle className="text-vt-red w-5 h-5" />;
      case 'WARNING': return <AlertTriangle className="text-vt-amber w-5 h-5" />;
      case 'INFO': return <Info className="text-vt-green w-5 h-5" />;
      default: return null;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'CRITICAL': return 'text-vt-red';
      case 'WARNING': return 'text-vt-amber';
      case 'INFO': return 'text-vt-green';
      default: return 'text-vt-green';
    }
  };

  const getDriftBarColor = (score) => {
    if (score === 0) return 'bg-vt-green';
    if (score <= 25) return 'bg-vt-green';
    if (score <= 60) return 'bg-vt-amber';
    return 'bg-vt-red';
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl text-vt-green mb-2">&gt; DRIFT MONITOR — Global Overview</h2>
        <div className="text-vt-green-dim">Real-time configuration drift detection across all environments</div>
      </div>

      {/* Global Drift List */}
      <div className="space-y-4 mb-8">
        {activeEnvironments.map((env) => {
          const envDrift = getEnvDriftEvents(env.id);
          const criticalCount = envDrift.filter(e => e.severity === 'CRITICAL').length;
          const warningCount = envDrift.filter(e => e.severity === 'WARNING').length;
          const infoCount = envDrift.filter(e => e.severity === 'INFO').length;

          return (
            <div
              key={env.id}
              className={`card-glow bg-vt-bg-card p-4 cursor-pointer transition-all ${
                selectedEnv === env.id ? 'border-vt-green' : ''
              }`}
              onClick={() => setSelectedEnv(selectedEnv === env.id ? null : env.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xl text-vt-green">{env.labName}</span>
                    {env.status === 'FROZEN' && (
                      <span className="px-2 py-0.5 border border-vt-blue-ice text-vt-blue-ice text-sm">
                        FROZEN
                      </span>
                    )}
                  </div>

                  {/* Drift Score Bar */}
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="h-3 bg-vt-bg-dark border border-vt-border">
                        <div
                          className={`h-full ${getDriftBarColor(env.driftScore)}`}
                          style={{ width: `${env.driftScore}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className={`text-lg font-bold ${
                      env.driftScore === 0 ? 'text-vt-green' :
                      env.driftScore <= 25 ? 'text-vt-green' :
                      env.driftScore <= 60 ? 'text-vt-amber' : 'text-vt-red'
                    }`}>
                      {env.driftScore}/100
                    </div>
                  </div>
                </div>

                <div className="ml-6 flex items-center gap-4 text-sm">
                  {env.driftScore === 0 ? (
                    <div className="flex items-center gap-2 text-vt-green">
                      <CheckCircle className="w-5 h-5" />
                      <span>[CLEAN]</span>
                    </div>
                  ) : (
                    <>
                      {criticalCount > 0 && (
                        <span className="text-vt-red">{criticalCount} CRITICAL</span>
                      )}
                      {warningCount > 0 && (
                        <span className="text-vt-amber">{warningCount} WARNING</span>
                      )}
                      {infoCount > 0 && (
                        <span className="text-vt-green">{infoCount} INFO</span>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Expanded Drift Detail */}
              {selectedEnv === env.id && envDrift.length > 0 && (
                <div className="mt-4 pt-4 border-t border-vt-border">
                  <div className="text-vt-green mb-3">═══ DRIFT DETAIL ═══</div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-vt-border text-vt-green-dim">
                          <th className="text-left py-2 px-2">PARAMETER</th>
                          <th className="text-left py-2 px-2">EXPECTED</th>
                          <th className="text-left py-2 px-2">ACTUAL</th>
                          <th className="text-left py-2 px-2">SEVERITY</th>
                          <th className="text-left py-2 px-2">DETECTED</th>
                        </tr>
                      </thead>
                      <tbody>
                        {envDrift.map((drift) => (
                          <tr
                            key={drift.id}
                            className={`border-b border-vt-border ${
                              drift.severity === 'CRITICAL' ? 'bg-vt-red-glow' :
                              drift.severity === 'WARNING' ? 'bg-vt-green-glow' : ''
                            }`}
                          >
                            <td className="py-2 px-2 text-vt-green">{drift.parameter}</td>
                            <td className="py-2 px-2 text-vt-green-dim">{drift.expectedValue}</td>
                            <td className="py-2 px-2 text-vt-amber">{drift.actualValue}</td>
                            <td className="py-2 px-2">
                              <div className="flex items-center gap-2">
                                {getSeverityIcon(drift.severity)}
                                <span className={getSeverityColor(drift.severity)}>
                                  {drift.severity}
                                </span>
                              </div>
                            </td>
                            <td className="py-2 px-2 text-vt-green-dim">{drift.detectedAt}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <button className="px-4 py-1 border border-vt-green text-vt-green hover:bg-vt-green hover:text-vt-bg-dark transition-colors text-sm">
                      [RESOLVE ALL]
                    </button>
                    <button className="px-4 py-1 border border-vt-amber text-vt-amber hover:bg-vt-amber hover:text-vt-bg-dark transition-colors text-sm">
                      [REVERT CHANGES]
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Drift Timeline */}
      <div className="card-glow bg-vt-bg-card p-4">
        <div className="text-xl text-vt-green mb-4">═══ DRIFT TIMELINE ═══</div>
        <div className="space-y-2 font-mono text-sm">
          {driftEvents.slice().reverse().map((event) => {
            const env = environments.find(e => e.id === event.environmentId);
            return (
              <div key={event.id} className="flex items-start gap-3">
                <span className="text-vt-green-dim">[{event.detectedAt}]</span>
                <div className="flex items-center gap-2">
                  {getSeverityIcon(event.severity)}
                  <span className={getSeverityColor(event.severity)}>
                    {env?.labName}: {event.parameter} changed {event.expectedValue}→{event.actualValue}
                  </span>
                </div>
              </div>
            );
          })}
          <div className="flex items-start gap-3">
            <span className="text-vt-green-dim">[2077.10.22 14:00]</span>
            <span className="text-vt-green">Scheduled scan: ALL CLEAR</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-vt-green-dim">[2077.10.20 09:30]</span>
            <span className="text-vt-green">Snapshot verified: MATCH</span>
          </div>
        </div>
      </div>
    </div>
  );
}
