// Debug script to test pinned articles fetching
import { supabase } from './supabaseClient.js';

async function debugPinnedArticles() {
    console.log('=== DEBUGGING PINNED ARTICLES ===');
    console.log('Supabase client status:', supabase ? 'initialized' : 'not initialized');
    
    if (!supabase) {
        console.error('Supabase client is not initialized. Check environment variables.');
        return;
    }
    
    try {
        // Test 1: Fetch all articles
        console.log('\n1. Fetching ALL articles:');
        const { data: allArticles, error: allError } = await supabase
            .from('articles')
            .select('id, title, is_pinned, is_published, created_at')
            .order('created_at', { ascending: false });
        
        if (allError) {
            console.error('Error fetching all articles:', allError);
        } else {
            console.log(`Total articles: ${allArticles?.length || 0}`);
            console.log('Sample articles:', allArticles?.slice(0, 3));
        }
        
        // Test 2: Fetch pinned articles
        console.log('\n2. Fetching PINNED articles:');
        const { data: pinnedArticles, error: pinnedError } = await supabase
            .from('articles')
            .select('*')
            .eq('is_pinned', true)
            .eq('is_published', true)
            .order('created_at', { ascending: false });
        
        if (pinnedError) {
            console.error('Error fetching pinned articles:', pinnedError);
        } else {
            console.log(`Pinned articles found: ${pinnedArticles?.length || 0}`);
            if (pinnedArticles && pinnedArticles.length > 0) {
                console.log('Pinned articles:', pinnedArticles.map(a => ({
                    id: a.id,
                    title: a.title,
                    is_pinned: a.is_pinned,
                    is_published: a.is_published
                })));
            }
        }
        
        // Test 3: Check RLS policies by attempting anonymous access
        console.log('\n3. Testing anonymous access (RLS check):');
        const { data: anonData, error: anonError } = await supabase
            .from('articles')
            .select('id, title, is_pinned')
            .eq('is_pinned', true)
            .limit(1);
        
        if (anonError) {
            console.error('RLS might be blocking anonymous access:', anonError);
        } else {
            console.log('Anonymous access successful, data:', anonData);
        }
        
        // Test 4: Count pinned vs unpinned
        console.log('\n4. Article statistics:');
        const { count: pinnedCount } = await supabase
            .from('articles')
            .select('*', { count: 'exact', head: true })
            .eq('is_pinned', true);
        
        const { count: unpinnedCount } = await supabase
            .from('articles')
            .select('*', { count: 'exact', head: true })
            .eq('is_pinned', false);
        
        const { count: publishedCount } = await supabase
            .from('articles')
            .select('*', { count: 'exact', head: true })
            .eq('is_published', true);
        
        console.log(`Pinned articles: ${pinnedCount || 0}`);
        console.log(`Unpinned articles: ${unpinnedCount || 0}`);
        console.log(`Published articles: ${publishedCount || 0}`);
        
        // Test 5: Direct SQL query (if RLS allows)
        console.log('\n5. Testing with different filter combinations:');
        
        // Just is_pinned
        const { data: justPinned, error: justPinnedError } = await supabase
            .from('articles')
            .select('id, title, is_pinned, is_published')
            .eq('is_pinned', true);
        
        console.log('Just is_pinned=true:', justPinned?.length || 0, 'articles');
        if (justPinnedError) console.error('Error:', justPinnedError);
        
        // Just is_published
        const { data: justPublished } = await supabase
            .from('articles')
            .select('id, title, is_pinned, is_published')
            .eq('is_published', true);
        
        console.log('Just is_published=true:', justPublished?.length || 0, 'articles');
        
        // Both conditions
        const { data: bothConditions } = await supabase
            .from('articles')
            .select('id, title, is_pinned, is_published')
            .eq('is_pinned', true)
            .eq('is_published', true);
        
        console.log('Both is_pinned=true AND is_published=true:', bothConditions?.length || 0, 'articles');
        
    } catch (error) {
        console.error('Unexpected error during debugging:', error);
    }
}

// Run the debug function
debugPinnedArticles();