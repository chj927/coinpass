-- Check AboutUs data in page_contents table

-- 1. See all page_contents entries
SELECT page_type, 
       content IS NOT NULL as has_content,
       created_at,
       updated_at
FROM page_contents
ORDER BY page_type;

-- 2. Check specifically for aboutUs
SELECT * 
FROM page_contents 
WHERE page_type = 'aboutUs';

-- 3. Check if there's any variation in page_type naming
SELECT DISTINCT page_type 
FROM page_contents 
WHERE page_type ILIKE '%about%';

-- 4. If aboutUs doesn't exist, insert a test record
-- UNCOMMENT AND RUN IF NEEDED:
/*
INSERT INTO page_contents (page_type, content) 
VALUES ('aboutUs', '{
    "title": "코인패스 서비스 소개",
    "content": "코인패스는 암호화폐 거래소 수수료 할인 서비스입니다.\n\n전 세계 주요 거래소와의 파트너십을 통해 최대 50% 수수료 할인 혜택을 제공합니다.\n\n간단한 가입만으로 평생 혜택을 누리실 수 있습니다."
}'::jsonb)
ON CONFLICT (page_type) 
DO UPDATE SET 
    content = EXCLUDED.content,
    updated_at = NOW();
*/