import type { ResolvedConfig, VqDigitalWalletGoogleConfig } from './contracts.js';

const VALID_ENVIRONMENTS = ['TEST', 'PRODUCTION'];
const VALID_BUTTON_COLORS = ['default', 'black', 'white'];
const VALID_BUTTON_TYPES = ['book', 'buy', 'checkout', 'donate', 'order', 'pay', 'plain', 'subscribe'];
const VALID_SIZE_MODES = ['static', 'fill'];

export const defaults = {
  environment: '',
  gateway: '',
  merchantId: '',
  merchantName: '',
  gatewayMerchantId: '',
  allowedCardNetworks: ['MASTERCARD', 'VISA'],
  allowedCardAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
  buttonColor: 'default',
  buttonType: 'pay',
  buttonSizeMode: 'static',
  onTokenGenerated: null,
  scriptLoadTimeout: 10000
} as const;

/** Extends target with properties from sources, guarding against prototype pollution. */
export function extend<T extends object>(target: T, ...sources: Array<Partial<T> | undefined | null>): T {
  sources.forEach((source) => {
    if (source) {
      Object.keys(source).forEach((key) => {
        if (key === '__proto__' || key === 'constructor' || key === 'prototype') return;
        (target as Record<string, unknown>)[key] = (source as Record<string, unknown>)[key];
      });
    }
  });
  return target;
}

export function isNullOrEmpty(value: unknown): boolean {
  if (value == null) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object' && (value as object).constructor === Object) {
    return Object.keys(value as object).length === 0;
  }
  return false;
}

export function sanitizeConfigString(input: unknown, maxLength?: number): string {
  if (typeof input !== 'string') return '';
  const limit = maxLength || 255;
  return input.replace(/[<>"';&\r\n]/g, '').substring(0, limit).trim();
}

function validateMerchantId(id: string): void {
  if (isNullOrEmpty(id)) {
    throw new Error('merchantId is required');
  }
  if (!/^[a-zA-Z0-9]{10,32}$/.test(id)) {
    throw new Error('merchantId format appears invalid for Google Pay');
  }
}

function validateGatewayConfig(gateway: string, gatewayMerchantId: string): void {
  if (isNullOrEmpty(gateway)) {
    throw new Error('gateway is required');
  }
  if (isNullOrEmpty(gatewayMerchantId)) {
    throw new Error('gatewayMerchantId is required');
  }
  if (gateway.length > 64 || /[<>"';&\r\n]/.test(gateway)) {
    throw new Error('gateway contains invalid characters');
  }
  if (gatewayMerchantId.length > 128 || /[<>"';&\r\n]/.test(gatewayMerchantId)) {
    throw new Error('gatewayMerchantId contains invalid characters');
  }
}

/** Validates a resolved config in place, mutating `merchantName` to its sanitized form. */
export function validateConfig(config: ResolvedConfig): void {
  validateMerchantId(config.merchantId);
  validateGatewayConfig(config.gateway, config.gatewayMerchantId);

  if (VALID_ENVIRONMENTS.indexOf(config.environment) === -1) {
    throw new Error('Invalid environment. Must be TEST or PRODUCTION');
  }
  if (VALID_BUTTON_COLORS.indexOf(config.buttonColor) === -1) {
    throw new Error('Invalid buttonColor. Must be: default, black, or white');
  }
  if (VALID_BUTTON_TYPES.indexOf(config.buttonType) === -1) {
    throw new Error('Invalid buttonType. Must be one of: book, buy, checkout, donate, order, pay, plain, subscribe');
  }
  if (VALID_SIZE_MODES.indexOf(config.buttonSizeMode) === -1) {
    throw new Error('Invalid buttonSizeMode. Must be: static or fill');
  }
  if (typeof config.scriptLoadTimeout !== 'number' || config.scriptLoadTimeout <= 0) {
    throw new Error('scriptLoadTimeout must be a positive number');
  }
  if (!Array.isArray(config.allowedCardNetworks) || config.allowedCardNetworks.length === 0) {
    throw new Error('allowedCardNetworks must be a non-empty array');
  }
  if (!Array.isArray(config.allowedCardAuthMethods) || config.allowedCardAuthMethods.length === 0) {
    throw new Error('allowedCardAuthMethods must be a non-empty array');
  }

  config.merchantName = sanitizeConfigString(config.merchantName, 100);
}

export function resolveConfig(config: VqDigitalWalletGoogleConfig): ResolvedConfig {
  return extend({}, defaults, config || {}) as unknown as ResolvedConfig;
}
