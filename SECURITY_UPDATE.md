# 🔒 CoinPass 보안 업데이트 가이드

## 📋 주요 변경사항

### 1. API 키 노출 문제 해결 ✅
- **이전**: Supabase API 키가 클라이언트 빌드에 포함됨
- **현재**: 모든 API 키는 서버에만 저장되며, 클라이언트는 프록시 서버를 통해서만 접근

### 2. 서버 측 권한 검증 구현 ✅
- **이전**: 클라이언트에서 user_metadata로 권한 확인 (조작 가능)
- **현재**: 서버에서 JWT 토큰 검증 및 데이터베이스 확인으로 권한 검증

### 3. Supabase RLS (Row Level Security) 정책 적용 ✅
- 모든 테이블에 RLS 활성화
- 공개 데이터는 읽기만 허용
- 쓰기 작업은 service_role을 통해서만 가능

## 🚀 설정 방법

### 1. 환경변수 설정

#### 서버용 (.env.server)
```bash
# .env.server.example을 복사하여 .env.server 생성
cp .env.server.example .env.server

# 다음 값들을 설정:
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your-very-secure-jwt-secret-at-least-32-characters
API_PORT=3001
```

#### 클라이언트용 (.env)
```bash
# .env.example을 복사하여 .env 생성
cp .env.example .env

# API 서버 URL 설정 (기본값: http://localhost:3001/api)
VITE_API_URL=http://localhost:3001/api
```

### 2. Supabase RLS 정책 적용

Supabase 대시보드의 SQL Editor에서 실행:
```bash
# setup-rls-policies.sql 파일의 내용을 전체 실행
```

### 3. 서버 실행

#### 개발 환경
```bash
# 클라이언트와 서버 동시 실행
npm run dev:all

# 또는 개별 실행
npm run dev        # 클라이언트 (포트 3000)
npm run dev:server # API 서버 (포트 3001)
```

#### 프로덕션 환경
```bash
# 빌드
npm run build

# 서버 실행
npm run start      # API 서버
npm run start:client # 클라이언트
```

## 🔐 보안 체크리스트

### 필수 확인 사항:
- [ ] `.env.server` 파일이 `.gitignore`에 포함되어 있는가?
- [ ] `SUPABASE_SERVICE_ROLE_KEY`가 클라이언트 코드에 없는가?
- [ ] Supabase RLS 정책이 모든 테이블에 적용되었는가?
- [ ] JWT_SECRET이 최소 32자 이상의 안전한 값인가?
- [ ] HTTPS가 프로덕션 환경에서 활성화되어 있는가?

### 권장 사항:
- [ ] 정기적으로 의존성 업데이트 (`npm audit`)
- [ ] API 서버 로그 모니터링 설정
- [ ] Rate limiting 값 조정 (필요시)
- [ ] CORS 허용 도메인 제한
- [ ] 2FA 구현 (향후)

## 📊 API 엔드포인트

### 공개 엔드포인트 (인증 불필요)
- `GET /api/exchanges` - 거래소 목록
- `GET /api/faqs` - FAQ 목록
- `GET /api/site-data/:section` - 사이트 데이터
- `POST /api/auth/login` - 로그인

### 보호된 엔드포인트 (JWT 토큰 필요)
- `POST /api/auth/logout` - 로그아웃
- `GET /api/auth/verify` - 세션 확인

### 관리자 엔드포인트 (관리자 권한 필요)
- `POST /api/admin/exchanges` - 거래소 생성/수정
- `DELETE /api/admin/exchanges/:id` - 거래소 삭제
- `POST /api/admin/site-data` - 사이트 데이터 수정
- `GET /api/admin/logs` - 관리자 로그

## 🛠️ 문제 해결

### API 서버 연결 실패
1. API 서버가 실행 중인지 확인
2. 포트 3001이 사용 가능한지 확인
3. `.env` 파일의 `VITE_API_URL` 확인

### 권한 오류 (403)
1. JWT 토큰이 유효한지 확인
2. 사용자 권한이 데이터베이스에 올바르게 설정되어 있는지 확인
3. RLS 정책이 올바르게 적용되었는지 확인

### CORS 오류
1. `api-server.ts`의 `allowedOrigins`에 도메인 추가
2. 개발 환경에서는 `http://localhost:3000` 확인

## 📝 마이그레이션 체크리스트

기존 코드를 새 보안 시스템으로 마이그레이션:

1. **supabase 직접 호출 제거**
   ```typescript
   // 이전
   import { supabase } from './supabaseClient';
   const { data } = await supabase.from('table').select();
   
   // 현재
   import { apiClient } from './api-client';
   const data = await apiClient.getExchanges();
   ```

2. **인증 코드 업데이트**
   ```typescript
   // 이전
   const { data } = await supabase.auth.signIn();
   
   // 현재
   const { token, user } = await apiClient.login(email, password);
   ```

3. **권한 확인 업데이트**
   ```typescript
   // 이전
   if (user.user_metadata?.is_admin)
   
   // 현재
   if (user.role === 'admin' && user.isAdmin)
   ```

## 🔄 업데이트 내역

- **2024.01.22**: 초기 보안 업데이트
  - API 프록시 서버 구현
  - RLS 정책 적용
  - 클라이언트 측 Supabase 직접 호출 제거

## 📞 지원

보안 관련 문의사항이 있으시면 관리자에게 문의해주세요.

⚠️ **중요**: 보안 취약점을 발견하시면 공개적으로 보고하지 마시고, 비공개로 관리자에게 직접 연락해주세요.