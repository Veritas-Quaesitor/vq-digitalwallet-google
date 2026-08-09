/** Configuration accepted by `new VqDigitalWalletGoogle(config)`. */
export interface VqDigitalWalletGoogleConfig {
  /** Google Pay environment ('TEST' or 'PRODUCTION'). */
  environment: 'TEST' | 'PRODUCTION';
  /** Payment gateway identifier. */
  gateway: string;
  /** Google Pay merchant ID (10-32 alphanumeric characters). */
  merchantId: string;
  /** Display name for the merchant. */
  merchantName?: string;
  /** Gateway-specific merchant identifier. */
  gatewayMerchantId: string;
  /** Supported card networks. Defaults to `['MASTERCARD', 'VISA']`. */
  allowedCardNetworks?: string[];
  /** Supported authentication methods. Defaults to `['PAN_ONLY', 'CRYPTOGRAM_3DS']`. */
  allowedCardAuthMethods?: string[];
  /** Google Pay button color theme. Defaults to `'default'`. */
  buttonColor?: 'default' | 'black' | 'white';
  /** Google Pay button type. Defaults to `'pay'`. */
  buttonType?: 'book' | 'buy' | 'checkout' | 'donate' | 'order' | 'pay' | 'plain' | 'subscribe';
  /** Google Pay button size mode. Defaults to `'static'`. */
  buttonSizeMode?: 'static' | 'fill';
  /** Callback invoked with the generated token or an error. */
  onTokenGenerated?: ((token: string | null, error?: Error) => void) | null;
  /** Timeout for loading the Google Pay script (ms). Defaults to `10000`. */
  scriptLoadTimeout?: number;
}

/** Config after defaults have been merged in and validated. */
export type ResolvedConfig = Required<Omit<VqDigitalWalletGoogleConfig, 'onTokenGenerated'>> &
  Pick<VqDigitalWalletGoogleConfig, 'onTokenGenerated'>;

/** Payment data for a transaction. */
export interface PaymentData {
  /** Payment amount (0.01 to 999999.99). */
  amount: number;
  /** Currency code. */
  currency: string;
  /** ISO 3166-1 alpha-2 country code. Defaults to `'ZA'`. */
  countryCode?: string;
  /** Unique transaction identifier. Generated if omitted. */
  transactionId?: string;
}

/** Result of a successful payment processing call. */
export interface PaymentResult {
  success: boolean;
  /** Base64-encoded payment token (encoding, not encryption — verify server-side). */
  token: string;
  message: string;
}

/** Structured error information returned by `logError`. */
export interface ErrorInfo {
  message: string;
  error: string;
  context: string;
  timestamp: string;
  version: string;
}

/** Minimal shape of the global `google.payments.api` surface this SDK depends on. */
export interface GooglePayApi {
  PaymentsClient: new (options: { environment: string }) => GooglePayPaymentsClient;
}

export interface GooglePayPaymentsClient {
  isReadyToPay(request: unknown): Promise<{ result: boolean }>;
  loadPaymentData(request: unknown): Promise<GooglePayPaymentData>;
  createButton(options: {
    onClick: () => void;
    buttonColor?: string;
    buttonType?: string;
    buttonSizeMode?: string;
  }): HTMLElement;
}

export interface GooglePayPaymentData {
  paymentMethodData: {
    tokenizationData: {
      token: string;
    };
  };
}
