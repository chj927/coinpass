-- Articles 테이블 생성
CREATE TABLE IF NOT EXISTS articles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('notice', 'guide', 'event', 'airdrop')),
    content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('external', 'internal')),
    content TEXT, -- 자체 작성 콘텐츠 (HTML)
    excerpt TEXT, -- 미리보기 텍스트
    external_url TEXT, -- 외부 블로그 링크
    image_url TEXT, -- 썸네일 이미지 URL
    author VARCHAR(100) DEFAULT 'CoinPass',
    is_pinned BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT TRUE,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX idx_articles_category ON articles(category);
CREATE INDEX idx_articles_is_published ON articles(is_published);
CREATE INDEX idx_articles_is_pinned ON articles(is_pinned);
CREATE INDEX idx_articles_created_at ON articles(created_at DESC);

-- RLS 정책 설정
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- 읽기 권한은 모두에게
CREATE POLICY "Articles are viewable by everyone" ON articles
    FOR SELECT USING (is_published = TRUE);

-- 생성, 수정, 삭제는 인증된 사용자만 (관리자)
CREATE POLICY "Only authenticated users can insert articles" ON articles
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated users can update articles" ON articles
    FOR UPDATE WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated users can delete articles" ON articles
    FOR DELETE USING (auth.role() = 'authenticated');

-- 조회수 증가 함수
CREATE OR REPLACE FUNCTION increment_article_view(article_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE articles 
    SET view_count = view_count + 1
    WHERE id = article_id;
END;
$$;

-- 업데이트 시간 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 예시 데이터 삽입
INSERT INTO articles (title, category, content_type, content, excerpt, external_url, image_url, is_pinned) VALUES
-- 공지사항
('CoinPass 서비스 정식 오픈', 'notice', 'internal', 
'<h2>안녕하세요, CoinPass입니다!</h2><p>드디어 국내 최고의 암호화폐 거래소 비교 플랫폼 CoinPass가 정식 오픈했습니다.</p><p>CoinPass는 여러분이 최적의 거래소를 선택할 수 있도록 다음과 같은 기능을 제공합니다:</p><ul><li>실시간 거래 수수료 비교</li><li>거래소별 코인 가격 비교</li><li>독점 할인 혜택</li><li>신규 가입 이벤트 정보</li></ul>', 
'국내 최고의 암호화폐 거래소 비교 플랫폼 CoinPass가 정식 오픈했습니다.',
NULL,
'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80',
true),

('서비스 이용약관 업데이트', 'notice', 'external', 
NULL,
'CoinPass 서비스 이용약관이 2024년 1월 15일부로 업데이트됩니다.',
'https://blog.naver.com/example/terms-update',
'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80',
false),

-- 가이드
('바이낸스 가입 및 KYC 인증 완벽 가이드', 'guide', 'internal',
'<h2>바이낸스 가입부터 KYC 인증까지</h2><p>세계 최대 거래소 바이낸스의 가입 과정을 상세히 안내해드립니다.</p><h3>1. 회원가입</h3><p>바이낸스 공식 웹사이트에 접속하여 이메일 또는 휴대폰 번호로 가입합니다.</p><h3>2. 보안 설정</h3><p>2FA(이중 인증)를 반드시 설정하여 계정을 보호하세요.</p><h3>3. KYC 인증</h3><p>신분증과 셀카를 준비하여 본인 인증을 완료합니다.</p>',
'바이낸스 거래소 가입부터 KYC 인증까지 완벽하게 안내해드립니다.',
NULL,
'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800&q=80',
true),

('업비트 자동매매 봇 설정 방법', 'guide', 'external',
NULL,
'업비트 API를 활용한 자동매매 봇 설정 방법을 알아보세요.',
'https://medium.com/@cryptobot/upbit-trading-bot',
'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80',
false),

('초보자를 위한 차트 분석 기초', 'guide', 'internal',
'<h2>차트 분석의 기초</h2><p>암호화폐 투자에 필요한 기본적인 차트 분석 방법을 배워봅시다.</p><h3>캔들스틱 차트란?</h3><p>캔들스틱은 특정 기간 동안의 시가, 고가, 저가, 종가를 한눈에 보여주는 차트입니다.</p><h3>주요 지표</h3><ul><li>이동평균선(MA)</li><li>RSI</li><li>MACD</li></ul>',
'암호화폐 차트 분석의 기초를 쉽게 설명해드립니다.',
NULL,
'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80',
false),

-- 이벤트
('OKX 거래소 신규가입 $100 보너스', 'event', 'internal',
'<h2>OKX 신규가입 이벤트</h2><p>지금 OKX에 가입하고 거래를 시작하면 최대 $100 보너스를 받을 수 있습니다!</p><h3>이벤트 참여 방법</h3><ol><li>CoinPass 전용 링크로 가입</li><li>KYC 인증 완료</li><li>$1,000 이상 입금</li><li>30일 내 $10,000 이상 거래</li></ol><p><strong>이벤트 기간: 2024.01.01 ~ 2024.02.29</strong></p>',
'OKX 거래소 신규가입 시 최대 $100 보너스를 받아가세요!',
NULL,
'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&q=80',
true),

('빗썸 BTC 거래 수수료 무료 이벤트', 'event', 'external',
NULL,
'빗썸에서 비트코인 거래 수수료 0% 이벤트를 진행합니다.',
'https://bithumb.com/event/btc-zero-fee',
'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800&q=80',
false),

-- 에어드랍
('Arbitrum 에어드랍 신청 가이드', 'airdrop', 'internal',
'<h2>Arbitrum 에어드랍 받는 방법</h2><p>Layer 2 솔루션 Arbitrum의 에어드랍을 받는 방법을 상세히 안내합니다.</p><h3>자격 조건</h3><ul><li>Arbitrum 네트워크에서 거래 이력</li><li>특정 기간 동안 자산 보유</li><li>거버넌스 참여</li></ul><h3>신청 방법</h3><p>공식 웹사이트에서 지갑을 연결하고 자격을 확인하세요.</p>',
'Arbitrum 에어드랍 자격 확인 및 신청 방법을 알아보세요.',
NULL,
'https://images.unsplash.com/photo-1621504450181-5d356f61d307?w=800&q=80',
true),

('zkSync 에어드랍 루머 총정리', 'airdrop', 'external',
NULL,
'zkSync 에어드랍 관련 최신 정보와 준비 방법을 확인하세요.',
'https://cryptonews.com/zksync-airdrop-guide',
'https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=800&q=80',
false),

('LayerZero 에어드랍 준비하기', 'airdrop', 'internal',
'<h2>LayerZero 에어드랍 대비</h2><p>크로스체인 프로토콜 LayerZero의 예상 에어드랍을 준비하는 방법입니다.</p><h3>추천 활동</h3><ul><li>Stargate Finance 이용</li><li>다양한 체인 간 브릿지 사용</li><li>프로토콜 정기적 이용</li></ul>',
'LayerZero 에어드랍을 대비한 준비 방법을 소개합니다.',
NULL,
'https://images.unsplash.com/photo-1640340434855-6084b1f4901c?w=800&q=80',
false);