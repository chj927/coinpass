-- =============================================
-- Supabase Row Level Security (RLS) - Read-Only Policies
-- =============================================
-- This script sets up RLS policies for public read-only access
-- Run this in your Supabase SQL editor

-- =============================================
-- ENABLE RLS ON ALL TABLES
-- =============================================

ALTER TABLE exchange_exchanges ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_logs ENABLE ROW LEVEL SECURITY;

-- =============================================
-- DROP EXISTING POLICIES (Clean slate)
-- =============================================

-- Drop all existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public can view active exchanges" ON exchange_exchanges;
DROP POLICY IF EXISTS "Public can view exchanges" ON exchange_exchanges;
DROP POLICY IF EXISTS "Service role manages exchanges" ON exchange_exchanges;
DROP POLICY IF EXISTS "No public write" ON exchange_exchanges;

DROP POLICY IF EXISTS "Public can view FAQs" ON exchange_faqs;
DROP POLICY IF EXISTS "Service role manages FAQs" ON exchange_faqs;

DROP POLICY IF EXISTS "Public can view site data" ON page_contents;
DROP POLICY IF EXISTS "Service role manages site data" ON page_contents;

DROP POLICY IF EXISTS "Public can view published articles" ON articles;
DROP POLICY IF EXISTS "Service role manages articles" ON articles;

-- =============================================
-- EXCHANGE_EXCHANGES TABLE POLICIES
-- =============================================

-- Public can read all exchanges (no restrictions for now)
CREATE POLICY "exchanges_public_read" 
ON exchange_exchanges FOR SELECT 
USING (true);

-- Block all public writes
CREATE POLICY "exchanges_no_public_insert" 
ON exchange_exchanges FOR INSERT 
USING (false);

CREATE POLICY "exchanges_no_public_update" 
ON exchange_exchanges FOR UPDATE 
USING (false);

CREATE POLICY "exchanges_no_public_delete" 
ON exchange_exchanges FOR DELETE 
USING (false);

-- =============================================
-- EXCHANGE_FAQS TABLE POLICIES
-- =============================================

-- Public can read all FAQs
CREATE POLICY "faqs_public_read" 
ON exchange_faqs FOR SELECT 
USING (true);

-- Block all public writes
CREATE POLICY "faqs_no_public_insert" 
ON exchange_faqs FOR INSERT 
USING (false);

CREATE POLICY "faqs_no_public_update" 
ON exchange_faqs FOR UPDATE 
USING (false);

CREATE POLICY "faqs_no_public_delete" 
ON exchange_faqs FOR DELETE 
USING (false);

-- =============================================
-- PAGE_CONTENTS TABLE POLICIES
-- =============================================

-- Public can read all page contents
CREATE POLICY "page_contents_public_read" 
ON page_contents FOR SELECT 
USING (true);

-- Block all public writes
CREATE POLICY "page_contents_no_public_insert" 
ON page_contents FOR INSERT 
USING (false);

CREATE POLICY "page_contents_no_public_update" 
ON page_contents FOR UPDATE 
USING (false);

CREATE POLICY "page_contents_no_public_delete" 
ON page_contents FOR DELETE 
USING (false);

-- =============================================
-- ARTICLES TABLE POLICIES
-- =============================================

-- Public can read published articles only
CREATE POLICY "articles_public_read" 
ON articles FOR SELECT 
USING (
    is_published = true 
    AND (publish_date IS NULL OR publish_date <= CURRENT_TIMESTAMP)
);

-- Block all public writes
CREATE POLICY "articles_no_public_insert" 
ON articles FOR INSERT 
USING (false);

CREATE POLICY "articles_no_public_update" 
ON articles FOR UPDATE 
USING (false);

CREATE POLICY "articles_no_public_delete" 
ON articles FOR DELETE 
USING (false);

-- =============================================
-- ADMIN_USERS TABLE POLICIES
-- =============================================

-- No public access to admin users table
CREATE POLICY "admin_users_no_public_read" 
ON admin_users FOR SELECT 
USING (false);

CREATE POLICY "admin_users_no_public_insert" 
ON admin_users FOR INSERT 
USING (false);

CREATE POLICY "admin_users_no_public_update" 
ON admin_users FOR UPDATE 
USING (false);

CREATE POLICY "admin_users_no_public_delete" 
ON admin_users FOR DELETE 
USING (false);

-- =============================================
-- LOGIN_LOGS TABLE POLICIES
-- =============================================

-- No public access to login logs
CREATE POLICY "login_logs_no_public_read" 
ON login_logs FOR SELECT 
USING (false);

CREATE POLICY "login_logs_no_public_insert" 
ON login_logs FOR INSERT 
USING (false);

CREATE POLICY "login_logs_no_public_update" 
ON login_logs FOR UPDATE 
USING (false);

CREATE POLICY "login_logs_no_public_delete" 
ON login_logs FOR DELETE 
USING (false);

-- =============================================
-- GRANT MINIMAL PERMISSIONS
-- =============================================

-- Revoke all default permissions
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;

-- Grant only necessary SELECT permissions to anon role
GRANT SELECT ON exchange_exchanges TO anon;
GRANT SELECT ON exchange_faqs TO anon;
GRANT SELECT ON page_contents TO anon;
GRANT SELECT ON articles TO anon;

-- No permissions for admin tables
-- admin_users and login_logs remain completely blocked

-- =============================================
-- VERIFY RLS IS ENABLED
-- =============================================

-- Query to verify RLS is enabled on all tables
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    CASE 
        WHEN rowsecurity = true THEN '✅ Protected'
        ELSE '❌ Unprotected'
    END as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
    'exchange_exchanges',
    'exchange_faqs', 
    'page_contents',
    'articles',
    'admin_users',
    'login_logs'
)
ORDER BY tablename;

-- =============================================
-- TEST QUERIES (Run these to verify policies work)
-- =============================================

-- These should work (return data):
-- SELECT * FROM exchange_exchanges;
-- SELECT * FROM exchange_faqs;
-- SELECT * FROM page_contents;
-- SELECT * FROM articles WHERE is_published = true;

-- These should fail (permission denied):
-- INSERT INTO exchange_exchanges (name_ko) VALUES ('test');
-- UPDATE exchange_exchanges SET name_ko = 'test' WHERE id = 1;
-- DELETE FROM exchange_exchanges WHERE id = 1;
-- SELECT * FROM admin_users;
-- SELECT * FROM login_logs;