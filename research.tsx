import { supabase } from './supabaseClient';
import { SecurityUtils } from './security-utils';

interface Article {
    id: number;
    title: string;
    content: string;
    category: string;
    project?: string;
    read_time: number;
    created_at: string;
    author: string;
    image_url?: string;
}

let articlesData: Article[] = [];
let filteredArticles: Article[] = [];
let currentFilter = 'all';
let activeCategory = '';
let activeProject = '';

document.addEventListener('DOMContentLoaded', async () => {
    await loadArticles();
    renderArticles();
    setupEventListeners();
});

async function loadArticles() {
    try {
        // 관리자 페이지에서 작성한 포스팅을 localStorage에서 로드
        const savedArticles = localStorage.getItem('coinpass-research-articles');
        if (savedArticles) {
            articlesData = JSON.parse(savedArticles);
        } else {
            // Mock data for demonstration when no articles exist
            articlesData = [
                {
                    id: 1,
                    title: "MegaETH Ecosystem: Where No Limits Exist",
                    content: "Lorem ipsum dolor sit amet...",
                    category: "infra",
                    read_time: 30,
                    created_at: "2025-07-25",
                    author: "c4vin",
                    image_url: ""
                },
                {
                    id: 2,
                    title: "Stable: A Digital Nation of USDT, by USDT, for USDT",
                    content: "Lorem ipsum dolor sit amet...",
                    category: "defi",
                    read_time: 32,
                    created_at: "2025-07-24",
                    author: "100y",
                    image_url: ""
                },
                {
                    id: 3,
                    title: "Layer3: The Final Piece in Web3 Mass Adoption",
                    content: "Lorem ipsum dolor sit amet...",
                    category: "consumer",
                    read_time: 27,
                    created_at: "2025-07-23",
                    author: "Ingeun",
                    image_url: ""
                }
            ];
        }
        
        filteredArticles = [...articlesData];
    } catch (error) {
        console.error('Failed to load articles:', error);
        articlesData = [];
        filteredArticles = [];
    }
}

function setupEventListeners() {
    // Filter tabs
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            const filter = target.getAttribute('data-filter');
            if (filter) {
                setActiveFilter(filter);
            }
        });
    });

    // Category filters
    document.querySelectorAll('[data-category]').forEach(option => {
        option.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            const category = target.getAttribute('data-category');
            if (category) {
                setActiveCategory(category);
            }
        });
    });

    // Project filters
    document.querySelectorAll('[data-project]').forEach(option => {
        option.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            const project = target.getAttribute('data-project');
            if (project) {
                setActiveProject(project);
            }
        });
    });

    setupMobileMenu();
}

function setActiveFilter(filter: string) {
    currentFilter = filter;
    
    // Update UI
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-filter="${filter}"]`)?.classList.add('active');
    
    filterArticles();
}

function setActiveCategory(category: string) {
    activeCategory = activeCategory === category ? '' : category;
    
    // Update UI
    document.querySelectorAll('[data-category]').forEach(option => {
        option.classList.remove('active');
    });
    if (activeCategory) {
        document.querySelector(`[data-category="${category}"]`)?.classList.add('active');
    }
    
    filterArticles();
}

function setActiveProject(project: string) {
    activeProject = activeProject === project ? '' : project;
    
    // Update UI
    document.querySelectorAll('[data-project]').forEach(option => {
        option.classList.remove('active');
    });
    if (activeProject) {
        document.querySelector(`[data-project="${project}"]`)?.classList.add('active');
    }
    
    filterArticles();
}

function filterArticles() {
    filteredArticles = articlesData.filter(article => {
        // Filter by tab (all, project, insights)
        if (currentFilter === 'project' && !article.project) return false;
        if (currentFilter === 'insights' && article.project) return false;
        
        // Filter by category
        if (activeCategory && article.category !== activeCategory) return false;
        
        // Filter by project
        if (activeProject && article.project !== activeProject) return false;
        
        return true;
    });
    
    renderArticles();
}

function renderArticles() {
    const container = document.getElementById('articles-grid');
    if (!container) return;

    const fragment = document.createDocumentFragment();
    
    filteredArticles.forEach(article => {
        const card = document.createElement('div');
        card.className = 'article-card';
        
        const imageSection = document.createElement('div');
        imageSection.className = 'article-image';
        
        if (article.image_url) {
            const img = document.createElement('img');
            img.src = article.image_url;
            img.alt = article.title;
            img.loading = 'lazy';
            imageSection.appendChild(img);
        } else {
            const placeholder = document.createElement('div');
            placeholder.className = 'placeholder-text';
            placeholder.textContent = getPlaceholderText(article.title);
            imageSection.appendChild(placeholder);
        }
        
        const content = document.createElement('div');
        content.className = 'article-content';
        
        // Meta information
        const meta = document.createElement('div');
        meta.className = 'article-meta';
        
        const readTime = document.createElement('span');
        readTime.className = 'article-read-time';
        readTime.textContent = `${article.read_time} min read`;
        
        const date = document.createElement('span');
        date.className = 'article-date';
        date.textContent = formatDate(article.created_at);
        
        meta.appendChild(readTime);
        meta.appendChild(date);
        
        // Title
        const title = document.createElement('h3');
        title.className = 'article-title';
        title.textContent = SecurityUtils.sanitizeHtml(article.title);
        
        // Tags
        const tags = document.createElement('div');
        tags.className = 'article-tags';
        
        const categoryTag = document.createElement('span');
        categoryTag.className = `article-tag ${article.category}`;
        categoryTag.textContent = article.category.charAt(0).toUpperCase() + article.category.slice(1);
        tags.appendChild(categoryTag);
        
        if (article.project) {
            const projectTag = document.createElement('span');
            projectTag.className = 'article-tag project';
            projectTag.textContent = article.project;
            tags.appendChild(projectTag);
        }
        
        // Author
        const author = document.createElement('div');
        author.className = 'article-author';
        
        const avatar = document.createElement('div');
        avatar.className = 'author-avatar';
        avatar.textContent = getAuthorInitials(article.author);
        
        const name = document.createElement('span');
        name.className = 'author-name';
        name.textContent = article.author;
        
        author.appendChild(avatar);
        author.appendChild(name);
        
        content.appendChild(meta);
        content.appendChild(title);
        content.appendChild(tags);
        content.appendChild(author);
        
        card.appendChild(imageSection);
        card.appendChild(content);
        fragment.appendChild(card);
    });
    
    container.innerHTML = '';
    container.appendChild(fragment);
}

function getPlaceholderText(title: string): string {
    const words = title.split(' ');
    return words.length > 0 ? words[0] : 'Article';
}

function getAuthorInitials(author: string): string {
    const names = author.split(/[,\s]+/);
    return names.map(name => name.charAt(0).toUpperCase()).join('').slice(0, 2);
}

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
    });
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
    nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            hamburgerBtn.classList.remove('is-active');
            nav.classList.remove('is-active');
            hamburgerBtn.setAttribute('aria-expanded', 'false');
        });
    });
}