import { openDB, IDBPDatabase } from 'idb';
import { User, Place, FeedItem, Chat, StaffCall } from '../types';
import { MOCK_USER, MOCK_PLACES, MOCK_FEED, MOCK_CHATS } from '../constants';
import { supabase } from '../services/supabase';
import { toCamel, toSnake } from './mapping';

const KEYS = {
  USER: 'voula_user_v3',
  PLACES: 'voula_places_v3',
  FEED: 'voula_feed_v3',
  CHATS: 'voula_chats_v3',
};

const DB_NAME = 'voula_db';
const DB_VERSION = 1;

const initDB = async (): Promise<IDBPDatabase> => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('keyval')) {
        db.createObjectStore('keyval');
      }
    },
  });
};

const saveLocal = async (key: string, data: any) => {
  try {
    const db = await initDB();
    await db.put('keyval', data, key);
  } catch (e) {
    console.error("Erro ao salvar no IndexedDB", e);
  }
};

const getLocal = async (key: string, fallback: any) => {
  try {
    const db = await initDB();
    const val = await db.get('keyval', key);
    return val !== undefined ? val : fallback;
  } catch (e) {
    return fallback;
  }
};

const removeLocal = async (key: string) => {
  try {
    const db = await initDB();
    await db.delete('keyval', key);
  } catch (e) {
    console.error("Erro ao remover do IndexedDB", e);
  }
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
          const user = {
            ...MOCK_USER,
            ...toCamel(profile),
            ownedPlaceId: profile.owned_place_id,
            history: profile.history || []
          };
          await saveLocal(KEYS.USER, user);
          return user;
        }
      }
      return null;
    },

    register: async (user: User, password?: string): Promise<{ success: boolean, data?: any, message?: string }> => {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: user.email!,
          password: password || '123456',
          options: {
            data: {
              name: user.name,
              avatar: user.avatar,
              owned_place_id: user.ownedPlaceId, // Critical: Pass ownership info
              level: user.level,
              points: user.points,
              badges: user.badges
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
            avatar: user.avatar,
            owned_place_id: user.ownedPlaceId,
            level: user.level || 1,
            points: user.points || 0,
            history: []
          };
          // We use INSERT IGNORE logic (on conflict do nothing) via upsert with ignoreDuplicates?
          // Actually upsert is better to ensure latest data, but trigger might race.
          // Let's use upsert which is safe.
          await supabase.from('profiles').upsert(profileData);
        }

        return { success: true, data };
      } catch (e: any) {
        return { success: false, message: e.message };
      }
    },

    login: async (email: string, password?: string): Promise<{ success: boolean, user?: User, message?: string }> => {
      // Allow legacy admin bypass locally
      if (email.toLowerCase() === 'admin' && password === '123') {
        const admin = { ...MOCK_USER, id: 'u1', name: 'Gabriel Admin', ownedPlaceId: '1' };
        await saveLocal(KEYS.USER, admin);
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
          const metadata = data.user.user_metadata || {};
          const user: User = {
            ...MOCK_USER,
            ...toCamel(profile),
            // MERGE FIX: If DB hasn't updated yet, use metadata from registration
            ownedPlaceId: profile.owned_place_id || metadata.owned_place_id,
            history: profile.history || []
          };
          await saveLocal(KEYS.USER, user);
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
            await saveLocal(KEYS.USER, user);
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

    logout: async () => {
      try { await supabase.auth.signOut(); } catch (e) { }
      await removeLocal(KEYS.USER);
      localStorage.removeItem('voula_logged_in');
    }
  },

  user: {
    get: async (): Promise<User> => {
      const sessionUser = await db.auth.getSession();
      if (sessionUser) return sessionUser;
      return await getLocal(KEYS.USER, MOCK_USER);
    },
    save: async (user: User): Promise<boolean> => {
      await saveLocal(KEYS.USER, user);
      try {
        // Use UPSERT instead of UPDATE for robustness
        const dbProfile = toSnake({
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          points: user.points,
          level: user.level,
          bio: user.bio,
          history: user.history,
          ownedPlaceId: user.ownedPlaceId,
          theme: user.theme,
          app_mode: user.appMode,
          accent_color: user.accentColor
        });
        const { error } = await supabase.from('profiles').upsert(dbProfile);

        if (error) {
          console.error("Erro ao sincronizar perfil com Supabase:", error.message, error.details);
          return false;
        }
        return true;
      } catch (e) {
        console.error("Exceção ao salvar perfil:", e);
        return false;
      }
    }
  },

  places: {
    get: async (): Promise<Place[]> => {
      try {
        const { data, error } = await supabase.from('places').select('*').order('people_count', { ascending: false });
        if (error) throw error;
        if (data) {
          await saveLocal(KEYS.PLACES, data);
          return data.map(d => toCamel(d));
        }
      } catch (e) { }
      return await getLocal(KEYS.PLACES, MOCK_PLACES);
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
          crowd_insights: place.crowdInsights,
          owner_id: place.ownerId
        };

        await supabase.from('places').insert([dbPlace]).select().single();
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
            ...toCamel(f),
            timeAgo: 'Agora pouco',
          }));
        }
      } catch (e) { }
      return await getLocal(KEYS.FEED, MOCK_FEED);
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
            return data.map(c => {
              const iAmUserId = c.user_id === user.id;
              return {
                id: c.id,
                userId: iAmUserId ? c.target_id : c.user_id,
                userName: iAmUserId ? (c.target_name || 'Usuário') : (c.user_name || 'Usuário'),
                userAvatar: iAmUserId ? (c.target_avatar || MOCK_USER.avatar) : (c.user_avatar || MOCK_USER.avatar),
                lastMessage: c.last_message,
                unreadCount: c.unread_count,
                messages: [] // Now strictly fetched via getMessages
              };
            });
          }
        }
      } catch (e) { }
      return await getLocal(KEYS.CHATS, MOCK_CHATS);
    },
    save: async (chats: Chat[]) => {
      await saveLocal(KEYS.CHATS, chats);
    },
    getMessages: async (chatId: string): Promise<any[]> => {
      try {
        const { data, error } = await supabase.from('messages')
          .select('*')
          .eq('chat_id', chatId)
          .order('created_at', { ascending: true });

        if (error) throw error;
        return data?.map(m => ({
          id: m.id,
          senderId: m.sender_id,
          text: m.content,
          timestamp: m.created_at,
          read: m.is_read
        })) || [];
      } catch (e) {
        console.error("Erro ao buscar mensagens:", e);
        return [];
      }
    },
    sendMessage: async (chatId: string, text: string) => {
      try {
        const me = await db.user.get();
        if (!me) return null;

        const { data, error } = await supabase.from('messages').insert({
          chat_id: chatId,
          sender_id: me.id,
          content: text
        }).select().single();

        if (error) throw error;

        // Also update the chat's last_message
        await supabase.from('chats').update({
          last_message: text,
          updated_at: new Date().toISOString()
        }).eq('id', chatId);

        return {
          id: data.id,
          senderId: data.sender_id,
          text: data.content,
          timestamp: data.created_at,
          read: data.is_read
        };
      } catch (e) {
        console.error("Erro ao enviar mensagem:", e);
        return null;
      }
    },
    add: async (chat: Chat) => {
      try {
        const me = await db.user.get();
        if (!me) return;

        await supabase.from('chats').upsert({
          id: chat.id,
          user_id: me.id,
          target_id: chat.userId,
          user_name: me.name,
          user_avatar: me.avatar,
          target_name: chat.userName,
          target_avatar: chat.userAvatar,
          last_message: chat.lastMessage,
          updated_at: new Date().toISOString()
        });
      } catch (e) {
        console.error("Chat add/update failed", e);
      }
    }
  },

  metrics: {
    logCheckIn: async (placeId: string, userId: string) => {
      try {
        await supabase.from('business_logs').insert([{
          place_id: placeId,
          user_id: userId,
          event_type: 'check_in',
          created_at: new Date().toISOString()
        }]);
      } catch (e) {
        console.warn("Metrics logging failed (table might be missing):", e);
      }
    },
    getVisitsByHour: async (placeId: string) => {
      try {
        // In a real scenario, we would aggregate this in SQL
        // SELECT date_trunc('hour', created_at) as hour, count(*) FROM business_logs ...
        const { data } = await supabase
          .from('business_logs')
          .select('created_at')
          .eq('place_id', placeId)
          .eq('event_type', 'check_in');

        if (data) {
          const hours: Record<number, number> = {};
          data.forEach(d => {
            const h = new Date(d.created_at).getHours();
            hours[h] = (hours[h] || 0) + 1;
          });
          return hours;
        }
      } catch (e) { }
      return { 18: 12, 19: 25, 20: 45, 21: 82, 22: 110, 23: 95, 0: 60 }; // Fallback
    },
    broadcastHype: async (place: Place, message: string) => {
      try {
        await db.feed.add({
          id: `hype_${Date.now()}`,
          userId: place.ownerId || 'admin',
          userName: place.name,
          userAvatar: place.imageUrl,
          action: '🔥 DISPAROU UM HYPE:',
          placeName: message,
          timeAgo: 'AGORA',
          liked: false,
          likesCount: 0,
          commentsCount: 0
        });
        return true;
      } catch (e) {
        return false;
      }
    }
  },

  friends: {
    request: async (targetId: string) => {
      try {
        const user = await db.user.get();
        if (!user) return false;
        const { error } = await supabase.from('friend_requests').upsert({
          sender_id: user.id,
          receiver_id: targetId,
          status: 'pending'
        });
        return !error;
      } catch (e) { return false; }
    },
    accept: async (requestId: string) => {
      try {
        const { error } = await supabase.from('friend_requests').update({ status: 'accepted' }).eq('id', requestId);
        return !error;
      } catch (e) { return false; }
    },
    getPending: async () => {
      try {
        const user = await db.user.get();
        if (!user) return [];
        const { data } = await supabase.from('friend_requests').select('*, profiles:sender_id(*)').eq('receiver_id', user.id).eq('status', 'pending');
        return data ? data.map(d => toCamel(d)) : [];
      } catch (e) { return []; }
    }
  }
};
