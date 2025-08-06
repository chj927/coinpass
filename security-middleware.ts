/**
 * 보안 미들웨어
 * HTTPS 강제, CSP 헤더 설정, 보안 헤더 추가
 */

export class SecurityMiddleware {
    /**
     * HTTPS 강제 리디렉션
     * 프로덕션 환경에서만 작동
     */
    static enforceHTTPS(): void {
        if (import.meta.env.PROD && window.location.protocol !== 'https:') {
            window.location.href = 'https:' + window.location.href.substring(window.location.protocol.length);
        }
    }

    /**
     * Content Security Policy 설정
     * XSS 공격 방지를 위한 CSP 헤더
     */
    static setCSPHeaders(): void {
        // 메타 태그로 CSP 설정 (클라이언트 사이드)
        const cspMeta = document.createElement('meta');
        cspMeta.httpEquiv = 'Content-Security-Policy';
        cspMeta.content = import.meta.env.VITE_CSP_HEADER || 
            "default-src 'self'; " +
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com; " +
            "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; " +
            "img-src 'self' data: https: blob:; " +
            "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.coingecko.com https://api.upbit.com; " +
            "font-src 'self' data: https://cdn.jsdelivr.net; " +
            "object-src 'none'; " +
            "media-src 'self'; " +
            "frame-src 'none';";
        
        document.head.appendChild(cspMeta);
    }

    /**
     * 추가 보안 헤더 설정
     * 서버 사이드에서 설정하는 것이 권장되지만, 
     * 클라이언트 사이드에서도 일부 보안 강화 가능
     */
    static setSecurityHeaders(): void {
        // Referrer Policy
        const referrerMeta = document.createElement('meta');
        referrerMeta.name = 'referrer';
        referrerMeta.content = 'strict-origin-when-cross-origin';
        document.head.appendChild(referrerMeta);

        // Feature Policy / Permissions Policy
        const featurePolicyMeta = document.createElement('meta');
        featurePolicyMeta.httpEquiv = 'Feature-Policy';
        featurePolicyMeta.content = "camera 'none'; microphone 'none'; geolocation 'none';";
        document.head.appendChild(featurePolicyMeta);
    }

    /**
     * 프레임 보호 (Clickjacking 방지)
     */
    static preventFraming(): void {
        if (window.self !== window.top) {
            // iframe 내에서 실행되는 것을 방지
            document.body.style.display = 'none';
            window.location.href = 'about:blank';
        }
    }

    /**
     * 개발자 도구 감지 (선택적)
     * 주의: 이는 완벽한 보안 솔루션이 아니며, 
     * 정당한 사용자에게 불편을 줄 수 있습니다.
     */
    static detectDevTools(callback?: () => void): void {
        if (import.meta.env.PROD) {
            let devtools = { open: false, orientation: null };
            const threshold = 160;
            const emitEvent = (state: boolean) => {
                if (state && callback) {
                    callback();
                }
            };

            setInterval(() => {
                if (window.outerHeight - window.innerHeight > threshold || 
                    window.outerWidth - window.innerWidth > threshold) {
                    if (!devtools.open) {
                        emitEvent(true);
                        devtools.open = true;
                    }
                } else {
                    devtools.open = false;
                }
            }, 500);
        }
    }

    /**
     * 우클릭 및 텍스트 선택 방지 (선택적)
     * 주의: 접근성을 해칠 수 있으므로 신중히 사용
     */
    static preventContextMenu(selector?: string): void {
        const elements = selector ? document.querySelectorAll(selector) : [document];
        elements.forEach(element => {
            element.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                return false;
            });
        });
    }

    /**
     * 복사 방지 (선택적)
     */
    static preventCopy(selector?: string): void {
        const elements = selector ? document.querySelectorAll(selector) : [document];
        elements.forEach(element => {
            element.addEventListener('copy', (e) => {
                e.preventDefault();
                return false;
            });
        });
    }

    /**
     * 안전한 외부 링크 처리
     * 모든 외부 링크에 rel="noopener noreferrer" 추가
     */
    static secureExternalLinks(): void {
        document.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            if (target.tagName === 'A') {
                const link = target as HTMLAnchorElement;
                if (link.href && link.hostname !== window.location.hostname) {
                    link.rel = 'noopener noreferrer';
                    if (!link.target) {
                        link.target = '_blank';
                    }
                }
            }
        });
    }

    /**
     * 민감한 데이터 자동 정리
     * 페이지 이탈 시 폼 데이터 및 민감한 정보 제거
     */
    static setupDataCleaning(): void {
        window.addEventListener('beforeunload', () => {
            // 모든 입력 필드 초기화
            const inputs = document.querySelectorAll('input[type="password"], input[type="email"], input[name*="password"], input[name*="email"]');
            inputs.forEach(input => {
                (input as HTMLInputElement).value = '';
            });

            // 세션 스토리지 민감한 데이터 제거
            const sensitiveKeys = ['auth_token', 'user_data', 'admin_session'];
            sensitiveKeys.forEach(key => {
                sessionStorage.removeItem(key);
            });
        });

        // 페이지 가시성 변경 시 (탭 전환 등)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // 민감한 정보를 임시로 숨기거나 제거
                document.querySelectorAll('.sensitive-data').forEach(el => {
                    el.classList.add('hidden');
                });
            }
        });
    }

    /**
     * 모든 보안 미들웨어 초기화
     */
    static initialize(): void {
        // HTTPS 강제
        this.enforceHTTPS();
        
        // 보안 헤더 설정
        this.setCSPHeaders();
        this.setSecurityHeaders();
        
        // 프레임 보호
        this.preventFraming();
        
        // 외부 링크 보안
        this.secureExternalLinks();
        
        // 데이터 정리 설정
        this.setupDataCleaning();
        
        // 프로덕션 환경에서만 추가 보안 적용
        if (import.meta.env.PROD) {
            // 개발자 도구 감지 (선택적)
            this.detectDevTools(() => {
                console.warn('Developer tools detected');
            });
        }
    }
}

// 자동 초기화
if (typeof window !== 'undefined') {
    SecurityMiddleware.initialize();
}