# 보안 가이드

## 보안 강화 사항

### 1. 환경변수 설정
- `.env` 파일을 생성하여 민감한 정보를 환경변수로 관리
- Supabase URL과 키를 하드코딩에서 환경변수로 변경
- 관리자 비밀번호 해시도 환경변수로 관리 권장

### 2. 관리자 인증 보안
- 로그인 시도 횟수 제한 (5회)
- 실패 시 15분 잠금
- 세션 관리 (30분 자동 만료)
- Rate limiting 적용

### 3. XSS 방지
- 모든 사용자 입력 데이터 sanitization
- HTML 태그 이스케이프 처리
- URL 유효성 검증

### 4. CSRF 보호
- CSRF 토큰 생성 및 검증
- 상태 변경 요청에 토큰 필수

### 5. 입력 검증
- 텍스트 길이 제한
- URL 형식 검증
- 허용된 테이블/페이지만 접근 가능

## 추가 권장사항

### 1. Supabase RLS (Row Level Security) 설정
```sql
-- 공개 테이블에 RLS 활성화
ALTER TABLE cex_exchanges ENABLE ROW LEVEL SECURITY;
ALTER TABLE dex_exchanges ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE single_pages ENABLE ROW LEVEL SECURITY;

-- 읽기 전용 정책
CREATE POLICY "Allow public read access" ON cex_exchanges FOR SELECT USING (true);
-- 다른 테이블에도 동일하게 적용
```

### 2. 환경변수 설정 방법
1. `.env.example` 파일을 복사하여 `.env` 파일 생성
2. 실제 값으로 변경
3. `.env` 파일을 `.gitignore`에 추가

### 3. 비밀번호 변경 방법
새로운 관리자 비밀번호 설정:
```javascript
// 브라우저 콘솔에서 실행
async function generatePasswordHash(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

// 사용 예시
generatePasswordHash('새로운비밀번호').then(console.log);
```

### 4. 프로덕션 배포 시 추가 고려사항
- HTTPS 사용 필수
- 콘텐츠 보안 정책 (CSP) 헤더 설정
- 정기적인 보안 업데이트
- 로그 모니터링
- 백업 및 복구 계획

### 5. 모니터링
- 비정상적인 로그인 시도 모니터링
- 데이터베이스 접근 로그 확인
- 주기적인 보안 점검