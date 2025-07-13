/**
 * Simple logger utility that can be disabled in production
 */

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  log: (message: string, ...args: unknown[]) => {
    if (isDevelopment) {
      console.log(message, ...args);
    }
  },
  
  warn: (message: string, ...args: unknown[]) => {
    if (isDevelopment) {
      console.warn(message, ...args);
    }
  },
  
  error: (message: string, ...args: unknown[]) => {
    // Always log errors, even in production
    console.error(message, ...args);
  },
  
  debug: (message: string, ...args: unknown[]) => {
    if (isDevelopment) {
      console.debug(message, ...args);
    }
  }
};