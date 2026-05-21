import { authService } from './authService';
import { env } from '../config/env';

class GoogleAuthService {
  private static instance: GoogleAuthService;
  private isInitialized = false;
  private currentNonce = '';

  private currentCallback: ((response: any) => void) | null = null;

  private constructor() {
    this.currentNonce = this.generateNonce();
  }

  public static getInstance(): GoogleAuthService {
    if (!GoogleAuthService.instance) {
      GoogleAuthService.instance = new GoogleAuthService();
    }
    return GoogleAuthService.instance;
  }

  private generateNonce(): string {
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);
    return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  public async initialize(onSuccess: (response: any) => void): Promise<void> {
    // Update the active subscriber
    this.currentCallback = onSuccess;

    if (this.isInitialized) {
      console.log('[GoogleAuth] Service already active. Using persistent handshake.');
      return;
    }

    const google = (window as any).google;
    if (!google) {
      console.warn('[GoogleAuth] Google Identity script not loaded yet.');
      return;
    }

    try {
      google.accounts.id.initialize({
        client_id: env.VITE_GOOGLE_CLIENT_ID,
        callback: (response: any) => {
          if (this.currentCallback) {
            this.currentCallback(response);
          }
        },
        nonce: this.currentNonce,
        itp_support: true,
        use_fedcm_for_prompt: false, // Returning to standard stable flow
        context: 'signin',
        ux_mode: 'popup'
      });

      this.isInitialized = true;
      console.log('Google Identity initialized - [GoogleAuth] Eternal Handshake initialized with nonce:', this.currentNonce);
    } catch (e) {
      console.error('[GoogleAuth] Initialization failed:', e);
    }
  }

  public prompt(): void {
    const google = (window as any).google;
    if (google && this.isInitialized) {
      google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          console.warn('[GoogleAuth] Native prompt failed/skipped. Falling back to standard OAuth.');
          authService.signInWithGoogle();
        }
      });
    } else {
      console.warn('[GoogleAuth] Cannot prompt: Service not initialized.');
      authService.signInWithGoogle();
    }
  }

  public getNonce(): string {
    return this.currentNonce;
  }

  public async logout(): Promise<void> {
    const google = (window as any).google;
    if (google) {
      google.accounts.id.disableAutoSelect();
    }
    // We keep the currentNonce for the lifetime of the singleton
    // to avoid the 'initialize called multiple times' error.
  }
}

export const googleAuthService = GoogleAuthService.getInstance();
