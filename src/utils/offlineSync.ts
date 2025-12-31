import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface OfflineQueueDB extends DBSchema {
    'pending-actions': {
        key: number;
        value: {
            id?: number;
            action: string;
            data: any;
            timestamp: number;
            retries: number;
        };
    };
}

const DB_NAME = 'voula-offline-queue';
const STORE_NAME = 'pending-actions';
const MAX_RETRIES = 3;

let db: IDBPDatabase<OfflineQueueDB> | null = null;

async function getDB(): Promise<IDBPDatabase<OfflineQueueDB>> {
    if (db) return db;

    db = await openDB<OfflineQueueDB>(DB_NAME, 1, {
        upgrade(database) {
            if (!database.objectStoreNames.contains(STORE_NAME)) {
                database.createObjectStore(STORE_NAME, {
                    keyPath: 'id',
                    autoIncrement: true
                });
            }
        }
    });

    return db;
}

export interface QueuedAction {
    action: string;
    data: any;
}

/**
 * Add an action to the offline queue
 */
export async function queueAction(action: string, data: any): Promise<void> {
    try {
        const database = await getDB();
        await database.add(STORE_NAME, {
            action,
            data,
            timestamp: Date.now(),
            retries: 0
        });
        console.log(`[Offline Queue] Action queued: ${action}`);
    } catch (error) {
        console.error('[Offline Queue] Failed to queue action:', error);
    }
}

/**
 * Get all pending actions from the queue
 */
export async function getPendingActions(): Promise<any[]> {
    try {
        const database = await getDB();
        return await database.getAll(STORE_NAME);
    } catch (error) {
        console.error('[Offline Queue] Failed to get pending actions:', error);
        return [];
    }
}

/**
 * Remove an action from the queue
 */
export async function removeAction(id: number): Promise<void> {
    try {
        const database = await getDB();
        await database.delete(STORE_NAME, id);
        console.log(`[Offline Queue] Action removed: ${id}`);
    } catch (error) {
        console.error('[Offline Queue] Failed to remove action:', error);
    }
}

/**
 * Update retry count for an action
 */
async function incrementRetry(id: number): Promise<void> {
    try {
        const database = await getDB();
        const action = await database.get(STORE_NAME, id);
        if (action) {
            action.retries += 1;
            await database.put(STORE_NAME, action);
        }
    } catch (error) {
        console.error('[Offline Queue] Failed to increment retry:', error);
    }
}

/**
 * Process all pending actions in the queue
 */
export async function syncPendingActions(): Promise<void> {
    if (!navigator.onLine) {
        console.log('[Offline Queue] Still offline, skipping sync');
        return;
    }

    console.log('[Offline Queue] Starting sync...');
    const actions = await getPendingActions();

    if (actions.length === 0) {
        console.log('[Offline Queue] No pending actions');
        return;
    }

    console.log(`[Offline Queue] Syncing ${actions.length} actions...`);

    for (const item of actions) {
        try {
            // Process the action based on type
            await processAction(item.action, item.data);

            // If successful, remove from queue
            await removeAction(item.id!);
            console.log(`[Offline Queue] Synced: ${item.action}`);

        } catch (error) {
            console.error(`[Offline Queue] Failed to sync action ${item.action}:`, error);

            // Increment retry count
            await incrementRetry(item.id!);

            // If max retries reached, remove from queue
            if (item.retries >= MAX_RETRIES) {
                console.warn(`[Offline Queue] Max retries reached for action ${item.id}, removing`);
                await removeAction(item.id!);
            }
        }
    }

    console.log('[Offline Queue] Sync complete');
}

/**
 * Process a specific action
 */
async function processAction(action: string, data: any): Promise<void> {
    // Import supabase dynamically to avoid circular dependencies
    const { supabase } = await import('@/services/supabase');

    switch (action) {
        case 'check-in':
            await supabase.from('check_ins').insert(data);
            break;

        case 'like-place':
            await supabase.from('likes').insert(data);
            break;

        case 'send-message':
            await supabase.from('messages').insert(data);
            break;

        case 'update-profile':
            await supabase.from('profiles').update(data.updates).eq('id', data.userId);
            break;

        default:
            console.warn(`[Offline Queue] Unknown action type: ${action}`);
    }
}

/**
 * Clear all actions from the queue
 */
export async function clearQueue(): Promise<void> {
    try {
        const database = await getDB();
        await database.clear(STORE_NAME);
        console.log('[Offline Queue] Queue cleared');
    } catch (error) {
        console.error('[Offline Queue] Failed to clear queue:', error);
    }
}

// Auto-sync when coming back online
if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
        console.log('[Offline Queue] Connection restored, syncing...');
        syncPendingActions();
    });

    // Also try to sync on page load if online
    if (navigator.onLine) {
        syncPendingActions();
    }
}
