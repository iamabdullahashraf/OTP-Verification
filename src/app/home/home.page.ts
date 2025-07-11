import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { Capacitor } from '@capacitor/core';
import { OtpVerificationService } from '../otp-verification.service';
import { initializeApp, getApps } from 'firebase/app';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss']
})
export class HomePage {
  phoneNumber: string = '';
  otp: string = '';
  verificationSent = false;
  loading = false;
  recaptchaVerifier?: RecaptchaVerifier;
  confirmationResult?: ConfirmationResult;
  userInput: string = '';
  generatedEmailOtp: string = '';

  constructor(
    public otpService: OtpVerificationService,
    private toastCtrl: ToastController
  ) {
    // Initialize Firebase if not already initialized
    if (!getApps().length) {
      initializeApp(environment.firebaseConfig);
    }
  }

  ngOnInit() {
    // Double-check Firebase initialization
    if (!getApps().length) {
      initializeApp(environment.firebaseConfig);
    }
  }

  async sendOtp() {
    this.loading = true;
    try {
      if (this.userInput.includes('@')) {
        // Email case
        this.generatedEmailOtp = Math.floor(100000 + Math.random() * 900000).toString();
        await this.otpService.sendEmailOtp(this.userInput, this.generatedEmailOtp);
        this.verificationSent = true;
        this.showToast('success', 'OTP sent to your email!');
      } else {
        // Phone case (existing logic)
        let formattedPhone = this.userInput.trim();
        if (formattedPhone.startsWith('00')) {
          formattedPhone = '+' + formattedPhone.substring(2);
        }
        if (!formattedPhone.startsWith('+')) {
          formattedPhone = '+92' + formattedPhone;
        }
        const auth = getAuth();
        if (Capacitor.getPlatform() === 'web') {
          if (!this.recaptchaVerifier) {
            this.recaptchaVerifier = new RecaptchaVerifier(
              auth,
              'recaptcha-container',
              {
                size: 'invisible',
                callback: (response: any) => {
                  console.log('reCAPTCHA solved:', response);
                }
              }
            );
            await this.recaptchaVerifier.render();
          }
        }
        const result = await signInWithPhoneNumber(auth, formattedPhone, this.recaptchaVerifier);
        this.confirmationResult = result;
        this.verificationSent = true;
        this.showToast('success', 'OTP sent successfully!');
      }
    } catch (err: any) {
      console.error(err);
      this.showToast('danger', err.message || 'Failed to send OTP');
    } finally {
      this.loading = false;
    }
  }

  async verifyOtp() {
    this.loading = true;
    try {
      if (this.userInput.includes('@')) {
        // Email case
        if (this.otp === this.generatedEmailOtp) {
          this.showToast('success', 'Email OTP verified!');
        } else {
          this.showToast('danger', 'Invalid OTP!');
        }
      } else {
        // Phone case (existing logic)
        if (!this.confirmationResult) {
          this.showToast('danger', 'No confirmation result.');
          return;
        }
        const result = await this.confirmationResult.confirm(this.otp);
        this.showToast('success', 'Phone verified!');
        console.log('✅ User:', result.user);
      }
    } catch (err: any) {
      console.error(err);
      this.showToast('danger', err.message || 'OTP verification failed');
    } finally {
      this.loading = false;
    }
  }

  async showToast(type: 'success' | 'danger', message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color: type,
      position: 'bottom',
    });
    await toast.present();
  }
}