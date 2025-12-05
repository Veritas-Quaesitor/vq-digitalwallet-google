# 🚀 Ecentric Google Pay Client SDK

[![npm version](https://badge.fury.io/js/ecentric-googlepay-clientsdk.svg)](https://badge.fury.io/js/ecentric-googlepay-clientsdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![Browser Support](https://img.shields.io/badge/Browser-Modern-green.svg)](#browser-compatibility)

A lightweight, JavaScript SDK for integrating Google Pay with secure payment processing. Features advanced security, rate limiting, session management, and comprehensive error handling.

## ✨ Features

- 🔒 **Enterprise Security** - Advanced validation and sanitization
- ⚡ **Rate Limiting** - Built-in protection against abuse
- 🎯 **TypeScript Support** - Full type definitions included
- 🌐 **Universal Compatibility** - Works in all modern browsers
- 📱 **Mobile Optimized** - Perfect for mobile commerce
- 🛡️ **Error Handling** - Comprehensive error management
- 📊 **Session Management** - Secure token handling
- 🔧 **Easy Integration** - Simple, intuitive API

## 📦 Installation

### NPM

```bash
npm install ecentric-googlepay-clientsdk
```

### Yarn

```bash
yarn add ecentric-googlepay-clientsdk
```

### CDN

```html
<script src="https://unpkg.com/ecentric-googlepay-clientsdk@latest/epsgooglepay.js"></script>
```

## 🚀 Quick Start

### Basic Implementation

```javascript
// Initialize the SDK
const googlePay = new EpsGooglePay({
    environment: 'TEST', // or 'PRODUCTION'
    gateway: 'your-gateway-name',
    merchantId: 'BCR2DN4T23YWKJHG',
    merchantName: 'Your Store Name',
    gatewayMerchantId: 'your-gateway-merchant-id',
    onTokenGenerated: function(token, error) {
        if (error) {
            console.error('Payment failed:', error);
        } else {
            console.log('Payment token:', token);
            // Send token to your server
        }
    }
});

// Initialize Google Pay
googlePay.initialize()
    .then(function(isReady) {
        if (isReady) {
            // Create payment button
            googlePay.createButton('google-pay-button', {
                amount: 100.50,
                currency: 'ZAR',
                countryCode: 'ZA'
            });
        } else {
            console.log('Google Pay not available');
        }
    })
    .catch(function(error) {
        console.error('Initialization failed:', error);
    });
```

### HTML Structure

```html
<!DOCTYPE html>
<html>
<head>
    <title>Google Pay Integration</title>
</head>
<body>
    <!-- Google Pay button container -->
    <div id="google-pay-button"></div>

    <script src="https://unpkg.com/ecentric-googlepay-clientsdk@latest/epsgooglepay.js"></script>
    <script>
        // Your integration code here
    </script>
</body>
</html>
```

## 📚 API Documentation

### Configuration Options

| Option                   | Type                     | Required | Default                          | Description                          |
| ------------------------ | ------------------------ | -------- | -------------------------------- | ------------------------------------ |
| `environment`            | `'TEST' \| 'PRODUCTION'` | ✅        | -                                | Google Pay environment               |
| `gateway`                | `string`                 | ✅        | -                                | Payment gateway identifier           |
| `merchantId`             | `string`                 | ✅        | -                                | Google Pay merchant ID (10-32 chars) |
| `merchantName`           | `string`                 | ✅        | -                                | Display name for your business       |
| `gatewayMerchantId`      | `string`                 | ✅        | -                                | Gateway-specific merchant ID         |
| `allowedCardNetworks`    | `string[]`               | ✅        | `['MASTERCARD', 'VISA']`         | Supported card networks              |
| `allowedCardAuthMethods` | `string[]`               | ✅        | `['PAN_ONLY', 'CRYPTOGRAM_3DS']` | Authentication methods               |
| `buttonColor`            | `string`                 | ❌        | `'default'`                      | Button color theme                   |
| `buttonType`             | `string`                 | ❌        | `'pay'`                          | Button type                          |
| `onTokenGenerated`       | `function`               | ✅        | `null`                           | Success/error callback               |
| `scriptLoadTimeout`      | `number`                 | ❌        | `10000`                          | Script load timeout (ms)             |

### Core Methods

#### `initialize(): Promise<boolean>`

Initializes Google Pay and checks device compatibility.

```javascript
googlePay.initialize()
    .then(isReady => {
        if (isReady) {
            // Google Pay is available
        }
    })
    .catch(error => {
        console.error('Initialization failed:', error);
    });
```

#### `createButton(container, paymentData): HTMLElement`

Creates and renders the Google Pay button.

```javascript
const button = googlePay.createButton('button-container', {
    amount: 99.99,
    currency: 'ZAR',
    countryCode: 'ZA',
    transactionId: 'unique-transaction-id' // optional
});
```

#### `requestPayment(paymentData): Promise<PaymentResult>`

Programmatically triggers a payment request.

```javascript
googlePay.requestPayment({
    amount: 150.00,
    currency: 'ZAR'
}).then(result => {
    console.log('Payment successful:', result.token);
}).catch(error => {
    console.error('Payment failed:', error);
});
```

#### `validatePaymentData(paymentData): void`

Validates payment data before processing.

```javascript
try {
    googlePay.validatePaymentData({
        amount: 100,
        currency: 'ZAR'
    });
} catch (error) {
    console.error('Invalid payment data:', error.message);
}
```

### Utility Methods

#### `generateTransactionId(): string`

Generates a unique UUID v4 transaction identifier.

#### `getSessionToken(): string | null`

Retrieves the current session token.

#### `clearSessionToken(): void`

Clears the stored session token.

#### `destroy(): void`

Cleanup method to destroy the instance.

## 🔧 Advanced Usage

### TypeScript Integration

```typescript
import EpsGooglePay, { 
    EpsGooglePayConfig, 
    PaymentData, 
    PaymentResult 
} from 'ecentric-googlepay-clientsdk';

const config: EpsGooglePayConfig = {
    environment: 'TEST',
    gateway: 'example',
    merchantId: 'BCR2DN4T23YWKJHG',
    merchantName: 'Test Merchant',
    gatewayMerchantId: 'test_merchant_123',
    onTokenGenerated: (token: string | null, error?: Error) => {
        if (error) {
            console.error('Payment failed:', error);
        } else {
            console.log('Payment token:', token);
        }
    }
};

const googlePay = new EpsGooglePay(config);
```

### Error Handling

```javascript
const googlePay = new EpsGooglePay({
    environment: 'TEST',
    gateway: 'example',
    merchantId: 'BCR2DN4T23YWKJHG',
    merchantName: 'Test Store',
    gatewayMerchantId: 'test123',
    onTokenGenerated: function(token, error) {
        if (error) {
            // Handle different error types
            if (error.message.includes('rate limit')) {
                alert('Too many requests. Please wait and try again.');
            } else if (error.message.includes('merchantId')) {
                console.error('Configuration error:', error);
            } else {
                console.error('Payment error:', error);
            }
        } else {
            // Success - send token to your server
            fetch('/process-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: token })
            });
        }
    }
});
```

### Rate Limiting

The SDK includes built-in rate limiting (3 requests per second) to prevent abuse:

```javascript
try {
    googlePay.checkRateLimit();
    // Proceed with payment
} catch (error) {
    console.log('Rate limit exceeded:', error.message);
    // Show user-friendly message
}
```

## 🌐 Browser Compatibility

| Browser | Version | Support |
| --- | --- | --- |
| Chrome | 61+ | ✅ Full |
| Firefox | 60+ | ✅ Full |
| Safari | 13+ | ✅ Full |
| Edge | 79+ | ✅ Full |
| Opera | 48+ | ✅ Full |
| Samsung Internet | 8.0+ | ✅ Full |

### Requirements:

- ES6 Promise support
- Base64 encoding (btoa/atob)
- JSON support
- Modern DOM APIs

## 🔒 Security Features

- ✅ **Input Sanitization** - All configuration strings are sanitized
- ✅ **Rate Limiting** - Protection against abuse
- ✅ **Validation** - Comprehensive parameter validation
- ✅ **Token Security** - Secure Base64 encoding
- ✅ **Error Handling** - Safe error management
- ✅ **Session Management** - Secure token storage

## 🚨 Error Codes

| Error | Description | Solution |
| --- | --- | --- |
| `merchantId is required` | Missing merchant ID | Provide valid Google Pay merchant ID |
| `gateway is required` | Missing gateway config | Configure payment gateway |
| `Invalid environment` | Wrong environment value | Use 'TEST' or 'PRODUCTION' |
| `Amount must be between 0.01 and 999999.99` | Invalid amount | Check payment amount |
| `Too many payment requests` | Rate limit exceeded | Wait before retrying |

## 📖 Examples

### React Integration

```jsx
import React, { useEffect, useRef } from 'react';
import EpsGooglePay from 'ecentric-googlepay-clientsdk';

function GooglePayButton({ amount, onPaymentSuccess }) {
    const buttonRef = useRef(null);
    const googlePayRef = useRef(null);

    useEffect(() => {
        const googlePay = new EpsGooglePay({
            environment: 'TEST',
            gateway: 'example',
            merchantId: 'BCR2DN4T23YWKJHG',
            merchantName: 'React Store',
            gatewayMerchantId: 'react_merchant_123',
            onTokenGenerated: (token, error) => {
                if (error) {
                    console.error('Payment failed:', error);
                } else {
                    onPaymentSuccess(token);
                }
            }
        });

        googlePay.initialize().then(isReady => {
            if (isReady && buttonRef.current) {
                googlePay.createButton(buttonRef.current, {
                    amount: amount,
                    currency: 'ZAR'
                });
            }
        });

        googlePayRef.current = googlePay;

        return () => {
            googlePay.destroy();
        };
    }, [amount, onPaymentSuccess]);

    return <div ref={buttonRef}></div>;
}
```

### Vue.js Integration

```vue
<template>
    <div ref="googlePayButton"></div>
</template>

<script>
import EpsGooglePay from 'ecentric-googlepay-clientsdk';

export default {
    props: ['amount'],
    mounted() {
        this.initializeGooglePay();
    },
    beforeDestroy() {
        if (this.googlePay) {
            this.googlePay.destroy();
        }
    },
    methods: {
        initializeGooglePay() {
            this.googlePay = new EpsGooglePay({
                environment: 'TEST',
                gateway: 'example',
                merchantId: 'BCR2DN4T23YWKJHG',
                merchantName: 'Vue Store',
                gatewayMerchantId: 'vue_merchant_123',
                onTokenGenerated: (token, error) => {
                    if (error) {
                        this.$emit('payment-error', error);
                    } else {
                        this.$emit('payment-success', token);
                    }
                }
            });

            this.googlePay.initialize().then(isReady => {
                if (isReady) {
                    this.googlePay.createButton(this.$refs.googlePayButton, {
                        amount: this.amount,
                        currency: 'ZAR'
                    });
                }
            });
        }
    }
};
</script>
```

### Angular Integration

#### Service Implementation:

```typescript
// google-pay.service.ts
import { Injectable } from '@angular/core';
import EpsGooglePay, { EpsGooglePayConfig, PaymentData } from 'ecentric-googlepay-clientsdk';

@Injectable({
  providedIn: 'root'
})
export class GooglePayService {
  private googlePay: any;
  private isInitialized = false;

  constructor() {}

  async initialize(config: EpsGooglePayConfig): Promise<boolean> {
    if (this.isInitialized) {
      return this.googlePay.isReadyToPay;
    }

    this.googlePay = new EpsGooglePay(config);

    try {
      const isReady = await this.googlePay.initialize();
      this.isInitialized = true;
      return isReady;
    } catch (error) {
      console.error('Google Pay initialization failed:', error);
      return false;
    }
  }

  createButton(container: HTMLElement, paymentData: PaymentData): HTMLElement | null {
    if (!this.isInitialized || !this.googlePay.isReadyToPay) {
      console.warn('Google Pay not ready');
      return null;
    }

    return this.googlePay.createButton(container, paymentData);
  }

  async requestPayment(paymentData: PaymentData): Promise<any> {
    if (!this.isInitialized) {
      throw new Error('Google Pay not initialized');
    }

    return this.googlePay.requestPayment(paymentData);
  }

  destroy(): void {
    if (this.googlePay) {
      this.googlePay.destroy();
      this.isInitialized = false;
    }
  }
}
```

#### Component Implementation:

```typescript
// payment.component.ts
import { Component, ElementRef, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { GooglePayService } from './google-pay.service';

@Component({
  selector: 'app-payment',
  template: `
    <div class="payment-container">
      <h2>Complete Your Payment</h2>

      <div class="payment-details">
        <p>Amount: {{ amount | currency:'ZAR':'symbol':'1.2-2' }}</p>
      </div>

      <div #googlePayButton class="google-pay-button-container"></div>

      <div *ngIf="!isGooglePayReady" class="fallback-message">
        Google Pay is not available on this device.
      </div>
    </div>
  `,
  styles: [`
    .payment-container {
      max-width: 400px;
      margin: 0 auto;
      padding: 20px;
    }

    .google-pay-button-container {
      margin: 20px 0;
      text-align: center;
    }

    .fallback-message {
      text-align: center;
      color: #666;
      font-style: italic;
    }
  `]
})
export class PaymentComponent implements OnInit, OnDestroy {
  @ViewChild('googlePayButton', { static: true }) googlePayButton!: ElementRef;

  amount = 150.00;
  isGooglePayReady = false;

  constructor(private googlePayService: GooglePayService) {}

  async ngOnInit() {
    await this.initializeGooglePay();
  }

  ngOnDestroy() {
    this.googlePayService.destroy();
  }

  private async initializeGooglePay() {
    const config = {
      environment: 'TEST' as const,
      gateway: 'example',
      merchantId: 'BCR2DN4T23YWKJHG',
      merchantName: 'Angular Store',
      gatewayMerchantId: 'angular_merchant_123',
      onTokenGenerated: (token: string | null, error?: Error) => {
        if (error) {
          this.handlePaymentError(error);
        } else if (token) {
          this.handlePaymentSuccess(token);
        }
      }
    };

    try {
      this.isGooglePayReady = await this.googlePayService.initialize(config);

      if (this.isGooglePayReady) {
        this.createPaymentButton();
      }
    } catch (error) {
      console.error('Failed to initialize Google Pay:', error);
    }
  }

  private createPaymentButton() {
    const paymentData = {
      amount: this.amount,
      currency: 'ZAR',
      countryCode: 'ZA'
    };

    this.googlePayService.createButton(
      this.googlePayButton.nativeElement,
      paymentData
    );
  }

  private handlePaymentSuccess(token: string) {
    console.log('Payment successful, token:', token);
    alert('Payment successful!');
  }

  private handlePaymentError(error: Error) {
    console.error('Payment failed:', error);
    alert('Payment failed. Please try again.');
  }
}
```

#### Module Configuration:

```typescript
// app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

import { AppComponent } from './app.component';
import { PaymentComponent } from './payment.component';
import { GooglePayService } from './google-pay.service';

@NgModule({
  declarations: [
    AppComponent,
    PaymentComponent
  ],
  imports: [
    BrowserModule,
    CommonModule
  ],
  providers: [
    GooglePayService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

### Development Setup

```bash
# Clone the repository
git clone https://dev.azure.com/epsdev/OnlinePayments/_git/Ecentric.GooglePay.ClientSdk

# Install dependencies
npm install

# Run development build
npm run build:dev

# Run tests
npm test

# Generate documentation
npm run docs
```

## 📄 License

**This project is licensed under the MIT License**

MIT License

Copyright (c) 2024 Ecentric

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## 🆘 Support

- 📧 **Email**: [support@ecentric.co.za](mailto:support@ecentric.co.za)
- 📖 **Documentation**: [API Docs](https://ecentric.readme.io)
- 🐛 **Issues**: [GitHub Issues](https://dev.azure.com/epsdev/OnlinePayments/_git/Ecentric.GooglePay.ClientSdk/issues)

## 🏷️ Version History

### v1.1.0

- ✅ Enhanced security features
- ✅ TypeScript definitions
- ✅ Improved error handling
- ✅ Rate limiting
- ✅ Session management

### v1.0.0

- ✅ Initial release
- ✅ Basic Google Pay integration
- ✅ UMD/CommonJS/ES6 support

---

### Made with ❤️ by [Ecentric](https://ecentric.co.za/)