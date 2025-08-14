import { supabase } from './supabaseClient';

interface PinnedArticle {
    id?: number;
    position: number;
    badge_text: string;
    badge_type: string;
    image_url: string;
    category: string;
    category_icon: string;
    title: string;
    description: string;
    footer_type: string;
    footer_text: string;
    cta_text: string;
    link_url: string;
    is_active: boolean;
}

// Load pinned articles from database
async function loadPinnedArticles() {
    try {
        const { data: articles, error } = await supabase
            .from('pinned_articles')
            .select('*')
            .eq('is_active', true)
            .order('position');
        
        if (error) {
            console.error('Error loading pinned articles:', error);
            return [];
        }
        
        return articles || [];
    } catch (error) {
        console.error('Failed to load pinned articles:', error);
        return [];
    }
}

// Render pinned article HTML
function renderPinnedArticle(article: PinnedArticle): string {
    return `
        <article class="pinned-item" data-pinned-id="${article.position}">
            <div class="pinned-badge">${article.badge_text}</div>
            <div class="pinned-image">
                <img src="${article.image_url}" alt="${article.title}" loading="lazy">
            </div>
            <div class="pinned-content">
                <div class="pinned-category">${article.category_icon} ${getCategoryLabel(article.category)}</div>
                <h3>${article.title}</h3>
                <p>${article.description}</p>
                <div class="pinned-footer">
                    <span class="${article.footer_type}">${article.footer_text}</span>
                    <button class="pinned-cta" onclick="window.location.href='${article.link_url}'">${article.cta_text}</button>
                </div>
            </div>
        </article>
    `;
}

// Get category label in Korean
function getCategoryLabel(category: string): string {
    const labels: { [key: string]: string } = {
        'event': '이벤트',
        'guide': '가이드',
        'notice': '공지사항'
    };
    return labels[category] || category;
}

// Calculate number of indicators needed
function calculateIndicators(totalItems: number, itemsPerView: number): number {
    return Math.ceil(totalItems / itemsPerView);
}

// Initialize carousel with dynamic data
async function initializeCarousel() {
    const articles = await loadPinnedArticles();
    const carouselTrack = document.querySelector('.carousel-track');
    const indicatorsContainer = document.querySelector('.carousel-indicators');
    
    if (!carouselTrack || !indicatorsContainer) return;
    
    // Clear existing content
    carouselTrack.innerHTML = '';
    indicatorsContainer.innerHTML = '';
    
    // Render articles
    if (articles.length === 0) {
        // Show placeholder if no articles
        carouselTrack.innerHTML = `
            <div class="no-pinned-articles">
                <p>현재 등록된 고정 게시물이 없습니다.</p>
            </div>
        `;
        return;
    }
    
    // Render each article
    articles.forEach(article => {
        carouselTrack.innerHTML += renderPinnedArticle(article);
    });
    
    // Calculate and render indicators
    const itemsPerView = getItemsPerView();
    const numIndicators = calculateIndicators(articles.length, itemsPerView);
    
    for (let i = 0; i < numIndicators; i++) {
        const indicator = document.createElement('span');
        indicator.className = i === 0 ? 'indicator active' : 'indicator';
        indicator.dataset.index = i.toString();
        indicatorsContainer.appendChild(indicator);
    }
    
    // Re-initialize carousel controls
    reinitializeCarouselControls(articles.length);
}

// Get items per view based on screen size
function getItemsPerView(): number {
    if (window.innerWidth <= 768) return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
}

// Reinitialize carousel controls after loading data
function reinitializeCarouselControls(totalItems: number) {
    // Update carousel object with actual data
    const carousel = (window as any).carousel;
    if (carousel) {
        carousel.totalItems = totalItems;
        carousel.indicators = document.querySelectorAll('.indicator');
        carousel.currentIndex = 0;
        
        // Update carousel display
        if (carousel.updateCarousel) {
            carousel.updateCarousel();
        }
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeCarousel();
    
    // Reinitialize on window resize
    let resizeTimeout: NodeJS.Timeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            initializeCarousel();
        }, 250);
    });
});

export {};