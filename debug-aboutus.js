// Debug script to check AboutUs data flow
// Run this in browser console on the exchange page

async function debugAboutUs() {
    console.log('=== DEBUGGING ABOUT US SECTION ===');
    
    // Import supabase if not already available
    if (typeof supabase === 'undefined') {
        console.error('Supabase not found. Make sure you are on the exchange page.');
        return;
    }
    
    // 1. Check what's in the database
    console.log('\n1. Checking page_contents table...');
    const { data: allPages, error: pagesError } = await supabase
        .from('page_contents')
        .select('*');
    
    if (pagesError) {
        console.error('Error fetching page_contents:', pagesError);
        return;
    }
    
    console.log('All page_contents entries:');
    allPages.forEach(page => {
        console.log(`  - page_type: "${page.page_type}", has content: ${!!page.content}`);
        if (page.page_type === 'aboutUs' || page.page_type === 'about-us' || page.page_type === 'about_us') {
            console.log('    Found AboutUs! Content:', page.content);
        }
    });
    
    // 2. Check specific aboutUs query
    console.log('\n2. Querying specifically for aboutUs...');
    const { data: aboutUsData, error: aboutUsError } = await supabase
        .from('page_contents')
        .select('*')
        .eq('page_type', 'aboutUs')
        .single();
    
    if (aboutUsError) {
        console.log('No aboutUs entry found. Error:', aboutUsError);
        
        // Try alternative formats
        console.log('\n3. Trying alternative formats...');
        const alternatives = ['about-us', 'about_us', 'aboutus', 'ABOUTUS'];
        for (const alt of alternatives) {
            const { data, error } = await supabase
                .from('page_contents')
                .select('*')
                .eq('page_type', alt)
                .single();
            
            if (data) {
                console.log(`  Found with page_type="${alt}":`, data);
            }
        }
    } else {
        console.log('AboutUs data found:', aboutUsData);
    }
    
    // 3. Check DOM elements
    console.log('\n4. Checking DOM elements...');
    const titleEl = document.getElementById('about-us-title');
    const contentEl = document.getElementById('about-us-content');
    
    console.log('  Title element exists:', !!titleEl);
    console.log('  Content element exists:', !!contentEl);
    
    if (titleEl) {
        console.log('  Current title text:', titleEl.textContent);
    }
    if (contentEl) {
        console.log('  Current content text:', contentEl.textContent?.substring(0, 100) + '...');
    }
    
    // 4. Try to manually update the section
    if (aboutUsData && aboutUsData.content) {
        console.log('\n5. Manually updating AboutUs section...');
        
        if (titleEl && aboutUsData.content.title) {
            titleEl.textContent = aboutUsData.content.title;
            console.log('  Title updated to:', aboutUsData.content.title);
        }
        
        if (contentEl && aboutUsData.content.content) {
            contentEl.innerHTML = '';
            const paragraphs = aboutUsData.content.content.split(/\n\s*\n/).filter(p => p.trim());
            paragraphs.forEach(text => {
                const p = document.createElement('p');
                p.textContent = text;
                contentEl.appendChild(p);
            });
            console.log('  Content updated with', paragraphs.length, 'paragraphs');
        }
    }
    
    console.log('\n=== DEBUGGING COMPLETE ===');
    console.log('If AboutUs is still not showing:');
    console.log('1. Check if aboutUs data exists in page_contents table');
    console.log('2. Verify the page_type is exactly "aboutUs"');
    console.log('3. Check if content is properly formatted JSON');
    console.log('4. Try saving again from admin panel');
}

// Run the debug function
debugAboutUs();