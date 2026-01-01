import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PlaceCard } from './PlaceCard';
import { ToastProvider } from './ToastProvider';

// Mock dependencies
vi.mock('@/hooks/useHaptic', () => ({
    useHaptic: () => ({ trigger: vi.fn() }),
}));

vi.mock('./ToastProvider', () => ({
    useToast: () => ({ showToast: vi.fn() }),
    ToastProvider: ({ children }: any) => <>{children}</>,
}));

vi.mock('@/utils/storage', () => ({
    db: {
        places: {
            addCall: vi.fn(),
        },
    },
}));

vi.mock('../constants', () => ({
    FALLBACK_IMAGE: 'fallback.jpg',
    getUserById: vi.fn(),
}));

const mockPlace = {
    id: '1',
    name: 'Bar Teste',
    type: 'Bar',
    address: 'Rua Teste, 123',
    imageUrl: 'test.jpg',
    rating: 4.5,
    distance: '1.2km',
    capacityPercentage: 50,
    lat: -22.22,
    lng: -54.80,
    isTrending: true,
    menu: [],
};

describe('PlaceCard component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders compact place information correctly', () => {
        render(
            <ToastProvider>
                <PlaceCard place={mockPlace as any} expanded={false} />
            </ToastProvider>
        );

        expect(screen.getByText('Bar Teste')).toBeDefined();
        expect(screen.getByText('Bar')).toBeDefined();
        expect(screen.getByText(/1.2km/)).toBeDefined();
    });

    it('renders expanded place information correctly', () => {
        render(
            <ToastProvider>
                <PlaceCard place={mockPlace as any} expanded={true} />
            </ToastProvider>
        );

        expect(screen.getByText('Bar Teste')).toBeDefined();
        expect(screen.getByText('Rua Teste, 123')).toBeDefined();
        expect(screen.getByText('VOU LÁ AGORA')).toBeDefined();
    });

    it('handles check-in button click and geolocation', async () => {
        const onCheckIn = vi.fn();
        const mockGeolocation = {
            getCurrentPosition: vi.fn().mockImplementation((success) =>
                success({
                    coords: {
                        latitude: -22.22,
                        longitude: -54.80,
                    },
                })
            ),
        };
        (global as any).navigator.geolocation = mockGeolocation;

        render(
            <ToastProvider>
                <PlaceCard place={mockPlace as any} expanded={true} onCheckIn={onCheckIn} />
            </ToastProvider>
        );

        const checkInBtn = screen.getByText('VOU LÁ AGORA');
        fireEvent.click(checkInBtn);

        await waitFor(() => {
            expect(onCheckIn).toHaveBeenCalledWith('1');
        });
    });
});
