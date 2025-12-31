import { useEffect } from 'react';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';

export const useBackgroundGeo = () => {
    useEffect(() => {
        if (!Capacitor.isNativePlatform()) return;

        const startWatching = async () => {
            const hasPermission = await Geolocation.checkPermissions();

            if (hasPermission.location !== 'granted') {
                const request = await Geolocation.requestPermissions();
                if (request.location !== 'granted') return;
            }

            // Prototype: In a real app, use @capacitor-community/background-geolocation
            // standard @capacitor/geolocation 'watchPosition' is limited in background
            const watchId = await Geolocation.watchPosition({
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }, (position, err) => {
                if (err) {
                    console.error('BG Geo Error:', err);
                    return;
                }
                if (position) {
                    console.log('Background Position:', position.coords.latitude, position.coords.longitude);
                    // Here we would normally send to API if it's a significant change
                }
            });

            return watchId;
        };

        const watchRef = startWatching();

        return () => {
            watchRef.then(id => {
                if (id) Geolocation.clearWatch({ id });
            });
        };
    }, []);
};
