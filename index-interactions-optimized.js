// Optimized Testimonial Carousel with Performance Improvements
function initTestimonialCarousel() {
    const cards = document.querySelectorAll('.testimonial-card');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.nav-btn.prev');
    const nextBtn = document.querySelector('.nav-btn.next');
    
    if (!cards.length) return;
    
    let currentIndex = 0;
    let autoRotateTimer = null;
    let isPageVisible = true;
    let isUserInteracting = false;
    
    // Use transform instead of class changes for better performance
    function showCard(index) {
        // Use requestAnimationFrame for smooth animations
        requestAnimationFrame(() => {
            cards.forEach((card, i) => {
                const isActive = i === index;
                card.classList.toggle('active', isActive);
                // Use transform for hardware acceleration
                card.style.transform = isActive ? 'translateX(0)' : 'translateX(100%)';
                card.style.opacity = isActive ? '1' : '0';
            });
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === index);
            });
        });
    }
    
    function nextCard() {
        currentIndex = (currentIndex + 1) % cards.length;
        showCard(currentIndex);
    }
    
    function prevCard() {
        currentIndex = (currentIndex - 1 + cards.length) % cards.length;
        showCard(currentIndex);
    }
    
    // Pause auto-rotation on user interaction
    function pauseAutoRotation() {
        isUserInteracting = true;
        clearInterval(autoRotateTimer);
        // Resume after 10 seconds of no interaction
        setTimeout(() => {
            isUserInteracting = false;
            if (isPageVisible) startAutoRotation();
        }, 10000);
    }
    
    // Optimized auto-rotation with visibility check
    function startAutoRotation() {
        if (!isPageVisible || isUserInteracting) return;
        
        clearInterval(autoRotateTimer);
        autoRotateTimer = setInterval(() => {
            if (isPageVisible && !isUserInteracting) {
                nextCard();
            }
        }, 5000);
    }
    
    // Page Visibility API to pause when not visible
    document.addEventListener('visibilitychange', () => {
        isPageVisible = !document.hidden;
        if (isPageVisible && !isUserInteracting) {
            startAutoRotation();
        } else {
            clearInterval(autoRotateTimer);
        }
    });
    
    // Intersection Observer to pause when not in viewport
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && isPageVisible && !isUserInteracting) {
                startAutoRotation();
            } else {
                clearInterval(autoRotateTimer);
            }
        });
    }, { threshold: 0.5 });
    
    const carouselContainer = document.querySelector('.testimonials-carousel');
    if (carouselContainer) {
        observer.observe(carouselContainer);
    }
    
    // Event listeners with interaction tracking
    nextBtn?.addEventListener('click', () => {
        pauseAutoRotation();
        nextCard();
    });
    
    prevBtn?.addEventListener('click', () => {
        pauseAutoRotation();
        prevCard();
    });
    
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            pauseAutoRotation();
            currentIndex = index;
            showCard(currentIndex);
        });
    });
    
    // Touch/swipe optimization with passive listeners
    let touchStartX = 0;
    const carousel = document.querySelector('.testimonials-carousel');
    
    carousel?.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        pauseAutoRotation();
    }, { passive: true });
    
    carousel?.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].clientX;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                nextCard();
            } else {
                prevCard();
            }
        }
    }, { passive: true });
    
    // Initialize
    showCard(0);
    startAutoRotation();
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        clearInterval(autoRotateTimer);
    });
}

// Optimized Savings Calculator with debouncing
function initSavingsCalculator() {
    const volumeInput = document.getElementById('trading-volume');
    const exchangeSelect = document.getElementById('exchange-select');
    const monthlySavings = document.getElementById('monthly-savings');
    const yearlySavings = document.getElementById('yearly-savings');
    const originalFee = document.getElementById('original-fee');
    const discountedFee = document.getElementById('discounted-fee');
    const discountedBar = document.querySelector('.bar-fill.discounted');
    
    if (!volumeInput || !exchangeSelect) return;
    
    const exchangeRates = {
        binance: { original: 0.001, discounted: 0.0005, discount: 50 },
        bybit: { original: 0.001, discounted: 0.00055, discount: 45 },
        okx: { original: 0.0008, discounted: 0.0005, discount: 38 },
        mexc: { original: 0.001, discounted: 0.0006, discount: 40 },
        gate: { original: 0.00075, discounted: 0.0005, discount: 33 }
    };
    
    // Cache formatter for better performance
    const numberFormatter = new Intl.NumberFormat('ko-KR');
    const formatNumber = (num) => numberFormatter.format(num);
    const formatCurrency = (num) => `₩${formatNumber(Math.round(num))}`;
    
    function parseVolume(value) {
        return parseFloat(value.replace(/[^0-9]/g, '')) || 0;
    }
    
    // Optimized calculate function with requestAnimationFrame
    function calculate() {
        requestAnimationFrame(() => {
            const volume = parseVolume(volumeInput.value);
            const exchange = exchangeSelect.value;
            const rates = exchangeRates[exchange];
            
            const originalMonthly = volume * rates.original;
            const discountedMonthly = volume * rates.discounted;
            const savedMonthly = originalMonthly - discountedMonthly;
            const savedYearly = savedMonthly * 12;
            
            // Batch DOM updates
            monthlySavings.textContent = formatCurrency(savedMonthly);
            yearlySavings.textContent = formatCurrency(savedYearly);
            originalFee.textContent = formatCurrency(originalMonthly);
            discountedFee.textContent = formatCurrency(discountedMonthly);
            
            // Use CSS transform for smoother animation
            const barWidth = (100 - rates.discount);
            discountedBar.style.transform = `scaleX(${barWidth / 100})`;
            discountedBar.style.transformOrigin = 'left';
        });
    }
    
    // Debounce function for input events
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Format input with debounced calculation
    const debouncedCalculate = debounce(calculate, 250);
    
    volumeInput.addEventListener('input', (e) => {
        const value = parseVolume(e.target.value);
        if (value) {
            e.target.value = formatNumber(value);
        }
        debouncedCalculate();
    });
    
    exchangeSelect.addEventListener('change', calculate);
    
    // Initial calculation
    calculate();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initTestimonialCarousel();
        initSavingsCalculator();
    });
} else {
    initTestimonialCarousel();
    initSavingsCalculator();
}