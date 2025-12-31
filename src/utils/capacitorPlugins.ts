/**
 * Capacitor Native Plugins Wrapper
 * 
 * This module provides a unified interface for all Capacitor native plugins
 * with proper error handling and fallbacks for web/PWA mode.
 */

import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { PushNotifications, Token, PushNotificationSchema } from '@capacitor/push-notifications';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { App } from '@capacitor/app';

/**
 * Check if running on native platform
 */
export const isNative = (): boolean => {
    return Capacitor.isNativePlatform();
};

/**
 * Get platform name (ios, android, web)
 */
export const getPlatform = (): string => {
    return Capacitor.getPlatform();
};

// ==================== CAMERA ====================

export interface PhotoResult {
    base64?: string;
    dataUrl?: string;
    path?: string;
}

/**
 * Take a photo using device camera
 */
export async function takePicture(options?: {
    quality?: number;
    allowEditing?: boolean;
    source?: 'camera' | 'photos';
}): Promise<PhotoResult | null> {
    try {
        if (!isNative()) {
            console.warn('[Capacitor] Camera not available on web');
            return null;
        }

        const image = await Camera.getPhoto({
            quality: options?.quality || 90,
            allowEditing: options?.allowEditing || true,
            resultType: CameraResultType.Base64,
            source: options?.source === 'photos' ? CameraSource.Photos : CameraSource.Camera
        });

        return {
            base64: image.base64String,
            dataUrl: `data:image/${image.format};base64,${image.base64String}`,
            path: image.path
        };
    } catch (error) {
        console.error('[Capacitor] Camera error:', error);
        return null;
    }
}

// ==================== GEOLOCATION ====================

export interface LocationCoords {
    latitude: number;
    longitude: number;
    accuracy: number;
    altitude?: number;
    speed?: number;
    heading?: number;
}

/**
 * Get current device location
 */
export async function getCurrentLocation(): Promise<LocationCoords | null> {
    try {
        const position = await Geolocation.getCurrentPosition({
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        });

        return {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude || undefined,
            speed: position.coords.speed || undefined,
            heading: position.coords.heading || undefined
        };
    } catch (error) {
        console.error('[Capacitor] Geolocation error:', error);

        // Fallback to browser Geolocation API
        if (navigator.geolocation) {
            return new Promise((resolve, _reject) => {
                navigator.geolocation.getCurrentPosition(
                    (pos) => resolve({
                        latitude: pos.coords.latitude,
                        longitude: pos.coords.longitude,
                        accuracy: pos.coords.accuracy
                    }),
                    () => resolve(null)
                );
            });
        }

        return null;
    }
}

/**
 * Watch location changes
 */
export async function watchLocation(
    callback: (coords: LocationCoords) => void
): Promise<string | null> {
    try {
        const watchId = await Geolocation.watchPosition(
            { enableHighAccuracy: true },
            (position, err) => {
                if (err) {
                    console.error('[Capacitor] Watch location error:', err);
                    return;
                }

                if (position) {
                    callback({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    });
                }
            }
        );

        return watchId;
    } catch (error) {
        console.error('[Capacitor] Watch location error:', error);
        return null;
    }
}

/**
 * Clear location watch
 */
export async function clearLocationWatch(watchId: string): Promise<void> {
    try {
        await Geolocation.clearWatch({ id: watchId });
    } catch (error) {
        console.error('[Capacitor] Clear watch error:', error);
    }
}

// ==================== PUSH NOTIFICATIONS ====================

/**
 * Initialize push notifications
 */
export async function initPushNotifications(
    onToken: (token: string) => void,
    onNotification: (notification: PushNotificationSchema) => void
): Promise<boolean> {
    try {
        if (!isNative()) {
            console.warn('[Capacitor] Push notifications not available on web');
            return false;
        }

        // Request permission
        const permission = await PushNotifications.requestPermissions();

        if (permission.receive !== 'granted') {
            console.warn('[Capacitor] Push notification permission denied');
            return false;
        }

        // Register for push
        await PushNotifications.register();

        // Listen for token
        await PushNotifications.addListener('registration', (token: Token) => {
            console.log('[Capacitor] Push token:', token.value);
            onToken(token.value);
        });

        // Listen for registration errors
        await PushNotifications.addListener('registrationError', (error: any) => {
            console.error('[Capacitor] Push registration error:', error);
        });

        // Listen for push notifications
        await PushNotifications.addListener(
            'pushNotificationReceived',
            (notification: PushNotificationSchema) => {
                console.log('[Capacitor] Push received:', notification);
                onNotification(notification);
            }
        );

        // Listen for notification tap
        await PushNotifications.addListener(
            'pushNotificationActionPerformed',
            (notification: any) => {
                console.log('[Capacitor] Push action:', notification);
                onNotification(notification.notification);
            }
        );

        return true;
    } catch (error) {
        console.error('[Capacitor] Push notifications error:', error);
        return false;
    }
}

// ==================== STATUS BAR ====================

/**
 * Set status bar style
 */
export async function setStatusBarStyle(style: 'light' | 'dark'): Promise<void> {
    try {
        if (!isNative()) return;

        await StatusBar.setStyle({
            style: style === 'light' ? Style.Light : Style.Dark
        });
    } catch (error) {
        console.error('[Capacitor] Status bar error:', error);
    }
}

/**
 * Set status bar background color
 */
export async function setStatusBarColor(color: string): Promise<void> {
    try {
        if (!isNative() || getPlatform() !== 'android') return;

        await StatusBar.setBackgroundColor({ color });
    } catch (error) {
        console.error('[Capacitor] Status bar color error:', error);
    }
}

/**
 * Show/hide status bar
 */
export async function setStatusBarVisible(visible: boolean): Promise<void> {
    try {
        if (!isNative()) return;

        if (visible) {
            await StatusBar.show();
        } else {
            await StatusBar.hide();
        }
    } catch (error) {
        console.error('[Capacitor] Status bar visibility error:', error);
    }
}

// ==================== SPLASH SCREEN ====================

/**
 * Hide splash screen
 */
export async function hideSplashScreen(): Promise<void> {
    try {
        if (!isNative()) return;

        await SplashScreen.hide();
    } catch (error) {
        console.error('[Capacitor] Splash screen error:', error);
    }
}

// ==================== APP ====================

/**
 * Get app info
 */
export async function getAppInfo(): Promise<{
    name: string;
    id: string;
    build: string;
    version: string;
} | null> {
    try {
        if (!isNative()) return null;

        const info = await App.getInfo();
        return info;
    } catch (error) {
        console.error('[Capacitor] App info error:', error);
        return null;
    }
}

/**
 * Listen for app state changes
 */
export function onAppStateChange(callback: (isActive: boolean) => void): void {
    if (!isNative()) return;

    App.addListener('appStateChange', ({ isActive }) => {
        callback(isActive);
    });
}

/**
 * Listen for back button (Android)
 */
export function onBackButton(callback: () => boolean): void {
    if (!isNative() || getPlatform() !== 'android') return;

    App.addListener('backButton', () => {
        const shouldExit = callback();
        if (shouldExit) {
            App.exitApp();
        }
    });
}

// ==================== INITIALIZATION ====================

/**
 * Initialize all Capacitor plugins
 */
export async function initializeCapacitor(): Promise<void> {
    console.log('[Capacitor] Initializing on platform:', getPlatform());

    if (!isNative()) {
        console.log('[Capacitor] Running on web, native features disabled');
        return;
    }

    try {
        // Hide splash screen after app loads
        setTimeout(() => {
            hideSplashScreen();
        }, 2000);

        // Set status bar style
        await setStatusBarStyle('dark');
        await setStatusBarColor('#0E1121');

        // Get app info
        const appInfo = await getAppInfo();
        console.log('[Capacitor] App info:', appInfo);

        console.log('[Capacitor] Initialization complete');
    } catch (error) {
        console.error('[Capacitor] Initialization error:', error);
    }
}
