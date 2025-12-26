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
            androidScaleType: 'CENTER_CROP',
            showSpinner: false,
            androidSpinnerStyle: 'large',
            iosSpinnerStyle: 'small',
            spinnerColor: '#ccff00',
            splashFullScreen: true,
            splashImmersive: true
        },
        StatusBar: {
            style: 'dark',
            backgroundColor: '#0E1121'
        },
        PushNotifications: {
            presentationOptions: ['badge', 'sound', 'alert']
        },
        Camera: {
            saveToGallery: true,
            quality: 90
        }
    }
};

export default config;
