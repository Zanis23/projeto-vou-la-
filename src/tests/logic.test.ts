import { describe, it, expect } from 'vitest';
import { calculateLevel } from '../utils/core';

describe('Gamification Logic', () => {
    it('should start at level 1 with 0 XP', () => {
        const result = calculateLevel(0);
        expect(result.level).toBe(1);
        expect(result.progress).toBe(0);
    });

    it('should reach level 2 at 500 XP', () => {
        const result = calculateLevel(500);
        expect(result.level).toBe(2);
        expect(result.progress).toBe(0);
    });

    it('should calculate progress correctly within a level', () => {
        // Level 1 is 0-499. 250 XP should be 50%
        const result = calculateLevel(250);
        expect(result.level).toBe(1);
        expect(result.progress).toBe(50);
    });

    it('should handle high levels correctly', () => {
        // Level 10 starts at 4500 (9 * 500)
        const result = calculateLevel(4500);
        expect(result.level).toBe(10);
        expect(result.progress).toBe(0);
    });
});
