type LogLevel = 'error' | 'warn' | 'info' | 'debug';

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

function resolveLevel(): LogLevel {
  const raw = (process.env.LOG_LEVEL || '').toLowerCase();
  if (raw === 'error' || raw === 'warn' || raw === 'info' || raw === 'debug') {
    return raw;
  }
  return process.env.NODE_ENV === 'production' ? 'warn' : 'info';
}

const currentLevel: LogLevel = resolveLevel();
const currentPriority = LEVEL_PRIORITY[currentLevel];

function enabled(level: LogLevel): boolean {
  return LEVEL_PRIORITY[level] <= currentPriority;
}

function fmt(level: LogLevel, args: unknown[]): unknown[] {
  return [`[${level}]`, ...args];
}

export const logger = {
  level: currentLevel,
  isLevelEnabled: enabled,
  error: (...args: unknown[]) => {
    if (enabled('error')) console.error(...fmt('error', args));
  },
  warn: (...args: unknown[]) => {
    if (enabled('warn')) console.warn(...fmt('warn', args));
  },
  info: (...args: unknown[]) => {
    if (enabled('info')) console.info(...fmt('info', args));
  },
  debug: (...args: unknown[]) => {
    if (enabled('debug')) console.info(...fmt('debug', args));
  },
};

/**
 * Install a global gate that silences ad-hoc `console.info` / `console.log` /
 * `console.debug` / `console.trace` calls when the active log level is below
 * `info`. `console.error` and `console.warn` are always preserved so that
 * existing error handling and signal-level warnings keep flowing to the
 * platform log sink.
 *
 * This lets us drop verbose tracing across hundreds of legacy call sites
 * without rewriting every file, while still allowing developers to opt back
 * in via `LOG_LEVEL=info` or `LOG_LEVEL=debug`.
 */
export function installConsoleGate(): void {
  const noop = () => {};
  if (!enabled('info')) {
    console.info = noop as typeof console.info;
    console.log = noop as typeof console.log;
  }
  if (!enabled('debug')) {
    console.debug = noop as typeof console.debug;
    console.trace = noop as typeof console.trace;
  }
}

export default logger;
