import { useState, useEffect } from 'react';

export default function BootSequence({ onComplete }) {
  const [phase, setPhase] = useState(0);
  const [text, setText] = useState('');

  const phases = [
    { duration: 1000, content: '' }, // Logo phase
    { 
      duration: 1500, 
      content: 'ROBCO INDUSTRIES (TM) TERMLINK PROTOCOL\nCOPYRIGHT 2077 ROBCO INDUSTRIES\nSERVER: WEST-TEK-MAINFRAME-01' 
    },
    { 
      duration: 1000, 
      content: '> CONNECTING TO VAULT-TEC NETWORK...\n> AUTHENTICATION: DR. WHITMORE [VERIFIED]\n> LOADING ENVIRONMENT CONTROL SYSTEM...' 
    }
  ];

  useEffect(() => {
    if (phase === 0) {
      const timer = setTimeout(() => setPhase(1), phases[0].duration);
      return () => clearTimeout(timer);
    }

    if (phase > 0 && phase <= phases.length) {
      const currentPhase = phases[phase - 1];
      let charIndex = 0;
      
      const typeInterval = setInterval(() => {
        if (charIndex < currentPhase.content.length) {
          setText(currentPhase.content.slice(0, charIndex + 1));
          charIndex++;
        } else {
          clearInterval(typeInterval);
          setTimeout(() => {
            if (phase < phases.length) {
              setPhase(phase + 1);
              setText('');
            } else {
              setTimeout(onComplete, 500);
            }
          }, 500);
        }
      }, 30);

      return () => clearInterval(typeInterval);
    }
  }, [phase]);

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-vt-bg-dark z-50 flex items-center justify-center">
      {phase === 0 && (
        <div className="text-center">
          <div className="text-6xl text-vt-green mb-4">⚙</div>
          <div className="text-4xl text-vt-green">VAULT-TEC</div>
        </div>
      )}

      {phase > 0 && (
        <div className="w-full max-w-3xl px-8">
          <pre className="text-vt-green text-xl whitespace-pre-wrap font-terminal">
            {text}
            <span className="cursor"></span>
          </pre>
        </div>
      )}

      <button
        onClick={handleSkip}
        className="absolute bottom-8 right-8 text-vt-green-dim hover:text-vt-green text-sm"
      >
        [SKIP]
      </button>
    </div>
  );
}
