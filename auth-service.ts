import { supabase } from './supabaseClient';

/**
 * 서버사이드 인증 서비스
 * Supabase Auth를 활용한 관리자 인증 시스템
 */
export class AuthService {
    private static instance: AuthService;
    // 세션 타임아웃 설정 (30분)
    private refreshInterval: NodeJS.Timeout | null = null;

    private constructor() {
        this.setupSessionRefresh();
    }

    static getInstance(): AuthService {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }

    /**
     * 관리자 로그인
     * @param email 관리자 이메일
     * @param password 비밀번호
     * @returns 로그인 성공 여부
     */
    async login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
        try {
            // 입력 검증
            if (!this.validateEmail(email) || !password || password.length < 8) {
                return { success: false, error: '유효하지 않은 입력입니다.' };
            }

            // Supabase Auth로 로그인
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });

            if (error) {
                console.error('Login error:', error);
                // Provide more specific error messages
                if (error.message === 'Invalid login credentials') {
                    return { success: false, error: '이메일 또는 비밀번호가 올바르지 않습니다.' };
                } else if (error.message.includes('Email not confirmed')) {
                    return { success: false, error: '이메일 인증이 필요합니다. 이메일을 확인해주세요.' };
                } else if (error.status === 400) {
                    return { success: false, error: '입력한 정보를 다시 확인해주세요.' };
                } else if (error.status === 429) {
                    return { success: false, error: '너무 많은 시도입니다. 잠시 후 다시 시도해주세요.' };
                }
                return { success: false, error: '로그인에 실패했습니다. 잠시 후 다시 시도해주세요.' };
            }

            if (!data.user) {
                return { success: false, error: '사용자 정보를 찾을 수 없습니다.' };
            }

            // 관리자 권한 확인 (user_metadata에 is_admin 플래그 확인)
            const isAdmin = data.user.user_metadata?.is_admin === true;
            if (!isAdmin) {
                await this.logout();
                return { success: false, error: '관리자 권한이 없습니다.' };
            }

            // 세션 정보 저장
            this.saveSession(data.session);
            
            return { success: true };
        } catch (error) {
            console.error('Login exception:', error);
            return { success: false, error: '로그인 처리 중 오류가 발생했습니다.' };
        }
    }

    /**
     * 로그아웃
     */
    async logout(): Promise<void> {
        try {
            await supabase.auth.signOut();
            this.clearSession();
            if (this.refreshInterval) {
                clearInterval(this.refreshInterval);
                this.refreshInterval = null;
            }
        } catch (error) {
            console.error('Logout error:', error);
            // 에러가 발생해도 로컬 세션은 정리
            this.clearSession();
        }
    }

    /**
     * 현재 세션 확인
     * @returns 유효한 관리자 세션 여부
     */
    async checkSession(): Promise<boolean> {
        try {
            const { data: { session }, error } = await supabase.auth.getSession();
            
            if (error || !session) {
                return false;
            }

            // 세션 만료 확인
            const expiresAt = new Date(session.expires_at! * 1000);
            if (expiresAt < new Date()) {
                await this.logout();
                return false;
            }

            // 관리자 권한 재확인
            const { data: { user } } = await supabase.auth.getUser();
            if (!user || user.user_metadata?.is_admin !== true) {
                await this.logout();
                return false;
            }

            return true;
        } catch (error) {
            console.error('Session check error:', error);
            return false;
        }
    }

    /**
     * 세션 갱신
     */
    async refreshSession(): Promise<boolean> {
        try {
            const { data, error } = await supabase.auth.refreshSession();
            
            if (error || !data.session) {
                console.error('Session refresh failed:', error);
                return false;
            }

            this.saveSession(data.session);
            return true;
        } catch (error) {
            console.error('Session refresh error:', error);
            return false;
        }
    }

    /**
     * 관리자 계정 생성 (초기 설정용)
     * 주의: 이 함수는 초기 설정 시에만 사용하고, 프로덕션에서는 비활성화해야 함
     */
    async createAdminUser(email: string, password: string): Promise<{ success: boolean; error?: string }> {
        try {
            // 이메일 검증
            if (!this.validateEmail(email)) {
                return { success: false, error: '유효하지 않은 이메일 형식입니다.' };
            }

            // 비밀번호 강도 검증
            const passwordStrength = this.checkPasswordStrength(password);
            if (!passwordStrength.isValid) {
                return { success: false, error: passwordStrength.message };
            }

            // Supabase Auth로 사용자 생성
            const { error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        is_admin: true,
                        created_at: new Date().toISOString()
                    }
                }
            });

            if (error) {
                return { success: false, error: error.message };
            }

            return { success: true };
        } catch (error) {
            console.error('Admin creation error:', error);
            return { success: false, error: '관리자 계정 생성 중 오류가 발생했습니다.' };
        }
    }

    /**
     * 비밀번호 변경
     */
    async changePassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
        try {
            // 세션 확인
            const isValid = await this.checkSession();
            if (!isValid) {
                return { success: false, error: '유효하지 않은 세션입니다.' };
            }

            // 비밀번호 강도 검증
            const passwordStrength = this.checkPasswordStrength(newPassword);
            if (!passwordStrength.isValid) {
                return { success: false, error: passwordStrength.message };
            }

            // 비밀번호 업데이트
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) {
                return { success: false, error: '비밀번호 변경에 실패했습니다.' };
            }

            return { success: true };
        } catch (error) {
            console.error('Password change error:', error);
            return { success: false, error: '비밀번호 변경 중 오류가 발생했습니다.' };
        }
    }

    /**
     * 로그인 시도 제한 관리
     */
    loginRateLimiter = {
        attempts: new Map<string, { count: number; firstAttempt: number }>(),
        maxAttempts: 5,
        windowMs: 15 * 60 * 1000, // 15분

        check(identifier: string): { allowed: boolean; remainingAttempts?: number; retryAfter?: number } {
            const now = Date.now();
            const record = this.attempts.get(identifier);

            if (!record) {
                this.attempts.set(identifier, { count: 1, firstAttempt: now });
                return { allowed: true, remainingAttempts: this.maxAttempts - 1 };
            }

            // 시간 창 확인
            if (now - record.firstAttempt > this.windowMs) {
                // 시간 창이 지났으므로 리셋
                this.attempts.set(identifier, { count: 1, firstAttempt: now });
                return { allowed: true, remainingAttempts: this.maxAttempts - 1 };
            }

            // 시도 횟수 확인
            if (record.count >= this.maxAttempts) {
                const retryAfter = this.windowMs - (now - record.firstAttempt);
                return { allowed: false, retryAfter: Math.ceil(retryAfter / 1000) };
            }

            // 시도 횟수 증가
            record.count++;
            return { allowed: true, remainingAttempts: this.maxAttempts - record.count };
        },

        reset(identifier: string): void {
            this.attempts.delete(identifier);
        }
    };

    /**
     * 이메일 유효성 검사
     */
    private validateEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * 비밀번호 강도 확인
     */
    private checkPasswordStrength(password: string): { isValid: boolean; message: string } {
        if (!password || password.length < 12) {
            return { isValid: false, message: '비밀번호는 최소 12자 이상이어야 합니다.' };
        }

        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        const strength = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length;

        if (strength < 3) {
            return { 
                isValid: false, 
                message: '비밀번호는 대문자, 소문자, 숫자, 특수문자 중 최소 3가지를 포함해야 합니다.' 
            };
        }

        return { isValid: true, message: '비밀번호가 안전합니다.' };
    }

    /**
     * 세션 저장
     */
    private saveSession(_session: any): void {
        // 세션 정보는 Supabase가 자동으로 관리하지만,
        // 추가적인 메타데이터가 필요한 경우 여기서 처리
        sessionStorage.setItem('admin_session_started', new Date().toISOString());
    }

    /**
     * 세션 정리
     */
    private clearSession(): void {
        sessionStorage.removeItem('admin_session_started');
    }

    /**
     * 자동 세션 갱신 설정
     */
    private setupSessionRefresh(): void {
        // 20분마다 세션 갱신 (30분 만료 전)
        this.refreshInterval = setInterval(async () => {
            const isValid = await this.checkSession();
            if (isValid) {
                await this.refreshSession();
            }
        }, 20 * 60 * 1000);
    }

    /**
     * IP 기반 접근 제한 (선택적)
     */
    async checkIPRestriction(clientIP: string): Promise<boolean> {
        // 허용된 IP 목록을 Supabase 테이블에서 관리할 수 있음
        // 이는 추가적인 보안 계층으로 사용 가능
        try {
            const { DatabaseUtils } = await import('./supabaseClient');
            const { data, error } = await DatabaseUtils.getPaginatedData(
                'admin_allowed_ips',
                1,
                1,
                'ip_address'
            );

            return !error && data !== null;
        } catch {
            // IP 제한이 설정되지 않은 경우 모든 IP 허용
            return true;
        }
    }
}

// 싱글톤 인스턴스 export
export const authService = AuthService.getInstance();