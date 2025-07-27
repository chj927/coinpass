// 공통 타입 정의

export interface DatabaseRecord {
    id?: number;
    created_at?: string;
    [key: string]: any;
}

export interface ExchangeData extends DatabaseRecord {
    name_ko: string;
    link: string;
    logoImageUrl?: string;
    benefit1_tag_ko: string;
    benefit1_value_ko: string;
    benefit2_tag_ko: string;
    benefit2_value_ko: string;
    benefit3_tag_ko: string;
    benefit3_value_ko: string;
    benefit4_tag_ko: string;
    benefit4_value_ko: string;
}

export interface FAQData extends DatabaseRecord {
    question_ko: string;
    answer_ko: string;
}

export interface GuideData extends DatabaseRecord {
    title_ko: string;
    content_ko: string;
}

export interface BannerData extends DatabaseRecord {
    page: string;
    image_url?: string;
    content?: string;
    enabled: boolean;
}

export interface SinglePageData extends DatabaseRecord {
    type: 'hero' | 'aboutUs' | 'popup';
    content: {
        ko: string;
        [key: string]: any;
    };
}

export interface PopupData {
    enabled: boolean;
    imageUrl?: string;
    content?: {
        ko: string;
    };
}

export interface SiteData {
    exchanges: ExchangeData[];
    dexExchanges: ExchangeData[];
    faqs: FAQData[];
    guides?: GuideData[];
    hero?: SinglePageData['content'];
    aboutUs?: SinglePageData['content'];
    popup?: PopupData;
}

export interface SecurityConfig {
    maxRetries: number;
    timeoutMs: number;
    maxInputLength: number;
}

export interface APIResponse<T> {
    data: T | null;
    error: Error | null;
    loading: boolean;
}

// Vite 환경변수 타입
export interface ImportMetaEnv {
    readonly VITE_SUPABASE_URL: string;
    readonly VITE_SUPABASE_ANON_KEY: string;
}

export interface ImportMeta {
    readonly env: ImportMetaEnv;
}

// 이벤트 관련 타입
export interface CustomEventDetail {
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
}

// 컴포넌트 상태 타입
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface ComponentState {
    loading: LoadingState;
    error: string | null;
    data: any;
}