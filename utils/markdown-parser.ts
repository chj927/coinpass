/**
 * 간단한 마크다운 파서
 * Bold와 링크 기능만 지원
 * 보안을 위해 HTML 태그는 이스케이프 처리
 */
export class SimpleMarkdownParser {
    /**
     * 마크다운 텍스트를 안전한 HTML로 변환
     * @param text 마크다운 형식의 텍스트
     * @returns HTML 문자열
     */
    static parse(text: string): string {
        if (!text) return '';
        
        // 1. HTML 이스케이프 (보안 - XSS 방지)
        let safe = text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;');
        
        // 2. Bold 처리: **텍스트** → <strong>텍스트</strong>
        safe = safe.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // 3. 링크 처리: [텍스트](URL) → <a href="URL">텍스트</a>
        safe = safe.replace(
            /\[([^\]]+)\]\(([^)]+)\)/g, 
            (match, text, url) => {
                // URL 검증 (http://, https://, mailto: 만 허용)
                if (!/^(https?:\/\/|mailto:)/i.test(url)) {
                    return match; // 유효하지 않은 URL은 변환하지 않음
                }
                return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="markdown-link">${text}</a>`;
            }
        );
        
        // 4. 줄바꿈 처리: \n → <br>
        safe = safe.replace(/\n/g, '<br>');
        
        return safe;
    }
    
    /**
     * 관리자 패널용 사용 가이드 텍스트
     */
    static getUsageGuide(): string {
        return `
📝 텍스트 서식 사용법:
• 굵은 글씨: **텍스트** → 텍스트가 굵게 표시됩니다
• 링크: [표시할 텍스트](https://example.com) → 클릭 가능한 링크가 됩니다
• 줄바꿈: Enter 키를 누르면 새 줄로 이동합니다

예시:
**코인패스**는 최대 **50% 수수료 할인**을 제공합니다.
자세한 내용은 [공식 홈페이지](https://coinpass.kr)를 참고하세요.
        `.trim();
    }
    
    /**
     * 미리보기용 - 마크다운 텍스트를 HTML로 변환하여 표시
     */
    static preview(text: string, previewElementId: string): void {
        const previewElement = document.getElementById(previewElementId);
        if (previewElement) {
            previewElement.innerHTML = this.parse(text);
        }
    }
}