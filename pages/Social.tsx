import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MOCK_FRIEND_REQUESTS, MOCK_USER, MOCK_SUGGESTIONS, MOCK_PLACES, FALLBACK_IMAGE } from '../constants';
import { MessageSquare, Heart, MapPin, Search, ChevronLeft, Send, CheckCircle2, UserPlus, X, Camera, Mic, Share2, Plus, ShieldAlert, MoreVertical } from 'lucide-react';
import { Chat, FeedItem, Message, Place } from '../types';
import { useHaptic } from '../hooks/useHaptic';
import { AiStudio } from '../components/AiStudio';
import { db } from '../utils/storage';
import { User } from '../types';
import { fadeIn, slideUp, slideInRight, scaleIn, springTransition } from '../src/styles/animations';

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
  const [blockedUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadChats = useCallback(async () => {
    const chats = await (db.chats as any).get();
    setAllChats(chats.filter((c: Chat) => !blockedUsers.includes(c.userId)));
  }, [blockedUsers]);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

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
                <motion.button
                  variants={slideUp}
                  key={user.id}
                  onClick={() => startNewChat(user)}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center gap-4 p-4 bg-slate-800/40 rounded-2xl hover:bg-slate-800/60 border border-slate-800 transition-colors"
                >
                  <img src={user.avatar} className="w-12 h-12 rounded-full object-cover border border-slate-700" alt="" />
                  <div className="text-left">
                    <h4 className="font-bold text-white">{user.name}</h4>
                    <p className="text-xs text-slate-500">{user.bio || 'Membro do Vou Lá'}</p>
                  </div>
                  <UserPlus className="ml-auto w-5 h-5 text-[var(--primary)]" />
                </motion.button>
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
          <AnimatePresence mode="wait">
            {view === 'chat_detail' && activeChat && (
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
              </motion.div>
            )}
          </AnimatePresence>
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
            <div className="flex gap-4 overflow-x-auto hide-scrollbar pl-1">
              <motion.div variants={scaleIn} onClick={() => setShowAiStudio(true)} className="flex flex-col items-center gap-1.5 shrink-0 group active:scale-95">
                <div className="w-[74px] h-[74px] rounded-full bg-slate-800 border-2 border-slate-700 border-dashed flex items-center justify-center text-[var(--primary)] shadow-lg group-hover:border-[var(--primary)] transition-colors">
                  <Camera className="w-7 h-7" />
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">AI Studio</span>
              </motion.div>
              {places.filter(p => p.isTrending).map(place => (
                <motion.div variants={scaleIn} key={place.id} className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer" onClick={() => onPlaceSelect?.(place)}>
                  <div className="w-[74px] h-[74px] rounded-full p-[3px] bg-gradient-to-tr from-[var(--primary)] via-[#FF3399] to-[#0CC4FF] shadow-lg">
                    <img src={place.imageUrl} className="w-full h-full rounded-full object-cover border-2 border-[var(--background)]" alt="" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-300 truncate w-16 text-center">{place.name}</span>
                </motion.div>
              ))}
            </div>

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
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {view === 'chats' && (
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
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-bold text-white text-base truncate">{chat.userName}</h3>
                      <span className="text-[10px] text-slate-500 font-bold">Hoje</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#00ff73]"><CheckCircle2 className="w-3 h-3" /></span>
                      <p className="text-sm truncate text-slate-500 font-medium">{chat.lastMessage}</p>
                    </div>
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
            className="flex flex-col flex-1 chat-bg overflow-hidden relative"
          >
            <div className="flex-1 p-4 overflow-y-auto space-y-3 pb-10 scroll-container">
              <AnimatePresence>
                {activeChat.messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] px-3 py-2 text-[14.5px] font-medium shadow-sm ${msg.isMe ? 'bubble-me' : 'bubble-them'}`}>
                      <p className="leading-relaxed">{msg.text}</p>
                      <div className={`flex items-center justify-end gap-1 mt-1 ${msg.isMe ? 'opacity-70' : 'text-slate-500'}`}>
                        <span className="text-[10px]">{msg.timestamp}</span>
                        {msg.isMe && <CheckCircle2 className="w-3 h-3 text-[#53bdeb]" />}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 bg-[#202c33] border-t border-slate-900/50 pb-safe">
              <div className="flex gap-3 items-center">
                <button className="text-slate-400 p-1 active:scale-90 transition-transform"><Plus className="w-6 h-6" /></button>
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
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleSendText}
                    className="bg-[#00a884] p-3 rounded-full text-white shadow-lg"
                  >
                    <Send className="w-5 h-5 fill-current" />
                  </motion.button>
                ) : (
                  <button className="text-slate-400 p-1 active:scale-90 transition-transform"><Mic className="w-6 h-6" /></button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
