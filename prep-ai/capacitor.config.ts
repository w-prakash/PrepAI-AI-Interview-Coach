import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'prep-ai',
  webDir: 'www',
  plugins: {
    SplashScreen: {
      launchShowDuration: 2500,
      showSpinner: true,
      backgroundColor: "#43c18d"
    }
  }
};

export default config;
