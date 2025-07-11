import { Injectable } from '@angular/core';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInWithPhoneNumber, ConfirmationResult, RecaptchaVerifier } from 'firebase/auth';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class OtpVerificationService {
  // Initialize Firebase app if not already initialized
  constructor() {
    if (!getApps().length) {
      initializeApp(environment.firebaseConfig);
    }
  }
  private recaptchaVerifier: RecaptchaVerifier | undefined;
  private confirmationResult: ConfirmationResult | undefined;

  setupRecaptcha(containerId: string) {
    this.recaptchaVerifier = new (RecaptchaVerifier as any)(containerId, { size: 'invisible' }, getAuth());
  }

  sendOtp(phoneNumber: string): Promise<ConfirmationResult> {
    if (!this.recaptchaVerifier) {
      throw new Error('Recaptcha not initialized');
    }
    return signInWithPhoneNumber(getAuth(), phoneNumber, this.recaptchaVerifier)
      .then((confirmationResult) => {
        this.confirmationResult = confirmationResult;
        return confirmationResult;
      });
  }

  verifyOtp(otp: string): Promise<any> {
    if (!this.confirmationResult) {
      throw new Error('No confirmation result');
    }
    return this.confirmationResult.confirm(otp);
  }

  // Dummy email OTP sender (replace with real SMTP/SendGrid API in production)
  async sendEmailOtp(email: string, otp: string): Promise<void> {
    // Call backend API to send email
    const response = await fetch('http://localhost:3001/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp })
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to send email');
    }
  }
}