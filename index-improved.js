// CoinPass Improved Index Page JavaScript
// Modern interactions and animations

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all components
    initTypewriter();
    initScrollAnimations();
    initCounterAnimations();
    initPageProgress();
    initMobileMenu();
    initThemeToggle();
    initExchangeLogos();
    initParticles();
});

// Typewriter Effect
function initTypewriter() {
    const typewriter = document.querySelector('.typewriter');
    if (!typewriter) return;
    
    const words = JSON.parse(typewriter.dataset.words || '[]');
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeSpeed = 100;
    
    function type() {
        const currentWord = words[wordIndex];
        
        if (isDeleting) {
            typewriter.textContent = currentWord.substring(0, charIndex - 1);
            charIndex--;
            typeSpeed = 50;
        } else {
            typewriter.textContent = currentWord.substring(0, charIndex + 1);
            charIndex++;
            typeSpeed = 100;
        }
        
        if (!isDeleting && charIndex === currentWord.length) {
            typeSpeed = 2000; // Pause at end
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            typeSpeed = 500; // Pause before new word
        }
        
        setTimeout(type, typeSpeed);
    }
    
    type();
}

// Scroll Animations
function initScrollAnimations() {
    const reveals = document.querySelectorAll('.reveal');
    
    const revealOnScroll = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    reveals.forEach(element => {
        revealOnScroll.observe(element);
    });
}

// Counter Animations
function initCounterAnimations() {
    const counters = document.querySelectorAll('[data-counter]');
    
    const countUp = (element) => {
        const target = parseInt(element.dataset.counter);
        const duration = 2000; // 2 seconds
        const increment = target / (duration / 16); // 60fps
        let current = 0;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current);
            }
        }, 16);
    };
    
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                countUp(entry.target);
                entry.target.classList.add('counted');
            }
        });
    }, {
        threshold: 0.5
    });
    
    counters.forEach(counter => {
        counterObserver.observe(counter);
    });
}

// Page Progress Indicator
function initPageProgress() {
    const progressBar = document.querySelector('.page-progress');
    if (!progressBar) return;
    
    const updateProgress = () => {
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPosition = window.scrollY;
        const progress = (scrollPosition / scrollHeight) * 100;
        progressBar.style.width = `${progress}%`;
    };
    
    window.addEventListener('scroll', updateProgress);
    updateProgress();
}

// Mobile Menu
function initMobileMenu() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navList = document.querySelector('.nav-list');
    
    const toggleMenu = () => {
        navList?.classList.toggle('mobile-active');
        menuToggle?.classList.toggle('active');
    };
    
    menuToggle?.addEventListener('click', toggleMenu);
    mobileMenuBtn?.addEventListener('click', toggleMenu);
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.header-modern') && navList?.classList.contains('mobile-active')) {
            navList.classList.remove('mobile-active');
            menuToggle?.classList.remove('active');
        }
    });
}

// Exchange Logos Hover Effects
function initExchangeLogos() {
    const logos = document.querySelectorAll('.exchange-logo');
    
    logos.forEach((logo, index) => {
        // Add staggered entrance animation
        logo.style.animationDelay = `${index * 0.1}s`;
        
        // Add hover tooltip
        logo.addEventListener('mouseenter', (e) => {
            const tooltip = document.createElement('div');
            tooltip.className = 'logo-tooltip';
            tooltip.textContent = logo.getAttribute('title');
            tooltip.style.position = 'absolute';
            tooltip.style.bottom = '70px';
            tooltip.style.left = '50%';
            tooltip.style.transform = 'translateX(-50%)';
            tooltip.style.background = 'var(--bg-elevated)';
            tooltip.style.padding = '8px 12px';
            tooltip.style.borderRadius = '8px';
            tooltip.style.fontSize = '0.75rem';
            tooltip.style.whiteSpace = 'nowrap';
            tooltip.style.zIndex = '10';
            tooltip.style.border = '1px solid var(--border-default)';
            logo.appendChild(tooltip);
        });
        
        logo.addEventListener('mouseleave', () => {
            const tooltip = logo.querySelector('.logo-tooltip');
            if (tooltip) tooltip.remove();
        });
    });
}

// Animated Particles
function initParticles() {
    const particlesContainer = document.querySelector('.particles-container');
    if (!particlesContainer) return;
    
    // Create additional particles dynamically for better effect
    const particleCount = 15;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle-dynamic';
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.animationDelay = `${Math.random() * 20}s`;
        particle.style.animationDuration = `${20 + Math.random() * 10}s`;
        particle.style.width = `${2 + Math.random() * 4}px`;
        particle.style.height = particle.style.width;
        particlesContainer.appendChild(particle);
    }
}

// Enhanced Theme Toggle
function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;
    
    // Load saved theme or default to dark
    const savedTheme = localStorage.getItem('coinpass-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Ensure body has the theme attribute too
    document.body.setAttribute('data-theme', savedTheme);
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        // Add transition class
        document.documentElement.classList.add('theme-transition');
        
        // Change theme on both html and body
        document.documentElement.setAttribute('data-theme', newTheme);
        document.body.setAttribute('data-theme', newTheme);
        localStorage.setItem('coinpass-theme', newTheme);
        
        // Animate button
        themeToggle.style.transform = 'scale(0.9) rotate(180deg)';
        setTimeout(() => {
            themeToggle.style.transform = 'scale(1) rotate(0deg)';
        }, 300);
        
        // Remove transition class
        setTimeout(() => {
            document.documentElement.classList.remove('theme-transition');
        }, 300);
    });
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', (e) => {
        if (!localStorage.getItem('coinpass-theme')) {
            const theme = e.matches ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', theme);
            document.body.setAttribute('data-theme', theme);
        }
    });
}

// Smooth Scroll for Internal Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add theme transition styles
const style = document.createElement('style');
style.textContent = `
    .theme-transition,
    .theme-transition *,
    .theme-transition *::before,
    .theme-transition *::after {
        transition: background-color 300ms ease, 
                    border-color 300ms ease, 
                    color 300ms ease !important;
    }
    
    .mobile-active {
        display: flex !important;
        position: fixed;
        top: 70px;
        left: 0;
        right: 0;
        background: var(--bg-surface);
        border-bottom: 1px solid var(--border-default);
        flex-direction: column;
        padding: var(--spacing-md);
        animation: slideDown 0.3s ease-out;
    }
    
    @keyframes slideDown {
        from {
            transform: translateY(-100%);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);