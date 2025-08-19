-- SQL script to check and fix RLS policies for articles table
-- Run this in Supabase SQL Editor

-- 1. Check current RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'articles';

-- 2. Enable RLS on articles table (if not already enabled)
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing SELECT policies that might be blocking
DROP POLICY IF EXISTS "Allow anonymous read access to published articles" ON articles;
DROP POLICY IF EXISTS "Allow public read access to articles" ON articles;
DROP POLICY IF EXISTS "Enable read access for all users" ON articles;

-- 4. Create a permissive policy for anonymous users to read ALL articles
-- This is needed for the frontend to filter client-side
CREATE POLICY "Enable read access for all users" 
ON articles FOR SELECT 
USING (true);

-- 5. Verify the articles table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_name = 'articles'
ORDER BY ordinal_position;

-- 6. Check if there are any pinned articles in the database
SELECT 
    id,
    title,
    is_pinned,
    is_published,
    created_at
FROM articles
WHERE is_pinned = true
ORDER BY created_at DESC;

-- 7. If no pinned articles exist, create a test one
-- Uncomment and run if needed:
/*
INSERT INTO articles (
    title,
    category,
    content_type,
    content,
    excerpt,
    author,
    is_pinned,
    is_published,
    view_count
) VALUES (
    'Test Pinned Article - Delete Me',
    'guide',
    'internal',
    'This is a test article to verify pinned functionality works',
    'Test excerpt for pinned article',
    'System Test',
    true,
    true,
    0
);
*/

-- 8. Verify the data types are correct (boolean not string)
SELECT 
    id,
    title,
    is_pinned::text as pinned_as_text,
    is_published::text as published_as_text,
    pg_typeof(is_pinned) as pinned_type,
    pg_typeof(is_published) as published_type
FROM articles
LIMIT 5;