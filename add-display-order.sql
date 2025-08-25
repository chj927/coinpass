-- display_order 컬럼 추가 SQL
-- Supabase SQL Editor에서 실행하세요

-- 1. exchange_exchanges 테이블에 display_order 컬럼 추가
ALTER TABLE exchange_exchanges 
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- 2. 기존 데이터에 기본 순서값 부여 (10씩 증가)
-- ID 순서대로 10, 20, 30... 으로 설정
UPDATE exchange_exchanges 
SET display_order = id * 10
WHERE display_order = 0 OR display_order IS NULL;

-- 3. 순서 확인 쿼리
SELECT id, name_ko, display_order 
FROM exchange_exchanges 
ORDER BY display_order ASC, id ASC;

-- 사용 팁:
-- 나중에 중간에 삽입하려면 15, 25 같은 중간값 사용
-- 예: 10과 20 사이에 넣으려면 15 입력