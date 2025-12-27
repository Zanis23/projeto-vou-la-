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
                if (payload.eventType === 'INSERT') {
                    queryClient.setQueryData(['places'], (old: Place[] | undefined) => [payload.new as Place, ...(old || [])]);
                } else if (payload.eventType === 'UPDATE') {
                    queryClient.setQueryData(['places'], (old: Place[] | undefined) =>
                        (old || []).map(p => p.id === payload.new.id ? { ...p, ...payload.new } : p)
                    );
                } else if (payload.eventType === 'DELETE') {
                    queryClient.setQueryData(['places'], (old: Place[] | undefined) =>
                        (old || []).filter(p => p.id !== payload.old.id)
                    );
                }
            })
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'feed' }, (payload) => {
                queryClient.setQueryData(['feed'], (old: FeedItem[] | undefined) => [payload.new as FeedItem, ...(old || [])]);
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'chats' }, (payload: any) => {
                const chat = payload.new;
                if (chat && (chat.user_id === currentUser.id || chat.target_id === currentUser.id)) {
                    window.dispatchEvent(new CustomEvent('voula_chat_update'));
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
