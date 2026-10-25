import { useState, useCallback, useRef } from 'react';
import { useSoundSystem } from '@/hooks/useSoundSystem';

export type Stage = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface LogEntry {
  id: string;
  timestamp: string;
  severity: 'info' | 'warn' | 'danger' | 'critical';
  event: string;
  detail: string;
}

export interface Toast {
  id: string;
  severity: 'info' | 'warn' | 'danger' | 'critical';
  title: string;
  message: string;
  emoji?: string;
}

export function getStage(attempts: number): Stage {
  if (attempts <= 2) return 0;
  if (attempts <= 5) return 1;
  if (attempts <= 9) return 2;
  if (attempts <= 24) return 3;
  if (attempts <= 49) return 4;
  if (attempts <= 66) return 5;
  if (attempts === 67) return 6;
  return 7;
}

function getTimestamp(): string {
  return new Date().toISOString().replace('T', ' ').substring(0, 19);
}

export function getRoast(username: string, password: string): string {
  const cat = categorizePassword(password, username);
  const msgs = MESSAGES[cat] ?? MESSAGES.generic;
  const pick = msgs[Math.floor(Math.random() * msgs.length)];
  const stage = getStage(0);
  return wrapMessage(pick, 0, stage, username);
}

export function categorizePassword(password: string, username: string): string {
  const p = password.toLowerCase().trim();
  const u = username.toLowerCase().trim();
  if (p.length === 0) return 'empty';
  /* username == password — the ultimate insult */
  if (u.length > 0 && p === u) return 'same_as_username';
  if (p.length < 6) return 'too_short';
  if (p.length > 28) return 'too_long';
  if (['password', '123456', '12345678', 'admin', 'qwerty', 'abc123', 'pass', 'test', 'login', '111111', 'password1', '1234', '12345', 'password123'].includes(p)) return 'common';
  if (['letmein', 'welcome', 'iloveyou', 'iloveu', 'love', 'sunshine', 'monkey', 'dragon', 'master', 'shadow', 'baseball', 'football', 'princess', 'superman', 'batman'].includes(p)) return 'classic_bad';
  if (/^[0-9]+$/.test(p)) return 'numeric';
  if (p.includes('hack') || p.includes('root') || p.includes('sudo') || p.includes('shell') || p.includes('kali') || p.includes('exploit') || p.includes('pwn') || p.includes('0day') || p.includes('pentest')) return 'hacker';
  if (p.includes('access') || p.includes('secure') || p.includes('cyber') || p.includes('network') || p.includes('firewall') || p.includes('encrypt')) return 'thematic';
  if (/(.)\1{3,}/.test(p)) return 'repeated';
  if (/^[a-z]+$/.test(p)) return 'lowercase_only';
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{3,}/.test(p)) return 'keyboard_smash';
  return 'generic';
}

// SAVAGE escalating messages per category
const MESSAGES: Record<string, string[]> = {
  empty: [
    "You submitted nothing. NOTHING. Your WiFi password has more effort than this. ❌",
    "Still nothing? Are you typing with your elbows? Your ELBOWS have more capability. 💀",
    "The empty field is staring back at us. We are also confused. Three times now. 😭",
    "Genuinely impressive. You've submitted air four times as your password. Olympic-level commitment to failure. 🚨",
    "We checked. The void has more credentials than you. Access denied from the void itself. ☠️",
    "At this point we think you're TESTING us. You are. We don't appreciate it. 🔥",
    "IT security tip: the password field needs INPUT. Radical concept. Please try. 💀",
    "Our server logs literally say NULL NULL NULL NULL NULL. You're a null person. 😭",
  ],
  too_short: [
    "That's not a password, that's a sound effect. Less than six characters? Really? ❌",
    "Our intern's cat has walked across the keyboard and produced better passwords. 💀",
    "Minimum is 8 characters. You submitted less than your IQ score apparently. 😭",
    "We checked — that's shorter than the word 'password'. You didn't even match the label. 🚨",
    "A five-character password in 2026. Bold. Brave. Wrong. Criminally, aggressively wrong. ☠️",
    "That password is so short it got carded at the door. It's underage. Put it back. 🔥",
  ],
  same_as_username: [
    "Your password is your username. YOUR USERNAME. We're speechless. Genuinely speechless. ❌",
    "Username = password. The #1 rule of cybersecurity and you broke it on attempt one. 💀",
    "That's not a password, that's an echo. 'Hello... hello... hello...' Denied. 😭",
    "We compared the two fields. They're identical. We're charging you with identity theft of yourself. 🚨",
    "Using your username as your password is like hiding a key under the doormat... that says 'KEY IS HERE.' ☠️",
  ],
  too_long: [
    "That's not a password, that's your autobiography. We don't have time for this. ❌",
    "Did you paste your entire diary into the password field? WHAT IS THAT LENGTH? 💀",
    "Our server actually laughed. We have logs of it laughing. At you specifically. 😭",
    "We admire the creativity. We hate the execution. Access denied for being extra. 🚨",
    "Sir, a 30-character password doesn't make up for the previous 40 wrong attempts. ☠️",
  ],
  common: [
    "Really? 'password'? Did you also name your dog 'Dog'? We need a moment. ❌",
    "This exact password appeared in 4.7 BILLION breaches before you typed it. New personal record. 💀",
    "'admin' again. Sir. Ma'am. We are BEGGING you from the bottom of our server racks. 😭",
    "That password is literally in the dictionary under 'what not to do.' Page one. 🚨",
    "A hacker in kindergarten could crack this. A hacker WHO IS A KINDERGARTENER. ☠️",
    "We've seen this password on literally every security hall of shame list. You're famous now. 🔥",
    "Our threat detection AI looked at that password and filed for emotional distress leave. 💀",
    "The password '123456' has been hacked 23 million times. Congrats on attempt 23,000,001. 😭",
  ],
  classic_bad: [
    "'letmein' — the classic. The timeless masterpiece of terrible passwords. Still wrong. ❌",
    "That password was retired by the internet in 2003. It has a pension now. You can't use it. 💀",
    "'iloveyou'? We don't. Not even a little bit right now. Access denied with disgust. 😭",
    "This password is so famous it has its own Wikipedia entry. Under 'worst passwords ever.' 🚨",
    "The audacity to type 'letmein' in a SECURITY OPERATIONS CENTER is award-winning. ☠️",
  ],
  numeric: [
    "Sequential numbers. Bold. Brave. Are you trying to open a luggage lock? ❌",
    "Only numbers? This isn't an ATM pin. This is a classified government system. NUMBERS. 💀",
    "We ran your password through 47 security algorithms. All 47 said 'lol.' 😭",
    "A purely numeric password in 2026 is a hate crime against cybersecurity. We're pressing charges. 🚨",
    "Your grandmother has a more secure password than this, and she still calls it 'the internet machine.' ☠️",
  ],
  hacker: [
    "Oh wow, 'hack' in the password. The FBI has entered the chat. Also that's not how hacking works. 💀",
    "Using 'sudo' won't help you here. This isn't your Raspberry Pi, kid. 😭",
    "You put 'kali' in the password and now we're ACTUALLY calling people. This is a real call. 🚨",
    "'exploit'? In your PASSWORD? We've forwarded this to three separate agencies. 🔥",
    "You watched Mr. Robot ONCE and now look at you. Embarrassing yourself in a federal system. ☠️",
    "The irony of a bad hacker using 'hack' as their password could power a city. 💀",
    "'pwn' in the password — you absolute legend. You're the least pwned person here, except you are pwned. 😭",
  ],
  thematic: [
    "Typing 'cyber' in a cybersecurity system password. That's like robbing a bank and writing 'BANK' on the bag. ❌",
    "'access' as your password to ACCESS™. The creativity. The audacity. The wrongness. 💀",
    "'firewall' in your password won't protect you from our very real firewall that just banned you. 😭",
    "'encrypt' — bold choice. We encrypted your rejection so hard you can't even read why you're denied. 🚨",
    "Using 'secure' in your password is the cybersecurity equivalent of naming yourself 'Humble.' ☠️",
  ],
  repeated: [
    "You held one key for five seconds. The determination. The consistency. The absolute wrongness. ❌",
    "'aaaaaaa' is not a password. It is a sound you make when you see the error message again. 💀",
    "Repeating characters 8 times — we see you panicking. We're not helping. We're watching. 😭",
    "Our pattern recognition flagged this as 'someone mashing keyboard in desperation.' Accurate. 🚨",
  ],
  lowercase_only: [
    "No capitals, no numbers, no symbols, no hope. Just vibes and lowercase letters. Denied. ❌",
    "That password has zero complexity and maximum confidence. We respect neither. 💀",
    "All lowercase? This system uses military-grade encryption and you brought a napkin. 😭",
    "Lowercase only passwords were banned in 2014. You're not just wrong, you're historically wrong. 🚨",
  ],
  keyboard_smash: [
    "Did you sit on the keyboard? We're logging this as a workplace injury. 💀",
    "@#$%! — is that a password or an emotion? Either way, wrong. 😭",
    "Impressive keyboard violence. We are unmoved. Our servers, however, are emotionally scarred. 🚨",
    "That looks like a cat walked across the keyboard while having a nightmare. Access denied. ☠️",
  ],
  generic: [
    "Invalid credentials. Creative, but no. ❌",
    "Nope. Not even close. But we appreciate the commitment to failure. 💀",
    "Wrong again. We're starting to think this is intentional. 😭",
    "Access denied. This is going in the security report. Under 'LOL.' 🚨",
    "Our authentication system is judging you and it doesn't feel bad about it. ☠️",
  ],
};

// Stage wrappers — get increasingly savage/sarcastic
function wrapMessage(base: string, attempts: number, stage: Stage, username: string): string {
  const u = username.trim();
  const userNote = u === 'admin' || u === 'administrator' || u === 'root'
    ? ` (Also, '${u}'? Really? That's your username? In THIS economy?)` : '';

  if (stage === 0) return base + userNote;
  if (stage === 1) return `[ATTEMPT ${attempts}] ${base}${userNote} This. Has. Been. Logged.`;
  if (stage === 2) return `⚠️ [ALERT #${attempts}] ${base}${userNote} A real human analyst is watching you do this.`;
  if (stage === 3) return `🚨 [BREACH ATTEMPT #${attempts}] ${base}${userNote} We know your timezone. We know your ISP. We're calling them.`;
  if (stage === 4) return `☠️ [INCIDENT #${attempts}] ${base}${userNote} Formal case opened: ACC-2026-${attempts}. Your keyboard is evidence now.`;
  if (stage === 5) return `🔥 [MELTDOWN #${attempts}] ${base}${userNote} At this point we're genuinely impressed. Wrong. But impressed.`;
  if (stage === 6) return `💀 PROTOCOL OMEGA: Even we can't use the 6–7 trend with you anymore. We're done. You win at losing.`;
  return `☠️ [POST-CRITICAL #${attempts}] ${base}${userNote} The system is in permanent lockdown and honestly? It's better this way.`;
}

export function getResponse(attempts: number, username: string, password: string): string {
  if (attempts === 0) return '';
  const stage = getStage(attempts);
  const category = categorizePassword(password, username);
  const msgs = MESSAGES[category] ?? MESSAGES.generic;
  const idx = Math.min(attempts - 1, msgs.length - 1);
  const base = msgs[idx];
  return wrapMessage(base, attempts, stage, username);
}

export function getToastForAttempt(attempts: number): { title: string; message: string; severity: Toast['severity']; emoji: string } | null {
  const map: Record<number, { title: string; message: string; severity: Toast['severity']; emoji: string }> = {
    1: { title: 'ACCESS DENIED', message: 'One wrong move. That\'s all it takes. We\'re already watching.', severity: 'info', emoji: '🔒' },
    3: { title: 'REPEAT OFFENDER', message: 'Three failures. At this point it\'s a pattern. A sad, sad pattern.', severity: 'warn', emoji: '⚠️' },
    5: { title: 'SECURITY ALERT', message: 'Five attempts. Monitoring upgraded to active surveillance. Hi there. 👋', severity: 'warn', emoji: '👁️' },
    7: { title: 'IDS TRIGGERED', message: 'Intrusion detection system fully activated. Every keystroke is logged.', severity: 'danger', emoji: '🚨' },
    10: { title: 'BRUTE FORCE CONFIRMED', message: 'TEN attempts. Our analyst just put down their coffee. It\'s on now.', severity: 'danger', emoji: '☕' },
    15: { title: 'HUMAN ANALYST ONLINE', message: 'A real human is reviewing your session. They\'re judging you. Hard.', severity: 'danger', emoji: '🕵️' },
    20: { title: 'TRACE ACTIVE', message: 'Network trace completed. We know more than you\'d like. 20 attempts.', severity: 'danger', emoji: '📍' },
    25: { title: '💀 INCIDENT DECLARED', message: 'FORMAL SECURITY INCIDENT OPENED. You just became a case number. Congrats?', severity: 'critical', emoji: '💀' },
    30: { title: '☠️ GEOLOCATION ACQUIRED', message: 'Terminal location triangulated. Accuracy: 99.7%. Please wave.', severity: 'critical', emoji: '🌍' },
    35: { title: '🔥 AUTHORITIES NOTIFIED', message: 'Relevant authorities have received your file. Hope the photo\'s nice.', severity: 'critical', emoji: '🚔' },
    40: { title: '☠️ FORENSIC CAPTURE', message: '40 attempts. Full forensic session capture active. All packets. EVERY packet.', severity: 'critical', emoji: '🔬' },
    50: { title: '🔥 SYSTEM MELTDOWN', message: 'FIFTY ATTEMPTS. Core systems entering meltdown. This is YOUR fault.', severity: 'critical', emoji: '🔥' },
    55: { title: '☠️ EMERGENCY LOCKDOWN', message: 'Emergency protocols tier 3. Hardened. Sealed. Like your fate.', severity: 'critical', emoji: '🔐' },
    60: { title: '💀 FINAL WARNING', message: 'Seven more attempts until Protocol OMEGA. We\'re almost impressed. Almost.', severity: 'critical', emoji: '⏳' },
    65: { title: '☠️ TWO MORE', message: 'TWO MORE ATTEMPTS before the point of no return. Please. Just stop.', severity: 'critical', emoji: '🆘' },
    67: { title: '💀 PROTOCOL OMEGA', message: 'Even we can\'t do this anymore. You win at losing. We called your mom.', severity: 'critical', emoji: '💀' },
  };
  return map[attempts] ?? null;
}

export function generateLogEntry(attempts: number, stage: Stage, username: string): LogEntry {
  const events: Record<Stage, Array<{ event: string; detail: string; severity: LogEntry['severity'] }>> = {
    0: [
      { event: 'AUTH_FAILURE', detail: `Credential mismatch for "${username || 'ANONYMOUS'}". No escalation.`, severity: 'info' },
      { event: 'ACCESS_DENIED', detail: 'Identity verification failed. Session nominal.', severity: 'info' },
    ],
    1: [
      { event: 'REPEAT_FAILURE', detail: `${attempts} consecutive failures. Pattern monitoring initiated.`, severity: 'warn' },
      { event: 'SESSION_FLAGGED', detail: 'Session tagged. Behavioral analysis active.', severity: 'warn' },
    ],
    2: [
      { event: 'THREAT_ELEVATED', detail: 'Brute force signature detected. Tier 1 alert active.', severity: 'warn' },
      { event: 'IDS_TRIGGERED', detail: 'Intrusion detection flagged this session. Logging intensified.', severity: 'warn' },
    ],
    3: [
      { event: 'BREACH_ATTEMPT', detail: `Active brute force on account "${username || 'UNKNOWN'}". Trace initiated.`, severity: 'danger' },
      { event: 'TRACE_ACTIVE', detail: 'Network trace protocol started. Location approximated.', severity: 'danger' },
      { event: 'FIREWALL_UPDATE', detail: 'Dynamic firewall rules updated. Reputation: NONE.', severity: 'danger' },
    ],
    4: [
      { event: 'INCIDENT_OPENED', detail: `Formal incident ACC-2026-${String(attempts).padStart(4, '0')} declared. Analyst assigned.`, severity: 'critical' },
      { event: 'FORENSIC_CAPTURE', detail: 'Full session forensics initiated. All packets archived.', severity: 'critical' },
    ],
    5: [
      { event: 'MELTDOWN_PROTOCOL', detail: 'Core security systems entering controlled degradation sequence.', severity: 'critical' },
      { event: 'EMERGENCY_LOCKDOWN', detail: 'Emergency lockdown tier 3 active. All systems hardened.', severity: 'critical' },
    ],
    6: [
      { event: 'PROTOCOL_OMEGA', detail: 'Attempt 67 reached. Non-recoverable state. Omega protocol ENGAGED.', severity: 'critical' },
    ],
    7: [
      { event: 'POST_CRITICAL', detail: `Attempt ${attempts}. Permanent lockdown. No recovery path exists.`, severity: 'critical' },
    ],
  };
  const pool = events[stage];
  const entry = pool[attempts % pool.length];
  return {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: getTimestamp(),
    severity: entry.severity,
    event: entry.event,
    detail: entry.detail,
  };
}

export function useAccessSystem() {
  const [attempts, setAttempts] = useState(0);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [response, setResponse] = useState('');
  const [log, setLog] = useState<LogEntry[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showCritical, setShowCritical] = useState(false);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const toastTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const stage = getStage(attempts);
  const stageRef = useRef<Stage>(stage);
  stageRef.current = stage;
  const sounds = useSoundSystem(stageRef);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
    if (toastTimers.current[id]) clearTimeout(toastTimers.current[id]);
  }, []);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}`;
    setToasts(prev => [...prev.slice(-2), { ...toast, id }]);
    const duration = toast.severity === 'critical' ? 5500 : 4000;
    toastTimers.current[id] = setTimeout(() => dismissToast(id), duration);
  }, [dismissToast]);

  const handleLogin = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    /* processing sweep tone on submit */
    sounds.submitSweep();
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    const newStage = getStage(newAttempts);
    const msg = getResponse(newAttempts, username, password);
    setResponse(msg);

    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 600);

    /* low error buzz shortly after the sweep — failure confirmed */
    setTimeout(() => sounds.errorBuzz(), 550);

    const entry = generateLogEntry(newAttempts, newStage, username || 'anonymous');
    setLog(prev => [entry, ...prev].slice(0, 50));

    const toast = getToastForAttempt(newAttempts);
    if (toast) addToast(toast);

    if (newAttempts === 67) {
      setTimeout(() => setShowCritical(true), 900);
    }
    /* CAPTCHA nightmare on milestone attempts */
    if ([5, 10, 25, 50].includes(newAttempts)) {
      setTimeout(() => setShowCaptcha(true), 700);
    }

    setPassword('');
  }, [attempts, username, password, addToast, sounds]);

  const dismissCritical = useCallback(() => setShowCritical(false), []);
  const triggerCaptcha = useCallback(() => setShowCaptcha(true), []);
  const dismissCaptcha = useCallback(() => setShowCaptcha(false), []);

  return {
    attempts, stage, username, setUsername,
    password, setPassword, response, log,
    toasts, showCritical, isShaking,
    showCaptcha, triggerCaptcha, dismissCaptcha,
    handleLogin, dismissToast, dismissCritical,
    sounds,
  };
}
