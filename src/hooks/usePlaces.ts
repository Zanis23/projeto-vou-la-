import { useQuery } from '@tanstack/react-query';
import { db } from '@/utils/storage';
import { Place } from '@/types';

export function usePlaces() {
    return useQuery<Place[]>({
        queryKey: ['places'],
        queryFn: async () => {
            const places = await db.places.get();
            if (places.length === 0) {
                await db.seed();
                return await db.places.get();
            }
            return places;
        },
        staleTime: 1000 * 60 * 2, // 2 minutes
    });
}
