// 보안 기능 테스트 스크립트
// 브라우저 콘솔에서 실행하여 보안 기능 검증

console.log('=== CoinPass 보안 기능 테스트 ===');

// SecurityUtils 클래스 테스트
async function testSecurityUtils() {
    console.log('\n1. HTML Sanitization 테스트');
    
    const testInput = '<script>alert("XSS")</script><p>안전한 텍스트</p>';
    console.log('입력:', testInput);
    console.log('출력:', SecurityUtils.sanitizeHtml(testInput));
    
    console.log('\n2. URL 검증 테스트');
    const urls = [
        'https://example.com',
        'http://test.com',
        'javascript:alert("XSS")',
        'ftp://unsafe.com',
        '//evil.com',
        'not-a-url'
    ];
    
    urls.forEach(url => {
        console.log(`${url}: ${SecurityUtils.isValidUrl(url) ? '✓ 유효' : '✗ 무효'}`);
    });
    
    console.log('\n3. 입력 검증 테스트');
    try {
        const validInput = SecurityUtils.validateInput('안전한 입력', 100);
        console.log('유효한 입력 처리:', validInput);
        
        // 너무 긴 입력 테스트
        SecurityUtils.validateInput('a'.repeat(2000), 100);
    } catch (error) {
        console.log('긴 입력 차단:', error.message);
    }
    
    console.log('\n4. 비밀번호 검증 테스트');
    const passwords = [
        '123456',
        'Password123',
        'SecureP@ss123',
        'VerySecurePassword123!'
    ];
    
    passwords.forEach(pwd => {
        const result = SecurityUtils.validatePassword(pwd);
        console.log(`${pwd}: ${result.isValid ? '✓ 유효' : '✗ 무효'}`);
        if (!result.isValid) {
            console.log('  오류:', result.errors.join(', '));
        }
    });
    
    console.log('\n5. Rate Limiting 테스트');
    for (let i = 1; i <= 12; i++) {
        const allowed = SecurityUtils.checkRateLimit('test-key', 10, 60000);
        console.log(`요청 ${i}: ${allowed ? '허용' : '차단'}`);
    }
    
    console.log('\n6. CSRF 토큰 테스트');
    const token1 = SecurityUtils.getCSRFToken();
    const token2 = SecurityUtils.getCSRFToken();
    console.log('토큰 일관성:', token1 === token2 ? '✓ 통과' : '✗ 실패');
    console.log('토큰 검증:', SecurityUtils.validateCSRFToken(token1) ? '✓ 통과' : '✗ 실패');
    console.log('잘못된 토큰 차단:', SecurityUtils.validateCSRFToken('fake-token') ? '✗ 실패' : '✓ 통과');
    
    console.log('\n7. 세션 관리 테스트');
    SecurityUtils.startSession();
    console.log('세션 시작 후 유효성:', SecurityUtils.isSessionValid() ? '✓ 유효' : '✗ 무효');
    SecurityUtils.clearSession();
    console.log('세션 클리어 후 유효성:', SecurityUtils.isSessionValid() ? '✗ 무효해야 함' : '✓ 무효');
}

// XSS 방지 테스트
function testXSSPrevention() {
    console.log('\n=== XSS 방지 테스트 ===');
    
    // DOM에 악성 스크립트 삽입 시도
    const testElement = document.createElement('div');
    testElement.innerHTML = SecurityUtils.sanitizeHtml('<img src=x onerror=alert("XSS")>');
    console.log('Sanitized HTML:', testElement.innerHTML);
    
    // 텍스트 콘텐츠 검증
    const textContent = SecurityUtils.sanitizeHtml('<script>alert("XSS")</script>Normal text');
    console.log('텍스트 sanitization:', textContent);
}

// 실행
if (typeof SecurityUtils !== 'undefined') {
    testSecurityUtils();
    testXSSPrevention();
    console.log('\n=== 모든 테스트 완료 ===');
} else {
    console.error('SecurityUtils를 찾을 수 없습니다. security-utils.ts가 로드되었는지 확인하세요.');
}