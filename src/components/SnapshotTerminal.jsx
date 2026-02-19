import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function SnapshotTerminal({ environment, onComplete, onClose }) {
  const [phase, setPhase] = useState(0);
  const [output, setOutput] = useState([]);

  const phases = [
    { message: '> INITIATING VAULT-TEC ENVIRONMENT SCAN...', delay: 500 },
    { message: '> Scanning OS configuration...', delay: 800 },
    { message: '  ✓ OS: Ubuntu 20.04.5 LTS', delay: 600 },
    { message: '  ✓ Kernel: 5.15.0-56-generic', delay: 600 },
    { message: '> Scanning installed packages...', delay: 800 },
    { message: '  ✓ Python 3.8.12', delay: 400 },
    { message: '  ✓ NumPy 1.21.0', delay: 400 },
    { message: '  ✓ SciPy 1.7.3', delay: 400 },
    { message: '  ✓ 139 additional packages catalogued', delay: 600 },
    { message: '> Scanning running services...', delay: 800 },
    { message: '  ✓ SSHD active (8.2p1)', delay: 400 },
    { message: '  ✓ Docker active (20.10.21)', delay: 400 },
    { message: '> Scanning drivers...', delay: 800 },
    { message: '  ✓ NVIDIA Driver 470.161.03', delay: 400 },
    { message: '  ✓ CUDA 11.4', delay: 400 },
    { message: '> Computing disk image hash...', delay: 1000 },
    { message: '  ✓ Hash: 7f3a9b2c1e4d5f6a8b9c0d1e2f3a4b5c', delay: 600 },
    { message: '', delay: 300 },
    { message: '═══════════════════════════════════════', delay: 200 },
    { message: 'SNAPSHOT CAPTURED SUCCESSFULLY', delay: 200 },
    { message: 'Components: 142 | Verified: ✓', delay: 200 },
    { message: `Timestamp: ${new Date().toISOString().replace('T', ' ').slice(0, 19)}`, delay: 200 },
    { message: '═══════════════════════════════════════', delay: 1000 }
  ];

  useEffect(() => {
    if (phase < phases.length) {
      const timer = setTimeout(() => {
        setOutput(prev => [...prev, phases[phase].message]);
        setPhase(phase + 1);
      }, phases[phase].delay);

      return () => clearTimeout(timer);
    } else {
      // Snapshot complete
      setTimeout(() => {
        onComplete();
      }, 1500);
    }
  }, [phase]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
      <div className="card-glow bg-vt-bg-dark p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="text-xl text-vt-green">
            SNAPSHOT: {environment.labName}
          </div>
          <button
            onClick={onClose}
            className="text-vt-green-dim hover:text-vt-green"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="border border-vt-border p-4 bg-vt-bg-card font-mono text-sm">
          {output.map((line, index) => (
            <div
              key={index}
              className={`${
                line.includes('✓') ? 'text-vt-green' :
                line.includes('SNAPSHOT CAPTURED') ? 'text-vt-green font-bold' :
                line.includes('═') ? 'text-vt-green' :
                'text-vt-green-dim'
              }`}
            >
              {line || '\u00A0'}
            </div>
          ))}
          {phase < phases.length && <span className="cursor"></span>}
        </div>

        {phase >= phases.length && (
          <div className="mt-4 text-center">
            <button
              onClick={onComplete}
              className="px-6 py-2 border border-vt-green text-vt-green hover:bg-vt-green hover:text-vt-bg-dark transition-colors"
            >
              [CLOSE]
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
