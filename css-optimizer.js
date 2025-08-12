// CSS Optimization Script for Build Process
import { PurgeCSS } from 'purgecss';
import cssnano from 'cssnano';
import postcss from 'postcss';

export async function optimizeCSS() {
    // PurgeCSS configuration to remove unused CSS
    const purgeCSSResults = await new PurgeCSS().purge({
        content: ['*.html', '*.tsx', '*.ts', '*.js'],
        css: ['index.css'],
        safelist: {
            standard: [/^theme-/, /^is-/, /^active/, /^touch-/],
            deep: [/popup/, /loader/],
            greedy: [/testimonial/, /carousel/]
        }
    });

    // Apply cssnano for additional optimization
    const result = await postcss([
        cssnano({
            preset: ['default', {
                discardComments: { removeAll: true },
                normalizeWhitespace: true,
                mergeRules: true,
                mergeLonghand: true,
                discardDuplicates: true,
                discardEmpty: true,
                minifyFontValues: true,
                minifyGradients: true,
                autoprefixer: false
            }]
        })
    ]).process(purgeCSSResults[0].css, { from: undefined });

    return result.css;
}

// Critical CSS extraction for above-the-fold content
export function extractCriticalCSS() {
    const criticalSelectors = [
        'body', 'header', '.hero', '.hero-banner', '.hero-content-centered',
        '.hero-badge', '#hero-title', '#hero-subtitle', '.hero-stats',
        '.main-cta-buttons', '.cta-button', '.logo', '.nav-container',
        '[data-theme="dark"]', ':root'
    ];
    
    // Extract only critical CSS for initial render
    return criticalSelectors;
}