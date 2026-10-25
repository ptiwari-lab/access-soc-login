import { useState, useRef, useEffect } from 'react';
import { TerminalSquare, X } from 'lucide-react';
import type { Stage } from '@/hooks/useAccessSystem';

interface Props { stage: Stage; attempts: number; }

interface ConsoleLine { id: number; text: string; color: string; }

const STAGE_MESSAGES: Record<Stage, string[]> = {
  0: [
    '> SOC terminal idle. All systems nominal.',
    '> No active threats detected. Touch grass.',
    '> Authentication subsystem standing by.',
  ],
  1: [
    '> Behavioral analysis engine warming up...',
    '> I see you. Not worried. Just noting it.',
    '> Session tagged for observation. Hi.',
  ],
  2: [
    '> Anomaly detected. Pattern matching engaged.',
    '> You are doing that on purpose, aren\'t you?',
    '> IDS thresholds exceeded. Logging intensified.',
  ],
  3: [
    '> ACTIVE BREACH SIGNATURE CONFIRMED.',
    '> Network trace protocol initiated. We see you.',
    '> Firewall rules dynamically updated. Good luck.',
  ],
  4: [
    '> INCIDENT DECLARED. Analyst SOC-ALPHA online.',
    '> Full forensic capture running. Every packet.',
    '> Your keyboard is now evidence. Literally.',
  ],
  5: [
    '> MELTDOWN PROTOCOL ACTIVE.',
    '> Core systems degrading. This is your fault.',
    '> We are genuinely impressed AND concerned.',
  ],
  6: [
    '> PROTOCOL OMEGA ENGAGED. Non-recoverable.',
    '> Even we can\'t use the 6-7 trend anymore. 😭',
    '> You win at losing. Congratulations?',
  ],
  7: [
    '> PERMANENT LOCKDOWN. No recovery path.',
    '> The system has accepted its fate. Have you?',
    '> We called your mom. She sighed. A long sigh.',
  ],
};

const BOOT_LINES = [
  '> ACCESS™ Operator Console v2.0',
  '> Type "help" for commands. Type "diag" for diagnostics.',
  '> This is a simulated terminal. No real commands executed.',
];

const HELP_TEXT = [
  '> Available commands:',
  '>   help  — show this message',
  '>   diag  — run simulated diagnostics',
  '>   cls   — clear console',
  '>   status — show current threat level',
];

export default function OperatorConsole({ stage, attempts }: Props) {
  const [open, setOpen] = useState(false);
  const [lines, setLines] = useState<ConsoleLine[]>([]);
  const [input, setInput] = useState('');
  const [bootDone, setBootDone] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lineId = useRef(0);

  function push(text: string, color = 'rgba(255,255,255,0.6)') {
    setLines(prev => [...prev, { id: lineId.current++, text, color }]);
  }

  function openConsole() {
    if (open || bootDone) return;
    setOpen(true);
    let i = 0;
    const interval = setInterval(() => {
      if (i < BOOT_LINES.length) {
        push(BOOT_LINES[i], 'rgba(0,212,255,0.6)');
        i++;
      } else {
        clearInterval(interval);
        setBootDone(true);
      }
    }, 300);
  }

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  function handleCommand(cmd: string) {
    const c = cmd.trim().toLowerCase();
    push(`> ${cmd}`, 'rgba(255,255,255,0.8)');

    if (c === 'help') {
      HELP_TEXT.forEach(l => push(l, 'rgba(0,212,255,0.5)'));
    } else if (c === 'diag') {
      push('> Running simulated diagnostics...', 'rgba(0,212,255,0.5)');
      push(`> CPU: 12% | MEM: 342MB | NET: ${12 + attempts * 2}ms`, 'rgba(0,255,136,0.6)');
      push(`> Threat level: ${stage >= 4 ? 'CRITICAL' : stage >= 2 ? 'ELEVATED' : 'NOMINAL'}`, stage >= 4 ? '#ef4444' : stage >= 2 ? '#f59e0b' : '#00ff88');
      push(`> Failed attempts: ${attempts}`, 'rgba(255,255,255,0.5)');
      push('> Diagnostics complete. Everything is fine. Probably.', 'rgba(0,255,136,0.4)');
    } else if (c === 'cls' || c === 'clear') {
      setLines([]);
    } else if (c === 'status') {
      const msgs = STAGE_MESSAGES[stage];
      push(`> Current stage: ${stage} | Attempts: ${attempts}`, 'rgba(0,212,255,0.5)');
      const msg = msgs[Math.floor(Math.random() * msgs.length)];
      push(msg, stage >= 4 ? 'rgba(239,68,68,0.6)' : stage >= 2 ? 'rgba(251,191,36,0.6)' : 'rgba(0,255,136,0.5)');
    } else if (c === '') {
      // no-op
    } else {
      push(`> Unknown command: "${cmd}". Type "help" for available commands.`, 'rgba(239,68,68,0.5)');
    }
  }

  if (!open) {
    return (
      <button
        onClick={openConsole}
        className="fixed z-40 transition-all"
        style={{
          bottom: '32px',
          right: '12px',
          color: 'rgba(0,212,255,0.25)',
          background: 'rgba(5,9,18,0.8)',
          border: '1px solid rgba(0,212,255,0.08)',
          borderRadius: '6px',
          padding: '4px 8px',
          fontFamily: "'Space Mono', monospace",
          fontSize: '0.5rem',
          letterSpacing: '0.08em',
          cursor: 'pointer',
          backdropFilter: 'blur(8px)',
        }}
        aria-label="Open operator console"
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(0,212,255,0.7)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(0,212,255,0.2)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(0,212,255,0.25)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(0,212,255,0.08)'; }}
      >
        <span className="flex items-center gap-1.5">
          <TerminalSquare size={10} /> OP-CON
        </span>
      </button>
    );
  }

  return (
    <div
      className="fixed z-40 flex flex-col overflow-hidden rounded-lg"
      style={{
        bottom: '32px',
        right: '12px',
        width: '360px',
        maxWidth: 'calc(100vw - 24px)',
        height: '240px',
        maxHeight: '40vh',
        background: 'rgba(4,8,18,0.95)',
        border: '1px solid rgba(0,212,255,0.15)',
        backdropFilter: 'blur(14px)',
        boxShadow: '0 0 40px rgba(0,212,255,0.08), 0 8px 30px rgba(0,0,0,0.5)',
      }}
    >
      <div className="flex items-center justify-between px-3 py-1.5 shrink-0" style={{ borderBottom: '1px solid rgba(0,212,255,0.08)' }}>
        <div className="flex items-center gap-2">
          <TerminalSquare size={11} style={{ color: '#00d4ff', opacity: 0.6 }} />
          <span style={{ color: 'rgba(0,212,255,0.5)', fontFamily: "'Space Mono', monospace", fontSize: '0.52rem', letterSpacing: '0.1em' }}>
            OPERATOR CONSOLE
          </span>
        </div>
        <button onClick={() => setOpen(false)} className="p-0.5 rounded transition-all hover:opacity-100 opacity-40" aria-label="Close console">
          <X size={11} style={{ color: 'rgba(255,255,255,0.5)' }} />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-2" style={{ minHeight: 0 }}>
        {lines.map(l => (
          <div key={l.id} style={{ color: l.color, fontFamily: "'Space Mono', monospace", fontSize: '0.56rem', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {l.text}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1.5 px-3 py-1.5 shrink-0" style={{ borderTop: '1px solid rgba(0,212,255,0.08)' }}>
        <span style={{ color: 'rgba(0,212,255,0.5)', fontFamily: "'Space Mono', monospace", fontSize: '0.56rem' }}>$</span>
        <input
          type="text"
          value={input}
          disabled={!bootDone}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              handleCommand(input);
              setInput('');
            }
          }}
          className="flex-1 bg-transparent outline-none"
          style={{ color: 'rgba(255,255,255,0.8)', fontFamily: "'Space Mono', monospace", fontSize: '0.56rem', caretColor: '#00d4ff' }}
          placeholder={bootDone ? 'type a command...' : 'initializing...'}
          autoFocus
        />
      </div>
    </div>
  );
}
