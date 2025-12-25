
import { User, Place, FeedItem, Chat, StaffCall, Message, AppNotification, Moment, Ticket, Achievement } from '../types';
import { MOCK_USER, MOCK_PLACES, MOCK_FEED, MOCK_CHATS } from '../constants';
import { supabase } from '../services/supabase';

const KEYS = {
  USER: 'voula_user_v3',
  PLACES: 'voula_places_v3',
  FEED: 'voula_feed_v3',
  CHATS: 'voula_chats_v3',
};

const saveLocal = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error("Erro ao salvar localmente", e);
  }
};

const getLocal = (key: string, fallback: any) => {
  const item = localStorage.getItem(key);
  if (!item) return fallback;
  try {
    return JSON.parse(item);
  } catch (e) {
    return fallback;
  }
};

export const generateUserCode = () => `VOU-${Math.floor(1000 + Math.random() * 9000)}`;

const mapProfileToUser = async (profile: any): Promise<User> => {
  let userCode = profile.user_code;

  // Lazy generation for existing users
  if (!userCode) {
    userCode = generateUserCode();
    await supabase.from('profiles').update({ user_code: userCode }).eq('id', profile.id);
  }

  // Handle potentially stringified or object settings
  const rawSettings = typeof profile.settings === 'string' ? JSON.parse(profile.settings) : (profile.settings || {});

  return {
    id: profile.id,
    email: profile.email,
    name: profile.name || 'Usuário',
    phone: profile.phone,
    age: profile.age,
    city: profile.city,
    avatar: profile.avatar || MOCK_USER.avatar,
    points: profile.points || 0,
    level: profile.level || 1,
    ownedPlaceId: profile.owned_place_id,
    bio: profile.bio || '',
    instagram: profile.instagram || '',
    tiktok: profile.tiktok || '',
    twitter: profile.twitter || '',
    memberSince: profile.created_at || new Date().toISOString(),
    history: profile.history || [],
    userCode: userCode,
    theme: profile.theme || 'neon',
    badges: profile.badges || [],
    savedPlaces: profile.saved_places || [],
    status: profile.status || '',
    termsAcceptedAt: profile.terms_accepted_at,
    privacyAcceptedAt: profile.privacy_accepted_at,
    settings: {
      ghostMode: rawSettings.ghostMode ?? false,
      publicProfile: rawSettings.publicProfile ?? true,
      allowTagging: rawSettings.allowTagging ?? true,
      blockedUsers: rawSettings.blockedUsers || [],
      notifications: {
        hypeAlerts: rawSettings.notifications?.hypeAlerts ?? true,
        chatMessages: rawSettings.notifications?.chatMessages ?? true,
        friendActivity: rawSettings.notifications?.friendActivity ?? true,
      }
    },
    lastSync: new Date().getTime()
  };
};

export const db = {
  // Popula o banco se estiver vazio (Primeiro acesso)
  seed: async () => {
    try {
      const { data: existingPlaces } = await supabase.from('places').select('id').limit(1);
      if (!existingPlaces || existingPlaces.length === 0) {
        console.log("🌱 Semeando dados iniciais no Supabase...");
        await supabase.from('places').insert(MOCK_PLACES.map(p => ({
          id: p.id,
          name: p.name,
          type: p.type,
          distance: p.distance,
          people_count: p.peopleCount,
          capacity_percentage: p.capacityPercentage,
          image_url: p.imageUrl,
          is_trending: p.isTrending,
          description: p.description,
          lat: p.lat,
          lng: p.lng,
          address: p.address,
          rating: p.rating,
          phone_number: p.phoneNumber,
          opening_hours: p.openingHours,
          tags: p.tags,
          current_music: p.currentMusic,
          menu: p.menu,
          active_calls: p.activeCalls || [],
          friends_present: p.friendsPresent,
          live_requests: p.liveRequests || [],
          upcoming_events: p.upcomingEvents || [],
          active_promos: p.activePromos || [],
          sentiment_score: p.sentimentScore,
          crowd_insights: p.crowdInsights,
          coordinates: p.coordinates,
          owner_id: p.ownerId ? (p.ownerId.length > 30 ? p.ownerId : null) : null
        })));

        await supabase.from('feed').insert(MOCK_FEED.map(f => ({
          user_id: f.userId.length > 30 ? f.userId : null,
          user_name: f.userName,
          user_avatar: f.userAvatar,
          action: f.action,
          place_name: f.placeName,
          likes_count: f.likesCount,
          comments_count: f.commentsCount,
          liked: f.liked
        })));
      }
    } catch (e) {
      console.warn("Seed ignorado (provavelmente tabelas não existem ou sem permissão RLS)", e);
    }
  },

  auth: {
    getSession: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        if (profile) {
          const user = await mapProfileToUser(profile);
          saveLocal(KEYS.USER, user);
          return user;
        }
      }
      return null;
    },

    logout: async () => {
      try { await supabase.auth.signOut(); } catch (e) { }
      localStorage.removeItem(KEYS.USER);
      localStorage.removeItem('voula_logged_in');
      localStorage.removeItem('voula_tutorial_seen_v1');
    },

    register: async (user: User, password?: string): Promise<{ success: boolean, data?: any, message?: string }> => {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: user.email!,
          password: password || '123456',
          options: {
            data: {
              name: user.name,
              phone: user.phone,
              age: user.age,
              city: user.city,
              avatar: user.avatar,
              owned_place_id: user.ownedPlaceId, // Critical: Pass ownership info
              level: user.level,
              points: user.points,
              badges: user.badges,
              terms_accepted_at: user.termsAcceptedAt,
              privacy_accepted_at: user.privacyAcceptedAt
            }
          }
        });

        if (error) return { success: false, message: error.message };

        // FALLBACK: Attempt to create profile immediately manually
        // This covers cases where the Postgres Trigger might fail or be slow
        if (data.user) {
          const profileData = {
            id: data.user.id,
            email: user.email,
            name: user.name,
            phone: user.phone,
            age: user.age,
            city: user.city,
            avatar: user.avatar,
            owned_place_id: user.ownedPlaceId,
            level: user.level || 1,
            points: user.points || 0,
            user_code: generateUserCode(),
            terms_accepted_at: user.termsAcceptedAt,
            privacy_accepted_at: user.privacyAcceptedAt,
            history: []
          };
          await supabase.from('profiles').upsert(profileData);
        }

        localStorage.removeItem('voula_tutorial_seen_v1');
        return { success: true, data };
      } catch (e: any) {
        return { success: false, message: e.message };
      }
    },

    login: async (email: string, password?: string): Promise<{ success: boolean, user?: User, message?: string }> => {
      // Allow legacy admin bypass locally
      if (email.toLowerCase() === 'admin' && password === '123') {
        const admin = { ...MOCK_USER, id: 'u1', name: 'Gabriel Admin', ownedPlaceId: '1' };
        saveLocal(KEYS.USER, admin);
        localStorage.setItem('voula_logged_in', 'true');
        return { success: true, user: admin };
      }

      try {
        const authEmail = email.includes('@') ? email : `${email}@voula.app`;
        const { data, error } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: password || ''
        });

        if (error) throw error;

        // Fetch profile with retry logic (3 attempts) to handle race condition with Trigger
        let profile = null;
        for (let i = 0; i < 3; i++) {
          const { data: p } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
          if (p) {
            profile = p;
            break;
          }
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        if (profile) {
          const user = await mapProfileToUser(profile);
          // Metadata override for new registrations where DB might be stale
          const metadata = data.user.user_metadata || {};
          if (metadata.owned_place_id) user.ownedPlaceId = metadata.owned_place_id;

          saveLocal(KEYS.USER, user);
          localStorage.setItem('voula_logged_in', 'true');
          return { success: true, user };
        } else {
          // FALLBACK: Profile trigger might have failed. Create profile manually.
          console.warn("Profile missing. Attempting manual creation...");
          const metadata = data.user.user_metadata || {};
          const newProfile = {
            id: data.user.id,
            email: authEmail,
            name: metadata.name || 'Novo Usuário',
            avatar: metadata.avatar || MOCK_USER.avatar,
            points: metadata.points || 100,
            level: metadata.level || 1,
            owned_place_id: metadata.owned_place_id || null, // Capture ownership from metadata
            created_at: new Date().toISOString()
          };

          const { error: insertError } = await supabase.from('profiles').insert([newProfile]);

          if (!insertError) {
            const user: User = {
              ...MOCK_USER,
              id: newProfile.id,
              email: newProfile.email,
              name: newProfile.name,
              avatar: newProfile.avatar,
              points: newProfile.points,
              level: newProfile.level,
              ownedPlaceId: newProfile.owned_place_id,
              badges: metadata.badges || []
            };
            saveLocal(KEYS.USER, user);
            localStorage.setItem('voula_logged_in', 'true');
            return { success: true, user };
          }

          console.warn("Manual profile creation failed:", insertError);
          return { success: false, message: 'Erro ao criar perfil de usuário. Tente novamente.' };
        }
      } catch (e: any) {
        return { success: false, message: e.message || 'Credenciais inválidas.' };
      }
      return { success: false, message: 'Erro ao processar login.' };
    },

    updatePassword: async (newPassword: string): Promise<{ success: boolean, message?: string }> => {
      try {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;
        return { success: true };
      } catch (e: any) {
        return { success: false, message: e.message };
      }
    },

    deleteAccount: async (): Promise<{ success: boolean, message?: string }> => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, message: 'Usuário não encontrado.' };

        // Profile deletion (Auth side deletion usually needs Admin API, so we focus on DB + Logout)
        const { error: profileError } = await supabase.from('profiles').delete().eq('id', user.id);
        if (profileError) throw profileError;

        await db.auth.logout();
        return { success: true };
      } catch (e: any) {
        return { success: false, message: e.message };
      }
    },
  },

  user: {
    get: async (): Promise<User> => {
      const sessionUser = await db.auth.getSession();
      if (sessionUser) return sessionUser;
      return getLocal(KEYS.USER, MOCK_USER);
    },
    save: async (user: User): Promise<boolean> => {
      user.lastSync = new Date().getTime(); // Mark this local state as the newest
      saveLocal(KEYS.USER, user);
      try {
        const { error } = await supabase.from('profiles').upsert({
          id: user.id,
          name: user.name,
          phone: user.phone,
          age: user.age,
          city: user.city,
          avatar: user.avatar,
          points: user.points,
          level: user.level,
          bio: user.bio,
          instagram: user.instagram,
          tiktok: user.tiktok,
          twitter: user.twitter,
          history: user.history,
          owned_place_id: user.ownedPlaceId,
          user_code: user.userCode,
          theme: user.theme || 'neon',
          terms_accepted_at: user.termsAcceptedAt,
          privacy_accepted_at: user.privacyAcceptedAt,
          settings: user.settings
        });

        if (error) {
          console.error("❌ Erro ao sincronizar perfil com Supabase:", error.message, error.details);
          return false;
        }
        return true;
      } catch (e: any) {
        console.error("❌ Exceção ao salvar perfil:", e.message || e);
        return false;
      }
    },
    search: async (query: string): Promise<User[]> => {
      try {
        const q = query.trim();
        // SEARCH FIX: PostgREST .or() with SDK template
        const { data } = await supabase.from('profiles')
          .select('*')
          .or(`name.ilike.%${q}%,user_code.ilike.%${q}%`)
          .limit(10);

        return (data || []).map(p => ({
          ...MOCK_USER,
          id: p.id,
          name: p.name,
          avatar: p.avatar,
          bio: p.bio,
          points: p.points || 0,
          level: p.level || 1,
          userCode: p.user_code
        }));
      } catch (e) {
        return [];
      }
    }
  },

  places: {
    get: async (): Promise<Place[]> => {
      try {
        const { data, error } = await supabase.from('places').select('*').order('people_count', { ascending: false });
        if (error) throw error;
        if (data) {
          saveLocal(KEYS.PLACES, data);
          return data.map(d => ({
            ...d,
            peopleCount: d.people_count,
            capacityPercentage: d.capacity_percentage,
            imageUrl: d.image_url,
            isTrending: d.is_trending,
            coordinates: d.coordinates || { x: 0, y: 0 },
            phoneNumber: d.phone_number,
            openingHours: d.opening_hours,
            currentMusic: d.current_music,
            activeCalls: d.active_calls,
            friendsPresent: d.friends_present,
            liveRequests: d.live_requests,
            upcomingEvents: d.upcoming_events,
            activePromos: d.active_promos,
            sentimentScore: d.sentiment_score,
            crowdInsights: d.crowd_insights,
            ownerId: d.owner_id
          }));
        }
      } catch (e) { }
      return getLocal(KEYS.PLACES, MOCK_PLACES);
    },
    add: async (place: Place) => {
      try {
        const dbPlace = {
          id: place.id,
          name: place.name,
          type: place.type,
          distance: place.distance,
          people_count: place.peopleCount,
          capacity_percentage: place.capacityPercentage,
          image_url: place.imageUrl,
          is_trending: place.isTrending,
          description: place.description,
          coordinates: place.coordinates,
          phone_number: place.phoneNumber,
          opening_hours: place.openingHours,
          current_music: place.currentMusic,
          owner_id: place.ownerId, // Add owner binding to DB insert
          lat: place.lat,
          lng: place.lng,
          address: place.address,
          tags: place.tags,
          menu: place.menu,
          active_calls: place.activeCalls,
          friends_present: place.friendsPresent,
          live_requests: place.liveRequests,
          upcoming_events: place.upcomingEvents,
          active_promos: place.activePromos,
          sentiment_score: place.sentimentScore,
          crowd_insights: place.crowdInsights
        };

        const { data } = await supabase.from('places').insert([dbPlace]).select().single();
        return place;
      } catch (e) { }
      return place;
    },
    update: async (place: Partial<Place> & { id: string }) => {
      try {
        const updateData: any = {};
        if (place.name) updateData.name = place.name;
        if (place.peopleCount !== undefined) updateData.people_count = place.peopleCount;
        if (place.capacityPercentage !== undefined) updateData.capacity_percentage = place.capacityPercentage;
        if (place.activeCalls) updateData.active_calls = place.activeCalls;
        if (place.menu) updateData.menu = place.menu;
        if (place.currentMusic) updateData.current_music = place.currentMusic;
        // ... map other fields as needed

        const { data } = await supabase.from('places').update(updateData).eq('id', place.id).select().single();
        return data ? { ...place, ...data } : place;
      } catch (e) {
        console.error("Update failed", e);
      }
      return place;
    },
    addCall: async (placeId: string, call: StaffCall) => {
      const { data: place } = await supabase.from('places').select('active_calls').eq('id', placeId).single();
      if (place) {
        const currentCalls = place.active_calls || [];
        const newCalls = [...currentCalls, call];
        await supabase.from('places').update({ active_calls: newCalls }).eq('id', placeId);
      }
    }
  },

  feed: {
    get: async (): Promise<FeedItem[]> => {
      try {
        const { data } = await supabase.from('feed').select('*').order('created_at', { ascending: false }).limit(30);
        if (data) {
          return data.map(f => ({
            id: f.id,
            userId: f.user_id,
            userName: f.user_name,
            userAvatar: f.user_avatar,
            action: f.action,
            placeName: f.place_name,
            likesCount: f.likes_count,
            commentsCount: f.comments_count,
            timeAgo: 'Agora pouco',
            liked: f.liked
          }));
        }
      } catch (e) { }
      return getLocal(KEYS.FEED, MOCK_FEED);
    },
    add: async (item: FeedItem) => {
      try {
        await supabase.from('feed').insert([{
          user_id: item.userId.length > 30 ? item.userId : null,
          user_name: item.userName,
          user_avatar: item.userAvatar,
          action: item.action,
          place_name: item.placeName,
          likes_count: 0,
          comments_count: 0
        }]);
      } catch (e) { }
      return item;
    }
  },

  chats: {
    get: async (): Promise<Chat[]> => {
      try {
        const user = await db.user.get();
        if (user && user.id) {
          const { data } = await supabase.from('chats')
            .select('*')
            .or(`user_id.eq.${user.id},target_id.eq.${user.id}`)
            .order('updated_at', { ascending: false });

          if (data) {
            return data.map(c => ({
              id: c.id,
              userId: c.user_id,
              userName: c.user_name,
              userAvatar: c.user_avatar,
              lastMessage: c.last_message,
              unreadCount: c.unread_count,
              messages: c.messages
            }));
          }
        }
      } catch (e) { }
      return getLocal(KEYS.CHATS, MOCK_CHATS);
    },
    save: async (chats: Chat[]) => {
      saveLocal(KEYS.CHATS, chats);
    },
    add: async (chat: Chat) => {
      try {
        const user = await db.user.get();
        if (!user) return;

        await supabase.from('chats').upsert({
          id: chat.id,
          user_id: user.id,
          target_id: chat.userId,
          user_name: chat.userName,
          user_avatar: chat.userAvatar,
          last_message: chat.lastMessage,
          messages: chat.messages,
          is_blocked: chat.isBlocked || false,
          updated_at: new Date().toISOString()
        });
      } catch (e) {
        console.error("Chat add/update failed", e);
      }
    },
    block: async (targetId: string) => {
      const me = await db.user.get();
      if (!me) return;
      const blocked = me.settings?.blockedUsers || [];
      if (!blocked.includes(targetId)) {
        const updatedUser = {
          ...me,
          settings: {
            ...me.settings!,
            blockedUsers: [...blocked, targetId]
          }
        };
        await db.user.save(updatedUser);
      }
    }
  },

  notifications: {
    get: async (): Promise<AppNotification[]> => {
      try {
        const user = await db.user.get();
        if (!user || !user.id) return [];

        const { data } = await supabase.from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50);

        if (data) {
          return data.map(n => ({
            id: n.id,
            userId: n.user_id,
            type: n.type,
            senderId: n.sender_id,
            senderName: n.sender_name,
            senderAvatar: n.sender_avatar,
            title: n.title,
            message: n.message,
            timestamp: n.created_at,
            read: n.read || false,
            chatId: n.chat_id,
            placeId: n.place_id,
            placeName: n.place_name
          }));
        }
      } catch (e) {
        console.error("Failed to fetch notifications", e);
      }
      return [];
    },

    add: async (notification: Omit<AppNotification, 'id' | 'timestamp'>) => {
      try {
        await supabase.from('notifications').insert([{
          user_id: notification.userId,
          type: notification.type,
          sender_id: notification.senderId,
          sender_name: notification.senderName,
          sender_avatar: notification.senderAvatar,
          title: notification.title,
          message: notification.message,
          read: false,
          chat_id: notification.chatId,
          place_id: notification.placeId,
          place_name: notification.placeName
        }]);
      } catch (e) {
        console.error("Failed to add notification", e);
      }
    },

    markAsRead: async (notificationId: string) => {
      try {
        await supabase.from('notifications')
          .update({ read: true })
          .eq('id', notificationId);
      } catch (e) {
        console.error("Failed to mark notification as read", e);
      }
    }
  },

  ranking: {
    list: async (): Promise<User[]> => {
      try {
        const { data } = await supabase.from('profiles')
          .select('*')
          .order('points', { ascending: false })
          .limit(20);

        if (data && data.length > 0) {
          return data.map(p => ({
            ...MOCK_USER,
            id: p.id,
            name: p.name,
            avatar: p.avatar,
            points: p.points || 0,
            level: p.level || 1,
            bio: p.bio,
            badges: p.badges || []
          }));
        }
      } catch (e) { }
      return [];
    }
  },

  moments: {
    list: async (placeId?: string): Promise<Moment[]> => {
      try {
        let q = supabase.from('moments').select('*').gt('expires_at', new Date().toISOString());
        if (placeId) q = q.eq('place_id', placeId);

        const { data } = await q.order('created_at', { ascending: false });
        if (data) {
          return data.map(m => ({
            id: m.id,
            userId: m.user_id,
            userName: m.user_name,
            userAvatar: m.user_avatar,
            placeId: m.place_id,
            placeName: m.place_name,
            contentUrl: m.content_url,
            contentType: m.content_type as 'image' | 'video',
            createdAt: m.created_at,
            expiresAt: m.expires_at
          }));
        }
      } catch (e) { }
      return [];
    },
    add: async (moment: Omit<Moment, 'id' | 'createdAt' | 'expiresAt'>) => {
      try {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) return;

        await supabase.from('moments').insert([{
          user_id: user.user.id,
          user_name: moment.userName,
          user_avatar: moment.userAvatar,
          place_id: moment.placeId,
          place_name: moment.placeName,
          content_url: moment.contentUrl,
          content_type: moment.contentType
        }]);
      } catch (e) { }
    }
  },

  wallet: {
    getTickets: async (): Promise<Ticket[]> => {
      try {
        const user = await db.user.get();
        if (!user || !user.id) return [];

        const { data } = await supabase.from('ticket_purchases')
          .select('*, ticket_catalog:ticket_id(*)')
          .eq('user_id', user.id);

        if (data) {
          return data.map(p => ({
            id: p.id,
            title: p.ticket_catalog?.name || 'Ingresso',
            placeId: p.ticket_catalog?.place_id || '',
            placeName: p.ticket_catalog?.place_name || 'Vou Lá Exclusive',
            qrCodeData: p.qr_code,
            status: p.status as 'valid' | 'used' | 'expired',
            type: 'Convite',
            price: p.ticket_catalog?.price || 0,
            purchasedAt: p.purchased_at
          }));
        }
      } catch (e) { }
      return [];
    },
    buy: async (ticketId: string): Promise<boolean> => {
      try {
        const user = await db.user.get();
        if (!user) return false;

        const { data: ticket } = await supabase.from('tickets_catalog').select('*').eq('id', ticketId).single();
        if (!ticket) return false;

        const { error } = await supabase.from('ticket_purchases').insert({
          user_id: user.id,
          ticket_id: ticketId,
          qr_code: `VOU-${Math.random().toString(36).substring(2, 11).toUpperCase()}`
        });

        if (!error) {
          // Award points for buying
          await db.user.save({ ...user, points: (user.points || 0) + 50 });
          return true;
        }
        return false;
      } catch (e) { return false; }
    }
  },

  achievements: {
    list: async (userId: string): Promise<Achievement[]> => {
      try {
        const { data } = await supabase.from('user_achievements').select('*').eq('user_id', userId);
        // Map to full achievement info (would normally fetch from a master table)
        return (data || []).map(a => ({
          id: a.achievement_id,
          title: a.achievement_id.replace('_', ' ').toUpperCase(),
          description: 'Desbloqueado com sucesso!',
          icon: 'Award',
          unlockedAt: a.unlocked_at
        }));
      } catch (e) { return []; }
    },
    award: async (userId: string, achievementId: string) => {
      try {
        await supabase.from('user_achievements').upsert({
          user_id: userId,
          achievement_id: achievementId
        });
      } catch (e) { }
    }
  }
};
