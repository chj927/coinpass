import { createClient } from '@supabase/supabase-js'

// 환경변수에서 Supabase 설정 로드 (보안 강화)
// Vite 환경변수 타입 선언
interface ImportMetaEnv {
    readonly VITE_SUPABASE_URL: string;
    readonly VITE_SUPABASE_ANON_KEY: string;
}

declare global {
    interface ImportMeta {
        readonly env: ImportMetaEnv;
    }
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 입력 검증 추가
if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase configuration is missing');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: false, // 보안 강화를 위해 세션 지속성 비활성화
    },
    db: {
        schema: 'public'
    },
    global: {
        headers: {
            'X-Client-Info': 'coinpass-web@1.0.0'
        }
    }
})