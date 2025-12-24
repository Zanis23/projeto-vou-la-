
// Haversine Formula to calculate distance between two lat/lng points in km
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};

const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180);
};

export const formatDistance = (distanceInKm: number): string => {
  if (distanceInKm < 1) {
    return `${Math.round(distanceInKm * 1000)}m`;
  }
  return `${distanceInKm.toFixed(1)}km`;
};

// Gamification Logic
// Level N requires: 100 * (N^1.5) XP roughly, or a simpler linear progression
export const calculateLevel = (xp: number): { level: number; progress: number; nextLevelXp: number } => {
  const baseXp = 500;
  const level = Math.floor(xp / baseXp) + 1;
  const xpForCurrentLevel = (level - 1) * baseXp;
  const xpForNextLevel = level * baseXp;
  const xpInCurrentLevel = xp - xpForCurrentLevel;
  const progress = Math.min(100, Math.floor((xpInCurrentLevel / baseXp) * 100));
  
  return { level, progress, nextLevelXp: xpForNextLevel };
};

export const generateMockRanking = (currentUserXp: number, currentUserName: string, currentUserAvatar: string) => {
    // Generate static high scores, but inject current user correctly
    const baseUsers = [
        { id: 'r1', name: 'Ana "Vip"', points: 15000, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', isMe: false },
        { id: 'r2', name: 'Marcos Rei', points: 12400, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100', isMe: false },
        { id: 'r3', name: 'Julia Party', points: 9800, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100', isMe: false },
        { id: 'r4', name: 'Lucas DJ', points: 5000, avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100', isMe: false },
        { id: 'r5', name: 'Beatriz Sol', points: 3200, avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100', isMe: false },
    ];

    const currentUserEntry = { id: 'me', name: currentUserName, points: currentUserXp, avatar: currentUserAvatar, isMe: true };
    
    // Merge and Sort
    const all = [...baseUsers, currentUserEntry].sort((a, b) => b.points - a.points);
    return all;
};
