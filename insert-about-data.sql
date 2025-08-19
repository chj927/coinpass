-- Insert or update About Us data in page_contents table
-- Using 'about' as page_type since 'aboutUs' is not in the ENUM

-- First, check if 'about' entry exists
SELECT * FROM page_contents WHERE page_type = 'about';

-- Insert or update the about section
INSERT INTO page_contents (page_type, content) 
VALUES ('about', '{
    "title": "코인패스 서비스 소개",
    "content": "코인패스는 암호화폐 거래소 수수료 할인을 전문으로 하는 국내 최고의 서비스입니다.\n\n전 세계 주요 거래소와의 공식 파트너십을 통해 일반 사용자보다 최대 50% 저렴한 수수료로 거래할 수 있는 혜택을 제공합니다.\n\n우리의 미션은 모든 암호화폐 투자자들이 공정하고 합리적인 수수료로 거래할 수 있도록 돕는 것입니다.\n\n간단한 가입 절차만으로 평생 수수료 할인 혜택을 누리실 수 있으며, 추가 비용이나 숨겨진 수수료는 전혀 없습니다."
}'::jsonb)
ON CONFLICT (page_type) 
DO UPDATE SET 
    content = EXCLUDED.content,
    updated_at = NOW();

-- Verify the data was inserted/updated
SELECT page_type, content, updated_at 
FROM page_contents 
WHERE page_type = 'about';