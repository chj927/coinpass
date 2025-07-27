// 보안 유틸리티 함수들
export class SecurityUtils {
    // HTML sanitization
    static sanitizeHtml(input: string): string {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    }

    // URL validation
    static isValidUrl(url: string): boolean {
        try {
            const urlObj = new URL(url);
            return ['http:', 'https:'].includes(urlObj.protocol);
        } catch {
            return false;
        }
    }

    // Input validation
    static validateInput(input: string, maxLength: number = 1000): string {
        if (typeof input !== 'string') {
            throw new Error('Invalid input type');
        }
        if (input.length > maxLength) {
            throw new Error(`Input too long. Max ${maxLength} characters allowed`);
        }
        return this.sanitizeHtml(input.trim());
    }

    // Generate secure random string
    static generateSecureToken(length: number = 32): string {
        const array = new Uint8Array(length);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    // Rate limiting (simple implementation)
    private static rateLimitMap = new Map<string, { count: number; resetTime: number }>();
    
    static checkRateLimit(key: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
        const now = Date.now();
        const record = this.rateLimitMap.get(key);
        
        if (!record || now > record.resetTime) {
            this.rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
            return true;
        }
        
        if (record.count >= maxRequests) {
            return false;
        }
        
        record.count++;
        return true;
    }

    // CSRF token management
    private static csrfToken: string | null = null;
    
    static getCSRFToken(): string {
        if (!this.csrfToken) {
            this.csrfToken = this.generateSecureToken();
            sessionStorage.setItem('csrf-token', this.csrfToken);
        }
        return this.csrfToken;
    }
    
    static validateCSRFToken(token: string): boolean {
        const storedToken = sessionStorage.getItem('csrf-token');
        return storedToken === token && token === this.csrfToken;
    }

    // Enhanced password validation
    static validatePassword(password: string): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];
        
        if (password.length < 12) {
            errors.push('비밀번호는 최소 12자 이상이어야 합니다');
        }
        if (!/[A-Z]/.test(password)) {
            errors.push('대문자를 포함해야 합니다');
        }
        if (!/[a-z]/.test(password)) {
            errors.push('소문자를 포함해야 합니다');
        }
        if (!/[0-9]/.test(password)) {
            errors.push('숫자를 포함해야 합니다');
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            errors.push('특수문자를 포함해야 합니다');
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // Session management
    static startSession(): void {
        const sessionId = this.generateSecureToken();
        const expiryTime = Date.now() + (30 * 60 * 1000); // 30분
        sessionStorage.setItem('admin-session', sessionId);
        sessionStorage.setItem('session-expiry', expiryTime.toString());
    }

    static isSessionValid(): boolean {
        const sessionId = sessionStorage.getItem('admin-session');
        const expiryTime = sessionStorage.getItem('session-expiry');
        
        if (!sessionId || !expiryTime) {
            return false;
        }
        
        return Date.now() < parseInt(expiryTime, 10);
    }

    static clearSession(): void {
        sessionStorage.removeItem('admin-session');
        sessionStorage.removeItem('session-expiry');
        sessionStorage.removeItem('csrf-token');
        this.csrfToken = null;
    }
}