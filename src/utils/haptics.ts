
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

export const triggerHaptic = async (type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'light') => {
    const isNative = Capacitor.isNativePlatform();

    try {
        if (type === 'success') {
            await Haptics.notification({ type: NotificationType.Success });
        } else if (type === 'warning') {
            await Haptics.notification({ type: NotificationType.Warning });
        } else if (type === 'error') {
            await Haptics.notification({ type: NotificationType.Error });
        } else {
            let style = ImpactStyle.Light;
            if (type === 'medium') style = ImpactStyle.Medium;
            if (type === 'heavy') style = ImpactStyle.Heavy;
            await Haptics.impact({ style });
        }
    } catch (e) {
        // Fallback for Web
        if (!isNative && navigator.vibrate) {
            if (type === 'light') navigator.vibrate(10);
            if (type === 'medium') navigator.vibrate(20);
            if (type === 'heavy') navigator.vibrate(40);
            if (type === 'success') navigator.vibrate([50, 30, 50]);
            if (type === 'warning') navigator.vibrate([30, 50, 30]);
            if (type === 'error') navigator.vibrate([50, 50, 50, 50]);
        }
    }
};
