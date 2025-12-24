
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MOCK_FRIEND_REQUESTS, MOCK_USER, MOCK_SUGGESTIONS, MOCK_PLACES, FALLBACK_IMAGE } from '../constants';
import { MessageSquare, Heart, MapPin, Search, ChevronLeft, Send, CheckCircle2, UserPlus, X, Camera, Image as ImageIcon, Mic, StopCircle, Calendar, Clock, Share2, Plus, ShieldAlert, Ban, MoreVertical } from 'lucide-react';
import { Chat, FriendRequest, FeedItem, Message, Place, SocialPlan } from '../types';
import { useHaptic } from '../hooks/useHaptic';
import { AiStudio } from '../components/AiStudio';
import { db } from '../utils/storage';
import { User } from '../types';

type ViewMode = 'feed' | 'chats' | 'plans' | 'chat_detail';

interface SocialProps {
  feed: FeedItem[];
  onToggleLike: (id: string) => void;
  onComment: (id: string) => void;
  onPlaceSelect?: (place: Place) => void;
  places: Place[];
}

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

  const filteredFeed = feed.filter(item => !reportedIds.includes(item.id) && !blockedUsers.includes(item.userId));

  return (
    <div className="h-full bg-[var(--background)] flex flex-col relative overflow-hidden transition-colors duration-500">
      {showAiStudio && <AiStudio onClose={() => setShowAiStudio(false)} />}

      {/* Search Modal */}
      {showSearch && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md p-4 flex flex-col">
          <div className="flex items-center gap-3 mb-6 pt-safe">
            <button onClick={() => setShowSearch(false)} className="p-2 bg-slate-800 rounded-xl text-white"><X className="w-6 h-6" /></button>
            <div className="flex-1 bg-slate-800 rounded-xl flex items-center px-4 py-2 border border-slate-700">
              <Search className="w-5 h-5 text-slate-400 mr-2" />
              <input
                autoFocus
                type="text"
                placeholder="Buscar por nome..."
                className="bg-transparent text-white w-full focus:outline-none placeholder:text-slate-500"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2">
            {searchResults.map(user => (
              <button
                key={user.id}
                onClick={() => startNewChat(user)}
                className="w-full flex items-center gap-4 p-4 bg-slate-800/40 rounded-2xl hover:bg-slate-800/60 border border-slate-800 transition-colors"
              >
                <img src={user.avatar} className="w-12 h-12 rounded-full object-cover border border-slate-700" alt="" />
                <div className="text-left">
                  <h4 className="font-bold text-white">{user.name}</h4>
                  <p className="text-xs text-slate-500">{user.bio || 'Membro do Vou Lá'}</p>
                </div>
                <UserPlus className="ml-auto w-5 h-5 text-[var(--primary)]" />
              </button>
            ))}
            {searchQuery.length > 2 && searchResults.length === 0 && (
              <p className="text-center text-slate-500 py-10">Nenhum usuário encontrado</p>
            )}
            {searchQuery.length <= 2 && (
              <div className="text-center py-10 opacity-30 italic text-slate-500">
                Digite pelo menos 3 letras...
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-[var(--background)] sticky top-0 z-20 pt-safe px-4 shadow-xl border-b border-slate-800 shrink-0">
        <div className="pt-4 pb-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black text-white italic tracking-tighter">SOCIAL</h2>
            <div className="flex gap-2">
              <button onClick={() => { trigger('light'); setShowSearch(true); }} className="bg-slate-800 p-2.5 rounded-full text-[var(--primary)] border border-slate-700 active:scale-95 shadow-lg shadow-black/20">
                <UserPlus className="w-5 h-5" />
              </button>
            </div>
          </div>
          {view !== 'chat_detail' && (
            <div className="flex p-1 bg-slate-800/80 backdrop-blur rounded-xl mb-2">
              <button onClick={() => setView('feed')} className={`flex-1 py-2.5 text-xs font-black uppercase rounded-lg transition-all ${view === 'feed' ? 'bg-[var(--primary)] text-black shadow-lg' : 'text-slate-400'}`}>Feed</button>
              <button onClick={() => setView('chats')} className={`flex-1 py-2.5 text-xs font-black uppercase rounded-lg transition-all ${view === 'chats' ? 'bg-[var(--primary)] text-black shadow-lg' : 'text-slate-400'}`}>Conversas</button>
            </div>
          )}
          {view === 'chat_detail' && activeChat && (
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-3">
                <button onClick={() => setView('chats')} className="p-2 bg-slate-800 rounded-lg text-white"><ChevronLeft className="w-5 h-5" /></button>
                <div className="flex items-center gap-3">
                  <img src={activeChat.userAvatar} className="w-10 h-10 rounded-full border-2 border-[var(--primary)] object-cover shadow-lg shadow-[var(--primary)]/20" alt="" />
                  <div>
                    <h3 className="font-bold text-white text-sm">{activeChat.userName}</h3>
                    <p className="text-[10px] text-[#00ff73] font-bold uppercase tracking-wider animate-pulse">Online</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { }} className="p-2 text-slate-400"><MoreVertical className="w-5 h-5" /></button>
              </div>
            </div>
          )}
        </div>
      </div>

      {view === 'feed' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-8 pb-32 bg-[var(--background)]">
          <div className="flex gap-4 overflow-x-auto hide-scrollbar pl-1">
            <div onClick={() => setShowAiStudio(true)} className="flex flex-col items-center gap-1.5 shrink-0 group active:scale-95">
              <div className="w-[74px] h-[74px] rounded-full bg-slate-800 border-2 border-slate-700 border-dashed flex items-center justify-center text-[var(--primary)] shadow-lg group-hover:border-[var(--primary)] transition-colors">
                <Camera className="w-7 h-7" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">AI Studio</span>
            </div>
            {places.filter(p => p.isTrending).map(place => (
              <div key={place.id} className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer" onClick={() => onPlaceSelect?.(place)}>
                <div className="w-[74px] h-[74px] rounded-full p-[3px] bg-gradient-to-tr from-[var(--primary)] via-[#FF3399] to-[#0CC4FF] shadow-lg">
                  <img src={place.imageUrl} className="w-full h-full rounded-full object-cover border-2 border-[var(--background)]" alt="" />
                </div>
                <span className="text-[10px] font-bold text-slate-300 truncate w-16 text-center">{place.name}</span>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            {filteredFeed.map((item) => (
              <div key={item.id} className="bg-slate-800/40 p-4 rounded-3xl border border-slate-700/50 animate-[slideUp_0.4s_ease-out]">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex gap-4">
                    <img src={item.userAvatar} className="w-12 h-12 rounded-full border-2 border-slate-600 object-cover shadow-md" alt="" />
                    <div>
                      <p className="text-sm text-white leading-tight"><span className="font-bold text-[var(--primary)]">{item.userName}</span> <span className="text-slate-300">{item.action}</span></p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-widest">{item.timeAgo}</p>
                    </div>
                  </div>
                  <button onClick={() => { trigger('medium'); if (confirm("Deseja denunciar?")) setReportedIds(prev => [...prev, item.id]); }} className="p-2 text-slate-600 hover:text-red-500 transition-colors">
                    <ShieldAlert className="w-4 h-4" />
                  </button>
                </div>
                <div className="bg-slate-900/50 rounded-2xl p-3 border border-slate-800 flex items-center gap-3 mb-3 cursor-pointer hover:bg-slate-900 transition-colors" onClick={() => { const p = places.find(x => x.name === item.placeName); if (p) onPlaceSelect?.(p); }}>
                  <div className="bg-slate-800 p-2 rounded-xl text-slate-400"><MapPin className="w-4 h-4" /></div>
                  <span className="text-sm font-bold text-white">{item.placeName}</span>
                </div>
                <div className="flex gap-6 pt-3 border-t border-slate-700/50">
                  <button onClick={() => onToggleLike(item.id)} className={`flex items-center gap-2 text-xs font-bold ${item.liked ? 'text-pink-500' : 'text-slate-400'} active:scale-110 transition-transform`}>
                    <Heart className={`w-4 h-4 ${item.liked ? 'fill-current' : ''}`} /> {item.likesCount}
                  </button>
                  <button className="flex items-center gap-2 text-xs font-bold text-slate-400">
                    <MessageSquare className="w-4 h-4" /> {item.commentsCount}
                  </button>
                  <button className="flex items-center gap-2 text-xs font-bold text-slate-400 ml-auto">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {view === 'chats' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-32 bg-[var(--background)]">
          {allChats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 opacity-50">
              <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="w-10 h-10 text-slate-600" />
              </div>
              <p className="text-slate-400 font-bold">Nenhuma conversa ativa</p>
              <button onClick={() => setShowSearch(true)} className="mt-4 text-[var(--primary)] font-bold text-xs uppercase tracking-widest border border-[var(--primary)] px-4 py-2 rounded-full">Procurar amigos</button>
            </div>
          ) : (
            allChats.map((chat) => (
              <button key={chat.id} onClick={() => openChat(chat.id)} className="w-full flex items-center gap-4 p-4 bg-slate-800/40 hover:bg-slate-800/60 border border-slate-700/50 rounded-2xl text-left active:scale-[0.98] transition-all">
                <div className="relative">
                  <img src={chat.userAvatar} className="w-14 h-14 rounded-full object-cover border border-slate-700" alt="" />
                  {chat.unreadCount > 0 && <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#00ff73] rounded-full border-2 border-[#0B141A] flex items-center justify-center text-[10px] font-black text-black shadow-lg shadow-[#00ff73]/40">{chat.unreadCount}</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-white text-base truncate">{chat.userName}</h3>
                    <span className="text-[10px] text-slate-500 font-bold">Hoje</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#00ff73]"><CheckCircle2 className="w-3 h-3" /></span>
                    <p className="text-sm truncate text-slate-500 font-medium">{chat.lastMessage}</p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {view === 'chat_detail' && activeChat && (
        <div className="flex flex-col flex-1 chat-bg overflow-hidden relative">
          <div className="flex-1 p-4 overflow-y-auto space-y-3 pb-10">
            {activeChat.messages.map((msg, idx) => (
              <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'} animate-[pop_0.3s_ease-out]`}>
                <div className={`max-w-[85%] px-3 py-2 text-[14.5px] font-medium shadow-sm ${msg.isMe ? 'bubble-me' : 'bubble-them'}`}>
                  <p className="leading-relaxed">{msg.text}</p>
                  <div className={`flex items-center justify-end gap-1 mt-1 ${msg.isMe ? 'opacity-70' : 'text-slate-500'}`}>
                    <span className="text-[10px]">{msg.timestamp}</span>
                    {msg.isMe && <CheckCircle2 className="w-3 h-3 text-[#53bdeb]" />}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 bg-[#202c33] border-t border-slate-900/50 pb-safe">
            <div className="flex gap-3 items-center">
              <button className="text-slate-400 p-1"><Plus className="w-6 h-6" /></button>
              <div className="flex-1 bg-[#2a3942] rounded-xl px-4 py-2.5 shadow-inner">
                <input
                  type="text"
                  value={chatInputValue}
                  onChange={(e) => setChatInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendText()}
                  placeholder="Mensagem"
                  className="w-full bg-transparent text-[#e9edef] focus:outline-none placeholder:text-slate-500 text-sm"
                />
              </div>
              {chatInputValue.trim() ? (
                <button
                  onClick={handleSendText}
                  className="bg-[#00a884] p-3 rounded-full text-white shadow-lg active:scale-95 transition-transform"
                >
                  <Send className="w-5 h-5 fill-current" />
                </button>
              ) : (
                <button className="text-slate-400 p-1"><Mic className="w-6 h-6" /></button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
