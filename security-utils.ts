// 보안 유틸리티 함수들
export class SecurityUtils {
    // Enhanced HTML sanitization with DOMPurify-like functionality
    static sanitizeHtml(input: string): string {
        if (!input) return '';
        
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    }

    // Safe innerHTML setter with sanitization
    static setSafeInnerHTML(element: Element, content: string): void {
        if (!element) return;
        element.innerHTML = this.sanitizeHtml(content);
    }

    // Create safe text content
    static createSafeTextNode(content: string): Text {
        return document.createTextNode(this.sanitizeHtml(content));
    }

    // Advanced XSS protection
    static stripScriptTags(input: string): string {
        return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    }

    // Content Security Policy helper
    static generateNonce(): string {
        return this.generateSecureToken(16);
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

    // Enhanced CSRF token management
    private static csrfToken: string | null = null;
    private static csrfTokenExpiry: number = 0;
    private static readonly CSRF_TOKEN_TTL = 30 * 60 * 1000; // 30분
    
    static getCSRFToken(): string {
        const now = Date.now();
        
        // 토큰이 없거나 만료된 경우 새로 생성
        if (!this.csrfToken || now > this.csrfTokenExpiry) {
            this.csrfToken = this.generateSecureToken(32);
            this.csrfTokenExpiry = now + this.CSRF_TOKEN_TTL;
            
            // sessionStorage 대신 메모리에만 저장 (XSS 방지)
            // 프로덕션에서는 httpOnly 쿠키 사용 권장
        }
        return this.csrfToken;
    }
    
    static validateCSRFToken(token: string): boolean {
        const now = Date.now();
        
        // 토큰 만료 확인
        if (!this.csrfToken || now > this.csrfTokenExpiry) {
            return false;
        }
        
        // 상수 시간 비교 (타이밍 공격 방지)
        return this.constantTimeEquals(token, this.csrfToken);
    }

    // 타이밍 공격 방지를 위한 상수 시간 문자열 비교
    private static constantTimeEquals(a: string, b: string): boolean {
        if (a.length !== b.length) {
            return false;
        }
        
        let result = 0;
        for (let i = 0; i < a.length; i++) {
            result |= a.charCodeAt(i) ^ b.charCodeAt(i);
        }
        
        return result === 0;
    }

    static clearCSRFToken(): void {
        this.csrfToken = null;
        this.csrfTokenExpiry = 0;
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