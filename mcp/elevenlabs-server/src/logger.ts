export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const levelWeights: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const envLevel = (process.env.LOG_LEVEL as LogLevel | undefined) ?? 'info';
const threshold = levelWeights[envLevel] ?? levelWeights.info;

const format = (level: LogLevel, message: string, meta?: Record<string, unknown>): string => {
  const payload = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...meta,
  };
  return JSON.stringify(payload);
};

export const logger = {
  debug: (message: string, meta?: Record<string, unknown>) => {
    if (threshold <= levelWeights.debug) {
      console.debug(format('debug', message, meta));
    }
  },
  info: (message: string, meta?: Record<string, unknown>) => {
    if (threshold <= levelWeights.info) {
      console.info(format('info', message, meta));
    }
  },
  warn: (message: string, meta?: Record<string, unknown>) => {
    if (threshold <= levelWeights.warn) {
      console.warn(format('warn', message, meta));
    }
  },
  error: (message: string, meta?: Record<string, unknown>) => {
    if (threshold <= levelWeights.error) {
      console.error(format('error', message, meta));
    }
  },
};
