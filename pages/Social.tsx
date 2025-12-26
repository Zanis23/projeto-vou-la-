
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MOCK_FRIEND_REQUESTS, MOCK_USER, MOCK_SUGGESTIONS, MOCK_PLACES, FALLBACK_IMAGE } from '../constants';
import { MessageSquare, Heart, MapPin, Search, ChevronLeft, Send, CheckCircle2, UserPlus, X, Camera, Image as ImageIcon, Mic, StopCircle, Calendar, Clock, Share2, Plus, ShieldAlert, Ban, MoreVertical, Sparkles } from 'lucide-react';
import { Chat, FriendRequest, FeedItem, Message, Place, SocialPlan, MatchProfile } from '../types';
import { useHaptic } from '../hooks/useHaptic';
import { AiStudio } from '../components/AiStudio';
import { MatchCard } from '../components/MatchCard';
import { db } from '../utils/storage';
import { User } from '../types';

type ViewMode = 'feed' | 'chats' | 'plans' | 'chat_detail' | 'connect';

interface SocialProps {
  feed: FeedItem[];
  onToggleLike: (id: string) => void;
  onComment: (id: string) => void;
  onPlaceSelect?: (place: Place) => void;
  places: Place[];
}

// Mock Data for Matches (Temporary)
const MOCK_MATCHES: MatchProfile[] = [
  {
    id: 'm1',
    name: 'Júlia',
    age: 23,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    bio: 'Amo sertanejo e barzinho com os amigos! 🍻',
    status: 'Indo para Seu Justino',
    tags: ['Sertanejo', 'Cerveja', 'Dança'],
    distance: '3 km',
    matchPercentage: 95,
    commonInterests: ['Sertanejo', 'Barzinho']
  },
  {
    id: 'm2',
    name: 'Lucas',
    age: 25,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    bio: 'Vibe eletrônica hoje? Bora! 🎧',
    status: 'Indo para High Club',
    tags: ['Eletrônica', 'Rave', 'After'],
    distance: '8 km',
    matchPercentage: 88,
    commonInterests: ['Eletrônica', 'Gin']
  }
];

export const Social: React.FC<SocialProps> = ({ feed, onToggleLike, onComment, onPlaceSelect, places }) => {
  const { trigger } = useHaptic();
  const [view, setView] = useState<ViewMode>('feed');
  const [allChats, setAllChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [chatInputValue, setChatInputValue] = useState('');
  const [showAiStudio, setShowAiStudio] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [reportedIds, setReportedIds] = useState<string[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Match System State
  const [matchProfiles, setMatchProfiles] = useState<MatchProfile[]>(MOCK_MATCHES);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

  const loadChats = useCallback(async () => {
    const chats = await (db.chats as any).get();
    setAllChats(chats.filter((c: Chat) => !blockedUsers.includes(c.userId)));
  }, [blockedUsers]);

  useEffect(() => {
    loadChats();
    // INTERVAL REMOVED: Realtime logic in App.tsx now triggers the refresh
  }, [loadChats]);

  // Listen for realtime updates from App.tsx
  useEffect(() => {
    const handleRealtimeUpdate = () => {
      loadChats();
      trigger('light');
    };
    window.addEventListener('voula_chat_update', handleRealtimeUpdate);
    return () => window.removeEventListener('voula_chat_update', handleRealtimeUpdate);
  }, [loadChats, trigger]);

  const activeChat = allChats.find(c => c.id === activeChatId) || null;

  useEffect(() => {
    if (view === 'chat_detail') messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages, view]);

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (q.length > 2) {
      const results = await (db as any).user.search(q);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const startNewChat = async (user: User) => {
    trigger('medium');
    const existing = allChats.find(c => c.userId === user.id);
    if (existing) {
      openChat(existing.id);
    } else {
      const newChat: Chat = {
        id: `chat_${Date.now()}`,
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
        lastMessage: 'Nova conversa',
        unreadCount: 0,
        messages: []
      };
      setAllChats(prev => [newChat, ...prev]);
      await (db.chats as any).add(newChat);
      openChat(newChat.id);
    }
    setShowSearch(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const openChat = (chatId: string) => {
    trigger('medium');
    setActiveChatId(chatId);
    setView('chat_detail');
    const updated = allChats.map(c => c.id === chatId ? { ...c, unreadCount: 0 } : c);
    setAllChats(updated);
    (db.chats as any).save(updated);
  };

  const handleSendText = async () => {
    if (!chatInputValue.trim() || !activeChatId) return;
    trigger('success');

    const me = await db.user.get();
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: me.id,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
      type: 'text',
      text: chatInputValue
    };

    const updatedChats = allChats.map(chat => {
      if (chat.id === activeChatId) {
        return {
          ...chat,
          messages: [...chat.messages, newMessage],
          lastMessage: chatInputValue
        };
      }
      return chat;
    });

    setAllChats(updatedChats);
    setChatInputValue('');

    const chatToSave = updatedChats.find(c => c.id === activeChatId);
    if (chatToSave) {
      await (db.chats as any).add(chatToSave);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeChatId) return;
    trigger('medium');

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      const me = await db.user.get();
      const newMessage: Message = {
        id: Date.now().toString(),
        senderId: me.id,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: true,
        type: 'image',
        imageUrl: base64
      };

      const updatedChats = allChats.map(chat => {
        if (chat.id === activeChatId) {
          return {
            ...chat,
            messages: [...chat.messages, newMessage],
            lastMessage: '📷 Foto'
          };
        }
        return chat;
      });

      setAllChats(updatedChats);
      const chatToSave = updatedChats.find(c => c.id === activeChatId);
      if (chatToSave) await (db.chats as any).add(chatToSave);
    };
    reader.readAsDataURL(file);
  };

  const handleBlockUser = async () => {
    if (!activeChat) return;
    if (confirm(`Deseja bloquear ${activeChat.userName}?`)) {
      await (db.chats as any).block(activeChat.userId);
      setBlockedUsers(prev => [...prev, activeChat.userId]);
      setView('chats');
      setActiveChatId(null);
      trigger('warning');
    }
  };

  // Match System Handlers
  const handleLike = () => {
    trigger('success');
    // Here you would implement the real "Like" logic (API call)
    // For now, simple animation/next
    nextMatchProfile();
  };

  const handlePass = () => {
    trigger('medium');
    nextMatchProfile();
  };

  const nextMatchProfile = () => {
    setCurrentMatchIndex(prev => prev + 1);
  };

  const filteredFeed = feed.filter(item => !reportedIds.includes(item.id) && !blockedUsers.includes(item.userId));
  const currentMatchProfile = matchProfiles[currentMatchIndex];

  return (
    <div className="h-full bg-[var(--background)] flex flex-col relative overflow-hidden transition-colors duration-500">
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-[#1a1f35] to-transparent pointer-events-none z-0"></div>
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-[var(--primary)] opacity-10 rounded-full blur-[80px] pointer-events-none z-0"></div>

      {showAiStudio && <AiStudio onClose={() => setShowAiStudio(false)} />}

      {/* Search Modal */}
      {showSearch && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xl p-4 flex flex-col animate-[fadeIn_0.2s_ease-out]">
          <div className="flex items-center gap-3 mb-6 pt-safe">
            <button onClick={() => setShowSearch(false)} className="p-3 bg-[var(--surface)] rounded-2xl text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--surface-highlight)]"><X className="w-6 h-6" /></button>
            <div className="flex-1 bg-[var(--surface)] rounded-2xl flex items-center px-5 py-3 border border-[var(--surface-highlight)] shadow-lg">
              <Search className="w-5 h-5 text-[var(--text-muted)] mr-3" />
              <input
                autoFocus
                type="text"
                placeholder="Nome ou código (VOU-1234)..."
                className="bg-transparent text-[var(--text-main)] w-full focus:outline-none placeholder:text-[var(--text-muted)] font-medium"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3">
            {searchResults.map(user => (
              <button
                key={user.id}
                onClick={() => startNewChat(user)}
                className="w-full flex items-center gap-4 p-4 bg-[var(--surface)]/80 rounded-[1.5rem] hover:bg-[var(--surface-highlight)] border border-[var(--surface-highlight)] transition-all active:scale-[0.98]"
              >
                <img src={user.avatar} className="w-14 h-14 rounded-[1.2rem] squircle object-cover border-2 border-[var(--background)] shadow-sm bg-slate-800" alt="" />
                <div className="text-left flex-1 min-w-0">
                  <h4 className="font-black text-[var(--text-main)] truncate text-lg">{user.name}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[9px] bg-[var(--surface-highlight)] text-[var(--text-muted)] px-2 py-0.5 rounded-lg font-mono font-bold uppercase tracking-wider">{user.userCode}</span>
                    <p className="text-[11px] text-[var(--text-muted)] truncate font-medium">{user.bio || 'Membro do Vou Lá'}</p>
                  </div>
                </div>
                <div className="p-3 bg-[var(--primary)]/10 rounded-full text-[var(--primary)]">
                  <UserPlus className="w-5 h-5" />
                </div>
              </button>
            ))}
            {searchQuery.length > 2 && searchResults.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-[var(--text-muted)] opacity-60">
                <Search className="w-12 h-12 mb-4 opacity-50" />
                <p className="font-bold uppercase tracking-widest text-xs">Nenhum usuário encontrado</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="px-5 pb-2 z-20 flex flex-col gap-4 sticky top-0 backdrop-blur-xl bg-[var(--background)]/80 pt-safe transition-colors duration-500 border-b border-white/5">
        <div className="flex justify-between items-center mt-2">
          <h2 className="text-3xl font-black text-[var(--text-main)] italic tracking-tighter drop-shadow-sm flex items-center gap-2">
            SOCIAL <span className="text-2xl not-italic text-[var(--primary)] animate-pulse">|</span>
          </h2>
          <div className="flex gap-2">
            <button onClick={() => { trigger('light'); setShowSearch(true); }} className="relative p-3 bg-[var(--surface)] rounded-full text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors border border-[var(--surface-highlight)] hover:border-[var(--primary)] active:scale-95 group shadow-lg">
              <UserPlus className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>

        {view !== 'chat_detail' && (
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 -mx-5 px-5 snap-x">
            <button
              onClick={() => setView('feed')}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border snap-center
                    ${view === 'feed'
                  ? 'bg-[var(--primary)] text-[var(--on-primary)] border-[var(--primary)] shadow-[0_0_20px_var(--primary-glow)] scale-105'
                  : 'bg-[var(--surface)] text-[var(--text-muted)] border-[var(--surface-highlight)] hover:border-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
            >
              FEED
            </button>
            <button
              onClick={() => setView('connect')}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border snap-center
                     ${view === 'connect'
                  ? 'bg-[var(--primary)] text-[var(--on-primary)] border-[var(--primary)] shadow-[0_0_20px_var(--primary-glow)] scale-105'
                  : 'bg-[var(--surface)] text-[var(--text-muted)] border-[var(--surface-highlight)] hover:border-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
            >
              <Sparkles className="w-3 h-3" />
              CONNECT
            </button>
            <button
              onClick={() => setView('chats')}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border snap-center
                    ${view === 'chats'
                  ? 'bg-[var(--primary)] text-[var(--on-primary)] border-[var(--primary)] shadow-[0_0_20px_var(--primary-glow)] scale-105'
                  : 'bg-[var(--surface)] text-[var(--text-muted)] border-[var(--surface-highlight)] hover:border-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
            >
              CONVERSAS
            </button>
          </div>
        )}

        {view === 'chat_detail' && activeChat && (
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-3">
              <button onClick={() => setView('chats')} className="p-2 bg-[var(--surface)] rounded-full text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--surface-highlight)] active:scale-90"><ChevronLeft className="w-5 h-5" /></button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[0.8rem] squircle p-[1px] bg-gradient-to-br from-[var(--primary)] to-fuchsia-500">
                  <img src={activeChat.userAvatar} className="w-full h-full rounded-[0.7rem] squircle object-cover" alt="" />
                </div>
                <div>
                  <h3 className="font-bold text-[var(--text-main)] text-sm leading-none">{activeChat.userName}</h3>
                  <p className="text-[10px] text-[#00ff73] font-bold uppercase tracking-wider animate-pulse flex items-center gap-1 mt-0.5"><span className="w-1.5 h-1.5 bg-[#00ff73] rounded-full"></span> Online</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleBlockUser} className="p-2 bg-red-500/10 rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-colors"><Ban className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>

      {view === 'feed' && (
        <div className="flex-1 overflow-y-auto p-5 space-y-8 pb-32 bg-[var(--background)]">
          <div className="flex gap-4 overflow-x-auto hide-scrollbar pl-1 -mx-5 px-5 snap-x">
            <div onClick={() => setShowAiStudio(true)} className="flex flex-col items-center gap-2 shrink-0 group active:scale-95 snap-center cursor-pointer">
              <div className="w-[80px] h-[80px] rounded-[1.8rem] squircle bg-[var(--surface)] border-2 border-[var(--border)] border-dashed flex items-center justify-center text-[var(--primary)] shadow-lg group-hover:border-[var(--primary)] transition-all group-hover:shadow-[var(--primary)]/30">
                <Camera className="w-8 h-8" />
              </div>
              <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wide group-hover:text-[var(--primary)] transition-colors">AI Studio</span>
            </div>
            {places.filter(p => p.isTrending).map(place => (
              <div key={place.id} className="flex flex-col items-center gap-2 shrink-0 cursor-pointer snap-center group" onClick={() => onPlaceSelect?.(place)}>
                <div className="w-[80px] h-[80px] rounded-[1.8rem] squircle p-[3px] bg-gradient-to-tr from-[var(--primary)] via-fuchsia-500 to-cyan-500 shadow-lg group-hover:scale-105 transition-transform">
                  <img src={place.imageUrl} className="w-full h-full rounded-[1.5rem] squircle object-cover border-2 border-[var(--background)] bg-slate-800" alt="" />
                </div>
                <span className="text-[10px] font-bold text-[var(--text-muted)] truncate w-20 text-center group-hover:text-[var(--text-main)] transition-colors">{place.name}</span>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            {filteredFeed.map((item, i) => (
              <div key={item.id} className="glass-card p-5 rounded-[2.5rem] border border-[var(--surface-highlight)] hover:border-[var(--primary)]/30 transition-all duration-300" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-4">
                    <div className="relative">
                      <img src={item.userAvatar} className="w-12 h-12 rounded-[1rem] squircle border-2 border-[var(--background)] object-cover shadow-md bg-slate-800" alt="" />
                      <div className="absolute -bottom-1 -right-1 bg-[var(--primary)] w-4 h-4 rounded-full border-2 border-[var(--background)] flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-black rounded-full animate-pulse"></div>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-[var(--text-main)] leading-tight"><span className="font-black text-[var(--primary)] tracking-wide">{item.userName}</span> <span className="text-[var(--text-muted)] font-medium">{item.action}</span></p>
                      <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase mt-1 tracking-widest opacity-70">{item.timeAgo}</p>
                    </div>
                  </div>
                  <button onClick={() => { trigger('medium'); if (confirm("Deseja denunciar?")) setReportedIds(prev => [...prev, item.id]); }} className="p-2 text-[var(--text-muted)] hover:text-red-500 transition-colors opacity-50 hover:opacity-100">
                    <ShieldAlert className="w-4 h-4" />
                  </button>
                </div>

                <div className="bg-[var(--background)]/50 rounded-2xl p-4 border border-[var(--surface-highlight)] flex items-center gap-4 mb-4 cursor-pointer hover:bg-[var(--surface-highlight)] transition-colors group" onClick={() => { const p = places.find(x => x.name === item.placeName); if (p) onPlaceSelect?.(p); }}>
                  <div className="bg-[var(--surface)] p-2.5 rounded-xl text-[var(--primary)] shadow-sm group-hover:scale-110 transition-transform"><MapPin className="w-5 h-5" /></div>
                  <span className="text-sm font-black text-[var(--text-main)] uppercase tracking-wide group-hover:text-[var(--primary)] transition-colors">{item.placeName}</span>
                </div>

                <div className="flex gap-6 pt-3 border-t border-[var(--border)]">
                  <button onClick={() => onToggleLike(item.id)} className={`flex items-center gap-2 text-xs font-bold ${item.liked ? 'text-pink-500' : 'text-[var(--text-muted)]'} active:scale-110 transition-transform hover:text-pink-400`}>
                    <Heart className={`w-5 h-5 ${item.liked ? 'fill-current' : ''}`} /> {item.likesCount}
                  </button>
                  <button className="flex items-center gap-2 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">
                    <MessageSquare className="w-5 h-5" /> {item.commentsCount}
                  </button>
                  <button className="flex items-center gap-2 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] ml-auto transition-colors">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {view === 'connect' && (
        <div className="flex-1 flex flex-col justify-center items-center p-5 pb-32">
          {currentMatchProfile ? (
            <div className="w-full max-w-sm animate-[fadeInScale_0.3s_ease-out]">
              <MatchCard
                key={currentMatchProfile.id}
                profile={currentMatchProfile as any}
                onLike={handleLike}
                onPass={handlePass}
                onSuperLike={() => { trigger('success'); nextMatchProfile(); }}
              />
            </div>
          ) : (
            <div className="text-center opacity-70">
              <div className="w-24 h-24 bg-[var(--surface)] rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-[var(--text-muted)]">
                <Sparkles className="w-10 h-10 text-[var(--text-muted)]" />
              </div>
              <h3 className="text-xl font-bold text-[var(--text-main)] mb-1">Acabaram os perfis por hoje!</h3>
              <p className="text-sm text-[var(--text-muted)]">Volte mais tarde para ver mais pessoas.</p>
              <button
                onClick={() => setCurrentMatchIndex(0)}
                className="mt-6 px-6 py-3 bg-[var(--surface)] text-[var(--text-main)] font-bold rounded-xl border border-[var(--text-muted)]"
              >
                Revisar Perfis
              </button>
            </div>
          )}
        </div>
      )}

      {view === 'chats' && (
        <div className="flex-1 overflow-y-auto p-5 space-y-3 pb-32 bg-[var(--background)]">
          {allChats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 opacity-50">
              <div className="w-24 h-24 bg-[var(--surface)] rounded-[2rem] squircle flex items-center justify-center mb-6 shadow-inner">
                <MessageSquare className="w-10 h-10 text-[var(--text-muted)]" />
              </div>
              <p className="text-[var(--text-muted)] font-bold text-sm uppercase tracking-wider">Nenhuma conversa ativa</p>
              <button onClick={() => setShowSearch(true)} className="mt-6 text-[var(--on-primary)] bg-[var(--primary)] font-black text-xs uppercase tracking-widest px-6 py-3 rounded-2xl shadow-lg shadow-[var(--primary)]/30 hover:scale-105 transition-transform">Procurar amigos</button>
            </div>
          ) : (
            allChats.map((chat) => (
              <button key={chat.id} onClick={() => openChat(chat.id)} className="w-full flex items-center gap-4 p-4 bg-[var(--surface)] hover:bg-[var(--surface-highlight)] border border-[var(--surface-highlight)] rounded-[1.5rem] text-left active:scale-[0.98] transition-all shadow-sm">
                <div className="relative">
                  <img src={chat.userAvatar} className="w-14 h-14 rounded-[1.2rem] squircle object-cover border-2 border-[var(--background)] bg-slate-800" alt="" />
                  {chat.unreadCount > 0 && <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#00ff73] rounded-full border-2 border-[var(--background)] flex items-center justify-center text-[10px] font-black text-black shadow-lg shadow-[#00ff73]/40">{chat.unreadCount}</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-black text-[var(--text-main)] text-base truncate tracking-tight">{chat.userName}</h3>
                    <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider">Hoje</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#00ff73]"><CheckCircle2 className="w-3.5 h-3.5" /></span>
                    <p className="text-sm truncate text-[var(--text-muted)] font-medium">{chat.lastMessage}</p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {view === 'chat_detail' && activeChat && (
        <div className="flex flex-col flex-1 chat-bg overflow-hidden relative bg-[var(--background)]">
          <div className="absolute inset-0 opacity-5 pattern-dots pointer-events-none"></div>
          <div className="flex-1 p-4 overflow-y-auto space-y-3 pb-safe">
            {activeChat.messages.map((msg, idx) => (
              <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'} animate-[pop_0.3s_ease-out]`}>
                <div className={`max-w-[85%] px-4 py-3 text-[15px] font-medium shadow-sm rounded-2xl ${msg.isMe ? 'bg-[var(--primary)] text-[var(--on-primary)] rounded-tr-none' : 'bg-[var(--surface)] text-[var(--text-main)] border border-[var(--border)] rounded-tl-none'}`}>
                  {msg.type === 'image' && msg.imageUrl ? (
                    <img src={msg.imageUrl} className="rounded-xl mb-1 max-h-60 w-auto object-cover" alt="Sent" />
                  ) : (
                    <p className="leading-relaxed">{msg.text}</p>
                  )}
                  <div className={`flex items-center justify-end gap-1 mt-1 ${msg.isMe ? 'opacity-70' : 'text-[var(--text-muted)]'}`}>
                    <span className="text-[9px] font-bold uppercase tracking-wider">{msg.timestamp}</span>
                    {msg.isMe && <CheckCircle2 className="w-3 h-3" />}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 bg-[var(--surface)]/90 backdrop-blur-lg border-t border-[var(--border)] pb-safe relative z-20">
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
            <div className="flex gap-3 items-center">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-[var(--text-muted)] p-2 rounded-full hover:bg-[var(--surface-highlight)] hover:text-[var(--primary)] transition-colors"
              >
                <Plus className="w-6 h-6" />
              </button>
              <div className="flex-1 bg-[var(--background)] rounded-2xl px-4 py-3 shadow-inner border border-[var(--border)]">
                <input
                  type="text"
                  value={chatInputValue}
                  onChange={(e) => setChatInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendText()}
                  placeholder="Digite sua mensagem..."
                  className="w-full bg-transparent text-[var(--text-main)] focus:outline-none placeholder:text-[var(--text-muted)] text-sm font-medium"
                />
              </div>
              {chatInputValue.trim() ? (
                <button
                  onClick={handleSendText}
                  className="bg-[var(--primary)] p-3 rounded-full text-[var(--on-primary)] shadow-lg active:scale-95 transition-transform hover:brightness-110"
                >
                  <Send className="w-5 h-5 fill-current" />
                </button>
              ) : (
                <button className="text-[var(--text-muted)] p-2 hover:text-[var(--text-main)]"><Mic className="w-6 h-6" /></button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
