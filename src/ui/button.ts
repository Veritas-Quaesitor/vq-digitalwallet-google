import type { GooglePayPaymentsClient } from '../core/contracts.js';

export interface ButtonOptions {
  buttonColor: string;
  buttonType: string;
  buttonSizeMode: string;
}

/**
 * Creates the native Google Pay button and mounts it into `container`.
 * @throws {Error} When the container cannot be resolved to a DOM element.
 */
export function mountGooglePayButton(
  paymentsClient: GooglePayPaymentsClient,
  container: string | HTMLElement,
  options: ButtonOptions,
  onClick: () => void
): HTMLElement {
  const button = paymentsClient.createButton({
    onClick,
    buttonColor: options.buttonColor,
    buttonType: options.buttonType,
    buttonSizeMode: options.buttonSizeMode
  });

  const target = typeof container === 'string' ? document.getElementById(container) : container;

  if (!target) {
    throw new Error('Container is required and must be a valid DOM element');
  }

  target.appendChild(button);
  return button;
}
