// Testimonial Carousel
function initTestimonialCarousel() {
    const cards = document.querySelectorAll('.testimonial-card');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.nav-btn.prev');
    const nextBtn = document.querySelector('.nav-btn.next');
    
    if (!cards.length) return;
    
    let currentIndex = 0;
    
    function showCard(index) {
        cards.forEach((card, i) => {
            card.classList.toggle('active', i === index);
        });
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
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
    
    // Event listeners
    nextBtn?.addEventListener('click', nextCard);
    prevBtn?.addEventListener('click', prevCard);
    
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentIndex = index;
            showCard(currentIndex);
        });
    });
    
    // Auto-rotate every 5 seconds
    setInterval(nextCard, 5000);
}

// Savings Calculator
function initSavingsCalculator() {
    const volumeInput = document.getElementById('trading-volume');
    const exchangeSelect = document.getElementById('exchange-select');
    const monthlySavings = document.getElementById('monthly-savings');
    const yearlySavings = document.getElementById('yearly-savings');
    const originalFee = document.getElementById('original-fee');
    const discountedFee = document.getElementById('discounted-fee');
    const discountedBar = document.querySelector('.bar-fill.discounted');
    
    // Debug log
    console.log('Calculator init:', {
        volumeInput: !!volumeInput,
        exchangeSelect: !!exchangeSelect,
        monthlySavings: !!monthlySavings,
        yearlySavings: !!yearlySavings
    });
    
    if (!volumeInput || !exchangeSelect) {
        console.error('Calculator elements not found');
        return;
    }
    
    const exchangeRates = {
        binance: { original: 0.001, discounted: 0.0005, discount: 50 },
        bybit: { original: 0.001, discounted: 0.00055, discount: 45 },
        okx: { original: 0.0008, discounted: 0.0005, discount: 38 },
        mexc: { original: 0.001, discounted: 0.0006, discount: 40 },
        gate: { original: 0.00075, discounted: 0.0005, discount: 33 }
    };
    
    function formatNumber(num) {
        return new Intl.NumberFormat('ko-KR').format(num);
    }
    
    function formatCurrency(num) {
        return `₩${formatNumber(Math.round(num))}`;
    }
    
    function parseVolume(value) {
        return parseFloat(value.replace(/[^0-9]/g, '')) || 0;
    }
    
    function calculate() {
        try {
            const volume = parseVolume(volumeInput.value);
            const exchange = exchangeSelect.value;
            const rates = exchangeRates[exchange];
            
            if (!rates) {
                console.error('Invalid exchange:', exchange);
                return;
            }
            
            const originalMonthly = volume * rates.original;
            const discountedMonthly = volume * rates.discounted;
            const savedMonthly = originalMonthly - discountedMonthly;
            const savedYearly = savedMonthly * 12;
            
            // Update display with null checks
            if (monthlySavings) monthlySavings.textContent = formatCurrency(savedMonthly);
            if (yearlySavings) yearlySavings.textContent = formatCurrency(savedYearly);
            if (originalFee) originalFee.textContent = formatCurrency(originalMonthly);
            if (discountedFee) discountedFee.textContent = formatCurrency(discountedMonthly);
            
            // Update bar width
            if (discountedBar) {
                const barWidth = (100 - rates.discount) + '%';
                discountedBar.style.width = barWidth;
            }
            
            console.log('Calculation complete:', { volume, savedMonthly, savedYearly });
        } catch (error) {
            console.error('Calculator error:', error);
        }
    }
    
    // Format input as user types
    volumeInput.addEventListener('input', (e) => {
        const value = parseVolume(e.target.value);
        if (value > 0) {
            e.target.value = formatNumber(value);
        }
        calculate();
    });
    
    exchangeSelect.addEventListener('change', calculate);
    
    // Initial calculation
    calculate();
}

// Animate numbers on scroll
function animateNumbers() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
                const target = entry.target;
                const value = parseFloat(target.textContent.replace(/[^0-9]/g, ''));
                const isCurrency = target.textContent.includes('₩');
                const duration = 2000;
                const start = 0;
                const increment = value / (duration / 16);
                let current = start;
                
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= value) {
                        current = value;
                        clearInterval(timer);
                        target.classList.add('animated');
                    }
                    
                    if (isCurrency) {
                        target.textContent = `₩${Math.round(current).toLocaleString('ko-KR')}`;
                    } else {
                        target.textContent = Math.round(current).toLocaleString('ko-KR');
                    }
                }, 16);
            }
        });
    }, { threshold: 0.5 });
    
    // Observe all savings amounts
    document.querySelectorAll('.monthly-savings').forEach(el => observer.observe(el));
}

// Initialize all interactions
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded - Initializing interactions');
    
    // Wait a bit for all elements to be ready
    setTimeout(() => {
        try {
            initTestimonialCarousel();
        } catch (error) {
            console.error('Testimonial carousel init failed:', error);
        }
        
        try {
            initSavingsCalculator();
        } catch (error) {
            console.error('Calculator init failed:', error);
        }
        
        try {
            animateNumbers();
        } catch (error) {
            console.error('Number animation init failed:', error);
        }
    }, 100);
});