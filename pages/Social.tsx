import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { Search, MapPin, Users, Send, Plus, Mic, ArrowLeft, Heart, MessageSquare, CheckCircle2, UserPlus, X, Sparkles, Zap, ShieldAlert, MoreVertical, Share2, ChevronLeft } from 'lucide-react';
import { Chat, FeedItem, Message, Place } from '../types';
import { useHaptic } from '../hooks/useHaptic';
import { AiStudio } from '../components/AiStudio';
import { db } from '../utils/storage';
import { supabase } from '../services/supabase';
import { toCamel } from '../utils/mapping';
import { User } from '../types';
import { fadeIn, slideUp, slideInRight } from '../src/styles/animations';

type ViewMode = 'feed' | 'connect' | 'chats' | 'plans' | 'chat_detail';

interface SocialProps {
  feed: FeedItem[];
  onToggleLike: (id: string) => void;
  onComment: (id: string) => void;
  onPlaceSelect?: (place: Place) => void;
  places: Place[];
}

const getChatId = (uid1: string, uid2: string) => {
  return [uid1, uid2].sort().join('_');
};

export const Social: React.FC<SocialProps> = ({ feed, onToggleLike, onPlaceSelect, places }) => {
  const { trigger } = useHaptic();
  const [view, setView] = useState<ViewMode>('feed');
  const [allChats, setAllChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeChatMessages, setActiveChatMessages] = useState<Message[]>([]);
  const [chatInputValue, setChatInputValue] = useState('');
  const [me, setMe] = useState<User | null>(null);
  const [showAiStudio, setShowAiStudio] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [reportedIds, setReportedIds] = useState<string[]>([]);
  const [blockedUsers] = useState<string[]>([]);
  const [sentRequests, setSentRequests] = useState<string[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeChatIdRef = useRef<string | null>(null);

  useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);

  const loadChats = useCallback(async () => {
    const chats = await (db.chats as any).get();
    setAllChats(chats.filter((c: Chat) => !blockedUsers.includes(c.userId)));
  }, [blockedUsers]);

  useEffect(() => {
    loadChats();
    db.user.get().then(setMe);
  }, [loadChats]);

  useEffect(() => {
    const handleRealtimeUpdate = (e: any) => {
      const updatedChat = toCamel(e.detail);
      if (!updatedChat) {
        loadChats();
        return;
      }
      setAllChats(prev => {
        const index = prev.findIndex(c => c.id === updatedChat.id);
        if (index !== -1) {
          const newChats = [...prev];
          newChats[index] = { ...prev[index], ...updatedChat, unreadCount: activeChatIdRef.current === updatedChat.id ? 0 : 1 };
          return newChats;
        }
        return [updatedChat, ...prev];
      });
      trigger('light');
    };

    const handleNewMessage = (e: any) => {
      const msg = toCamel(e.detail);
      if (msg.chatId === activeChatIdRef.current) {
        setActiveChatMessages(prev => {
          if (prev.some(m => m.id === msg.id)) return prev;
          return [...prev, {
            id: msg.id,
            senderId: msg.senderId,
            text: msg.content,
            timestamp: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isMe: false, // Will be filtered out/adjusted by the UI check later
            type: 'text'
          }];
        });
        trigger('light');
      }
    };

    window.addEventListener('voula_chat_update', handleRealtimeUpdate as any);
    window.addEventListener('voula_message_received', handleNewMessage as any);
    return () => {
      window.removeEventListener('voula_chat_update', handleRealtimeUpdate as any);
      window.removeEventListener('voula_message_received', handleNewMessage as any);
    };
  }, [loadChats, trigger]);

  const activeChat = allChats.find(c => c.id === activeChatId) || null;

  useEffect(() => {
    if (view === 'chat_detail') {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [activeChatMessages.length, view]);

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (q.length > 2) {
      const { data } = await supabase.from('profiles').select('*').ilike('name', `% ${q}% `).limit(10);
      setSearchResults(data ? data.map((u: any) => toCamel(u)) : []);
    } else {
      setSearchResults([]);
    }
  };

  const loadPendingInvitations = useCallback(async () => {
    const invites = await (db as any).friends.getPending();
    setPendingInvitations(invites);
  }, []);

  useEffect(() => {
    loadPendingInvitations();
  }, [loadPendingInvitations]);

  const handleAddFriend = async (user: User) => {
    trigger('medium');
    const success = await (db as any).friends.request(user.id);
    if (success) {
      setSentRequests(prev => [...prev, user.id]);
    }
  };

  const startNewChat = async (user: User) => {
    trigger('medium');
    const existing = allChats.find(c => c.userId === user.id);
    if (existing) {
      openChat(existing.id);
    } else {
      const me = await db.user.get();
      const chatId = getChatId(me.id, user.id);
      const newChat: Chat = {
        id: chatId,
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
        lastMessage: 'Nova conversa',
        unreadCount: 0,
        messages: []
      };
      setAllChats(prev => {
        const chatExists = prev.some(c => c.id === chatId);
        if (chatExists) return prev;
        return [newChat, ...prev];
      });
      await (db.chats as any).add(newChat);
      openChatWithList(chatId, [newChat, ...allChats]);
    }
    setShowSearch(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const openChatWithList = (chatId: string, currentList: Chat[]) => {
    trigger('medium');
    setActiveChatId(chatId);
    setView('chat_detail');
    setAllChats(prev => {
      const listToUse = prev.length >= currentList.length ? prev : currentList;
      return listToUse.map(c => c.id === chatId ? { ...c, unreadCount: 0 } : c);
    });
    // Fetch actual messages
    (db.chats as any).getMessages(chatId).then(setActiveChatMessages);
  };

  const openChat = (chatId: string) => {
    trigger('medium');
    setActiveChatId(chatId);
    setView('chat_detail');
    setAllChats(prev => prev.map(c => c.id === chatId ? { ...c, unreadCount: 0 } : c));
    // Fetch actual messages
    (db.chats as any).getMessages(chatId).then(setActiveChatMessages);
  };

  const handleSendText = async () => {
    if (!chatInputValue.trim() || !activeChatId) return;
    const text = chatInputValue;
    setChatInputValue('');
    trigger('success');

    const me = await db.user.get();

    // Add optimistic message
    const msg: Message = {
      id: Date.now().toString(),
      senderId: me.id,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
      type: 'text',
      text
    };
    setActiveChatMessages(prev => [...prev, msg]);

    // Send to backend
    await (db.chats as any).sendMessage(activeChatId, text);

    // Update local chat list metadata
    setAllChats(prev => prev.map(c =>
      c.id === activeChatId ? { ...c, lastMessage: text } : c
    ));
  };

  const filteredFeed = feed.filter(item => !reportedIds.includes(item.id) && !blockedUsers.includes(item.userId));

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="h-full bg-[var(--background)] flex flex-col relative overflow-hidden transition-colors duration-500">
      <AnimatePresence>
        {showAiStudio && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed inset-0 z-[150]"
          >
            <AiStudio onClose={() => setShowAiStudio(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[160] bg-black/95 backdrop-blur-xl p-4 flex flex-col"
          >
            <motion.div
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              className="flex items-center gap-3 mb-6 pt-safe"
            >
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
            </motion.div>

            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="flex-1 overflow-y-auto space-y-2"
            >
              {searchResults.map(user => (
                <motion.div
                  variants={slideUp}
                  key={user.id}
                  className="w-full flex items-center gap-4 p-4 bg-slate-800/40 rounded-2xl border border-slate-800 transition-colors"
                >
                  <img src={user.avatar} className="w-12 h-12 rounded-full object-cover border border-slate-700" alt="" />
                  <div className="text-left flex-1">
                    <h4 className="font-bold text-white">{user.name}</h4>
                    <p className="text-xs text-slate-500">{user.bio || 'Membro do Vou Lá'}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startNewChat(user)}
                      className="p-2 bg-slate-700 rounded-lg text-[var(--primary)] active:scale-95 transition-transform"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    <button
                      disabled={sentRequests.includes(user.id)}
                      onClick={() => handleAddFriend(user)}
                      className={`p - 2 rounded - lg active: scale - 95 transition - transform ${sentRequests.includes(user.id) ? 'bg-emerald-500/20 text-emerald-500' : 'bg-indigo-600 text-white'} `}
                    >
                      {sentRequests.includes(user.id) ? <CheckCircle2 className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                    </button>
                  </div>
                </motion.div>
              ))}
              {searchQuery.length > 2 && searchResults.length === 0 && (
                <p className="text-center text-slate-500 py-10">Nenhum usuário encontrado</p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-[var(--background)] sticky top-0 z-20 pt-safe px-4 shadow-xl border-b border-slate-800 shrink-0">
        <div className="pt-4 pb-2">
          {view !== 'chat_detail' ? (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-white italic tracking-tighter">SOCIAL</h2>
                <div className="flex gap-2">
                  <button onClick={() => { trigger('light'); setShowSearch(true); }} className="bg-slate-800 p-2.5 rounded-full text-[var(--primary)] border border-slate-700 active:scale-95 shadow-lg shadow-black/20">
                    <UserPlus className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="flex p-1 bg-slate-800/80 backdrop-blur rounded-xl mb-2">
                <button onClick={() => setView('feed')} className={`flex - 1 py - 2.5 text - [10px] font - black uppercase rounded - lg transition - all relative ${view === 'feed' ? 'bg-[var(--primary)] text-black shadow-lg' : 'text-slate-400'} `}>Feed</button>
                <button onClick={() => setView('connect')} className={`flex - 1 py - 2.5 text - [10px] font - black uppercase rounded - lg transition - all relative ${view === 'connect' ? 'bg-[var(--primary)] text-black shadow-lg' : 'text-slate-400'} `}>Connect</button>
                <button onClick={() => setView('chats')} className={`flex - 1 py - 2.5 text - [10px] font - black uppercase rounded - lg transition - all relative ${view === 'chats' ? 'bg-[var(--primary)] text-black shadow-lg' : 'text-slate-400'} `}>
                  Conversas
                  {pendingInvitations.length > 0 && <span className="absolute top-1 right-2 w-2 h-2 bg-emerald-500 rounded-full animate-pulse border border-black" />}
                </button>
              </div>
            </>
          ) : (
            <AnimatePresence mode="wait">
              {activeChat && (
                <motion.div
                  key="chat_header"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 20, opacity: 0 }}
                  className="flex items-center justify-between pb-2"
                >
                  <div className="flex items-center gap-3">
                    <button onClick={() => setView('chats')} className="p-2 bg-slate-800 rounded-lg text-white active:scale-90 transition-transform"><ChevronLeft className="w-5 h-5" /></button>
                    <div className="flex items-center gap-3">
                      <img src={activeChat.userAvatar || 'https://i.pravatar.cc/150?u=voula'} className="w-10 h-10 rounded-full border-2 border-[var(--primary)] object-cover shadow-lg shadow-[var(--primary)]/20" alt={activeChat.userName || 'Usuário'} />
                      <div>
                        <h3 className="font-bold text-white text-sm">{activeChat.userName || 'Usuário'}</h3>
                        <p className="text-[10px] text-[#00ff73] font-bold uppercase tracking-wider animate-pulse">Online</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { }} className="p-2 text-slate-400"><MoreVertical className="w-5 h-5" /></button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {view === 'feed' && (
          <motion.div
            key="feed"
            variants={container}
            initial="hidden"
            animate="show"
            exit="hidden"
            className="flex-1 overflow-y-auto p-4 space-y-8 pb-32 bg-[var(--background)] scroll-container"
          >
            {/* Removed Stories Tray */}

            <div className="space-y-6">
              {filteredFeed.map((item) => (
                <motion.div
                  variants={slideUp}
                  key={item.id}
                  className="bg-slate-800/40 p-4 rounded-3xl border border-slate-700/50"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex gap-4">
                      <img src={item.userAvatar} className="w-12 h-12 rounded-full border-2 border-slate-600 object-cover shadow-md" alt="" />
                      <div>
                        <p className="text-sm text-white leading-tight"><span className="font-bold text-[var(--primary)]">{item.userName}</span> <span className="text-slate-300">{item.action}</span></p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-widest">{item.timeAgo}</p>
                      </div>
                    </div>
                    <button onClick={() => { trigger('medium'); if (window.confirm("Deseja denunciar?")) setReportedIds(prev => [...prev, item.id]); }} className="p-2 text-slate-600 hover:text-red-500 transition-colors">
                      <ShieldAlert className="w-4 h-4" />
                    </button>
                  </div>
                  <motion.div
                    whileTap={{ scale: 0.98 }}
                    className="bg-slate-900/50 rounded-2xl p-3 border border-slate-800 flex items-center gap-3 mb-3 cursor-pointer hover:bg-slate-900 transition-colors"
                    onClick={() => { const p = places.find(x => x.name === item.placeName); if (p) onPlaceSelect?.(p); }}
                  >
                    <div className="bg-slate-800 p-2 rounded-xl text-slate-400"><MapPin className="w-4 h-4" /></div>
                    <span className="text-sm font-bold text-white">{item.placeName}</span>
                  </motion.div>
                  <div className="flex gap-6 pt-3 border-t border-slate-700/50">
                    <button onClick={() => onToggleLike(item.id)} className={`flex items - center gap - 2 text - xs font - bold ${item.liked ? 'text-pink-500' : 'text-slate-400'} active: scale - 110 transition - transform`}>
                      <Heart className={`w - 4 h - 4 ${item.liked ? 'fill-current' : ''} `} /> {item.likesCount}
                    </button>
                    <button className="flex items-center gap-2 text-xs font-bold text-slate-400">
                      <MessageSquare className="w-4 h-4" /> {item.commentsCount}
                    </button>
                    <button className="flex items-center gap-2 text-xs font-bold text-slate-400 ml-auto">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {view === 'connect' && (
          <motion.div
            key="connect"
            variants={container}
            initial="hidden"
            animate="show"
            exit="hidden"
            className="flex-1 overflow-y-auto p-4 space-y-6 pb-32 bg-[var(--background)] scroll-container"
          >
            <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900/40 p-6 rounded-[2.5rem] border border-indigo-500/20 mb-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Users className="w-20 h-20 text-indigo-400" />
              </div>
              <h3 className="text-xl font-black text-white italic tracking-tighter mb-2 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" /> RADAR SOCIAL
              </h3>
              <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest mb-6">Pessoas na sua vibe agora</p>

              <div className="bg-slate-900/60 rounded-2xl p-4 border border-white/5 flex items-center justify-between">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center overflow-hidden">
                      <img src={`https://i.pravatar.cc/150?u=${i}`} alt="" />
                    </div >
                  ))}
                </div >
                <button onClick={() => setShowSearch(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider active:scale-95 transition-all">Explorar</button>
              </div >
            </div >

            <div className="space-y-4">
              <div className="flex justify-between items-center px-2">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Recomendados</h4>
                <Zap className="w-3.5 h-3.5 text-yellow-500" />
              </div>

              {/* Mocked Recommended Users for Connect View */}
              {[
                { id: '1', name: 'Julia Santos', bio: 'Apaixonada por música eletrônica 🎧', avatar: 'https://i.pravatar.cc/150?u=julia', distance: 'out' },
                { id: '2', name: 'Marcos Lima', bio: 'Procurando a melhor batida da noite', avatar: 'https://i.pravatar.cc/150?u=marcos', distance: '1km' },
                { id: '3', name: 'Carla Dias', bio: 'Vamo de barzinho hoje? 🍻', avatar: 'https://i.pravatar.cc/150?u=carla', distance: '500m' }
              ].map((user) => (
                <motion.div
                  variants={slideUp}
                  key={user.id}
                  className="bg-slate-800/30 p-4 rounded-3xl border border-slate-700/40 flex items-center gap-4 group"
                >
                  <div className="relative">
                    <img src={user.avatar} className="w-14 h-14 rounded-full object-cover border-2 border-slate-700 group-hover:border-indigo-500 transition-colors" alt="" />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900 shadow-lg" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-sm truncate">{user.name}</h4>
                      <span className="px-1.5 py-0.5 bg-slate-900 text-[8px] font-black text-indigo-400 uppercase rounded border border-indigo-500/10">{user.distance}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">{user.bio}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => startNewChat(user as any)} className="p-2.5 bg-slate-800 rounded-xl text-slate-400 active:text-[var(--primary)] transition-colors"><MessageSquare className="w-4 h-4" /></button>
                    <button onClick={() => handleAddFriend(user as any)} className="p-2.5 bg-slate-800 rounded-xl text-indigo-500 active:scale-95 transition-all"><UserPlus className="w-4 h-4" /></button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div >
        )}

        {
          view === 'chats' && (
            <motion.div
              key="chats"
              variants={container}
              initial="hidden"
              animate="show"
              exit="hidden"
              className="flex-1 overflow-y-auto p-4 space-y-3 pb-32 bg-[var(--background)]"
            >
              {allChats.length === 0 ? (
                <motion.div variants={fadeIn} className="flex flex-col items-center justify-center h-64 opacity-50">
                  <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <MessageSquare className="w-10 h-10 text-slate-600" />
                  </div>
                  <p className="text-slate-400 font-bold">Nenhuma conversa ativa</p>
                  <button onClick={() => setShowSearch(true)} className="mt-4 text-[var(--primary)] font-bold text-xs uppercase tracking-widest border border-[var(--primary)] px-4 py-2 rounded-full active:scale-95 transition-transform">Procurar amigos</button>
                </motion.div>
              ) : (
                allChats.map((chat) => (
                  <motion.button
                    variants={slideUp}
                    key={chat.id}
                    onClick={() => openChat(chat.id)}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center gap-4 p-4 bg-slate-800/40 hover:bg-slate-800/60 border border-slate-700/50 rounded-2xl text-left transition-all"
                  >
                    <div className="relative">
                      <img src={chat.userAvatar} className="w-14 h-14 rounded-full object-cover border border-slate-700" alt="" />
                      {chat.unreadCount > 0 && <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#00ff73] rounded-full border-2 border-[#0B141A] flex items-center justify-center text-[10px] font-black text-black shadow-lg shadow-[#00ff73]/40">{chat.unreadCount}</div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-black text-white italic tracking-tight">{chat.userName}</h4>
                        <span className="text-[10px] text-slate-500 font-bold">{chat.messages[chat.messages.length - 1]?.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-400 truncate font-medium">
                        {chat.lastMessage}
                      </p>
                    </div>
                  </motion.button>
                ))
              )}
            </motion.div>
          )
        }

        {
          view === 'chat_detail' && activeChat && (
            <motion.div
              key="chat_detail"
              variants={slideInRight}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex flex-col flex-1 bg-[var(--background)] overflow-hidden relative"
            >
              {/* Professional Background Pattern (Optional subtle gradient) */}
              <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />

              <div className="flex-1 p-4 overflow-y-auto space-y-4 pb-10 scroll-container relative z-10">
                <AnimatePresence initial={false}>
                  {activeChatMessages.map((msg) => {
                    const isMe = msg.senderId === me?.id || msg.isMe;

                    return (
                      <motion.div
                        key={msg.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'} group`}
                      >
                        <div className={`relative max-w-[80%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                          <div className={`
                          px-4 py-3 rounded-[20px] shadow-sm backdrop-blur-md border transition-all
                          ${isMe
                              ? 'bg-gradient-to-br from-[var(--primary-main)] to-indigo-600 text-black font-medium border-white/10 rounded-tr-sm'
                              : 'bg-[#1e1e1e]/80 text-[var(--text-primary)] border-white/5 rounded-tl-sm'
                            }
                          hover:shadow-lg hover:brightness-110
                        `}>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                            <div className={`flex items-center justify-end gap-1.5 mt-1 opacity-60`}>
                              <span className="text-[10px] font-bold uppercase tracking-tighter">{msg.timestamp}</span>
                              {isMe && (
                                <div className="flex -space-x-1">
                                  <CheckCircle2 className="w-3 h-3 text-current" />
                                  <CheckCircle2 className="w-3 h-3 text-current" />
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Sticking Tail */}
                          <div className={`
                          absolute top-0 w-3 h-3
                          ${isMe ? '-right-1' : '-left-1'}
                        `}>
                            <svg viewBox="0 0 10 10" className={isMe ? 'text-indigo-600 fill-current' : 'text-[#1e1e1e]/80 fill-current'}>
                              <path d={isMe ? "M0 0 L10 0 L0 10" : "M0 0 L10 0 L10 10"} />
                            </svg>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                <div ref={messagesEndRef} className="h-4" />
              </div>

              <div className="p-4 bg-[var(--bg-card)]/90 backdrop-blur-3xl border-t border-white/10 pb-safe z-20">
                <div className="flex gap-3 items-center max-w-4xl mx-auto">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    className="bg-white/5 hover:bg-white/10 p-3.5 rounded-2xl text-slate-400 transition-colors border border-white/5"
                  >
                    <Plus className="w-6 h-6" />
                  </motion.button>

                  <div className="flex-1 bg-black/40 rounded-2xl px-4 py-3.5 border border-white/10 focus-within:border-[var(--primary-main)] focus-within:ring-1 focus-within:ring-[var(--primary-main)]/30 transition-all shadow-inner">
                    <input
                      type="text"
                      value={chatInputValue}
                      onChange={(e) => setChatInputValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendText()}
                      placeholder="Escreva sua mensagem..."
                      className="w-full bg-transparent text-[var(--text-primary)] focus:outline-none placeholder:text-slate-500 text-sm"
                    />
                  </div>

                  {chatInputValue.trim() ? (
                    <motion.button
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleSendText}
                      className="bg-[var(--primary-main)] p-4 rounded-2xl text-black shadow-[0_4px_20px_rgba(var(--primary-main-rgb),0.5)] border border-white/20"
                    >
                      <Send className="w-5 h-5 fill-current" />
                    </motion.button>
                  ) : (
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      className="bg-white/5 hover:bg-white/10 p-4 rounded-2xl text-slate-400 border border-white/5"
                    >
                      <Mic className="w-6 h-6" />
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          )
        }
      </AnimatePresence >
    </div >
  );
};
