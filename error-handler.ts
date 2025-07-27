// 통합 에러 핸들링 시스템

export class ErrorHandler {
    private static instance: ErrorHandler;
    private errorQueue: Array<{ message: string; timestamp: number }> = [];
    private maxQueueSize = 10;

    private constructor() {}

    public static getInstance(): ErrorHandler {
        if (!ErrorHandler.instance) {
            ErrorHandler.instance = new ErrorHandler();
        }
        return ErrorHandler.instance;
    }

    public handleError(error: Error | string, context?: string): void {
        const message = typeof error === 'string' ? error : error.message;
        const timestamp = Date.now();
        
        // 에러 로깅
        console.error(`[${context || 'Unknown'}] ${message}`, error);
        
        // 에러 큐에 추가
        this.addToQueue({ message, timestamp });
        
        // 사용자에게 친화적인 메시지 표시
        this.showUserMessage(this.getFriendlyMessage(message));
    }

    public handleAPIError(error: any, context: string): void {
        let message = '서버 연결에 실패했습니다.';
        
        if (error?.message) {
            if (error.message.includes('fetch')) {
                message = '네트워크 연결을 확인해주세요.';
            } else if (error.message.includes('timeout')) {
                message = '요청 시간이 초과되었습니다.';
            } else if (error.message.includes('401')) {
                message = '인증이 필요합니다.';
            } else if (error.message.includes('403')) {
                message = '접근 권한이 없습니다.';
            } else if (error.message.includes('404')) {
                message = '요청한 데이터를 찾을 수 없습니다.';
            } else if (error.message.includes('500')) {
                message = '서버에 일시적인 문제가 발생했습니다.';
            }
        }
        
        this.handleError(new Error(message), context);
    }

    public handleValidationError(field: string, value: any): void {
        const message = `입력 값이 올바르지 않습니다: ${field}`;
        this.handleError(new Error(message), 'Validation');
    }

    private getFriendlyMessage(originalMessage: string): string {
        const friendlyMessages: Record<string, string> = {
            'Network request failed': '인터넷 연결을 확인해주세요.',
            'Failed to fetch': '서버에 연결할 수 없습니다.',
            'TypeError': '예상치 못한 오류가 발생했습니다.',
            'ReferenceError': '필요한 리소스를 찾을 수 없습니다.',
            'Supabase configuration is missing': '서비스 설정에 문제가 있습니다.',
        };

        for (const [key, value] of Object.entries(friendlyMessages)) {
            if (originalMessage.includes(key)) {
                return value;
            }
        }

        return '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
    }

    private addToQueue(errorInfo: { message: string; timestamp: number }): void {
        this.errorQueue.push(errorInfo);
        
        // 큐 크기 제한
        if (this.errorQueue.length > this.maxQueueSize) {
            this.errorQueue.shift();
        }
    }

    private showUserMessage(message: string, type: 'error' | 'warning' | 'info' = 'error'): void {
        // 기존 메시지가 있으면 제거
        const existingMessage = document.querySelector('.error-toast');
        if (existingMessage) {
            existingMessage.remove();
        }

        const toast = document.createElement('div');
        toast.className = `error-toast error-toast--${type}`;
        toast.textContent = message;
        
        const styles = {
            error: { bg: '#ff4757', color: '#fff' },
            warning: { bg: '#ffa502', color: '#fff' },
            info: { bg: '#3742fa', color: '#fff' }
        };
        
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${styles[type].bg};
            color: ${styles[type].color};
            padding: 16px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 9999;
            max-width: 350px;
            font-size: 14px;
            line-height: 1.4;
            animation: slideIn 0.3s ease-out;
        `;

        // 애니메이션 CSS 추가
        if (!document.querySelector('#error-animations')) {
            const style = document.createElement('style');
            style.id = 'error-animations';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(toast);

        // 5초 후 자동 제거
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 5000);

        // 클릭으로 즉시 제거
        toast.addEventListener('click', () => {
            toast.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        });
    }

    public showSuccess(message: string): void {
        this.showUserMessage(message, 'info');
    }

    public showWarning(message: string): void {
        this.showUserMessage(message, 'warning');
    }

    public getRecentErrors(): Array<{ message: string; timestamp: number }> {
        return [...this.errorQueue].reverse();
    }

    public clearErrors(): void {
        this.errorQueue = [];
    }
}

// 전역 에러 핸들러 설정
export function setupGlobalErrorHandling(): void {
    const errorHandler = ErrorHandler.getInstance();

    // 처리되지 않은 Promise 거부
    window.addEventListener('unhandledrejection', (event) => {
        errorHandler.handleError(event.reason, 'Unhandled Promise');
        event.preventDefault();
    });

    // 일반적인 JavaScript 에러
    window.addEventListener('error', (event) => {
        errorHandler.handleError(event.error || event.message, 'Global Error');
    });

    // 리소스 로딩 에러
    window.addEventListener('error', (event) => {
        if (event.target && event.target !== window) {
            const target = event.target as HTMLElement;
            if (target.tagName === 'IMG') {
                console.warn('Image failed to load:', (target as HTMLImageElement).src);
            } else if (target.tagName === 'SCRIPT') {
                errorHandler.handleError('스크립트 로딩에 실패했습니다.', 'Resource Loading');
            }
        }
    }, true);
}

// 유틸리티 함수들
export const handleAsyncError = (asyncFn: () => Promise<any>) => {
    return async (...args: any[]) => {
        try {
            return await asyncFn.apply(this, args);
        } catch (error) {
            ErrorHandler.getInstance().handleError(error as Error, 'Async Function');
            throw error;
        }
    };
};

export const withErrorBoundary = (fn: Function, context: string) => {
    return (...args: any[]) => {
        try {
            return fn.apply(this, args);
        } catch (error) {
            ErrorHandler.getInstance().handleError(error as Error, context);
            return null;
        }
    };
};