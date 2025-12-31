import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, MoreVertical, Search, UserPlus, Users, MessageSquare, Send,
  Heart, Share2, Plus, X, MapPin, Sparkles, ShieldAlert, Mic, CheckCircle2
} from 'lucide-react';
import { Chat, FeedItem, Message, User, Place } from '@/types';
import { useHaptic } from '@/hooks/useHaptic';
import { AiStudio } from '@/components/AiStudio';
import { db } from '@/utils/storage';
import { supabase } from '@/services/supabase';
import { toCamel } from '@/utils/mapping';
import { slideUp, fadeIn, slideInRight } from '@/styles/animations';
import { Header } from '@/components/ui/Header';
import { Avatar } from '@/components/ui/Avatar';

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
            isMe: false,
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
      const { data } = await supabase.from('profiles').select('*').ilike('name', `%${q}%`).limit(10);
      setSearchResults(data ? data.map((u: any) => toCamel(u)) : []);
    } else {
      setSearchResults([]);
    }
  };

  const loadPendingInvitations = useCallback(async () => {
    const invites = await (db as any).friends.getPending();
    setPendingInvitations(invites || []);
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
    (db.chats as any).getMessages(chatId).then(setActiveChatMessages);
  };

  const openChat = (chatId: string) => {
    trigger('medium');
    setActiveChatId(chatId);
    setView('chat_detail');
    setAllChats(prev => prev.map(c => c.id === chatId ? { ...c, unreadCount: 0 } : c));
    (db.chats as any).getMessages(chatId).then(setActiveChatMessages);
  };

  const handleSendText = async () => {
    if (!chatInputValue.trim() || !activeChatId) return;
    const text = chatInputValue;
    setChatInputValue('');
    trigger('success');

    const me = await db.user.get();

    const msg: Message = {
      id: Date.now().toString(),
      senderId: me.id,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
      type: 'text',
      text
    };
    setActiveChatMessages(prev => [...prev, msg]);

    await (db.chats as any).sendMessage(activeChatId, text);

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
    <div className="full-screen bg-bg-default flex flex-col relative overflow-hidden">
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
            <div className="flex items-center gap-3 mb-6 pt-safe">
              <button
                onClick={() => setShowSearch(false)}
                className="p-2.5 bg-white/5 rounded-xl text-white border border-white/10"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="flex-1 bg-white/5 rounded-xl flex items-center px-4 py-2 border border-white/10">
                <Search className="w-5 h-5 text-text-tertiary mr-2" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Buscar por nome..."
                  className="bg-transparent text-white w-full focus:outline-none placeholder:text-text-tertiary text-sm"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            </div>

            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="flex-1 overflow-y-auto space-y-3"
            >
              {searchResults.map(user => (
                <motion.div
                  variants={slideUp}
                  key={user.id}
                  className="w-full flex items-center gap-4 p-4 bg-white/5 rounded-[1.5rem] border border-white/5"
                >
                  <Avatar src={user.avatar} size="md" className="border border-white/10" />
                  <div className="text-left flex-1 min-w-0">
                    <h4 className="font-black text-white italic truncate">{user.name}</h4>
                    <p className="text-[10px] text-text-tertiary font-bold uppercase tracking-widest truncate">{user.bio || 'Membro do Vou Lá'}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startNewChat(user)}
                      className="p-2.5 bg-primary-main/10 rounded-xl text-primary-main border border-primary-main/20"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    <button
                      disabled={sentRequests.includes(user.id)}
                      onClick={() => handleAddFriend(user)}
                      className={`p-2.5 rounded-xl border transition-all ${sentRequests.includes(user.id) ? 'bg-status-success/10 text-status-success border-status-success/20' : 'bg-indigo-600 text-white border-indigo-500/20'} `}
                    >
                      {sentRequests.includes(user.id) ? <CheckCircle2 className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                    </button>
                  </div>
                </motion.div>
              ))}
              {searchQuery.length > 2 && searchResults.length === 0 && (
                <p className="text-center text-text-tertiary py-10 text-xs font-bold uppercase tracking-widest">Nenhum usuário encontrado</p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Header
        left={
          view === 'chat_detail' ? (
            <button
              onClick={() => { trigger('light'); setView('chats'); }}
              className="p-2.5 bg-white/5 rounded-xl text-white border border-white/10"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-primary-main/10 flex items-center justify-center border border-primary-main/20">
              <Users className="w-5 h-5 text-primary-main" />
            </div>
          )
        }
        center={
          view === 'chat_detail' && activeChat ? (
            <div className="flex items-center gap-3">
              <Avatar src={activeChat.userAvatar} size="sm" className="border border-primary-main/30" />
              <div className="text-left">
                <h3 className="font-bold text-white text-xs leading-none mb-1">{activeChat.userName}</h3>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-status-success rounded-full animate-pulse" />
                  <span className="text-[8px] text-status-success font-black uppercase tracking-widest">Online</span>
                </div>
              </div>
            </div>
          ) : (
            <h1 className="text-xl font-black text-white italic tracking-tighter uppercase">SOCIAL</h1>
          )
        }
        right={
          view === 'chat_detail' ? (
            <button className="p-2.5 text-text-tertiary">
              <MoreVertical className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={() => { trigger('light'); setShowSearch(true); }}
              className="p-2.5 bg-primary-main/10 rounded-xl text-primary-main border border-primary-main/20"
            >
              <UserPlus className="w-5 h-5" />
            </button>
          )
        }
      />

      {view !== 'chat_detail' && (
        <div className="px-6 py-2 bg-bg-default/60 backdrop-blur-2xl border-b border-border-default z-30">
          <div className="flex p-1 bg-white/5 rounded-2xl">
            {['feed', 'connect', 'chats'].map((v) => (
              <button
                key={v}
                onClick={() => { trigger('light'); setView(v as ViewMode); }}
                className={`flex-1 py-2.5 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all relative
                  ${view === v ? 'bg-primary-main text-black shadow-lg shadow-primary-main/20' : 'text-text-tertiary hover:text-white'}
                `}
              >
                {v === 'feed' ? 'Feed' : v === 'connect' ? 'Connect' : 'Bate-papo'}
                {v === 'chats' && pendingInvitations.length > 0 && (
                  <span className="absolute top-1.5 right-2 w-2 h-2 bg-status-success rounded-full animate-pulse border-2 border-bg-card" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      <main className="flex-1 relative overflow-hidden flex flex-col">
        <AnimatePresence mode="wait">
          {view === 'feed' && (
            <motion.div
              key="feed"
              variants={fadeIn}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex-1 overflow-y-auto p-4 space-y-6 pb-32 scroll-container"
            >
              {filteredFeed.map((item) => (
                <motion.div
                  variants={slideUp}
                  key={item.id}
                  className="bg-white/5 p-5 rounded-[2rem] border border-white/5"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-4">
                      <Avatar src={item.userAvatar} size="md" className="border border-white/10" />
                      <div>
                        <p className="text-sm text-white leading-tight">
                          <span className="font-black italic text-primary-main uppercase">{item.userName}</span>
                          <span className="text-text-secondary ml-1">{item.action}</span>
                        </p>
                        <p className="text-[10px] text-text-tertiary font-bold uppercase mt-1 tracking-widest">{item.timeAgo}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => { trigger('medium'); if (window.confirm("Deseja denunciar?")) setReportedIds(prev => [...prev, item.id]); }}
                      className="p-2 text-text-tertiary hover:text-status-error transition-colors"
                    >
                      <ShieldAlert className="w-4 h-4" />
                    </button>
                  </div>

                  <motion.div
                    whileTap={{ scale: 0.98 }}
                    className="bg-black/20 rounded-2xl p-4 border border-white/5 flex items-center gap-3 mb-4 cursor-pointer hover:bg-black/40 transition-colors"
                    onClick={() => { const p = places.find(x => x.name === item.placeName); if (p) onPlaceSelect?.(p); }}
                  >
                    <div className="bg-white/5 p-2 rounded-xl text-text-tertiary"><MapPin className="w-4 h-4" /></div>
                    <span className="text-sm font-black italic text-white uppercase tracking-tight">{item.placeName}</span>
                  </motion.div>

                  <div className="flex gap-6 pt-4 border-t border-white/5">
                    <button
                      onClick={() => onToggleLike(item.id)}
                      className={`flex items-center gap-2 text-xs font-black uppercase ${item.liked ? 'text-status-error' : 'text-text-tertiary'} active:scale-110 transition-all`}
                    >
                      <Heart className={`w-4 h-4 ${item.liked ? 'fill-current' : ''}`} /> {item.likesCount}
                    </button>
                    <button className="flex items-center gap-2 text-xs font-black uppercase text-text-tertiary">
                      <MessageSquare className="w-4 h-4" /> {item.commentsCount}
                    </button>
                    <button className="flex items-center gap-2 text-xs font-black uppercase text-text-tertiary ml-auto">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {view === 'connect' && (
            <motion.div
              key="connect"
              variants={fadeIn}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex-1 overflow-y-auto p-4 space-y-6 pb-32 scroll-container"
            >
              <div className="bg-gradient-to-br from-indigo-600/20 via-bg-surface-1 to-bg-default p-8 rounded-[3rem] border border-indigo-500/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Users className="w-32 h-32 text-indigo-400" />
                </div>
                <h3 className="text-2xl font-black text-white italic tracking-tighter mb-2 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-indigo-400" /> RADAR SOCIAL
                </h3>
                <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-[0.2em] mb-8">Conecte-se com pessoas na sua vibe</p>

                <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-5 border border-white/5 flex items-center justify-between">
                  <div className="flex -space-x-4">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="w-12 h-12 rounded-full border-4 border-bg-surface-1 overflow-hidden">
                        <img src={`https://i.pravatar.cc/150?u=${i + 10}`} alt="" />
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setShowSearch(true)}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 active:scale-95 transition-all"
                  >
                    Explorar
                  </button>
                </div>
              </div>

              <div className="space-y-4 px-2">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">Sugeridos para você</h4>
                  <Sparkles className="w-4 h-4 text-primary-main" />
                </div>

                {[
                  { id: '1', name: 'Julia Santos', bio: 'Apaixonada por música eletrônica 🎧', avatar: 'https://i.pravatar.cc/150?u=julia', distance: 'Dourados/MS' },
                  { id: '2', name: 'Marcos Lima', bio: 'Procurando a melhor batida da noite', avatar: 'https://i.pravatar.cc/150?u=marcos', distance: '1km' },
                  { id: '3', name: 'Carla Dias', bio: 'Vamo de barzinho hoje? 🍻', avatar: 'https://i.pravatar.cc/150?u=carla', distance: '500m' }
                ].map((user) => (
                  <motion.div
                    variants={slideUp}
                    key={user.id}
                    className="bg-white/5 p-5 rounded-[2.5rem] border border-white/5 flex items-center gap-5 hover:bg-white/[0.08] transition-all group"
                  >
                    <div className="relative">
                      <Avatar src={user.avatar} size="lg" className="border-2 border-white/10 group-hover:border-primary-main/50 transition-colors" />
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-status-success rounded-full border-4 border-bg-default shadow-lg" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <h4 className="font-black text-white italic truncate tracking-tight">{user.name}</h4>
                        <span className="px-2 py-0.5 bg-black text-[8px] font-black text-primary-main uppercase rounded-lg border border-primary-main/20">{user.distance}</span>
                      </div>
                      <p className="text-[11px] text-text-tertiary font-bold mt-1 line-clamp-1">{user.bio}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startNewChat(user as any)}
                        className="p-3 bg-white/5 rounded-2xl text-text-tertiary hover:text-primary-main hover:bg-primary-main/10 transition-all border border-white/5"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {view === 'chats' && (
            <motion.div
              key="chats"
              variants={fadeIn}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex-1 overflow-y-auto p-4 space-y-3 pb-32 scroll-container"
            >
              {allChats.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 opacity-40">
                  <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/5">
                    <MessageSquare className="w-12 h-12 text-text-tertiary" />
                  </div>
                  <p className="text-sm font-black uppercase tracking-widest text-text-tertiary">Nenhuma conversa ativa</p>
                  <button onClick={() => setShowSearch(true)} className="mt-6 text-primary-main font-black text-[10px] uppercase tracking-widest border-2 border-primary-main/30 px-6 py-3 rounded-2xl active:scale-95 transition-all">Procurar amigos</button>
                </div>
              ) : (
                allChats.map((chat) => (
                  <motion.button
                    variants={slideUp}
                    key={chat.id}
                    onClick={() => openChat(chat.id)}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center gap-5 p-5 bg-white/5 hover:bg-white/[0.08] border border-white/5 rounded-[2rem] text-left transition-all group"
                  >
                    <div className="relative">
                      <Avatar src={chat.userAvatar} size="lg" className="border-2 border-white/10 group-hover:border-primary-main/50 transition-colors" />
                      {chat.unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary-main rounded-full border-4 border-bg-default flex items-center justify-center text-[10px] font-black text-black shadow-lg shadow-primary-main/40">
                          {chat.unreadCount}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-black text-white italic tracking-tight">{chat.userName}</h4>
                        <span className="text-[10px] text-text-tertiary font-black uppercase tracking-tighter">
                          {chat.messages && chat.messages.length > 0 ? chat.messages[chat.messages.length - 1].timestamp : ''}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary truncate font-bold opacity-70">
                        {chat.lastMessage}
                      </p>
                    </div>
                  </motion.button>
                ))
              )}
            </motion.div>
          )}

          {view === 'chat_detail' && activeChat && (
            <motion.div
              key="chat_detail"
              variants={slideInRight}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex-1 flex flex-col overflow-hidden"
            >
              <div className="flex-1 p-4 overflow-y-auto space-y-4 pb-10 scroll-container relative">
                <AnimatePresence initial={false}>
                  {activeChatMessages.map((msg) => {
                    const isMe = msg.senderId === me?.id || msg.isMe;

                    return (
                      <motion.div
                        key={msg.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`relative max-w-[85%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                          <div className={`
                            px-5 py-3.5 rounded-[24px] shadow-2xl border transition-all
                            ${isMe
                              ? 'bg-primary-main text-black font-black italic border-white/20 rounded-tr-sm'
                              : 'bg-white/5 text-white border-white/5 rounded-tl-sm backdrop-blur-xl'
                            }
                          `}>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                            <div className="flex items-center justify-end gap-2 mt-2 opacity-40">
                              <span className="text-[9px] font-black uppercase tracking-tighter">{msg.timestamp}</span>
                              {isMe && (
                                <div className="flex -space-x-1.5">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                <div ref={messagesEndRef} className="h-4" />
              </div>

              <div className="p-6 bg-bg-default/80 backdrop-blur-3xl border-t border-white/5 pb-safe z-20">
                <div className="flex gap-3 items-center">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    className="bg-white/5 p-4 rounded-2xl text-text-tertiary border border-white/5"
                  >
                    <Plus className="w-6 h-6" />
                  </motion.button>

                  <div className="flex-1 bg-white/5 rounded-2xl px-5 py-4 border border-white/10 group focus-within:border-primary-main/50 transition-all ring-1 ring-white/5">
                    <input
                      type="text"
                      value={chatInputValue}
                      onChange={(e) => setChatInputValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendText()}
                      placeholder="Escreva sua mensagem..."
                      className="w-full bg-transparent text-white focus:outline-none placeholder:text-text-tertiary text-sm font-bold"
                    />
                  </div>

                  {chatInputValue.trim() ? (
                    <motion.button
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleSendText}
                      className="bg-primary-main p-4 rounded-2xl text-black shadow-xl shadow-primary-main/20"
                    >
                      <Send className="w-6 h-6 fill-current" />
                    </motion.button>
                  ) : (
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      className="bg-white/5 p-4 rounded-2xl text-text-tertiary border border-white/5"
                    >
                      <Mic className="w-6 h-6" />
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};
