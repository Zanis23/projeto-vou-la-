/**
 * Secure Storage using Capacitor Preferences API
 * Compatible with Capacitor 6
 */

import { Preferences } from '@capacitor/preferences';

export const secureStorage = {
    /**
     * Set a value in secure storage
     */
    async set(key: string, value: string): Promise<void> {
        try {
            await Preferences.set({ key, value });
        } catch (error) {
            console.error('[SecureStorage] Set error:', error);
            throw error;
        }
    },

    /**
     * Get a value from secure storage
     */
    async get(key: string): Promise<string | null> {
        try {
            const { value } = await Preferences.get({ key });
            return value;
        } catch (error) {
            console.error('[SecureStorage] Get error:', error);
            return null;
        }
    },

    /**
     * Remove a value from secure storage
     */
    async remove(key: string): Promise<void> {
        try {
            await Preferences.remove({ key });
        } catch (error) {
            console.error('[SecureStorage] Remove error:', error);
            throw error;
        }
    },

    /**
     * Clear all values from secure storage
     */
    async clear(): Promise<void> {
        try {
            await Preferences.clear();
        } catch (error) {
            console.error('[SecureStorage] Clear error:', error);
            throw error;
        }
    },

    /**
     * Get all keys from secure storage
     */
    async keys(): Promise<string[]> {
        try {
            const { keys } = await Preferences.keys();
            return keys;
        } catch (error) {
            console.error('[SecureStorage] Keys error:', error);
            return [];
        }
    }
};
