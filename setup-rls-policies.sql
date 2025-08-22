-- =============================================
-- Supabase Row Level Security (RLS) Policies
-- =============================================
-- This script sets up secure RLS policies to prevent unauthorized access
-- Run this in your Supabase SQL editor

-- Enable RLS on all tables
ALTER TABLE exchange_exchanges ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Create admin_users table if not exists
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create admin_logs table for audit trail
CREATE TABLE IF NOT EXISTS admin_logs (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES admin_users(id),
    action VARCHAR(100) NOT NULL,
    details JSONB,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on new tables
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- =============================================
-- EXCHANGES TABLE POLICIES
-- =============================================

-- Public read access for exchanges
CREATE POLICY "Public can view active exchanges" 
ON exchange_exchanges FOR SELECT 
USING (is_active = true);

-- Only service role can insert/update/delete
CREATE POLICY "Service role manages exchanges" 
ON exchange_exchanges FOR ALL 
USING (auth.jwt() ->> 'role' = 'service_role');

-- =============================================
-- FAQS TABLE POLICIES
-- =============================================

-- Public read access for FAQs
CREATE POLICY "Public can view FAQs" 
ON exchange_faqs FOR SELECT 
USING (true);

-- Only service role can manage FAQs
CREATE POLICY "Service role manages FAQs" 
ON exchange_faqs FOR ALL 
USING (auth.jwt() ->> 'role' = 'service_role');

-- =============================================
-- SITE_DATA TABLE POLICIES
-- =============================================

-- Public read access for page contents
CREATE POLICY "Public can view page contents" 
ON page_contents FOR SELECT 
USING (true);

-- Only service role can update page contents
CREATE POLICY "Service role manages page contents" 
ON page_contents FOR ALL 
USING (auth.jwt() ->> 'role' = 'service_role');

-- =============================================
-- ARTICLES TABLE POLICIES
-- =============================================

-- Public can view published articles
CREATE POLICY "Public can view published articles" 
ON articles FOR SELECT 
USING (
    is_published = true 
    AND (publish_date IS NULL OR publish_date <= CURRENT_TIMESTAMP)
);

-- Service role has full access
CREATE POLICY "Service role manages articles" 
ON articles FOR ALL 
USING (auth.jwt() ->> 'role' = 'service_role');

-- =============================================
-- ADMIN_SESSIONS TABLE POLICIES
-- =============================================

-- Only service role can access login logs
CREATE POLICY "Service role manages login logs" 
ON login_logs FOR ALL 
USING (auth.jwt() ->> 'role' = 'service_role');

-- =============================================
-- USERS TABLE POLICIES
-- =============================================

-- Admin users can view their own profile
CREATE POLICY "Admin users can view own profile" 
ON admin_users FOR SELECT 
USING (auth.uid() = id);

-- Only service role can manage admin users
CREATE POLICY "Service role manages admin users" 
ON admin_users FOR ALL 
USING (auth.jwt() ->> 'role' = 'service_role');

-- =============================================
-- ADMIN_LOGS TABLE POLICIES
-- =============================================

-- Only service role can access admin logs
CREATE POLICY "Service role manages admin logs" 
ON admin_logs FOR ALL 
USING (auth.jwt() ->> 'role' = 'service_role');

-- =============================================
-- FUNCTIONS FOR ENHANCED SECURITY
-- =============================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admin_users 
        WHERE id = auth.uid() 
        AND role = 'admin' 
        AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log admin actions
CREATE OR REPLACE FUNCTION log_admin_action(
    p_action VARCHAR,
    p_details JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO admin_logs (user_id, action, details)
    VALUES (auth.uid(), p_action, p_details);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMPS
-- =============================================

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables with updated_at column
CREATE TRIGGER update_exchanges_updated_at 
    BEFORE UPDATE ON exchange_exchanges 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_page_contents_updated_at 
    BEFORE UPDATE ON page_contents 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_users_updated_at 
    BEFORE UPDATE ON admin_users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX IF NOT EXISTS idx_exchanges_active ON exchange_exchanges(is_active);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(is_published, publish_date);
CREATE INDEX IF NOT EXISTS idx_admin_logs_user ON admin_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created ON admin_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);

-- =============================================
-- GRANT MINIMAL PERMISSIONS
-- =============================================

-- Revoke all default permissions
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;

-- Grant only necessary permissions to anon role (unauthenticated users)
GRANT SELECT ON exchange_exchanges TO anon;
GRANT SELECT ON exchange_faqs TO anon;
GRANT SELECT ON page_contents TO anon;
GRANT SELECT ON articles TO anon;

-- No permissions for authenticated role (handled by service role)
-- All write operations must go through the API server

-- =============================================
-- SECURITY NOTICES
-- =============================================

COMMENT ON SCHEMA public IS 
'CoinPass public schema with RLS enabled. All write operations must go through the API server with service role key.';

COMMENT ON TABLE exchange_exchanges IS 
'Exchange information table. Public read, service role write only.';

COMMENT ON TABLE admin_users IS 
'Admin user accounts table. Protected by RLS, managed by service role only.';

COMMENT ON TABLE admin_logs IS 
'Audit trail for admin actions. Service role access only.';

-- =============================================
-- VERIFY RLS IS ENABLED
-- =============================================

-- Query to verify RLS is enabled on all tables
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- This should show rowsecurity = true for all tables