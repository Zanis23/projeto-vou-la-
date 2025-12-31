
import { Place, PlaceType, User, FeedItem, Chat, FriendRequest, Mission, SocialPlan, MatchProfile } from '@/types';

export const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1514525253361-bee8a197c0c1?q=80&w=800&auto=format&fit=crop';

export const MOCK_USER: User = {
  id: 'u1',
  name: 'Gabriel',
  avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&auto=format&fit=crop',
  level: 12,
  points: 2450,
  badges: ['Rei do Tereré', 'Universitário UFGD', 'Inimigo do Fim'],
  bio: 'Vivendo um rolê de cada vez em Dourados ✨ Apaixonado por sertanejo e tereré.',
  instagram: 'gabriel.voula',
  tiktok: 'gabriel_voula',
  twitter: '',
  theme: 'neon',
  appMode: 'dark',
  accentColor: 'neon',
  history: [],
  savedPlaces: [],
  ownedPlaceId: '1', // Vinculado ao Tex Music Bar para fins de teste
  memberSince: '2024-01-15T12:00:00.000Z',
  status: '🔥 Pronto pro crime',
  settings: {
    ghostMode: false,
    publicProfile: true,
    allowTagging: true,
    notifications: {
      hypeAlerts: true,
      chatMessages: true,
      friendActivity: true
    }
  }
};

export const MOCK_PLACES: Place[] = [
  {
    id: '1',
    name: 'Tex Music Bar',
    type: PlaceType.BALADA,
    distance: '2.5km',
    peopleCount: 412,
    capacityPercentage: 98,
    imageUrl: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=800&auto=format&fit=crop',
    isTrending: true,
    description: 'A casa sertaneja mais bombada de Dourados. Shows ao vivo e gente bonita.',
    coordinates: { x: 80, y: 30 },
    lat: -22.2238,
    lng: -54.8064,
    friendsPresent: ['https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100'],
    kingId: 'u1',
    address: 'R. Maj. Capilé, 1000 - Centro',
    rating: 4.7,
    phoneNumber: '(67) 99999-1234',
    openingHours: '23:00 - 05:00',
    tags: ['Sertanejo', 'Camarote', 'Shows', 'Universitário'],
    currentMusic: 'Sertanejo Universitário',
    menu: [
      { id: 'm1', name: 'Combo Vodka Smirnoff', price: 180, category: 'drink', available: true },
      { id: 'm2', name: 'Balde Heineken (6un)', price: 75, category: 'drink', available: true },
      { id: 'm3', name: 'Gin Tônica', price: 25, category: 'drink', available: true },
    ],
    activeCalls: [],
    liveRequests: []
  },
  {
    id: '2',
    name: 'Jangoo Pub',
    type: PlaceType.BAR,
    distance: '0.5km',
    peopleCount: 145,
    capacityPercentage: 85,
    imageUrl: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=800&auto=format&fit=crop',
    isTrending: true,
    description: 'O templo do Rock em Dourados. Cervejas artesanais e bandas cover.',
    coordinates: { x: 45, y: 55 },
    lat: -22.2205,
    lng: -54.8120,
    friendsPresent: ['https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100'],
    address: 'R. Toshinobu Katayama, 1166 - Centro',
    rating: 4.9,
    phoneNumber: '(67) 3421-1234',
    openingHours: '19:00 - 03:00',
    tags: ['Rock', 'Pub', 'Cerveja Artesanal', 'Alternativo'],
    currentMusic: 'Classic Rock Live'
  },
  {
    id: '3',
    name: 'Adega do Bill',
    type: PlaceType.ADEGA,
    distance: '1.2km',
    peopleCount: 45,
    capacityPercentage: 40,
    imageUrl: 'https://images.unsplash.com/photo-1584224505353-0667e416d183?q=80&w=800&auto=format&fit=crop',
    isTrending: false,
    description: 'O esquenta oficial da cidade. Bebidas geladas e fumo de qualidade.',
    coordinates: { x: 20, y: 40 },
    lat: -22.2280,
    lng: -54.8150,
    friendsPresent: [],
    address: 'R. Hayel Bon Faker, 1500',
    rating: 4.5,
    openingHours: '10:00 - 02:00',
    tags: ['Esquenta', 'Conveniência', '24h', 'Funk'],
    currentMusic: 'Funk Mix 2024',
    menu: [
      { id: 'm4', name: 'Combo Jack Daniels', price: 280, category: 'drink', available: true },
      { id: 'm5', name: 'Corote Sabores', price: 8, category: 'drink', available: true },
    ]
  },
  {
    id: '4',
    name: 'Espetaria Prime',
    type: PlaceType.RESTAURANTE,
    distance: '3.1km',
    peopleCount: 88,
    capacityPercentage: 70,
    imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=800&auto=format&fit=crop',
    isTrending: false,
    description: 'O melhor espetinho de Dourados com aquela cerveja trincando.',
    coordinates: { x: 60, y: 70 },
    lat: -22.2450,
    lng: -54.7900,
    friendsPresent: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'],
    address: 'Av. Weimar Gonçalves Torres, 2500',
    rating: 4.6,
    openingHours: '18:00 - 00:00',
    tags: ['Família', 'Happy Hour', 'Espetinho', 'MPB'],
    currentMusic: 'MPB / Voz e Violão'
  },
  {
    id: '5',
    name: 'ExpoDourados',
    type: PlaceType.EVENTO,
    distance: '5.0km',
    peopleCount: 2500,
    capacityPercentage: 95,
    imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=800&auto=format&fit=crop',
    isTrending: true,
    description: 'Maior feira agropecuária da região com shows nacionais.',
    coordinates: { x: 90, y: 10 },
    lat: -22.2050,
    lng: -54.7800,
    friendsPresent: ['https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100'],
    address: 'Parque de Exposições João Humberto de Carvalho',
    rating: 4.8,
    openingHours: '08:00 - 04:00',
    tags: ['Agro', 'Show Nacional', 'Rodeio', 'Festa'],
    currentMusic: 'Palco Principal: Jorge & Mateus'
  },
  {
    id: '6',
    name: 'Kira Sushi Lounge',
    type: PlaceType.RESTAURANTE,
    distance: '0.8km',
    peopleCount: 62,
    capacityPercentage: 55,
    imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=800&auto=format&fit=crop',
    isTrending: false,
    description: 'Culinária japonesa contemporânea e drinks exclusivos.',
    coordinates: { x: 30, y: 20 },
    lat: -22.2150,
    lng: -54.8080,
    friendsPresent: [],
    address: 'R. Albino Torraca, 800',
    rating: 4.9,
    openingHours: '19:00 - 23:30',
    tags: ['Japonês', 'Date', 'Lounge', 'Sofisticado'],
    currentMusic: 'Deep House Relax'
  },
  {
    id: '7',
    name: 'The Pub Universitário',
    type: PlaceType.BAR,
    distance: '1.5km',
    peopleCount: 210,
    capacityPercentage: 92,
    imageUrl: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?q=80&w=800&auto=format&fit=crop',
    isTrending: true,
    description: 'Onde a galera da UFGD e UEMS se encontra.',
    coordinates: { x: 50, y: 50 },
    lat: -22.2300,
    lng: -54.8250,
    friendsPresent: ['https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100'],
    address: 'R. Quintino Bocaiuva, 450',
    rating: 4.4,
    openingHours: '17:00 - 02:00',
    tags: ['Universitário', 'Barato', 'Papo Furado', 'Sinuca'],
    currentMusic: 'Playlist: Melhores do TikTok'
  }
];

export const MOCK_FEED: FeedItem[] = [
  { id: 'f1', userId: 'u2', userName: 'Pedro Silva', userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100', action: 'dominou o', placeName: 'Tex Music Bar', timeAgo: '5 min atrás', liked: false, likesCount: 12, commentsCount: 3 },
  { id: 'f2', userId: 'u3', userName: 'Larissa Souza', userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', action: 'pediu música no', placeName: 'Jangoo Pub', timeAgo: '20 min atrás', liked: true, likesCount: 28, commentsCount: 5 }
];

export const MOCK_CHATS: Chat[] = [];
export const MOCK_MISSIONS: Mission[] = [
  { id: 'm1', title: 'Primeiro Check-in do Dia', description: 'Faça seu primeiro check-in hoje', xpReward: 50, progress: 0, total: 1, icon: 'location', completed: false }
];
export const MOCK_PLANS: SocialPlan[] = [];
export const MOCK_FRIEND_REQUESTS: FriendRequest[] = [];
export const MOCK_SUGGESTIONS = [
  { id: 's1', name: 'Julia Martins', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100', mutual: 12 },
  { id: 's2', name: 'Lucas Pereira', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100', mutual: 5 }
];
export const MOCK_MATCH_PROFILES: MatchProfile[] = [
  { id: 'mp1', name: 'Isabela', age: 22, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80', bio: 'Aqui pela música, fico pela resenha. 🍹', status: '💃 Na pista', tags: ['Sertanejo', 'Drinks', 'Aquário'] }
];

export const getUserById = (id: string): User => {
  if (id === MOCK_USER.id) return MOCK_USER;
  return {
    ...MOCK_USER,
    id,
    name: 'Usuário',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + id,
    points: 0,
    level: 1
  };
};
