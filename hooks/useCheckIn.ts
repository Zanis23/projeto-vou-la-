import { useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '../utils/storage';
import { Place, FeedItem, User, FeedCheckIn } from '../types';

export function useCheckIn(currentUser: User | null) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ placeId, target }: { placeId: string, target: Place }) => {
            if (!currentUser) throw new Error('User not logged in');

            const xp = 50;
            const checkin: FeedCheckIn = {
                id: Date.now().toString(),
                placeId,
                placeName: target.name,
                timestamp: new Date().toISOString(),
                xpEarned: xp,
                snapshotImageUrl: target.imageUrl
            };

            const updatedUser = {
                ...currentUser,
                points: currentUser.points + xp,
                history: [checkin, ...currentUser.history]
            };

            // Save user profile
            await db.user.save(updatedUser);

            // Create feed item
            const newItem: FeedItem = {
                id: `f_${Date.now()}`,
                userId: currentUser.id,
                userName: currentUser.name,
                userAvatar: currentUser.avatar,
                action: 'chegou no',
                placeName: target.name,
                timeAgo: 'Agora',
                liked: false,
                likesCount: 0,
                commentsCount: 0
            };

            await db.feed.add(newItem);

            // Update place stats
            await Promise.all([
                db.places.update({
                    id: placeId,
                    peopleCount: target.peopleCount + 1,
                    capacityPercentage: Math.min(100, target.capacityPercentage + 2)
                }),
                db.metrics.logCheckIn(placeId, currentUser.id)
            ]);

            return { updatedUser, newItem };
        },
        onSuccess: () => {
            // Invalidate queries to refetch fresh data
            queryClient.invalidateQueries({ queryKey: ['places'] });
            queryClient.invalidateQueries({ queryKey: ['feed'] });
            // We could also update the user profile cache if we had a useUser hook
        },
    });
}
