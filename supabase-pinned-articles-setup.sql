-- Supabase Setup for Pinned Articles
-- Run this in your Supabase SQL editor

-- Create pinned_articles table for managing carousel posts
CREATE TABLE IF NOT EXISTS pinned_articles (
    id SERIAL PRIMARY KEY,
    position INTEGER NOT NULL CHECK (position >= 1 AND position <= 6), -- Position 1-6 in carousel
    badge_text VARCHAR(20) NOT NULL, -- Badge text like "🔥 HOT", "📢 공지"
    badge_type VARCHAR(20) DEFAULT 'hot', -- hot, notice, guide, event, tip
    image_url TEXT NOT NULL, -- Thumbnail image URL
    category VARCHAR(50) NOT NULL, -- Category: event, guide, notice
    category_icon VARCHAR(10) DEFAULT '📢', -- Category icon
    title VARCHAR(200) NOT NULL, -- Article title
    description TEXT NOT NULL, -- Article description
    footer_type VARCHAR(20) DEFAULT 'date', -- Type: date, event_period, views
    footer_text VARCHAR(100), -- Footer text like "~01.31", "조회 5.2K"
    cta_text VARCHAR(50) DEFAULT '자세히 →', -- Call-to-action button text
    link_url TEXT, -- Link to full article or external page
    is_active BOOLEAN DEFAULT true, -- Whether this pinned post is active
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(position) -- Each position can only have one article
);

-- Create an update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_pinned_articles_updated_at 
    BEFORE UPDATE ON pinned_articles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE pinned_articles ENABLE ROW LEVEL SECURITY;

-- Policy for public read access (anyone can view active pinned articles)
CREATE POLICY "Public can read active pinned articles" ON pinned_articles
    FOR SELECT USING (is_active = true);

-- Policy for authenticated admin write access
CREATE POLICY "Authenticated users can manage pinned articles" ON pinned_articles
    FOR ALL USING (auth.role() = 'authenticated');

-- Insert sample data (optional - you can skip this if you want to add via admin panel)
INSERT INTO pinned_articles (position, badge_text, badge_type, image_url, category, category_icon, title, description, footer_type, footer_text, cta_text, link_url) VALUES
(1, '🔥 HOT', 'hot', 'https://via.placeholder.com/400x200/667EEA/ffffff?text=Grand+Opening', 'event', '🎁', '코인패스 그랜드 오픈 이벤트', '지금 가입하시는 모든 분께 거래소 수수료 추가 10% 할인!', 'event_period', '~01.31', '참여하기 →', '#'),
(2, '📢 공지', 'notice', 'https://via.placeholder.com/400x200/F59E0B/ffffff?text=Fee+Update', 'notice', '📢', '2025년 1월 수수료 할인율 업데이트', '바이낸스, 바이비트, OKX 수수료 할인율 대폭 상향!', 'date', '01.14', '자세히 →', '#'),
(3, '📘 가이드', 'guide', 'https://via.placeholder.com/400x200/10B981/ffffff?text=KYC+Guide', 'guide', '📘', '바이낸스 KYC 인증 완벽 가이드', '2025년 변경된 KYC 정책과 빠른 인증 팁 총정리', 'views', '조회 5.2K', '읽기 →', '#')
ON CONFLICT (position) DO NOTHING;