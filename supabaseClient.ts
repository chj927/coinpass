import { createClient } from '@supabase/supabase-js'

// 환경변수에서 Supabase 설정 로드 (보안 강화)
// TypeScript 오류 방지를 위한 타입 선언
declare const import_meta_env: any;

const supabaseUrl = (typeof import_meta_env !== 'undefined' && import_meta_env.VITE_SUPABASE_URL) || 'https://znixozrpthqcrvgdkgry.supabase.co'
const supabaseAnonKey = (typeof import_meta_env !== 'undefined' && import_meta_env.VITE_SUPABASE_ANON_KEY) || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpuaXhvenJwdGhxY3J2Z2RrZ3J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxODU0MjIsImV4cCI6MjA2ODc2MTQyMn0.YIxAe9FHqaFSUk7uIqtKf9jgR5tzUoA6bhIq9QyEepI'

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