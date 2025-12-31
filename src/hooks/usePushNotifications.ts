import { useEffect } from 'react';
import { PushNotifications, Token, ActionPerformed, PushNotificationSchema } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { db } from '@/utils/storage';

export const usePushNotifications = (userId: string | undefined) => {
    useEffect(() => {
        if (!Capacitor.isNativePlatform()) {
            console.log('Push notifications are only available on native platforms.');
            return;
        }

        if (!userId) return;

        const initializePush = async () => {
            // Request permissions
            let permStatus = await PushNotifications.checkPermissions();

            if (permStatus.receive === 'prompt') {
                permStatus = await PushNotifications.requestPermissions();
            }

            if (permStatus.receive !== 'granted') {
                console.warn('User denied push notification permissions.');
                return;
            }

            // Register with Apple / Google
            await PushNotifications.register();

            // On success, we should be able to receive notifications
            PushNotifications.addListener('registration', async (token: Token) => {
                console.log('Push registration success, token: ' + token.value);

                // Save token to profile in Supabase for targeted pushes
                const user = await db.user.get();
                if (user && user.id === userId) {
                    await db.user.save({
                        ...user,
                        pushToken: token.value
                    });
                }
            });

            // Some error occurred
            PushNotifications.addListener('registrationError', (error: any) => {
                console.error('Error on registration: ' + JSON.stringify(error));
            });

            // Show us the notification payload if the app is open on our device
            PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
                console.log('Push received: ' + JSON.stringify(notification));
            });

            // Method called when tapping on a notification
            PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
                console.log('Push action performed: ' + JSON.stringify(notification));
                // Handle deep linking logic here
            });
        };

        initializePush();

        // Clean up listeners on unmount
        return () => {
            PushNotifications.removeAllListeners();
        };
    }, [userId]);
};
