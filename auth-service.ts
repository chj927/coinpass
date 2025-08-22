import { apiClient, APIError } from './api-client';

/**
 * 서버사이드 인증 서비스
 * API 서버를 통한 관리자 인증 시스템
 */
export class AuthService {
    private static instance: AuthService;
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

            // API 서버를 통한 로그인
            const data = await apiClient.login(email, password);

            if (!data || !data.user) {
                return { success: false, error: '로그인에 실패했습니다.' };
            }

            // 관리자 권한 확인
            if (!data.user.isAdmin) {
                await this.logout();
                return { success: false, error: '관리자 권한이 없습니다.' };
            }

            // 세션 정보 저장 (토큰은 apiClient가 자동으로 관리)
            this.saveSession({
                userId: data.user.id,
                email: data.user.email,
                role: data.user.role
            });
            
            return { success: true };
        } catch (error) {
            console.error('Login exception:', error);
            
            if (error instanceof APIError) {
                if (error.statusCode === 401) {
                    return { success: false, error: '이메일 또는 비밀번호가 올바르지 않습니다.' };
                } else if (error.statusCode === 429) {
                    return { success: false, error: '너무 많은 시도입니다. 잠시 후 다시 시도해주세요.' };
                }
            }
            
            return { success: false, error: '로그인 처리 중 오류가 발생했습니다.' };
        }
    }

    /**
     * 로그아웃
     */
    async logout(): Promise<void> {
        try {
            await apiClient.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this.clearSession();
            if (this.refreshInterval) {
                clearInterval(this.refreshInterval);
                this.refreshInterval = null;
            }
        }
    }

    /**
     * 현재 세션 확인
     * @returns 유효한 관리자 세션 여부
     */
    async checkSession(): Promise<boolean> {
        try {
            const isValid = await apiClient.verifySession();
            
            if (!isValid) {
                this.clearSession();
                return false;
            }
            
            const user = await apiClient.getCurrentUser();
            return !!(user && user.isAdmin);
        } catch (error) {
            console.error('Session check error:', error);
            this.clearSession();
            return false;
        }
    }

    /**
     * 현재 사용자 정보 가져오기
     */
    async getCurrentUser(): Promise<any | null> {
        try {
            const user = await apiClient.getCurrentUser();
            if (!user || !user.isAdmin) {
                return null;
            }
            return user;
        } catch (error) {
            console.error('Get current user error:', error);
            return null;
        }
    }

    /**
     * 세션 자동 갱신 설정
     */
    private setupSessionRefresh(): void {
        // 20분마다 세션 확인 및 갱신
        this.refreshInterval = setInterval(async () => {
            const isValid = await this.checkSession();
            if (!isValid) {
                console.log('Session expired or invalid');
                this.clearSession();
            }
        }, 20 * 60 * 1000);
    }

    /**
     * 세션 정보 저장
     */
    private saveSession(sessionData: any): void {
        sessionStorage.setItem('admin_session', JSON.stringify(sessionData));
        sessionStorage.setItem('admin_session_started', new Date().toISOString());
    }

    /**
     * 세션 정보 삭제
     */
    private clearSession(): void {
        sessionStorage.removeItem('admin_session');
        sessionStorage.removeItem('admin_session_started');
    }

    /**
     * 이메일 유효성 검사
     */
    private validateEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * 비밀번호 강도 검증
     */
    validatePasswordStrength(password: string): {
        isValid: boolean;
        errors: string[];
    } {
        const errors: string[] = [];
        
        if (password.length < 12) {
            errors.push('비밀번호는 최소 12자 이상이어야 합니다.');
        }
        
        if (!/[A-Z]/.test(password)) {
            errors.push('대문자를 포함해야 합니다.');
        }
        
        if (!/[a-z]/.test(password)) {
            errors.push('소문자를 포함해야 합니다.');
        }
        
        if (!/[0-9]/.test(password)) {
            errors.push('숫자를 포함해야 합니다.');
        }
        
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            errors.push('특수문자를 포함해야 합니다.');
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }
}

// 싱글톤 인스턴스 export
export const authService = AuthService.getInstance();