/**
 * TypeScript definitions for Ecentric Google Pay Client SDK
 * @version 1.1.0
 * @author Ecentric
 */

/**
 * Configuration object for EpsGooglePay initialization
 */
export interface EpsGooglePayConfig {
  /** Google Pay environment ('TEST' or 'PRODUCTION') */
  environment: 'TEST' | 'PRODUCTION';
  /** Payment gateway identifier */
  gateway: string;
  /** Google Pay merchant ID (10-32 alphanumeric characters) */
  merchantId: string;
  /** Display name for the merchant */
  merchantName: string;
  /** Gateway-specific merchant identifier */
  gatewayMerchantId: string;
  /** Supported card networks */
  allowedCardNetworks?: string[];
  /** Authentication methods */
  allowedCardAuthMethods?: string[];
  /** Google Pay button color theme */
  buttonColor?: 'default' | 'black' | 'white';
  /** Google Pay button type */
  buttonType?: 'book' | 'buy' | 'checkout' | 'donate' | 'order' | 'pay' | 'plain' | 'subscribe';
  /** Google Pay button size mode */
  buttonSizeMode?: 'static' | 'fill';
  /** Callback function for successful token generation */
  onTokenGenerated?: (token: string | null, error?: Error) => void;
  /** Timeout for loading Google Pay script (ms) */
  scriptLoadTimeout?: number;
}

/**
 * Payment data object for transaction processing
 */
export interface PaymentData {
  /** Payment amount (0.01 to 999999.99) */
  amount: number;
  /** Currency code (currently supports 'ZAR') */
  currency: string;
  /** ISO 3166-1 alpha-2 country code */
  countryCode?: string;
  /** Unique transaction identifier */
  transactionId?: string;
}

/**
 * Payment processing result object
 */
export interface PaymentResult {
  /** Whether the payment processing was successful */
  success: boolean;
  /** Base64 encoded payment token */
  token: string;
  /** Result message */
  message: string;
}

/**
 * Error information object
 */
export interface ErrorInfo {
  /** Error message */
  message: string;
  /** Error details */
  error: string;
  /** Context where error occurred */
  context: string;
  /** ISO timestamp of error */
  timestamp: string;
  /** SDK version */
  version: string;
}

/**
 * Default configuration values
 */
export interface EpsGooglePayDefaults {
  environment: string;
  gateway: string;
  merchantId: string;
  merchantName: string;
  gatewayMerchantId: string;
  allowedCardNetworks: string[];
  allowedCardAuthMethods: string[];
  buttonColor: string;
  buttonType: string;
  buttonSizeMode: string;
  onTokenGenerated: ((token: string | null, error?: Error) => void) | null;
  scriptLoadTimeout: number;
}

/**
 * Main EpsGooglePay class
 */
export interface EpsGooglePay {
  /** SDK version */
  readonly version: string;
  /** Configuration object */
  readonly config: EpsGooglePayConfig;
  /** Google Pay client instance */
  readonly paymentsClient: any;
  /** Whether Google Pay is ready for payments */
  readonly isReadyToPay: boolean;
  /** Current session token */
  readonly sessionToken: string | null;

  /**
   * Initialize EpsGooglePay instance
   * @param config Configuration object
   * @returns This instance for chaining
   * @throws When browser support is insufficient or configuration is invalid
   */
  init(config: EpsGooglePayConfig): EpsGooglePay;

  /**
   * Validate configuration object
   * @param config Configuration to validate
   * @throws When configuration is invalid
   */
  validateConfig(config: EpsGooglePayConfig): void;

  /**
   * Log error with context and metadata
   * @param message Error message
   * @param error Error object
   * @param context Context where error occurred
   * @returns Error information object
   */
  logError(message: string, error?: Error, context?: string): ErrorInfo;

  /**
   * Check and enforce rate limiting
   * @throws When rate limit is exceeded
   */
  checkRateLimit(): void;

  /**
   * Initialize Google Pay API and check readiness
   * @returns Promise resolving to readiness status
   * @throws When initialization fails
   */
  initialize(): Promise<boolean>;

  /**
   * Create Google Pay button and attach to container
   * @param container Container element or ID
   * @param paymentData Payment data for the transaction
   * @returns Created button element
   * @throws When Google Pay is not ready or parameters are invalid
   */
  createButton(container: string | HTMLElement, paymentData: PaymentData): HTMLElement;

  /**
   * Validate payment data object
   * @param paymentData Payment data to validate
   * @throws When payment data is invalid
   */
  validatePaymentData(paymentData: PaymentData): void;

  /**
   * Request payment from Google Pay
   * @param paymentData Payment data for the transaction
   * @returns Promise resolving to payment result
   * @throws When payment request fails or rate limit is exceeded
   */
  requestPayment(paymentData: PaymentData): Promise<PaymentResult>;

  /**
   * Build Google Pay payment data request object
   * @param paymentData Payment data
   * @returns Google Pay payment data request
   */
  buildPaymentDataRequest(paymentData: PaymentData): any;

  /**
   * Get base payment data request structure
   * @returns Base payment data request object
   */
  getBasePaymentDataRequest(): any;

  /**
   * Process payment data from Google Pay and generate token
   * @param paymentData Payment data from Google Pay
   * @returns Promise resolving to payment result
   * @throws When token processing fails
   */
  processPayment(paymentData: any): Promise<PaymentResult>;

  /**
   * Invoke callback function with token or error
   * @param token Generated token or null if error
   * @param error Error object if processing failed
   */
  invokeCallback(token: string | null, error?: Error): void;

  /**
   * Encode payload to Base64
   * @param tokenizationData Data to encode
   * @returns Base64 encoded string
   * @throws When encoding fails
   */
  encodePayloadToBase64(tokenizationData: string): string;

  /**
   * Decode Base64 payload to object
   * @param base64EncodedPayload Base64 encoded payload
   * @returns Decoded object
   * @throws When decoding fails or payload is invalid
   */
  decodePayloadFromBase64(base64EncodedPayload: string): any;

  /**
   * Store session token
   * @param token Token to store
   */
  storeSessionToken(token: string): void;

  /**
   * Get stored session token
   * @returns Stored token or null if none exists
   */
  getSessionToken(): string | null;

  /**
   * Clear stored session token
   */
  clearSessionToken(): void;

  /**
   * Generate unique transaction ID (UUID v4)
   * @returns UUID v4 transaction ID
   */
  generateTransactionId(): string;

  /**
   * Destroy instance and cleanup resources
   */
  destroy(): void;
}

/**
 * EpsGooglePay constructor interface
 */
export interface EpsGooglePayConstructor {
  /**
   * Create new EpsGooglePay instance
   * @param config Configuration object
   * @returns New EpsGooglePay instance
   */
  new (config: EpsGooglePayConfig): EpsGooglePay;
  (config: EpsGooglePayConfig): EpsGooglePay;

  /** SDK version */
  readonly version: string;
  /** Default configuration values */
  readonly defaults: EpsGooglePayDefaults;

  /**
   * Restore previous EpsGooglePay and return this instance
   * @returns EpsGooglePay constructor
   */
  noConflict(): EpsGooglePayConstructor;
}

/**
 * Main export - EpsGooglePay constructor
 */
declare const EpsGooglePay: EpsGooglePayConstructor;
export default EpsGooglePay;