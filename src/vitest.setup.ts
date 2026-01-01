import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Capacitor Plugins
vi.mock('@capacitor/haptics', () => ({
    Haptics: {
        impact: vi.fn(),
        notification: vi.fn(),
        vibrate: vi.fn(),
        selectionStart: vi.fn(),
        selectionChanged: vi.fn(),
        selectionEnd: vi.fn(),
    },
    ImpactStyle: {
        Heavy: 'HEAVY',
        Medium: 'MEDIUM',
        Light: 'LIGHT',
    },
    NotificationType: {
        Success: 'SUCCESS',
        Warning: 'WARNING',
        Error: 'ERROR',
    },
}));

vi.mock('@capacitor/geolocation', () => ({
    Geolocation: {
        getCurrentPosition: vi.fn(),
        watchPosition: vi.fn(),
    },
}));

// Mock window.L (Leaflet) for Radar tests
(window as any).L = {
    map: vi.fn(() => ({
        setView: vi.fn().mockReturnThis(),
        on: vi.fn().mockReturnThis(),
        remove: vi.fn(),
        invalidateSize: vi.fn(),
        flyTo: vi.fn(),
        getZoom: vi.fn(() => 14),
    })),
    tileLayer: vi.fn(() => ({
        addTo: vi.fn().mockReturnThis(),
    })),
    marker: vi.fn(() => ({
        addTo: vi.fn().mockReturnThis(),
        setLatLng: vi.fn().mockReturnThis(),
        remove: vi.fn(),
    })),
    divIcon: vi.fn(() => ({})),
};
