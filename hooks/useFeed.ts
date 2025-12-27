import { useQuery } from '@tanstack/react-query';
import { db } from '../utils/storage';
import { FeedItem } from '../types';

export function useFeed() {
    return useQuery<FeedItem[]>({
        queryKey: ['feed'],
        queryFn: async () => {
            return await db.feed.get();
        },
        staleTime: 1000 * 60, // 1 minute
    });
}
