
export enum PlaceType {
  BAR = 'Bar',
  BALADA = 'Balada',
  EVENTO = 'Evento',
  ADEGA = 'Adega',
  RESTAURANTE = 'Restaurante'
}

export enum VibeLevel {
  CHILL = 'CHILL',
  HEATING = 'HEATING',
  EXPLODING = 'EXPLODING'
}

export enum Tab {
  HOME = 'HOME',
  RADAR = 'RADAR',
  AI_FINDER = 'AI_FINDER',
  SOCIAL = 'SOCIAL',
  PROFILE = 'PROFILE',
  CHALLENGES = 'CHALLENGES',
  RANKING = 'RANKING',
  STORE = 'STORE',
  EVENTS = 'EVENTS',
  DASHBOARD = 'DASHBOARD'
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: 'drink' | 'food' | 'other';
  available: boolean;
  imageUrl?: string;
}

export interface OrderItem extends MenuItem {
  quantity: number;
  status: 'preparing' | 'delivered';
  orderedAt: string;
}

export interface SongHistory {
  id: string;
  title: string;
  artist: string;
  playedAt: string;
}

export interface StaffCall {
  id: string;
  userId: string;
  userName: string;
  type: 'Pedido' | 'Conta' | 'Ajuda';
  timestamp: string;
  status: 'pending' | 'preparing' | 'ready' | 'done';
  waitingTime?: number; // em minutos
}

export interface LiveRequest {
  id: string;
  userId: string;
  userName: string;
  content: string;
  type: 'music' | 'shoutout';
  timestamp: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface FlashPromo {
  id: string;
  title: string;
  description: string;
  expiresAt: string;
  active: boolean;
}

export interface TicketTier {
  id: string;
  name: string;
  price: number;
  sold: number;
  capacity: number;
}

export interface BusinessEvent {
  id: string;
  title: string;
  date: string;
  description: string;
  tiers: TicketTier[];
}

export interface CrowdInsight {
  male: number;
  female: number;
  others: number;
  avgAge: number;
  topDrink: string;
}

export interface Place {
  id: string;
  name: string;
  type: PlaceType;
  distance: string;
  peopleCount: number;
  capacityPercentage: number;
  imageUrl: string;
  isTrending: boolean;
  description: string;
  coordinates: { x: number; y: number };
  lat?: number;
  lng?: number;
  friendsPresent: string[];
  kingId?: string;
  address?: string;
  rating?: number;
  phoneNumber?: string;
  openingHours?: string;
  tags?: string[];
  currentMusic?: string;
  songHistory?: SongHistory[];
  menu?: MenuItem[];
  ownerId?: string;
  upcomingEvents?: BusinessEvent[];
  activeCalls?: StaffCall[];
  liveRequests?: LiveRequest[];
  activePromos?: FlashPromo[];
  sentimentScore?: number;
  crowdInsights?: CrowdInsight;
}

export interface PrivacySettings {
  ghostMode: boolean;
  publicProfile: boolean;
  allowTagging: boolean;
  blockedUsers?: string[];
  notifications: {
    hypeAlerts: boolean;
    chatMessages: boolean;
    friendActivity: boolean;
  };
}

export interface CheckIn {
  id: string;
  placeId: string;
  placeName: string;
  timestamp: string;
  xpEarned: number;
  snapshotImageUrl: string;
}

export type FeedCheckIn = CheckIn;

export interface Ticket {
  id: string;
  title: string;
  placeName: string;
  qrCodeData: string;
  status: 'valid' | 'used' | 'expired';
  type: string;
  date?: string;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  email?: string;
  level: number;
  points: number;
  badges: string[];
  memberSince: string;
  bio?: string;
  theme?: 'purple' | 'neon' | 'cyan' | 'pink';
  history: CheckIn[];
  savedPlaces: string[];
  ownedPlaceId?: string;
  settings?: PrivacySettings;
  instagram?: string;
  tiktok?: string;
  twitter?: string;
  status?: string;
  wallet?: Ticket[];
  appMode?: 'light' | 'dark';
}

export interface FeedItem {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  action: string;
  placeName: string;
  timeAgo: string;
  liked: boolean;
  likesCount: number;
  commentsCount: number;
  isReported?: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  timestamp: string;
  isMe: boolean;
  type: 'text' | 'image' | 'audio';
  text?: string;
  imageUrl?: string;
  audioUrl?: string;
}

export interface Chat {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  lastMessage: string;
  unreadCount: number;
  messages: Message[];
  isBlocked?: boolean;
}

export interface FriendRequest {
  id: string;
  name: string;
  avatar: string;
  mutual: number;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  progress: number;
  total: number;
  icon: string;
  completed: boolean;
}

export interface SocialPlan {
  id: string;
  title: string;
  placeName: string;
  date: string;
  time: string;
  confirmedCount: number;
  pendingCount: number;
  avatars: string[];
  isHost: boolean;
  userStatus: 'confirmed' | 'pending' | 'declined';
}

export interface MatchProfile {
  id: string;
  name: string;
  age: number;
  avatar: string;
  bio: string;
  status: string;
  tags: string[];
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'hype' | 'alert' | 'invite';
  placeId?: string;
}
