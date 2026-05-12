/*!
 * vq-digitalwallet-google v1.1.0
 * Released under the MIT License.
 */
(function () {
    'use strict';

    /**
     * @fileoverview VQ Digital Wallet - Google Pay SDK - Enhanced Security & Enterprise Edition
     * A comprehensive Google Pay integration library providing secure payment processing
     * with enterprise-grade features including rate limiting, session management, and robust error handling.
     *
     * @version 1.1.0
     * @author Veritas Quaesitor
     * @license MIT
     * @compliance Google Pay API specification aligned
     * @since 1.0.0
     */

    (function (global, factory) {

      if (typeof module === "object" && typeof module.exports === "object") {
        module.exports = factory(global, true);
      } else if (typeof define === "function" && define.amd) {
        define(function () {
          return factory(global);
        });
      } else {
        factory(global);
      }
    })(typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {}, function (window, noGlobal) {

      /**
       * Current SDK version
       * @constant {string}
       * @default "1.0.0"
       */
      var version = "1.1.0";

      /**
       * Google Pay API version
       * @constant {number}
       * @default 2
       */
      var GOOGLE_PAY_API_VERSION = 2;

      /**
       * Google Pay API minor version
       * @constant {number}
       * @default 0
       */
      var GOOGLE_PAY_API_VERSION_MINOR = 0;

      /**
       * Valid Google Pay environments
       * @constant {string[]}
       */
      var VALID_ENVIRONMENTS = ['TEST', 'PRODUCTION'];

      /**
       * Rate limiting constants
       * @private
       */
      var MAX_REQUESTS_PER_SECOND = 3;
      var REQUEST_COOLDOWN = 1000;

      /**
       * Default configuration object
       * @typedef {Object} VqDigitalWalletGoogleDefaults
       * @property {string} environment - Google Pay environment ('TEST' or 'PRODUCTION')
       * @property {string} gateway - Payment gateway identifier
       * @property {string} merchantId - Google Pay merchant ID
       * @property {string} merchantName - Display name for the merchant
       * @property {string} gatewayMerchantId - Gateway-specific merchant identifier
       * @property {string[]} allowedCardNetworks - Supported card networks
       * @property {string[]} allowedCardAuthMethods - Supported authentication methods
       * @property {string} buttonColor - Google Pay button color theme
       * @property {string} buttonType - Google Pay button type
       * @property {string} buttonSizeMode - Google Pay button size mode
       * @property {Function|null} onTokenGenerated - Callback function for token generation
       * @property {number} scriptLoadTimeout - Timeout for loading Google Pay script (ms)
       */
      var defaults = {
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
      };

      /**
       * Supported currencies for Google Pay transactions
       * @constant {string[]}
       */
      var VALID_CURRENCIES = ['AED', 'AUD', 'BRL', 'CAD', 'CHF', 'CNY', 'DKK', 'EGP', 'EUR', 'GBP', 'GHS', 'HKD', 'INR', 'JPY', 'KES', 'MXN', 'NGN', 'NOK', 'NZD', 'SEK', 'SGD', 'USD', 'ZAR'];

      /**
       * Configuration object for VqDigitalWalletGoogle initialization
       * @typedef {Object} VqDigitalWalletGoogleConfig
       * @property {string} environment - Google Pay environment ('TEST' or 'PRODUCTION')
       * @property {string} gateway - Payment gateway identifier
       * @property {string} merchantId - Google Pay merchant ID (10-32 alphanumeric characters)
       * @property {string} merchantName - Display name for the merchant
       * @property {string} gatewayMerchantId - Gateway-specific merchant identifier
       * @property {string[]} [allowedCardNetworks=['MASTERCARD', 'VISA']] - Supported card networks
       * @property {string[]} [allowedCardAuthMethods=['PAN_ONLY', 'CRYPTOGRAM_3DS']] - Authentication methods
       * @property {string} [buttonColor='default'] - Google Pay button color theme
       * @property {string} [buttonType='pay'] - Google Pay button type
       * @property {string} [buttonSizeMode='static'] - Google Pay button size mode
       * @property {Function} [onTokenGenerated] - Callback function for successful token generation
       * @property {number} [scriptLoadTimeout=10000] - Timeout for loading Google Pay script (ms)
       */

      /**
       * Payment data object for transaction processing
       * @typedef {Object} PaymentData
       * @property {number} amount - Payment amount (0.01 to 999999.99)
       * @property {string} currency - Currency code (currently supports 'ZAR')
       * @property {string} [countryCode='ZA'] - ISO 3166-1 alpha-2 country code
       * @property {string} [transactionId] - Unique transaction identifier
       */

      /**
       * Payment processing result object
       * @typedef {Object} PaymentResult
       * @property {boolean} success - Whether the payment processing was successful
       * @property {string} token - Base64 encoded payment token
       * @property {string} message - Result message
       */

      /**
       * Error information object
       * @typedef {Object} ErrorInfo
       * @property {string} message - Error message
       * @property {string} error - Error details
       * @property {string} context - Context where error occurred
       * @property {string} timestamp - ISO timestamp of error
       * @property {string} version - SDK version
       */

      /**
       * Extends target object with properties from source objects
       * @private
       * @param {Object} target - Target object to extend
       * @param {...Object} sources - Source objects to copy properties from
       * @returns {Object} Extended target object
       */
      function extend(target) {
        var sources = Array.prototype.slice.call(arguments, 1);
        sources.forEach(function (source) {
          if (source) {
            Object.keys(source).forEach(function (key) {
              if (key === '__proto__' || key === 'constructor' || key === 'prototype') return;
              target[key] = source[key];
            });
          }
        });
        return target;
      }

      /**
       * Checks if a value is null, undefined, or empty
       * @private
       * @param {*} value - Value to check
       * @returns {boolean} True if value is null, undefined, or empty
       */
      function isNullOrEmpty(value) {
        if (value == null) return true;
        if (typeof value === "string") return value.trim() === '';
        if (Array.isArray(value)) return value.length === 0;
        if (typeof value === "object" && value.constructor === Object) {
          return Object.keys(value).length === 0;
        }
        if (typeof value === "number") return false;
        if (typeof value === "boolean") return false;
        if (typeof value === "function") return false;
        return false;
      }

      /**
       * Validates if a string is valid Base64
       * @private
       * @param {string} str - String to validate
       * @returns {boolean} True if valid Base64
       */
      function isValidBase64(str) {
        if (isNullOrEmpty(str)) return false;
        try {
          var decoded = atob(str);
          return btoa(decoded) === str;
        } catch (err) {
          return false;
        }
      }

      /**
       * Validates Google Pay merchant ID format
       * @private
       * @param {string} id - Merchant ID to validate
       * @throws {Error} When merchant ID is invalid
       * @returns {boolean} True if valid
       */
      function validateMerchantId(id) {
        if (isNullOrEmpty(id)) {
          throw new Error("merchantId is required");
        }
        if (!/^[a-zA-Z0-9]{10,32}$/.test(id)) {
          throw new Error("merchantId format appears invalid for Google Pay");
        }
        return true;
      }

      /**
       * Validates gateway configuration parameters
       * @private
       * @param {string} gateway - Gateway identifier
       * @param {string} gatewayMerchantId - Gateway merchant ID
       * @throws {Error} When gateway configuration is invalid
       * @returns {boolean} True if valid
       */
      function validateGatewayConfig(gateway, gatewayMerchantId) {
        if (isNullOrEmpty(gateway)) {
          throw new Error("gateway is required");
        }
        if (isNullOrEmpty(gatewayMerchantId)) {
          throw new Error("gatewayMerchantId is required");
        }
        if (gateway.length > 64 || /[<>"';&\r\n]/.test(gateway)) {
          throw new Error("gateway contains invalid characters");
        }
        if (gatewayMerchantId.length > 128 || /[<>"';&\r\n]/.test(gatewayMerchantId)) {
          throw new Error("gatewayMerchantId contains invalid characters");
        }
        return true;
      }

      /**
       * Sanitizes configuration strings by removing dangerous characters
       * @private
       * @param {string} input - Input string to sanitize
       * @param {number} [maxLength=255] - Maximum allowed length
       * @returns {string} Sanitized string
       */
      function sanitizeConfigString(input, maxLength) {
        if (typeof input !== 'string') return '';
        maxLength = maxLength || 255;
        return input.replace(/[<>"';&\r\n]/g, '').substring(0, maxLength).trim();
      }

      /**
       * Validates browser support for required APIs
       * @private
       * @throws {Error} When required browser APIs are not supported
       */
      function validateBrowserSupport() {
        if (typeof btoa === 'undefined') {
          throw new Error('Base64 encoding not supported in this browser');
        }
        if (typeof Promise === 'undefined') {
          throw new Error('Promise support required');
        }
        if (typeof JSON === 'undefined') {
          throw new Error('JSON support required');
        }
      }

      /**
       * Normalizes Google Pay token to ensure proper JSON format
       * @private
       * @param {string|Object} rawToken - Raw token from Google Pay
       * @returns {string} Normalized JSON string
       */
      function normalizeGooglePayToken(rawToken) {
        var jsonString = typeof rawToken === 'string' ? rawToken : JSON.stringify(rawToken);
        return jsonString.startsWith('"') ? jsonString : JSON.stringify(jsonString);
      }

      /**
       * Loads Google Pay script from CDN
       * @private
       * @param {number} [timeout=10000] - Timeout in milliseconds
       * @returns {Promise<Object>} Promise resolving to Google Pay API object
       */
      function loadGooglePayScript(timeout) {
        return new Promise(function (resolve, reject) {
          if (window.google && window.google.payments && window.google.payments.api) {
            resolve(window.google.payments.api);
            return;
          }
          var script = document.createElement('script');
          script.src = 'https://pay.google.com/gp/p/js/pay.js';
          script.async = true;
          var timeoutId = setTimeout(function () {
            reject(new Error('Google Pay script load timeout after ' + timeout + 'ms'));
          }, timeout || 10000);
          script.onload = function () {
            clearTimeout(timeoutId);
            if (window.google && window.google.payments && window.google.payments.api) {
              resolve(window.google.payments.api);
            } else {
              reject(new Error('Google Pay API failed to load properly'));
            }
          };
          script.onerror = function () {
            clearTimeout(timeoutId);
            reject(new Error('Failed to load Google Pay script from CDN'));
          };
          document.head.appendChild(script);
        });
      }

      /**
       * VqDigitalWalletGoogle main constructor function
       * @class
       * @param {VqDigitalWalletGoogleConfig} config - Configuration object
       * @returns {VqDigitalWalletGoogle} New VqDigitalWalletGoogle instance
       * @example
       * const googlePay = VqDigitalWalletGoogle({
       *   environment: 'TEST',
       *   gateway: 'example',
       *   merchantId: 'BCR2DN4T23YWKJHG',
       *   merchantName: 'Test Merchant',
       *   gatewayMerchantId: 'test_merchant_123',
       *   allowedCardNetworks: ['MASTERCARD', 'VISA'],
       *   allowedCardAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
       *   onTokenGenerated: function(token, error) {
       *     if (error) {
       *       console.error('Payment failed:', error);
       *     } else {
       *       console.log('Payment token:', token);
       *     }
       *   }
       * });
       */
      var VqDigitalWalletGoogle = function (config) {
        return new VqDigitalWalletGoogle.fn.init(config);
      };
      VqDigitalWalletGoogle.fn = VqDigitalWalletGoogle.prototype = {
        constructor: VqDigitalWalletGoogle,
        version: version,
        /**
         * Initialize VqDigitalWalletGoogle instance
         * @memberof VqDigitalWalletGoogle
         * @param {VqDigitalWalletGoogleConfig} config - Configuration object
         * @returns {VqDigitalWalletGoogle} This instance for chaining
         * @throws {Error} When browser support is insufficient or configuration is invalid
         */
        init: function (config) {
          validateBrowserSupport();
          this.config = extend({}, defaults, config || {});
          this.paymentsClient = null;
          this.isReadyToPay = false;
          this.sessionToken = null;
          this._requestCount = 0;
          this._lastRequestTime = 0;
          this.validateConfig(this.config);
          return this;
        },
        /**
         * Validate configuration object
         * @memberof VqDigitalWalletGoogle
         * @param {VqDigitalWalletGoogleConfig} config - Configuration to validate
         * @throws {Error} When configuration is invalid
         */
        validateConfig: function (config) {
          validateMerchantId(config.merchantId);
          validateGatewayConfig(config.gateway, config.gatewayMerchantId);
          if (VALID_ENVIRONMENTS.indexOf(config.environment) === -1) {
            throw new Error('Invalid environment. Must be TEST or PRODUCTION');
          }
          var VALID_BUTTON_COLORS = ['default', 'black', 'white'];
          var VALID_BUTTON_TYPES = ['book', 'buy', 'checkout', 'donate', 'order', 'pay', 'plain', 'subscribe'];
          var VALID_SIZE_MODES = ['static', 'fill'];
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
        },
        /**
         * Log error with context and metadata
         * @memberof VqDigitalWalletGoogle
         * @param {string} message - Error message
         * @param {Error} [error] - Error object
         * @param {string} [context='general'] - Context where error occurred
         * @returns {ErrorInfo} Error information object
         * @example
         * const errorInfo = googlePay.logError('Payment failed', error, 'processPayment');
         */
        logError: function (message, error, context) {
          var errorInfo = {
            message: message,
            error: error ? error.message : 'Unknown error',
            context: context || 'general',
            timestamp: new Date().toISOString(),
            version: this.version
          };
          if (this.config.environment === 'TEST') {
            console.error('VqDigitalWalletGoogle Error:', errorInfo);
            if (error && error.stack) {
              console.error('Stack trace:', error.stack);
            }
          } else {
            console.error('VqDigitalWalletGoogle Error:', errorInfo.message);
          }
          return errorInfo;
        },
        /**
         * Check and enforce rate limiting
         * @memberof VqDigitalWalletGoogle
         * @throws {Error} When rate limit is exceeded
         * @example
         * try {
         *   googlePay.checkRateLimit();
         * } catch (error) {
         *   console.log('Rate limit exceeded, please wait');
         * }
         */
        checkRateLimit: function () {
          var now = Date.now();
          if (now - this._lastRequestTime < REQUEST_COOLDOWN) {
            this._requestCount++;
            if (this._requestCount > MAX_REQUESTS_PER_SECOND) {
              throw new Error('Too many payment requests. Please wait before trying again.');
            }
          } else {
            this._requestCount = 1;
          }
          this._lastRequestTime = now;
        },
        /**
         * Initialize Google Pay API and check readiness
         * @memberof VqDigitalWalletGoogle
         * @returns {Promise<boolean>} Promise resolving to readiness status
         * @throws {Error} When initialization fails
         * @example
         * googlePay.initialize()
         *   .then(function(isReady) {
         *     if (isReady) {
         *       console.log('Google Pay is ready');
         *       // Create payment button
         *     } else {
         *       console.log('Google Pay not available');
         *     }
         *   })
         *   .catch(function(error) {
         *     console.error('Initialization failed:', error);
         *   });
         */
        initialize: function () {
          var self = this;
          return loadGooglePayScript(this.config.scriptLoadTimeout).then(function (googlePayApi) {
            self.paymentsClient = new googlePayApi.PaymentsClient({
              environment: self.config.environment
            });
            return self.checkReadyToPay();
          }).catch(function (error) {
            self.logError('Initialization failed', error, 'initialize');
            throw error;
          });
        },
        /**
         * Check if Google Pay is ready for payments
         * @memberof VqDigitalWalletGoogle
         * @returns {Promise<boolean>} Promise resolving to readiness status
         * @private
         */
        checkReadyToPay: function () {
          var self = this;
          var paymentDataRequest = this.getBasePaymentDataRequest();
          return this.paymentsClient.isReadyToPay(paymentDataRequest).then(function (response) {
            if (!response.result) {
              if (self.config.allowedCardAuthMethods.length === 1 && self.config.allowedCardAuthMethods[0] === 'CRYPTOGRAM_3DS') {
                console.warn('VqDigitalWalletGoogle: Google Pay not available - CRYPTOGRAM_3DS requires device/card network support. Consider adding PAN_ONLY for broader compatibility.');
              } else if (self.config.allowedCardNetworks.length === 0) {
                console.warn('VqDigitalWalletGoogle: Google Pay not available - No card networks specified.');
              } else {
                console.warn('VqDigitalWalletGoogle: Google Pay not available on this device/browser. Check merchant configuration or device compatibility.');
              }
            } else {
              if (self.config.environment === 'TEST') {
                console.log('VqDigitalWalletGoogle: Google Pay ready with auth methods:', self.config.allowedCardAuthMethods);
              }
            }
            self.isReadyToPay = response.result;
            return response.result;
          }).catch(function (err) {
            console.error('VqDigitalWalletGoogle: Error checking Google Pay availability:', err);
            if (err.message && err.message.includes('merchantId')) {
              console.error('VqDigitalWalletGoogle: Check your merchantId configuration');
            } else if (err.message && err.message.includes('gateway')) {
              console.error('VqDigitalWalletGoogle: Check your gateway configuration');
            }
            return false;
          });
        },
        /**
         * Create Google Pay button and attach to container
         * @memberof VqDigitalWalletGoogle
         * @param {string|HTMLElement} container - Container element or ID
         * @param {PaymentData} paymentData - Payment data for the transaction
         * @returns {HTMLElement} Created button element
         * @throws {Error} When Google Pay is not ready or parameters are invalid
         * @example
         * const button = googlePay.createButton('google-pay-button', {
         *   amount: 100.50,
         *   currency: 'ZAR',
         *   countryCode: 'ZA',
         *   transactionId: 'unique-transaction-id'
         * });
         */
        createButton: function (container, paymentData) {
          if (!this.isReadyToPay) {
            throw new Error('Google Pay is not ready. Call initialize() first.');
          }
          if (isNullOrEmpty(paymentData)) {
            throw new Error('Payment data is required');
          }
          this.validatePaymentData(paymentData);
          var self = this;
          var button = this.paymentsClient.createButton({
            onClick: function () {
              try {
                self.requestPayment(paymentData);
              } catch (error) {
                self.logError('Button click handler failed', error, 'createButton');
              }
            },
            buttonColor: this.config.buttonColor,
            buttonType: this.config.buttonType,
            buttonSizeMode: this.config.buttonSizeMode
          });
          if (typeof container === 'string') {
            container = document.getElementById(container);
          }
          if (isNullOrEmpty(container)) {
            throw new Error('Container is required and must be a valid DOM element');
          }
          container.appendChild(button);
          return button;
        },
        /**
         * Validate payment data object
         * @memberof VqDigitalWalletGoogle
         * @param {PaymentData} paymentData - Payment data to validate
         * @throws {Error} When payment data is invalid
         * @example
         * try {
         *   googlePay.validatePaymentData({
         *     amount: 100.50,
         *     currency: 'ZAR',
         *     countryCode: 'ZA'
         *   });
         * } catch (error) {
         *   console.error('Invalid payment data:', error.message);
         * }
         */
        validatePaymentData: function (paymentData) {
          if (!paymentData.amount || paymentData.amount <= 0 || paymentData.amount > 999999.99) {
            throw new Error('Amount must be between 0.01 and 999999.99');
          }
          var amountStr = paymentData.amount.toString();
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
        },
        /**
         * Request payment from Google Pay
         * @memberof VqDigitalWalletGoogle
         * @param {PaymentData} paymentData - Payment data for the transaction
         * @returns {Promise<PaymentResult>} Promise resolving to payment result
         * @throws {Error} When payment request fails or rate limit is exceeded
         * @example
         * googlePay.requestPayment({
         *   amount: 100.50,
         *   currency: 'ZAR'
         * }).then(function(result) {
         *   console.log('Payment successful:', result.token);
         * }).catch(function(error) {
         *   console.error('Payment failed:', error);
         * });
         */
        requestPayment: function (paymentData) {
          var self = this;
          try {
            this.checkRateLimit();
            var paymentDataRequest = this.buildPaymentDataRequest(paymentData);
            return this.paymentsClient.loadPaymentData(paymentDataRequest).then(function (paymentData) {
              return self.processPayment(paymentData);
            }).catch(function (err) {
              self.logError('Payment request failed', err, 'requestPayment');
              self.clearSessionToken();
              self.invokeCallback(null, err);
              throw err;
            });
          } catch (error) {
            this.logError('Payment request validation failed', error, 'requestPayment');
            throw error;
          }
        },
        /**
         * Build Google Pay payment data request object
         * @memberof VqDigitalWalletGoogle
         * @param {PaymentData} paymentData - Payment data
         * @returns {Object} Google Pay payment data request
         * @example
         * const request = googlePay.buildPaymentDataRequest({
         *   amount: 100,
         *   currency: 'ZAR',
         *   countryCode: 'ZA'
         * });
         */
        buildPaymentDataRequest: function (paymentData) {
          var baseRequest = this.getBasePaymentDataRequest();
          return extend(baseRequest, {
            merchantInfo: {
              merchantId: this.config.merchantId,
              merchantName: this.config.merchantName || 'Merchant'
            },
            transactionInfo: {
              totalPriceStatus: 'FINAL',
              totalPrice: paymentData.amount.toString(),
              totalPriceLabel: 'Total',
              currencyCode: paymentData.currency.toUpperCase() || 'ZAR',
              countryCode: paymentData.countryCode || 'ZA',
              transactionId: paymentData.transactionId || this.generateTransactionId(),
              checkoutOption: "COMPLETE_IMMEDIATE_PURCHASE"
            }
          });
        },
        /**
         * Get base payment data request structure
         * @memberof VqDigitalWalletGoogle
         * @returns {Object} Base payment data request object
         * @example
         * const baseRequest = googlePay.getBasePaymentDataRequest();
         */
        getBasePaymentDataRequest: function () {
          return {
            apiVersion: GOOGLE_PAY_API_VERSION,
            apiVersionMinor: GOOGLE_PAY_API_VERSION_MINOR,
            allowedPaymentMethods: [{
              type: 'CARD',
              parameters: {
                allowedAuthMethods: this.config.allowedCardAuthMethods,
                allowedCardNetworks: this.config.allowedCardNetworks
              },
              tokenizationSpecification: {
                type: 'PAYMENT_GATEWAY',
                parameters: {
                  gateway: this.config.gateway,
                  gatewayMerchantId: this.config.gatewayMerchantId
                }
              }
            }]
          };
        },
        /**
         * Process payment data from Google Pay and generate token
         * @memberof VqDigitalWalletGoogle
         * @param {Object} paymentData - Payment data from Google Pay
         * @returns {Promise<PaymentResult>} Promise resolving to payment result
         * @throws {Error} When token processing fails
         * @example
         * googlePay.processPayment(paymentData)
         *   .then(function(result) {
         *     console.log('Token generated:', result.token);
         *   })
         *   .catch(function(error) {
         *     console.error('Processing failed:', error);
         *   });
         */
        processPayment: function (paymentData) {
          try {
            var rawToken = paymentData.paymentMethodData.tokenizationData.token;
            var tokenString = normalizeGooglePayToken(rawToken);
            var base64 = btoa(tokenString);
            if (isNullOrEmpty(base64) || !isValidBase64(base64)) {
              throw new Error('Failed to generate valid Google Pay token');
            }
            this.storeSessionToken(base64);
            this.invokeCallback(base64);
            return Promise.resolve({
              success: true,
              token: base64,
              message: 'Google Pay token generated successfully'
            });
          } catch (error) {
            this.logError('Token processing failed', error, 'processPayment');
            this.clearSessionToken();
            this.invokeCallback(null, error);
            return Promise.reject(new Error('Google Pay token generation failed: ' + error.message));
          }
        },
        /**
         * Invoke callback function with token or error
         * @memberof VqDigitalWalletGoogle
         * @param {string|null} token - Generated token or null if error
         * @param {Error} [error] - Error object if processing failed
         * @example
         * // Callback is invoked automatically, but can be called manually:
         * googlePay.invokeCallback(token, null); // Success
         * googlePay.invokeCallback(null, error); // Error
         */
        invokeCallback: function (token, error) {
          if (this.config.onTokenGenerated && typeof this.config.onTokenGenerated === 'function') {
            try {
              var self = this;
              setTimeout(function () {
                try {
                  self.config.onTokenGenerated(token, error);
                } catch (callbackError) {
                  self.logError('Callback execution failed', callbackError, 'invokeCallback');
                }
              }, 0);
            } catch (callbackError) {
              this.logError('Callback setup failed', callbackError, 'invokeCallback');
            }
          }
        },
        /**
         * Encode payload to Base64
         * @memberof VqDigitalWalletGoogle
         * @param {string} tokenizationData - Data to encode
         * @returns {string} Base64 encoded string
         * @throws {Error} When encoding fails
         * @example
         * const encoded = googlePay.encodePayloadToBase64('{"test":"data"}');
         */
        encodePayloadToBase64: function (tokenizationData) {
          if (!tokenizationData) {
            throw new Error('Invalid tokenization data');
          }
          try {
            //var jsonString = JSON.stringify(tokenizationData);
            return btoa(tokenizationData);
          } catch (error) {
            throw new Error('Failed to encode tokenization data: ' + error.message);
          }
        },
        /**
         * Decode Base64 payload to object
         * @memberof VqDigitalWalletGoogle
         * @param {string} base64EncodedPayload - Base64 encoded payload
         * @returns {Object} Decoded object
         * @throws {Error} When decoding fails or payload is invalid
         * @example
         * try {
         *   const decoded = googlePay.decodePayloadFromBase64(encodedPayload);
         *   console.log('Decoded data:', decoded);
         * } catch (error) {
         *   console.error('Invalid payload:', error.message);
         * }
         */
        decodePayloadFromBase64: function (base64EncodedPayload) {
          if (!base64EncodedPayload || !isValidBase64(base64EncodedPayload)) {
            throw new Error('Invalid base64 encoded payload');
          }
          try {
            var decodedString = atob(base64EncodedPayload);
            return JSON.parse(decodedString);
          } catch (error) {
            throw new Error('Failed to decode base64 payload: ' + error.message);
          }
        },
        /**
         * Store session token
         * @memberof VqDigitalWalletGoogle
         * @param {string} token - Token to store
         * @example
         * googlePay.storeSessionToken('abc123token');
         */
        storeSessionToken: function (token) {
          this.sessionToken = token;
        },
        /**
         * Get stored session token
         * @memberof VqDigitalWalletGoogle
         * @returns {string|null} Stored token or null if none exists
         * @example
         * const token = googlePay.getSessionToken();
         * if (token) {
         *   console.log('Session token exists');
         * }
         */
        getSessionToken: function () {
          return this.sessionToken;
        },
        /**
         * Clear stored session token
         * @memberof VqDigitalWalletGoogle
         * @example
         * googlePay.clearSessionToken();
         */
        clearSessionToken: function () {
          this.sessionToken = null;
        },
        /**
         * Generate unique transaction ID (UUID v4)
         * @memberof VqDigitalWalletGoogle
         * @returns {string} UUID v4 transaction ID
         * @example
         * const transactionId = googlePay.generateTransactionId();
         * // Returns: "12345678-1234-4567-8901-123456789012"
         */
        generateTransactionId: function () {
          if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
            return crypto.randomUUID();
          }
          if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
            var array = new Uint8Array(16);
            crypto.getRandomValues(array);
            array[6] = array[6] & 0x0f | 0x40; // Version 4
            array[8] = array[8] & 0x3f | 0x80; // Variant bits

            var hex = Array.from(array, function (byte) {
              return ('0' + byte.toString(16)).slice(-2);
            }).join('');
            return [hex.slice(0, 8), hex.slice(8, 12), hex.slice(12, 16), hex.slice(16, 20), hex.slice(20, 32)].join('-');
          }

          // Fallback for older browsers
          return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0;
            var v = c == 'x' ? r : r & 0x3 | 0x8;
            return v.toString(16);
          });
        },
        /**
         * Destroy instance and cleanup resources
         * @memberof VqDigitalWalletGoogle
         * @example
         * // Clean up when done
         * googlePay.destroy();
         */
        destroy: function () {
          this.clearSessionToken();
          this.paymentsClient = null;
          this.config = null;
          this.isReadyToPay = false;
          this._requestCount = 0;
          this._lastRequestTime = 0;
        }
      };
      VqDigitalWalletGoogle.fn.init.prototype = VqDigitalWalletGoogle.fn;

      /**
       * SDK version
       * @memberof VqDigitalWalletGoogle
       * @static
       * @type {string}
       * @readonly
       */
      VqDigitalWalletGoogle.version = version;

      /**
       * Default configuration values
       * @memberof VqDigitalWalletGoogle
       * @static
       * @type {VqDigitalWalletGoogleDefaults}
       * @readonly
       */
      VqDigitalWalletGoogle.defaults = defaults;
      if (!noGlobal) {
        var _VqDigitalWalletGoogle = window.VqDigitalWalletGoogle;

        /**
         * Restore previous VqDigitalWalletGoogle and return this instance
         * @memberof VqDigitalWalletGoogle
         * @static
         * @returns {VqDigitalWalletGoogle} VqDigitalWalletGoogle constructor
         * @example
         * const VqDigitalWalletGoogle = window.VqDigitalWalletGoogle.noConflict();
         */
        VqDigitalWalletGoogle.noConflict = function () {
          if (window.VqDigitalWalletGoogle === VqDigitalWalletGoogle) {
            window.VqDigitalWalletGoogle = _VqDigitalWalletGoogle;
          }
          return VqDigitalWalletGoogle;
        };
        window.VqDigitalWalletGoogle = VqDigitalWalletGoogle;
      }
      return VqDigitalWalletGoogle;
    });

})();
