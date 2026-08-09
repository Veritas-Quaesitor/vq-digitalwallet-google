import { SDK_VERSION } from '../version.js';
import { defaults, isNullOrEmpty, resolveConfig, validateConfig } from '../core/config.js';
import { RateLimiter } from '../core/rate-limiter.js';
import { generateTransactionId as generateId } from '../core/ids.js';
import { validateBrowserSupport } from '../browser/environment.js';
import { loadGooglePayScript } from '../browser/google-pay-sdk-loader.js';
import { buildPaymentDataRequest, getBasePaymentDataRequest, validatePaymentData as validatePaymentDataRequest } from '../google-pay/request-builder.js';
import { decodePayloadFromBase64, encodePayloadToBase64, isValidBase64, normalizeGooglePayToken } from '../google-pay/response-mapper.js';
import { mountGooglePayButton } from '../ui/button.js';
import { logError as logErrorRuntime } from '../observability/runtime.js';
import type {
  ErrorInfo,
  GooglePayPaymentData,
  GooglePayPaymentsClient,
  PaymentData,
  PaymentResult,
  ResolvedConfig,
  VqDigitalWalletGoogleConfig
} from '../core/contracts.js';

/**
 * Instance shape exposed by `new VqDigitalWalletGoogle(config)` — also
 * callable without `new`, preserving the original constructor contract.
 */
export interface VqDigitalWalletGoogleInstance {
  config: ResolvedConfig;
  paymentsClient: GooglePayPaymentsClient | null;
  isReadyToPay: boolean;
  sessionToken: string | null;
  readonly version: string;

  validateConfig(config: ResolvedConfig): void;
  logError(message: string, error?: Error, context?: string): ErrorInfo;
  checkRateLimit(): void;
  initialize(): Promise<boolean>;
  checkReadyToPay(): Promise<boolean>;
  createButton(container: string | HTMLElement, paymentData: PaymentData): HTMLElement;
  validatePaymentData(paymentData: PaymentData): void;
  requestPayment(paymentData: PaymentData): Promise<PaymentResult>;
  buildPaymentDataRequest(paymentData: PaymentData): Record<string, unknown>;
  getBasePaymentDataRequest(): Record<string, unknown>;
  processPayment(paymentData: GooglePayPaymentData): Promise<PaymentResult>;
  invokeCallback(token: string | null, error?: Error): void;
  encodePayloadToBase64(tokenizationData: string): string;
  decodePayloadFromBase64(payload: string): unknown;
  storeSessionToken(token: string): void;
  getSessionToken(): string | null;
  clearSessionToken(): void;
  generateTransactionId(): string;
  destroy(): void;

  /** @internal per-instance rate limiter, not part of the documented surface */
  _rateLimiter: RateLimiter;
}

export interface VqDigitalWalletGoogleConstructor {
  (config: VqDigitalWalletGoogleConfig): VqDigitalWalletGoogleInstance;
  new (config: VqDigitalWalletGoogleConfig): VqDigitalWalletGoogleInstance;
  readonly version: string;
  readonly defaults: typeof defaults;
  readonly fn: VqDigitalWalletGoogleInstance;
}

// The original SDK used a jQuery-style factory (`fn.init` on the prototype)
// so that both `new VqDigitalWalletGoogle(config)` and
// `VqDigitalWalletGoogle(config)` construct an instance — a preserved
// contract (see contract-inventory.md). TypeScript classes cannot be called
// without `new`, so this pattern is kept deliberately instead of converting
// to a `class`.
function VqDigitalWalletGoogleFactory(this: unknown, config: VqDigitalWalletGoogleConfig): VqDigitalWalletGoogleInstance {
  return new (VqDigitalWalletGoogleImpl.fn.init as unknown as new (c: VqDigitalWalletGoogleConfig) => VqDigitalWalletGoogleInstance)(config);
}

const VqDigitalWalletGoogleImpl = VqDigitalWalletGoogleFactory as unknown as VqDigitalWalletGoogleConstructor & {
  fn: VqDigitalWalletGoogleInstance & { init: (this: VqDigitalWalletGoogleInstance, config: VqDigitalWalletGoogleConfig) => VqDigitalWalletGoogleInstance };
};

const proto = {
  constructor: VqDigitalWalletGoogleImpl,
  version: SDK_VERSION,

  // `init` must be a classic function expression, not ES2015 method
  // shorthand: shorthand methods are not constructible with `new`, and the
  // preserved factory pattern above calls `new fn.init(config)`.
  init: function (this: VqDigitalWalletGoogleInstance, config: VqDigitalWalletGoogleConfig): VqDigitalWalletGoogleInstance {
    validateBrowserSupport();

    this.config = resolveConfig(config);
    this.paymentsClient = null;
    this.isReadyToPay = false;
    this.sessionToken = null;
    this._rateLimiter = new RateLimiter();

    this.validateConfig(this.config);

    return this;
  },

  validateConfig(this: VqDigitalWalletGoogleInstance, config: ResolvedConfig): void {
    validateConfig(config);
  },

  logError(this: VqDigitalWalletGoogleInstance, message: string, error?: Error, context?: string): ErrorInfo {
    return logErrorRuntime(message, error, context || 'general', this.config.environment, this.version);
  },

  checkRateLimit(this: VqDigitalWalletGoogleInstance): void {
    this._rateLimiter.check();
  },

  initialize(this: VqDigitalWalletGoogleInstance): Promise<boolean> {
    return loadGooglePayScript(this.config.scriptLoadTimeout)
      .then((googlePayApi) => {
        this.paymentsClient = new googlePayApi.PaymentsClient({ environment: this.config.environment });
        return this.checkReadyToPay();
      })
      .catch((error) => {
        this.logError('Initialization failed', error, 'initialize');
        throw error;
      });
  },

  checkReadyToPay(this: VqDigitalWalletGoogleInstance): Promise<boolean> {
    const paymentDataRequest = this.getBasePaymentDataRequest();

    return this.paymentsClient!.isReadyToPay(paymentDataRequest)
      .then((response) => {
        if (!response.result) {
          if (this.config.allowedCardAuthMethods.length === 1 && this.config.allowedCardAuthMethods[0] === 'CRYPTOGRAM_3DS') {
            console.warn('VqDigitalWalletGoogle: Google Pay not available - CRYPTOGRAM_3DS requires device/card network support. Consider adding PAN_ONLY for broader compatibility.');
          } else if (this.config.allowedCardNetworks.length === 0) {
            console.warn('VqDigitalWalletGoogle: Google Pay not available - No card networks specified.');
          } else {
            console.warn('VqDigitalWalletGoogle: Google Pay not available on this device/browser. Check merchant configuration or device compatibility.');
          }
        } else if (this.config.environment === 'TEST') {
          console.log('VqDigitalWalletGoogle: Google Pay ready with auth methods:', this.config.allowedCardAuthMethods);
        }

        this.isReadyToPay = response.result;
        return response.result;
      })
      .catch((err: Error) => {
        console.error('VqDigitalWalletGoogle: Error checking Google Pay availability:', err);

        if (err.message && err.message.includes('merchantId')) {
          console.error('VqDigitalWalletGoogle: Check your merchantId configuration');
        } else if (err.message && err.message.includes('gateway')) {
          console.error('VqDigitalWalletGoogle: Check your gateway configuration');
        }

        return false;
      });
  },

  createButton(this: VqDigitalWalletGoogleInstance, container: string | HTMLElement, paymentData: PaymentData): HTMLElement {
    if (!this.isReadyToPay) {
      throw new Error('Google Pay is not ready. Call initialize() first.');
    }
    if (isNullOrEmpty(paymentData)) {
      throw new Error('Payment data is required');
    }

    this.validatePaymentData(paymentData);

    return mountGooglePayButton(
      this.paymentsClient!,
      container,
      { buttonColor: this.config.buttonColor, buttonType: this.config.buttonType, buttonSizeMode: this.config.buttonSizeMode },
      () => {
        try {
          this.requestPayment(paymentData);
        } catch (error) {
          this.logError('Button click handler failed', error as Error, 'createButton');
        }
      }
    );
  },

  validatePaymentData(this: VqDigitalWalletGoogleInstance, paymentData: PaymentData): void {
    validatePaymentDataRequest(paymentData);
  },

  requestPayment(this: VqDigitalWalletGoogleInstance, paymentData: PaymentData): Promise<PaymentResult> {
    try {
      this.checkRateLimit();

      const paymentDataRequest = this.buildPaymentDataRequest(paymentData);

      return this.paymentsClient!.loadPaymentData(paymentDataRequest)
        .then((responseData) => this.processPayment(responseData))
        .catch((err: Error) => {
          this.logError('Payment request failed', err, 'requestPayment');
          this.clearSessionToken();
          this.invokeCallback(null, err);
          throw err;
        });
    } catch (error) {
      this.logError('Payment request validation failed', error as Error, 'requestPayment');
      throw error;
    }
  },

  buildPaymentDataRequest(this: VqDigitalWalletGoogleInstance, paymentData: PaymentData): Record<string, unknown> {
    return buildPaymentDataRequest(this.config, paymentData, () => this.generateTransactionId());
  },

  getBasePaymentDataRequest(this: VqDigitalWalletGoogleInstance): Record<string, unknown> {
    return getBasePaymentDataRequest(this.config);
  },

  processPayment(this: VqDigitalWalletGoogleInstance, paymentData: GooglePayPaymentData): Promise<PaymentResult> {
    try {
      const rawToken = paymentData.paymentMethodData.tokenizationData.token;
      const tokenString = normalizeGooglePayToken(rawToken);
      const base64 = btoa(tokenString);

      if (isNullOrEmpty(base64) || !isValidBase64(base64)) {
        throw new Error('Failed to generate valid Google Pay token');
      }

      this.storeSessionToken(base64);
      this.invokeCallback(base64);

      return Promise.resolve({ success: true, token: base64, message: 'Google Pay token generated successfully' });
    } catch (error) {
      this.logError('Token processing failed', error as Error, 'processPayment');
      this.clearSessionToken();
      this.invokeCallback(null, error as Error);
      return Promise.reject(new Error('Google Pay token generation failed: ' + (error as Error).message));
    }
  },

  invokeCallback(this: VqDigitalWalletGoogleInstance, token: string | null, error?: Error): void {
    if (this.config.onTokenGenerated && typeof this.config.onTokenGenerated === 'function') {
      try {
        setTimeout(() => {
          try {
            this.config.onTokenGenerated!(token, error);
          } catch (callbackError) {
            this.logError('Callback execution failed', callbackError as Error, 'invokeCallback');
          }
        }, 0);
      } catch (callbackError) {
        this.logError('Callback setup failed', callbackError as Error, 'invokeCallback');
      }
    }
  },

  encodePayloadToBase64(tokenizationData: string): string {
    return encodePayloadToBase64(tokenizationData);
  },

  decodePayloadFromBase64(payload: string): unknown {
    return decodePayloadFromBase64(payload);
  },

  storeSessionToken(this: VqDigitalWalletGoogleInstance, token: string): void {
    this.sessionToken = token;
  },

  getSessionToken(this: VqDigitalWalletGoogleInstance): string | null {
    return this.sessionToken;
  },

  clearSessionToken(this: VqDigitalWalletGoogleInstance): void {
    this.sessionToken = null;
  },

  generateTransactionId(): string {
    return generateId();
  },

  destroy(this: VqDigitalWalletGoogleInstance): void {
    this.clearSessionToken();
    this.paymentsClient = null;
    this.isReadyToPay = false;
    this._rateLimiter.reset();
  }
};

VqDigitalWalletGoogleImpl.fn = VqDigitalWalletGoogleImpl.prototype = proto as unknown as VqDigitalWalletGoogleInstance & {
  init: (this: VqDigitalWalletGoogleInstance, config: VqDigitalWalletGoogleConfig) => VqDigitalWalletGoogleInstance;
};
(VqDigitalWalletGoogleImpl.fn.init as unknown as { prototype: unknown }).prototype = VqDigitalWalletGoogleImpl.fn;

Object.defineProperty(VqDigitalWalletGoogleImpl, 'version', { value: SDK_VERSION, enumerable: true });
Object.defineProperty(VqDigitalWalletGoogleImpl, 'defaults', { value: defaults, enumerable: true });

export const VqDigitalWalletGoogle: VqDigitalWalletGoogleConstructor = VqDigitalWalletGoogleImpl;
