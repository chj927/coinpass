-- Check ENUM values for page_type column

-- 1. Get ENUM type values
SELECT 
    t.typname AS enum_name,
    e.enumlabel AS enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
WHERE t.typname = 'page_type';

-- 2. Check all existing page_contents
SELECT page_type, 
       content IS NOT NULL as has_content,
       created_at
FROM page_contents
ORDER BY page_type;

-- 3. Check if 'about' or similar exists
SELECT * FROM page_contents 
WHERE page_type IN ('about', 'about_us', 'about-us', 'service', 'service_intro');

-- 4. Get column information
SELECT 
    column_name,
    data_type,
    udt_name
FROM information_schema.columns
WHERE table_name = 'page_contents' 
AND column_name = 'page_type';

-- 5. SOLUTION 1: If 'about' exists in ENUM, use it
-- Check what values are in the table
SELECT DISTINCT page_type FROM page_contents;

-- 6. SOLUTION 2: Add 'aboutUs' to ENUM (requires admin privileges)
-- ALTER TYPE page_type ADD VALUE 'aboutUs';

-- 7. SOLUTION 3: Use an existing value like 'about' or 'service'
-- Update your code to use the correct value