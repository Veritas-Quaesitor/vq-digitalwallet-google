import type { ErrorInfo } from '../core/contracts.js';

/**
 * Builds structured error info and logs it. Verbose in TEST (message +
 * stack), message-only in PRODUCTION to avoid leaking internals.
 */
export function logError(message: string, error: Error | undefined, context: string, environment: string, version: string): ErrorInfo {
  const errorInfo: ErrorInfo = {
    message,
    error: error ? error.message : 'Unknown error',
    context: context || 'general',
    timestamp: new Date().toISOString(),
    version
  };

  if (environment === 'TEST') {
    console.error('VqDigitalWalletGoogle Error:', errorInfo);
    if (error && error.stack) {
      console.error('Stack trace:', error.stack);
    }
  } else {
    console.error('VqDigitalWalletGoogle Error:', errorInfo.message);
  }

  return errorInfo;
}
