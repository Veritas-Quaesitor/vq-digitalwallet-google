import type { GooglePayApi } from '../core/contracts.js';

declare global {
  interface Window {
    google?: {
      payments?: {
        api?: GooglePayApi;
      };
    };
  }
}

// Google's own canonical, unversioned endpoint for the Google Pay API
// JavaScript library. Unlike Apple's versioned CDN path (pinned with an SRI
// hash in the sibling SDK), Google does not publish a versioned URL or a
// stable content hash for this script — it is served live and updated
// server-side, so Subresource Integrity pinning is not available here.
// (Verified against Google's own public documentation pages; their
// script-loading code sample did not render in a plain-text fetch, so this
// is corroborated by the well-established, unchanged nature of this exact
// URL across the Google Pay ecosystem, not a direct doc quote — flagging
// that distinction rather than overstating confidence.)
export const GOOGLE_PAY_SCRIPT_URL = 'https://pay.google.com/gp/p/js/pay.js';

/** Loads the Google Pay script from Google's CDN, or resolves immediately if already present. */
export function loadGooglePayScript(timeout?: number): Promise<GooglePayApi> {
  return new Promise((resolve, reject) => {
    if (window.google?.payments?.api) {
      resolve(window.google.payments.api);
      return;
    }

    const script = document.createElement('script');
    script.src = GOOGLE_PAY_SCRIPT_URL;
    script.async = true;

    const timeoutId = setTimeout(() => {
      reject(new Error('Google Pay script load timeout after ' + timeout + 'ms'));
    }, timeout || 10000);

    script.onload = () => {
      clearTimeout(timeoutId);
      if (window.google?.payments?.api) {
        resolve(window.google.payments.api);
      } else {
        reject(new Error('Google Pay API failed to load properly'));
      }
    };

    script.onerror = () => {
      clearTimeout(timeoutId);
      reject(new Error('Failed to load Google Pay script from CDN'));
    };

    document.head.appendChild(script);
  });
}
