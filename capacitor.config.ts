import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.voula.dourados',
    appName: 'Vou Lá',
    webDir: 'dist',
    server: {
        androidScheme: 'https'
    },
    plugins: {
        SplashScreen: {
            launchShowDuration: 2000,
            launchAutoHide: true,
            backgroundColor: '#0E1121',
            androidSplashResourceName: 'splash',
            showSpinner: false,
            androidScaleType: 'CENTER_CROP',
            splashFullScreen: true,
            splashImmersive: true,
        },
        StatusBar: {
            style: 'dark',
            backgroundColor: '#0E1121',
        },
    },
};

export default config;
