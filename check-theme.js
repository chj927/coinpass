// Theme functionality checker
// Run this in browser console on each page

function checkThemeFunctionality() {
    console.log('=== 테마 기능 체크 시작 ===');
    
    // 1. 현재 테마 확인
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    console.log(`현재 테마: ${currentTheme}`);
    
    // 2. 테마 토글 버튼 확인
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) {
        console.error('❌ 테마 토글 버튼을 찾을 수 없습니다!');
        return false;
    }
    console.log('✅ 테마 토글 버튼 발견');
    
    // 3. 테마 아이콘 확인
    const sunIcon = document.querySelector('.sun-icon');
    const moonIcon = document.querySelector('.moon-icon');
    if (!sunIcon || !moonIcon) {
        console.error('❌ 테마 아이콘을 찾을 수 없습니다!');
        return false;
    }
    console.log('✅ 테마 아이콘 발견');
    
    // 4. CSS 변수 확인
    const styles = getComputedStyle(document.documentElement);
    const cssVars = {
        '--bg-color': styles.getPropertyValue('--bg-color'),
        '--primary-text-color': styles.getPropertyValue('--primary-text-color'),
        '--accent-color': styles.getPropertyValue('--accent-color'),
        '--card-bg-color': styles.getPropertyValue('--card-bg-color')
    };
    console.log('CSS 변수:', cssVars);
    
    // 5. 테마 전환 테스트
    console.log('테마 전환 테스트 시작...');
    themeToggle.click();
    
    setTimeout(() => {
        const newTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        if (newTheme !== currentTheme) {
            console.log(`✅ 테마 전환 성공: ${currentTheme} → ${newTheme}`);
            
            // 변경된 스타일 확인
            const newStyles = getComputedStyle(document.documentElement);
            const newCssVars = {
                '--bg-color': newStyles.getPropertyValue('--bg-color'),
                '--primary-text-color': newStyles.getPropertyValue('--primary-text-color'),
                '--accent-color': newStyles.getPropertyValue('--accent-color'),
                '--card-bg-color': newStyles.getPropertyValue('--card-bg-color')
            };
            console.log('변경된 CSS 변수:', newCssVars);
            
            // localStorage 확인
            const savedTheme = localStorage.getItem('theme');
            console.log(`localStorage 저장된 테마: ${savedTheme}`);
            
            // 원래대로 복원
            setTimeout(() => {
                themeToggle.click();
                console.log('테마 복원 완료');
            }, 1000);
            
            return true;
        } else {
            console.error('❌ 테마가 변경되지 않았습니다!');
            return false;
        }
    }, 500);
}

// 페이지 로드 완료 후 실행
if (document.readyState === 'complete') {
    checkThemeFunctionality();
} else {
    window.addEventListener('load', checkThemeFunctionality);
}

console.log('테마 체크 스크립트 로드됨. checkThemeFunctionality() 함수를 직접 호출할 수도 있습니다.');