import { useState, useRef, useEffect, useCallback } from 'react';
import { TerminalSquare } from 'lucide-react';
import type { Stage } from '@/hooks/useAccessSystem';
import { getRoast } from '@/hooks/useAccessSystem';

interface Props {
  stage: Stage;
  attempts: number;
  username: string;
  password: string;
  onOverride: () => void;
}

interface Line { id: string; type: 'in' | 'out' | 'sys'; text: string; }

const BOOT_LINES = [
  'ACCESS™ CLI v4.2.1 — type "help" for commands',
  'connection: SECURE · tls 1.3 · session encrypted',
];

export default function InteractiveTerminal({ stage, attempts, username, password, onOverride }: Props) {
  const [lines, setLines] = useState<Line[]>([]);
  const [input, setInput] = useState('');
  const [hist, setHist] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  /* boot lines on mount */
  useEffect(() => {
    setLines(BOOT_LINES.map((text, i) => ({ id: `boot-${i}`, type: 'sys' as const, text })));
  }, []);

  /* autoscroll */
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [lines]);

  const push = useCallback((type: Line['type'], text: string) => {
    setLines(prev => [...prev, { id: `l-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, type, text }]);
  }, []);

  const runCommand = useCallback((raw: string) => {
    const cmd = raw.trim().toLowerCase();
    if (!cmd) return;
    push('in', `$ ${raw}`);
    setHist(prev => [...prev, raw]);
    setHistIdx(-1);

    const [name, ...args] = cmd.split(/\s+/);

    switch (name) {
      case 'help':
        push('out', 'available commands:');
        push('out', '  help     — show this list');
        push('out', '  status   — current session status');
        push('out', '  roast    — get roasted about your last password');
        push('out', '  override — initiate emergency override (CAPTCHA)');
        push('out', '  clear    — clear the terminal');
        break;
      case 'status': {
        const level = stage >= 5 ? 'DEFCON 1 — MELTDOWN' : stage >= 4 ? 'DEFCON 2 — INCIDENT' : stage >= 2 ? 'DEFCON 4 — ELEVATED' : 'DEFCON 5 — NOMINAL';
        push('out', `session:    ACCESS™ / sector alpha-7`);
        push('out', `attempts:   ${attempts}`);
        push('out', `operator:   ${username || '<unset>'}`);
        push('out', `threat:     ${level}`);
        push('out', `siren:      ${stage >= 5 ? 'ACTIVE' : 'standby'}`);
        break;
      }
      case 'roast': {
        const r = getRoast(username || 'guest', password || args.join(' ') || 'password');
        push('out', r);
        break;
      }
      case 'override':
        push('sys', '> initiating emergency override protocol...');
        push('sys', '> biometric fallback unavailable');
        push('sys', '> human verification required — launching CAPTCHA');
        setTimeout(() => {
          onOverride();
          push('out', 'CAPTCHA challenge deployed. Good luck. You will need it.');
        }, 600);
        break;
      case 'clear':
        setLines([]);
        break;
      case 'sudo':
        push('out', `${username || 'guest'} is not in the sudoers file. This incident will be reported. To your mom.`);
        break;
      case 'whoami':
        push('out', username ? `${username} — clearance: REVOKED` : 'a threat actor with commitment issues');
        break;
      default:
        push('out', `command not found: ${name}. type "help".`);
    }
  }, [stage, attempts, username, password, push, onOverride]);

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      runCommand(input);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (hist.length === 0) return;
      const ni = histIdx === -1 ? hist.length - 1 : Math.max(0, histIdx - 1);
      setHistIdx(ni);
      setInput(hist[ni]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (histIdx === -1) return;
      const ni = histIdx + 1;
      if (ni >= hist.length) { setHistIdx(-1); setInput(''); }
      else { setHistIdx(ni); setInput(hist[ni]); }
    }
  };

  const accent = stage >= 4 ? '#ef4444' : stage >= 2 ? '#f59e0b' : '#00d4ff';

  return (
    <div
      className="soc-panel relative overflow-hidden"
      style={{ borderColor: `${accent}22` }}
      onClick={() => inputRef.current?.focus()}
    >
      <div className="panel-label" style={{ cursor: 'text' }}>
        <TerminalSquare size={11} style={{ color: accent }} />
        CLI · OPERATOR TERMINAL
        <span style={{ marginLeft: 'auto', color: accent, fontSize: '0.5rem', opacity: 0.5 }}>SHIFT+TAB</span>
      </div>

      <div
        ref={scrollRef}
        className="px-2.5 py-2 overflow-y-auto"
        style={{ height: '120px', fontFamily: "'Space Mono', monospace", fontSize: '0.62rem', lineHeight: 1.5 }}
      >
        {lines.map(l => (
          <div key={l.id} style={{
            color: l.type === 'in' ? accent : l.type === 'sys' ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.78)',
            whiteSpace: 'pre-wrap', wordBreak: 'break-word',
          }}>
            {l.text}
          </div>
        ))}
        {/* input line */}
        <div className="flex items-center" style={{ color: accent }}>
          <span style={{ marginRight: 4 }}>$</span>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            spellCheck={false}
            autoComplete="off"
            className="flex-1 bg-transparent outline-none"
            style={{ color: 'rgba(255,255,255,0.85)', fontFamily: "'Space Mono', monospace", fontSize: '0.62rem', caretColor: accent }}
            aria-label="terminal command input"
          />
        </div>
      </div>
    </div>
  );
}
