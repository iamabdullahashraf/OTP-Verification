import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.OTP.Verification',
  appName: 'OTP-Verification',
  webDir: 'www',
  plugins: {
    Keyboard: {
      resize: 'body'  // ✅ Important for Android input focus
    }
  }

};

export default config;
