import { VqDigitalWalletGoogle } from './google-pay/client.js';

export { VqDigitalWalletGoogle } from './google-pay/client.js';
export type { VqDigitalWalletGoogleInstance, VqDigitalWalletGoogleConstructor } from './google-pay/client.js';
export type { PaymentData, PaymentResult, VqDigitalWalletGoogleConfig, ErrorInfo } from './core/contracts.js';
export { SDK_VERSION } from './version.js';

declare global {
  interface Window {
    VqDigitalWalletGoogle?: typeof VqDigitalWalletGoogle;
  }
}

if (typeof window !== 'undefined') {
  window.VqDigitalWalletGoogle = VqDigitalWalletGoogle;
}
