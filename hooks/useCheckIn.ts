import { useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '../utils/storage';
import { Place, FeedItem, User, FeedCheckIn } from '../types';
import { useToast } from '../components/ToastProvider';

export function useCheckIn(currentUser: User | null) {
    const queryClient = useQueryClient();
    const { showToast } = useToast();

    return useMutation({
        mutationFn: async ({ placeId, target }: { placeId: string, target: Place }) => {
            if (!currentUser) throw new Error('User not logged in');

            const xp = 50;
            const newPoints = currentUser.points + xp;
            let newLevel = currentUser.level;

            // Simple leveling logic: level up every 250 XP
            const levelThreshold = 250;
            const calculatedLevel = Math.floor(newPoints / levelThreshold) + 1;

            if (calculatedLevel > currentUser.level) {
                newLevel = calculatedLevel;
                showToast({
                    type: 'success',
                    message: `PARABÉNS! Você subiu para o Nível ${newLevel}! 🏆`
                });
            }

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
                points: newPoints,
                level: newLevel,
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
        },
    });
}
