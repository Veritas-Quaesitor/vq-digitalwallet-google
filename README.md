# 🚀 VQ Digital Wallet Google Pay SDK

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/source-TypeScript-blue.svg)](https://www.typescriptlang.org/)
[![Browser Support](https://img.shields.io/badge/Browser-Modern-green.svg)](#browser-compatibility)
[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://veritas-quaesitor.github.io/vq-digitalwallet-google/demo.html)

A Google Pay Web SDK, written in modular TypeScript, distributed as one GitHub-hosted browser script. Features rate limiting, session handling, and input validation — see [Security Best Practices](#-security-best-practices) for what the SDK does and does not protect against.

## ✨ Features

- 🛡️ **Input Validation** - Configuration and payment-data validation before any request is made
- ⚡ **Rate Limiting** - Client-side UX safeguard against abuse (pair with server-side limits)
- 🎯 **TypeScript Source** - Written and tested in TypeScript; no type declarations are shipped to consumers (no confirmed demand)
- 🌐 **Universal Compatibility** - Works in all modern browsers
- 📱 **Mobile Optimized** - Perfect for mobile commerce
- 🛡️ **Error Handling** - Comprehensive error management
- 📊 **Session Management** - In-memory token handling, cleared on error/destroy
- 🔧 **Easy Integration** - Simple, intuitive API

## 🎮 Live Demo

The demo is live at **[https://veritas-quaesitor.github.io/vq-digitalwallet-google/demo.html](https://veritas-quaesitor.github.io/vq-digitalwallet-google/demo.html)**

API documentation is at **[https://veritas-quaesitor.github.io/vq-digitalwallet-google/api/](https://veritas-quaesitor.github.io/vq-digitalwallet-google/api/)**

You can also run it locally — open `docs/demo.html` directly in any browser. No server required.

## 📦 Installation

This SDK is distributed as a single GitHub-hosted browser script — it is **not published to npm**. Include it directly:

```html
<script src="https://veritas-quaesitor.github.io/vq-digitalwallet-google/vq-google-pay.js"></script>
```

## 🚀 Quick Start

### Basic Implementation

```javascript
// Initialize the SDK
const googlePay = new VqDigitalWalletGoogle({
    environment: 'TEST', // or 'PRODUCTION'
    gateway: 'your-gateway-name',
    merchantId: '12345678901234567890',
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

    <script src="https://veritas-quaesitor.github.io/vq-digitalwallet-google/vq-google-pay.js"></script>
    <script>
        // Your integration code here
    </script>
</body>
</html>
```

> See the [interactive demo](./docs/demo.html) for a full working example.

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
| `buttonSizeMode`         | `'static' \| 'fill'`    | ❌        | `'static'`                       | Button size mode                     |
| `onTokenGenerated`       | `function`               | ❌        | `null`                           | Success/error callback               |
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

#### `encodePayloadToBase64(data): string`

Encodes a string to Base64. Used internally during payment processing; exposed for debugging and testing.

```javascript
const encoded = googlePay.encodePayloadToBase64('{"orderId":"TEST-001","amount":99.99}');
```

Throws if encoding fails.

#### `decodePayloadFromBase64(payload): object`

Decodes a Base64 string back to a parsed JSON object.

```javascript
const decoded = googlePay.decodePayloadFromBase64(encodedString);
// decoded = { orderId: 'TEST-001', amount: 99.99 }
```

- Throws `'Invalid base64 encoded payload'` for malformed Base64 input
- Throws `'Failed to decode base64 payload'` if the decoded content is not valid JSON

### Wire contract

The payment token returned by `requestPayment` and passed to `onTokenGenerated` is:

```text
Token = btoa(JSON.stringify(rawGooglePayToken))
```

This is the exact payload your backend must decode and forward to your payment gateway. Base64 here is an encoding for safe transport, not encryption — see [Security Best Practices](#-security-best-practices).

## 🔧 Advanced Usage

### Error Handling

```javascript
const googlePay = new VqDigitalWalletGoogle({
    environment: 'TEST',
    gateway: 'example',
    merchantId: '12345678901234567890',
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

## 🔐 Security Best Practices

- **Never expose credentials in frontend code** — `gatewayMerchantId` and merchant credentials belong in environment variables, not hard-coded JavaScript.
- **Always validate the token server-side** — the Base64 token returned by `requestPayment` must be forwarded server-to-server to your payment gateway for authorisation. Never treat a client-side token as proof of a successful charge.
- **Use PRODUCTION only with a registered merchant account** — complete [Google Pay's merchant approval process](https://pay.google.com/business/console) before switching environments.
- **Enforce HTTPS** — Google Pay will not load on non-secure origins in production.
- **Rate limiting is client-side only** — the SDK enforces 3 requests/second per instance as a UX safeguard. Implement independent server-side rate limiting on your token processing endpoint.
- **Rotate credentials regularly** — treat `gatewayMerchantId` like a password; regenerate it if you suspect exposure.

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

## 🔒 Security-Relevant Behavior

- ✅ **Input Sanitization** - All configuration strings are sanitized
- ✅ **Rate Limiting** - Client-side abuse deterrent (not a substitute for server-side limits)
- ✅ **Validation** - Comprehensive parameter validation
- ✅ **Base64 Token Encoding** - Base64 is an encoding, not encryption; it makes the token transport-safe, not confidential — always verify tokens server-side (see [Security Best Practices](#-security-best-practices))
- ✅ **Error Handling** - Safe error management
- ✅ **Session Management** - In-memory token storage, cleared on error/destroy (nothing persisted to disk or browser storage)

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

Add the SDK `<script>` tag (see [Installation](#-installation)) to your app's HTML shell — there is no npm package to import.

```jsx
import React, { useEffect, useRef } from 'react';

function GooglePayButton({ amount, onPaymentSuccess }) {
    const buttonRef = useRef(null);
    const googlePayRef = useRef(null);

    useEffect(() => {
        const googlePay = new window.VqDigitalWalletGoogle({
            environment: 'TEST',
            gateway: 'example',
            merchantId: '12345678901234567890',
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
// Loaded via the SDK <script> tag in index.html — no npm package to import.

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
            this.googlePay = new window.VqDigitalWalletGoogle({
                environment: 'TEST',
                gateway: 'example',
                merchantId: '12345678901234567890',
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

> **Vue 3:** Replace `beforeDestroy()` with `beforeUnmount()`.

### Angular Integration

#### Service Implementation:

No type declarations are shipped with the hosted script — this example uses `any` at the SDK boundary, same as any other untyped global loaded via `<script>`:

```typescript
// google-pay.service.ts
// The SDK <script> tag must be present in index.html; no npm package to import.
import { Injectable } from '@angular/core';

declare const VqDigitalWalletGoogle: any;

@Injectable({
  providedIn: 'root'
})
export class GooglePayService {
  private googlePay: any;
  private isInitialized = false;

  constructor() {}

  async initialize(config: Record<string, unknown>): Promise<boolean> {
    if (this.isInitialized) {
      return this.googlePay.isReadyToPay;
    }

    this.googlePay = new VqDigitalWalletGoogle(config);

    try {
      const isReady = await this.googlePay.initialize();
      this.isInitialized = true;
      return isReady;
    } catch (error) {
      console.error('Google Pay initialization failed:', error);
      return false;
    }
  }

  createButton(container: HTMLElement, paymentData: Record<string, unknown>): HTMLElement | null {
    if (!this.isInitialized || !this.googlePay.isReadyToPay) {
      console.warn('Google Pay not ready');
      return null;
    }

    return this.googlePay.createButton(container, paymentData);
  }

  async requestPayment(paymentData: Record<string, unknown>): Promise<any> {
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
      merchantId: '12345678901234567890',
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
git clone https://github.com/veritas-quaesitor/vq-digitalwallet-google

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

Copyright (c) 2024 Veritas Quaesitor

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

## 🏷️ Version History

See [CHANGELOG.md](https://github.com/Veritas-Quaesitor/vq-digitalwallet-google/blob/main/CHANGELOG.md).

---

### Made with ❤️ by Veritas Quaesitor