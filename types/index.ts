// Core type definitions for CoinPass application

// Article related types
export interface Article {
  id: number;
  title: string;
  content: string;
  category: string;
  author?: string;
  created_at: string;
  updated_at?: string;
  is_pinned?: boolean | string | number; // Flexible type to handle database inconsistencies
  is_featured?: boolean | string | number;
  view_count?: number;
  image_url?: string;
  tags?: string[];
  status?: 'draft' | 'published' | 'archived';
}

// Exchange related types
export interface Exchange {
  id: number;
  name_ko: string;
  logoimageurl?: string;
  benefit1_tag_ko: string;
  benefit1_value_ko: string;
  benefit2_tag_ko: string;
  benefit2_value_ko: string;
  benefit3_tag_ko: string;
  benefit3_value_ko: string;
  benefit4_tag_ko: string;
  benefit4_value_ko: string;
  link: string;
  created_at?: string;
  updated_at?: string;
}

// FAQ related types
export interface FAQ {
  id: number;
  question_ko: string;
  answer_ko: string;
  created_at?: string;
  updated_at?: string;
}

// Popup data type
export interface PopupData {
  enabled: boolean;
  type: 'text' | 'image';
  content: {
    ko: string;
    en?: string;
  };
  imageUrl?: string;
  startDate?: string;
  endDate?: string;
}

// Hero data type
export interface HeroData {
  title: {
    ko: string;
    en?: string;
  };
  subtitle: {
    ko: string;
    en?: string;
  };
}

// Filter type for article filters
export interface Filter {
  category: string;
  label: string;
  count?: number;
  active?: boolean;
}

// Admin session type
export interface AdminSession {
  id: string;
  email: string;
  created_at: string;
  expires_at: string;
  ip_address?: string;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
  count?: number;
}

// Supabase specific types
export interface SupabaseResponse<T> {
  data: T | null;
  error: {
    message: string;
    details?: string;
    hint?: string;
    code?: string;
  } | null;
  count?: number | null;
  status?: number;
  statusText?: string;
}

// Price comparison types
export interface PriceData {
  exchange: string;
  symbol: string;
  price: number;
  change_24h?: number;
  volume_24h?: number;
  timestamp: number;
}

// User preferences
export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: 'ko' | 'en';
  notifications?: boolean;
}