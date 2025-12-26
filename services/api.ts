import { supabase } from './supabase';
import { User, CheckIn } from '../types';

/**
 * Check-in Management
 * Uses the 'manage_checkin' RPC to handle auto-checkout and atomic updates.
 */
export const api = {
    checkIn: async (placeId: string, vibe: string = 'CHILL', xp: number = 50) => {
        try {
            const { data, error } = await supabase.rpc('manage_checkin', {
                p_place_id: placeId,
                p_vibe: vibe,
                p_xp: xp
            });

            if (error) {
                console.error("RPC Error (manage_checkin):", error);
                throw error;
            }
            return data;
        } catch (err) {
            console.error("Check-in failed:", err);
            throw err;
        }
    },

    /**
     * Get Active Users at a Place
     * Uses 'get_active_users_at_place' RPC for privacy-filtered list.
     */
    getActiveUsers: async (placeId: string): Promise<User[]> => {
        const { data, error } = await supabase.rpc('get_active_users_at_place', {
            p_place_id: placeId
        });

        if (error) {
            console.error("Error fetching active users:", error);
            return [];
        }

        // Map RPC result (id, name, avatar, bio) to User partial
        return (data || []).map((u: any) => ({
            id: u.id,
            name: u.name,
            avatar: u.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + u.id,
            bio: u.bio,
            level: 1, // Default for minimal display
            points: 0,
            badges: [],
            history: [],
            savedPlaces: [],
            memberSince: new Date().toISOString()
        })) as User[];
    },

    /**
     * Check if Current User has an active checkin
     */
    getActiveCheckIn: async (userId: string) => {
        const { data, error } = await supabase
            .from('checkins')
            .select(`
        *,
        places (name, image_url)
      `)
            .eq('user_id', userId)
            .is('checked_out_at', null)
            .single();

        if (error && error.code !== 'PGRST116') { // Ignore 'no rows' error
            console.error("Error fetching active checkin:", error);
        }

        return data;
    },

    /**
     * Send Social Interaction (Like/Connect)
     */
    sendInteraction: async (targetId: string, type: 'LIKE' | 'CONNECT' = 'CONNECT') => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const { data, error } = await supabase
            .from('interactions')
            .insert({
                actor_id: user.id,
                target_id: targetId,
                type,
                status: 'PENDING'
            })
            .select()
            .single();

        if (error) {
            // If duplicate (violates unique index), just return existing logic or error
            if (error.code === '23505') { // Unique violation
                console.warn("Interaction already exists");
                return { status: 'ALREADY_EXISTS' };
            }
            console.error("Interaction error:", error);
            throw error;
        }

        return data;
    },

    /**
     * Get Pending Interactions (Inbox)
     */
    getPendingInteractions: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const { data, error } = await supabase
            .from('interactions')
            .select(`
                *,
                actor:profiles!actor_id (id, name, avatar, bio)
            `)
            .eq('target_id', user.id)
            .eq('status', 'PENDING')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching inbox:", error);
            return [];
        }
        return data;
    },

    /**
     * Respond to Interaction (Accept/Reject)
     */
    respondToInteraction: async (interactionId: string, status: 'ACCEPTED' | 'REJECTED') => {
        const { data, error } = await supabase
            .from('interactions')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', interactionId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};

