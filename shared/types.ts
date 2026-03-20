// 🔥 ZENMO - Types Partagés Frontend/Backend

// ==================== USER TYPES ====================
export interface User {
  id: string;
  phoneVerified: boolean;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  vibe: VibeType;
  city: string;
  createdAt: Date;
  lastSeen: Date;
  settings: UserSettings;
  stats: UserStats;
}

export interface UserSettings {
  pushEnabled: boolean;
  language: 'fr' | 'en';
  privacy: {
    showOnline: boolean;
    showCity: boolean;
    discoverableByPhone: boolean;
    allowMessageRequests: boolean;
  };
}

export interface UserStats {
  messagesSent: number;
  storiesPosted: number;
  vibesPosted: number;
}

// ==================== VIBE TYPES ====================
export type VibeType = 
  | 'calme' 
  | 'love' 
  | 'energy' 
  | 'creative' 
  | 'funny' 
  | 'ambitious' 
  | 'chill' 
  | 'party';

export interface VibePost {
  id: string;
  userId: string;
  user?: User;
  type: 'mood' | 'question' | 'confession';
  text: string;
  media?: string[];
  city: string;
  vibe: VibeType;
  likes: number;
  comments: number;
  createdAt: Date;
}

// ==================== CHAT TYPES ====================
export interface Message {
  id: string;
  conversationId: string;
  from: string;
  to: string;
  type: 'text' | 'image' | 'audio';
  content: string;
  meta?: {
    duration?: number;
    size?: number;
  };
  createdAt: Date;
  delivered: boolean;
  read: boolean;
}

export interface Conversation {
  id: string;
  participants: string[];
  status: 'PENDING' | 'ACTIVE';
  lastMessage?: {
    text: string;
    at: Date;
  };
  createdAt: Date;
  muted: string[];
  archived: boolean;
}

// ==================== STORY TYPES ====================
export interface Story {
  id: string;
  userId: string;
  user?: User;
  city: string;
  content: StoryContent[];
  vibe: VibeType;
  createdAt: Date;
  expiresAt: Date;
  views: number;
}

export interface StoryContent {
  type: 'image' | 'video';
  url: string;
  caption?: string;
  duration?: number;
}

// ==================== AUTH TYPES ====================
export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export interface OTPRequest {
  phone: string;
}

export interface OTPVerify {
  phone: string;
  code: string;
}

// ==================== API RESPONSE TYPES ====================
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
}

// ==================== WEBSOCKET EVENTS ====================
export interface SocketEvents {
  // Client -> Server
  'join_conversation': { conversationId: string };
  'send_message': { conversationId: string; type: string; content: string };
  'typing': { conversationId: string };
  'presence_update': { status: 'online' | 'offline' };

  // Server -> Client
  'message': Message;
  'message_delivered': { messageId: string };
  'message_read': { messageId: string };
  'user_typing': { conversationId: string; userId: string };
  'presence': { userId: string; status: 'online' | 'offline' };
}

// ==================== MODERATION TYPES ====================
export interface Report {
  id: string;
  targetId: string;
  targetType: 'message' | 'user' | 'story' | 'vibe';
  reporterId: string;
  reason: 'harassment' | 'spam' | 'inappropriate' | 'fake' | 'other';
  description?: string;
  createdAt: Date;
  status: 'open' | 'reviewed' | 'closed';
  adminNote?: string;
}

// ==================== CONSTANTS ====================
export const VIBE_COLORS: Record<VibeType, string> = {
  calme: '#33D1C4',      // Turquoise
  love: '#FF6B9D',       // Rose
  energy: '#FFD93D',     // Jaune énergique
  creative: '#7B61FF',   // Violet
  funny: '#FF8C42',      // Orange
  ambitious: '#E4C66D',  // Or
  chill: '#A8E6CF',      // Vert pastel
  party: '#FF4757',      // Rouge festif
};

export const CITIES = [
  'Ouagadougou',
  'Bobo-Dioulasso',
  'Koudougou',
  'Banfora',
  'Ouahigouya',
  'Pouytenga',
  'Kaya',
  'Tenkodogo',
  'Fada N\'Gourma',
  'Dori'
] as const;

export type City = typeof CITIES[number];