import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import { db } from '../utils/storage';
import { toCamel } from '../utils/mapping';
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
                    const mappedPlace = toCamel(payload.new) as Place;

                    queryClient.setQueryData(['places'], (old: Place[] | undefined) => {
                        if (!old) return [mappedPlace];
                        if (payload.eventType === 'INSERT') return [mappedPlace, ...old];
                        return old.map(p => p.id === mappedPlace.id ? { ...p, ...mappedPlace } : p);
                    });
                } else if (payload.eventType === 'DELETE') {
                    queryClient.setQueryData(['places'], (old: Place[] | undefined) =>
                        (old || []).filter(p => p.id === payload.old.id ? false : true)
                    );
                }
            })
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'feed' }, (payload) => {
                const mappedFeed = {
                    ...toCamel(payload.new),
                    timeAgo: 'Agora pouco',
                    liked: false
                } as FeedItem;
                queryClient.setQueryData(['feed'], (old: FeedItem[] | undefined) => [mappedFeed, ...(old || [])]);
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'chats' }, (payload: any) => {
                const chat = toCamel(payload.new);
                if (chat && (chat.userId === currentUser.id || chat.targetId === currentUser.id)) {
                    // Update chats list cache
                    queryClient.invalidateQueries({ queryKey: ['chats'] });
                    window.dispatchEvent(new CustomEvent('voula_chat_update', { detail: chat }));

                    // Trigger logical notification if it's a new message not from ME
                    // Only for INSERT to avoid spam on updates
                    if (payload.eventType === 'INSERT') {
                        window.dispatchEvent(new CustomEvent('voula_notification', {
                            detail: {
                                type: 'info',
                                message: `Nova mensagem de ${chat.userName || 'Alguém'}`
                            }
                        }));
                    }
                }
            })
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'friend_requests' }, (payload: any) => {
                const req = toCamel(payload.new);
                if (req.receiverId === currentUser.id) {
                    window.dispatchEvent(new CustomEvent('voula_notification', {
                        detail: {
                            type: 'success',
                            message: `Novo pedido de amizade recebido!`
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
