import { useState } from 'react';
import { signIn, signUp, confirmSignUp } from 'aws-amplify/auth';
import { AlertTriangle } from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const [mode, setMode] = useState('signin'); // 'signin', 'signup', 'confirm'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn({ username, password });
      onLoginSuccess();
    } catch (err) {
      console.error('Sign in error:', err);
      setError(err.message || 'VAULT-TEC SYSTEMS ERROR: Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signUp({
        username,
        password,
        options: {
          userAttributes: {
            email
          }
        }
      });
      setMode('confirm');
      setError('');
    } catch (err) {
      console.error('Sign up error:', err);
      setError(err.message || 'VAULT-TEC SYSTEMS ERROR: Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await confirmSignUp({ username, confirmationCode });
      setMode('signin');
      setError('');
    } catch (err) {
      console.error('Confirmation error:', err);
      setError(err.message || 'VAULT-TEC SYSTEMS ERROR: Confirmation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-vt-bg-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">⚙</div>
          <div className="text-4xl text-vt-green mb-2">VAULT-TEC</div>
          <div className="text-xl text-vt-green-dim">ENVIRONMENT CONTROL SYSTEM</div>
        </div>

        {/* Login Form */}
        <div className="card-glow bg-vt-bg-card p-6">
          <div className="text-2xl text-vt-green mb-6 text-center">
            {mode === 'signin' && '&gt; AUTHENTICATION REQUIRED'}
            {mode === 'signup' && '&gt; RESEARCHER REGISTRATION'}
            {mode === 'confirm' && '&gt; VERIFY CREDENTIALS'}
          </div>

          {error && (
            <div className="mb-4 p-3 border-2 border-vt-red bg-vt-red-glow">
              <div className="flex items-center gap-2 text-vt-red">
                <AlertTriangle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            </div>
          )}

          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-vt-green mb-2">Username:</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-vt-bg-dark border border-vt-border text-vt-green px-4 py-2 focus:outline-none focus:border-vt-green font-terminal"
                  placeholder="Enter username"
                  required
                />
              </div>

              <div>
                <label className="block text-vt-green mb-2">Password:</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-vt-bg-dark border border-vt-border text-vt-green px-4 py-2 focus:outline-none focus:border-vt-green font-terminal"
                  placeholder="Enter password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 border-2 border-vt-green text-vt-green hover:bg-vt-green hover:text-vt-bg-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '[AUTHENTICATING...]' : '[AUTHENTICATE]'}
              </button>

              <div className="text-center text-vt-green-dim text-sm">
                New researcher?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="text-vt-green hover:underline"
                >
                  Register here
                </button>
              </div>
            </form>
          )}

          {mode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="block text-vt-green mb-2">Username:</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-vt-bg-dark border border-vt-border text-vt-green px-4 py-2 focus:outline-none focus:border-vt-green font-terminal"
                  placeholder="Choose username"
                  required
                />
              </div>

              <div>
                <label className="block text-vt-green mb-2">Email:</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-vt-bg-dark border border-vt-border text-vt-green px-4 py-2 focus:outline-none focus:border-vt-green font-terminal"
                  placeholder="researcher@westtek.com"
                  required
                />
              </div>

              <div>
                <label className="block text-vt-green mb-2">Password:</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-vt-bg-dark border border-vt-border text-vt-green px-4 py-2 focus:outline-none focus:border-vt-green font-terminal"
                  placeholder="Min 8 chars, upper, lower, number"
                  required
                />
                <div className="text-vt-green-dim text-xs mt-1">
                  Must contain: uppercase, lowercase, number (min 8 chars)
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 border-2 border-vt-green text-vt-green hover:bg-vt-green hover:text-vt-bg-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '[REGISTERING...]' : '[REGISTER]'}
              </button>

              <div className="text-center text-vt-green-dim text-sm">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className="text-vt-green hover:underline"
                >
                  Sign in
                </button>
              </div>
            </form>
          )}

          {mode === 'confirm' && (
            <form onSubmit={handleConfirm} className="space-y-4">
              <div className="text-vt-green-dim text-sm mb-4">
                A verification code has been sent to {email}. Enter it below to complete registration.
              </div>

              <div>
                <label className="block text-vt-green mb-2">Verification Code:</label>
                <input
                  type="text"
                  value={confirmationCode}
                  onChange={(e) => setConfirmationCode(e.target.value)}
                  className="w-full bg-vt-bg-dark border border-vt-border text-vt-green px-4 py-2 focus:outline-none focus:border-vt-green font-terminal"
                  placeholder="Enter 6-digit code"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 border-2 border-vt-green text-vt-green hover:bg-vt-green hover:text-vt-bg-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '[VERIFYING...]' : '[VERIFY]'}
              </button>

              <div className="text-center text-vt-green-dim text-sm">
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className="text-vt-green hover:underline"
                >
                  Back to sign in
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Demo Credentials Hint */}
        <div className="mt-4 text-center text-vt-green-dim text-sm">
          <div className="border border-vt-border p-3 bg-vt-bg-card">
            <div className="text-vt-amber mb-1">Demo Credentials:</div>
            <div>Username: testuser</div>
            <div>Password: TestPassword123!</div>
          </div>
        </div>
      </div>
    </div>
  );
}
