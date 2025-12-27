import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import { db } from '../utils/storage';
import { Place, FeedItem, User } from '../types';

export function useRealtimeData(appState: string, currentUser: User | null) {
    const queryClient = useQueryClient();

    const loadInitialData = useCallback(async () => {
        try {
            // Warm the cache
            await Promise.all([
                queryClient.prefetchQuery({ queryKey: ['places'], queryFn: () => db.places.get() }),
                queryClient.prefetchQuery({ queryKey: ['feed'], queryFn: () => db.feed.get() })
            ]);
        } catch (error) {
            console.error('Error prefetching initial data:', error);
        }
    }, [queryClient]);

    useEffect(() => {
        if (appState === 'MAIN') {
            loadInitialData();
        }
    }, [appState, loadInitialData]);

    useEffect(() => {
        if (appState !== 'MAIN' || !currentUser) return;

        const channel = supabase
            .channel('db-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'places' }, (payload) => {
                if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
                    const d = payload.new as any;
                    const mappedPlace: Partial<Place> = {
                        id: d.id,
                        name: d.name,
                        type: d.type,
                        peopleCount: d.people_count,
                        capacityPercentage: d.capacity_percentage,
                        imageUrl: d.image_url,
                        isTrending: d.is_trending,
                        activeCalls: d.active_calls,
                        currentMusic: d.current_music,
                        sentimentScore: d.sentiment_score
                    };

                    queryClient.setQueryData(['places'], (old: Place[] | undefined) => {
                        if (!old) return [mappedPlace as Place];
                        if (payload.eventType === 'INSERT') return [mappedPlace as Place, ...old];
                        return old.map(p => p.id === d.id ? { ...p, ...mappedPlace } : p);
                    });
                } else if (payload.eventType === 'DELETE') {
                    queryClient.setQueryData(['places'], (old: Place[] | undefined) =>
                        (old || []).filter(p => p.id !== payload.old.id)
                    );
                }
            })
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'feed' }, (payload) => {
                const f = payload.new as any;
                const mappedFeed: FeedItem = {
                    id: f.id,
                    userId: f.user_id,
                    userName: f.user_name,
                    userAvatar: f.user_avatar,
                    action: f.action,
                    placeName: f.place_name,
                    likesCount: f.likes_count,
                    commentsCount: f.comments_count,
                    timeAgo: 'Agora pouco',
                    liked: false
                };
                queryClient.setQueryData(['feed'], (old: FeedItem[] | undefined) => [mappedFeed, ...(old || [])]);
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'chats' }, (payload: any) => {
                const chat = payload.new;
                if (chat && (chat.user_id === currentUser.id || chat.target_id === currentUser.id)) {
                    // Update chats list cache
                    queryClient.invalidateQueries({ queryKey: ['chats'] });
                    window.dispatchEvent(new CustomEvent('voula_chat_update', { detail: chat }));

                    // Trigger logical notification if it's a new message not from ME
                    // In a more robust system, we'd check the last message sender_id
                    window.dispatchEvent(new CustomEvent('voula_notification', {
                        detail: {
                            type: 'info',
                            message: `Nova mensagem de ${chat.user_name || 'Alguém'}`
                        }
                    }));
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [appState, currentUser, queryClient]);

    return {
        loadInitialData
    };
}
