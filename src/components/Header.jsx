import { useVault } from '../context/VaultContext';
import { signOut } from 'aws-amplify/auth';
import { LogOut } from 'lucide-react';
import DemoMode from './DemoMode';

export default function Header() {
  const { simulationMode } = useVault();
  
  const now = new Date();
  const falloutDate = `2077.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

  const handleLogout = async () => {
    try {
      await signOut();
      window.location.reload();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="border-b-2 border-vt-green px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-vt-green font-terminal">
            ═══ VAULT-TEC ENVIRONMENT CONTROL SYSTEM ═══
          </h1>
        </div>
        <div className="flex items-center gap-4 text-lg">
          <DemoMode />
          <span className="text-vt-green-dim">{falloutDate}</span>
          {simulationMode && (
            <span className="px-3 py-1 border border-vt-amber text-vt-amber text-sm">
              [SIMULATION MODE]
            </span>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-1 border border-vt-green-dim text-vt-green-dim hover:border-vt-green hover:text-vt-green transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">[LOGOUT]</span>
          </button>
        </div>
      </div>
    </header>
  );
}
