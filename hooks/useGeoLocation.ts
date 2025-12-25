import { useState, useEffect } from 'react';

interface GeoLocationState {
    loaded: boolean;
    coordinates?: { lat: number; lng: number };
    error?: { code: number; message: string };
}

export const useGeoLocation = () => {
    const [location, setLocation] = useState<GeoLocationState>({
        loaded: false,
    });

    const onSuccess = (location: GeolocationPosition) => {
        setLocation({
            loaded: true,
            coordinates: {
                lat: location.coords.latitude,
                lng: location.coords.longitude,
            },
        });
    };

    const onError = (error: GeolocationPositionError) => {
        setLocation({
            loaded: true,
            error: {
                code: error.code,
                message: error.message,
            },
        });
    };

    useEffect(() => {
        if (!("geolocation" in navigator)) {
            onError({
                code: 0,
                message: "Geolocation not supported",
            } as GeolocationPositionError);
            return;
        }

        const watcher = navigator.geolocation.watchPosition(onSuccess, onError, {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 5000
        });

        return () => navigator.geolocation.clearWatch(watcher);
    }, []);

    return location;
};
