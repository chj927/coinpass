// Shared Theme Toggle Functionality
function setupThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;

    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('coinpass-theme') || 'dark';
    applyTheme(savedTheme);

    // Add click event listener
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        applyTheme(newTheme);
        localStorage.setItem('coinpass-theme', newTheme);
        
        // Add a subtle animation effect
        themeToggle.style.transform = 'scale(0.95)';
        setTimeout(() => {
            themeToggle.style.transform = 'scale(1)';
        }, 150);
    });

    // Listen for system theme changes (optional enhancement)
    if (window.matchMedia) {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', (e) => {
            // Only auto-switch if user hasn't manually set a preference
            if (!localStorage.getItem('coinpass-theme')) {
                applyTheme(e.matches ? 'dark' : 'light');
            }
        });
    }
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    
    // Update theme toggle button aria-label
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        const newLabel = theme === 'dark' ? '라이트 테마로 변경' : '다크 테마로 변경';
        themeToggle.setAttribute('aria-label', newLabel);
        themeToggle.setAttribute('title', newLabel);
    }
}

// Initialize theme on page load
document.addEventListener('DOMContentLoaded', setupThemeToggle);