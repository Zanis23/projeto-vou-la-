import { describe, it, expect } from 'vitest';
import { calculateDistance, formatDistance, calculateLevel, generateMockRanking } from './core';

describe('core utilities', () => {
    describe('calculateDistance', () => {
        it('calculates distance between two points correctly', () => {
            // Dourados coordinates roughly: -22.2238, -54.8064
            // A point 1km North roughly: -22.1147, -54.8064 (approximate)
            // Let's use known small distance
            const d = calculateDistance(-22.2238, -54.8064, -22.2238, -54.8164);
            expect(d).toBeGreaterThan(0);
            expect(d).toBeLessThan(2); // Should be around 1km
        });

        it('returns 0 for same point', () => {
            expect(calculateDistance(-22, -54, -22, -54)).toBe(0);
        });
    });

    describe('formatDistance', () => {
        it('formats meters for small distances', () => {
            expect(formatDistance(0.5)).toBe('500m');
            expect(formatDistance(0.01)).toBe('10m');
        });

        it('formats km for larger distances', () => {
            expect(formatDistance(1.5)).toBe('1.5km');
            expect(formatDistance(10)).toBe('10.0km');
        });
    });

    describe('calculateLevel', () => {
        it('calculates level 1 for low XP', () => {
            const result = calculateLevel(100);
            expect(result.level).toBe(1);
            expect(result.progress).toBe(20); // 100/500
        });

        it('calculates level 2 for 500+ XP', () => {
            const result = calculateLevel(600);
            expect(result.level).toBe(2);
            expect(result.progress).toBe(20); // (600-500)/500
        });
    });

    describe('generateMockRanking', () => {
        it('includes the current user in the ranking', () => {
            const ranking = generateMockRanking(5000, 'Test User', 'avatar.jpg');
            const me = ranking.find(u => u.isMe);
            expect(me).toBeDefined();
            expect(me?.name).toBe('Test User');
        });

        it('sorts users by points descending', () => {
            const ranking = generateMockRanking(20000, 'Top User', 'avatar.jpg');
            expect(ranking[0].name).toBe('Top User');
        });
    });
});
