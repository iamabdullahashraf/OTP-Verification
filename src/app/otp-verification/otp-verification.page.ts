import { Component } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // <-- YEH ZARURI HAI
import { OtpVerificationService } from '../otp-verification.service';

@Component({
  selector: 'app-otp-verification',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule], // <-- YEH ZARURI HAI
  templateUrl: './otp-verification.page.html',
  styleUrls: ['./otp-verification.page.scss'],
})
export class OtpVerificationPage {
  phoneNumber = '';
  otp = '';
  verificationSent = false;
  loading = false;

  constructor(
    public otpService: OtpVerificationService,
    private toastCtrl: ToastController
  ) {}

  async sendOtp() {
    if (!this.phoneNumber) {
      this.showToast('Please enter phone number');
      return;
    }
    this.loading = true;
    try {
      this.otpService.setupRecaptcha('recaptcha-container');
      await this.otpService.sendOtp(this.phoneNumber);
      this.verificationSent = true;
      this.showToast('OTP sent!');
    } catch (err: any) {
      this.showToast(err.message || 'Failed to send OTP');
    }
    this.loading = false;
  }

  async verifyOtp() {
    if (!this.otp) {
      this.showToast('Please enter OTP');
      return;
    }
    this.loading = true;
    try {
      await this.otpService.verifyOtp(this.otp);
      this.showToast('OTP verified!');
      // Success logic here
    } catch (err: any) {
      this.showToast(err.message || 'Invalid OTP');
    }
    this.loading = false;
  }

  async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'bottom',
    });
    toast.present();
  }
}