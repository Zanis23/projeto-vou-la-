import { describe, it, expect, vi, beforeEach } from 'vitest';
import { triggerHaptic } from './haptics';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

vi.mock('@capacitor/core', () => ({
    Capacitor: {
        isNativePlatform: vi.fn(),
    },
}));

describe('haptics utilities', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('triggers light impact correctly on native', async () => {
        vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true);
        await triggerHaptic('light');
        expect(Haptics.impact).toHaveBeenCalledWith({ style: ImpactStyle.Light });
    });

    it('triggers success notification correctly on native', async () => {
        vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true);
        await triggerHaptic('success');
        expect(Haptics.notification).toHaveBeenCalledWith({ type: NotificationType.Success });
    });

    it('triggers medium impact correctly on native', async () => {
        vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true);
        await triggerHaptic('medium');
        expect(Haptics.impact).toHaveBeenCalledWith({ style: ImpactStyle.Medium });
    });
});
