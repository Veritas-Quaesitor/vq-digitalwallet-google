import { GOOGLE_PAY_API_VERSION, GOOGLE_PAY_API_VERSION_MINOR } from '../version.js';
import type { PaymentData, ResolvedConfig } from '../core/contracts.js';

const VALID_CURRENCIES = [
  'AED', 'AUD', 'BRL', 'CAD', 'CHF', 'CNY', 'DKK', 'EGP', 'EUR',
  'GBP', 'GHS', 'HKD', 'INR', 'JPY', 'KES', 'MXN', 'NGN', 'NOK',
  'NZD', 'SEK', 'SGD', 'USD', 'ZAR'
];

/** @throws {Error} When payment data is invalid. */
export function validatePaymentData(paymentData: PaymentData): void {
  if (!paymentData.amount || paymentData.amount <= 0 || paymentData.amount > 999999.99) {
    throw new Error('Amount must be between 0.01 and 999999.99');
  }

  const amountStr = paymentData.amount.toString();
  if (!/^\d+(\.\d{1,2})?$/.test(amountStr)) {
    throw new Error('Amount must have maximum 2 decimal places');
  }

  if (!paymentData.currency || VALID_CURRENCIES.indexOf(paymentData.currency.toUpperCase()) === -1) {
    throw new Error('Invalid or unsupported currency code for Google Pay');
  }

  if (paymentData.countryCode && (paymentData.countryCode.length !== 2 || !/^[A-Z]{2}$/.test(paymentData.countryCode))) {
    throw new Error('Country code must be 2 uppercase letters (ISO 3166-1 alpha-2)');
  }

  if (paymentData.transactionId && (paymentData.transactionId.length > 128 || /[<>"';&\r\n]/.test(paymentData.transactionId))) {
    throw new Error('Transaction ID contains invalid characters or is too long');
  }
}

export function getBasePaymentDataRequest(config: ResolvedConfig): Record<string, unknown> {
  return {
    apiVersion: GOOGLE_PAY_API_VERSION,
    apiVersionMinor: GOOGLE_PAY_API_VERSION_MINOR,
    allowedPaymentMethods: [{
      type: 'CARD',
      parameters: {
        allowedAuthMethods: config.allowedCardAuthMethods,
        allowedCardNetworks: config.allowedCardNetworks
      },
      tokenizationSpecification: {
        type: 'PAYMENT_GATEWAY',
        parameters: {
          gateway: config.gateway,
          gatewayMerchantId: config.gatewayMerchantId
        }
      }
    }]
  };
}

export function buildPaymentDataRequest(
  config: ResolvedConfig,
  paymentData: PaymentData,
  generateTransactionId: () => string
): Record<string, unknown> {
  const baseRequest = getBasePaymentDataRequest(config);

  return Object.assign(baseRequest, {
    merchantInfo: {
      merchantId: config.merchantId,
      merchantName: config.merchantName || 'Merchant'
    },
    transactionInfo: {
      totalPriceStatus: 'FINAL',
      totalPrice: paymentData.amount.toString(),
      totalPriceLabel: 'Total',
      currencyCode: paymentData.currency.toUpperCase() || 'ZAR',
      countryCode: paymentData.countryCode || 'ZA',
      transactionId: paymentData.transactionId || generateTransactionId(),
      checkoutOption: 'COMPLETE_IMMEDIATE_PURCHASE'
    }
  });
}
