// Simple structured logger for STIGMATOR
// In production, logs are suppressed. In development, they go to console.

const isDev = process.env.NODE_ENV === "development";
const isTest = process.env.NODE_ENV === "test";

function createLogger(namespace: string) {
  return {
    debug: (...args: unknown[]) => {
      if (isDev && !isTest) console.debug(`[${namespace}]`, ...args);
    },
    info: (...args: unknown[]) => {
      if (isDev && !isTest) console.info(`[${namespace}]`, ...args);
    },
    warn: (...args: unknown[]) => {
      if (isDev && !isTest) console.warn(`[${namespace}]`, ...args);
    },
    error: (...args: unknown[]) => {
      // Always log errors, but strip in production if needed
      console.error(`[${namespace}]`, ...args);
    },
  };
}

export const logger = createLogger("stigmator");
export default createLogger;
