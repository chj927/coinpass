import { supabase } from './supabaseClient';

document.addEventListener('DOMContentLoaded', async () => {
    await loadBannerContent();
    setupEventListeners();
    // Placeholder for future price comparison functionality
    initializePriceComparison();
});

async function loadBannerContent() {
    try {
        const { data: bannerData, error } = await supabase
            .from('banners')
            .select('*')
            .eq('page', 'compare')
            .eq('enabled', true)
            .single();

        const bannerContainer = document.getElementById('banner-content');
        if (!bannerContainer) return;

        if (error || !bannerData) {
            bannerContainer.style.display = 'none';
            return;
        }

        if (bannerData.image_url) {
            const img = document.createElement('img');
            img.src = bannerData.image_url;
            img.alt = '시세비교 배너';
            img.loading = 'lazy';
            bannerContainer.appendChild(img);
        } else if (bannerData.content) {
            const div = document.createElement('div');
            div.className = 'banner-text';
            div.textContent = bannerData.content;
            bannerContainer.appendChild(div);
        } else {
            bannerContainer.style.display = 'none';
        }
    } catch (error) {
        console.error('Failed to load banner content:', error);
        const bannerContainer = document.getElementById('banner-content');
        if (bannerContainer) {
            bannerContainer.style.display = 'none';
        }
    }
}

function setupEventListeners() {
    setupMobileMenu();
    setupSearchAndFilters();
}

function setupSearchAndFilters() {
    const searchInput = document.getElementById('coin-search') as HTMLInputElement;
    const sortSelect = document.getElementById('sort-by') as HTMLSelectElement;
    
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
    
    if (sortSelect) {
        sortSelect.addEventListener('change', handleSort);
    }
}

function handleSearch(event: Event) {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    // TODO: Implement search functionality when real data is available
    // Search functionality - TODO: implement filtering logic
}

function handleSort(event: Event) {
    const sortBy = (event.target as HTMLSelectElement).value;
    // TODO: Implement sort functionality when real data is available
    // Sort functionality - TODO: implement sorting logic
}

function initializePriceComparison() {
    // TODO: This will be implemented when exchange APIs are integrated
    // For now, we show the coming soon message
    
    // Placeholder data structure for future implementation
    const mockData = [
        {
            symbol: 'BTC',
            name: 'Bitcoin',
            prices: {
                binance: 0,
                bybit: 0,
                okx: 0,
                upbit: 0,
                bithumb: 0
            },
            premium: 0,
            volume: 0
        }
    ];
    
    // Price comparison initialized with placeholder data
}

function setupMobileMenu() {
    const hamburgerBtn = document.querySelector('.hamburger-button');
    const nav = document.getElementById('main-nav');
    
    if (!hamburgerBtn || !nav) return;
    
    hamburgerBtn.addEventListener('click', () => {
        const isActive = hamburgerBtn.classList.toggle('is-active');
        nav.classList.toggle('is-active', isActive);
        hamburgerBtn.setAttribute('aria-expanded', isActive.toString());
    });
    
    // Close menu when clicking nav links
    nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            hamburgerBtn.classList.remove('is-active');
            nav.classList.remove('is-active');
            hamburgerBtn.setAttribute('aria-expanded', 'false');
        });
    });
}