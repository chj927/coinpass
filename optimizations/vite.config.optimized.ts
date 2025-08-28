import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';
import { compression } from 'vite-plugin-compression2';
import viteImagemin from 'vite-plugin-imagemin';

export default defineConfig(({ mode }) => {
    loadEnv(mode, '.', '');
    const isDev = mode === 'development';
    
    return {
        define: {
            'process.env.NODE_ENV': JSON.stringify(mode),
            __DEV__: isDev
        },
        resolve: {
            alias: {
                '@': path.resolve(__dirname, '.'),
                // Optimize Supabase imports
                '@supabase/supabase-js': '@supabase/supabase-js/dist/module/index.js'
            }
        },
        server: {
            port: 3000,
            open: true,
            cors: true,
            hmr: {
                overlay: true
            }
        },
        preview: {
            host: true,
            port: 8080,
            strictPort: true,
        },
        build: {
            target: 'es2020',
            minify: 'terser', // Better minification than esbuild
            terserOptions: {
                compress: {
                    drop_console: !isDev,
                    drop_debugger: !isDev,
                    pure_funcs: !isDev ? ['console.log', 'console.debug'] : [],
                    passes: 2,
                    ecma: 2020,
                    module: true,
                    toplevel: true,
                    unsafe_arrows: true,
                    unsafe_comps: true,
                    unsafe_methods: true,
                    unsafe_proto: true,
                    unsafe_regexp: true,
                    unsafe_undefined: true,
                    unused: true
                },
                mangle: {
                    safari10: true,
                    toplevel: true
                },
                format: {
                    comments: false,
                    ecma: 2020
                }
            },
            sourcemap: isDev,
            cssCodeSplit: true,
            rollupOptions: {
                input: {
                    main: path.resolve(__dirname, 'index.html'),
                    admin: path.resolve(__dirname, 'admin.html'),
                    exchange: path.resolve(__dirname, 'exchange.html'),
                    articles: path.resolve(__dirname, 'articles.html'),
                },
                output: {
                    // Improved manual chunks
                    manualChunks(id) {
                        // Vendor chunks
                        if (id.includes('node_modules')) {
                            if (id.includes('@supabase')) {
                                return 'supabase';
                            }
                            if (id.includes('bcrypt') || id.includes('jsonwebtoken')) {
                                return 'auth';
                            }
                            // Group other small vendors
                            return 'vendor';
                        }
                        
                        // Application chunks
                        if (id.includes('security')) {
                            return 'security';
                        }
                        if (id.includes('utils') || id.includes('error-handler')) {
                            return 'utils';
                        }
                        if (id.includes('analytics')) {
                            return 'analytics';
                        }
                    },
                    chunkFileNames: (chunkInfo) => {
                        const facadeModuleId = chunkInfo.facadeModuleId ? 
                            path.basename(chunkInfo.facadeModuleId, path.extname(chunkInfo.facadeModuleId)) : 
                            'chunk';
                        return `assets/${facadeModuleId}-[hash].js`;
                    },
                    entryFileNames: 'assets/[name]-[hash].js',
                    assetFileNames: (assetInfo) => {
                        const extType = assetInfo.name?.split('.').at(-1);
                        if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType || '')) {
                            return 'assets/images/[name]-[hash][extname]';
                        }
                        if (/woff2?|ttf|otf|eot/i.test(extType || '')) {
                            return 'assets/fonts/[name]-[hash][extname]';
                        }
                        return 'assets/[name]-[hash][extname]';
                    }
                },
                // Tree-shaking optimizations
                treeshake: {
                    moduleSideEffects: false,
                    propertyReadSideEffects: false,
                    tryCatchDeoptimization: false
                }
            },
            chunkSizeWarningLimit: 500,
            assetsInlineLimit: 4096,
            cssMinify: 'lightningcss',
            reportCompressedSize: false,
            // Module preload optimization
            modulePreload: {
                polyfill: true
            }
        },
        optimizeDeps: {
            include: [
                '@supabase/supabase-js',
                'bcryptjs',
                'jsonwebtoken'
            ],
            exclude: [],
            esbuildOptions: {
                target: 'es2020',
                supported: {
                    bigint: true
                }
            }
        },
        css: {
            devSourcemap: isDev,
            // PostCSS optimization
            postcss: {
                plugins: [
                    // Add autoprefixer, cssnano, etc.
                ]
            },
            // CSS modules optimization
            modules: {
                generateScopedName: isDev ? '[name]__[local]__[hash:base64:5]' : '[hash:base64:5]'
            }
        },
        plugins: [
            // Bundle analyzer (only in build with --analyze flag)
            process.env.ANALYZE && visualizer({
                open: true,
                gzipSize: true,
                brotliSize: true,
                filename: 'dist/bundle-analysis.html'
            }),
            
            // Compression plugin for better performance
            !isDev && compression({
                algorithm: 'gzip',
                threshold: 10240,
                deleteOriginalAssets: false,
                exclude: [/\.(br)$/, /\.(gz)$/]
            }),
            
            !isDev && compression({
                algorithm: 'brotliCompress',
                threshold: 10240,
                deleteOriginalAssets: false,
                exclude: [/\.(br)$/, /\.(gz)$/]
            }),
            
            // Image optimization
            !isDev && viteImagemin({
                gifsicle: {
                    optimizationLevel: 7,
                    interlaced: false
                },
                optipng: {
                    optimizationLevel: 7
                },
                mozjpeg: {
                    quality: 80
                },
                pngquant: {
                    quality: [0.8, 0.9],
                    speed: 4
                },
                svgo: {
                    plugins: [
                        {
                            name: 'removeViewBox',
                            active: false
                        },
                        {
                            name: 'removeEmptyAttrs',
                            active: false
                        }
                    ]
                }
            }),
            
            // Custom plugin for critical CSS extraction
            {
                name: 'extract-critical-css',
                transformIndexHtml(html) {
                    if (isDev) return html;
                    
                    // Extract and inline critical CSS
                    // This is a simplified version - use a proper critical CSS tool in production
                    return html;
                }
            },
            
            // Security headers (enhanced version)
            {
                name: 'add-security-headers',
                configureServer(server) {
                    server.middlewares.use((req, res, next) => {
                        // Enhanced security headers
                        res.setHeader('X-Content-Type-Options', 'nosniff');
                        res.setHeader('X-Frame-Options', 'DENY');
                        res.setHeader('X-XSS-Protection', '1; mode=block');
                        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
                        res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
                        
                        // Cache control for assets
                        if (req.url?.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff2?)$/)) {
                            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
                        }
                        
                        next();
                    });
                }
            }
        ].filter(Boolean),
        
        // Worker optimization
        worker: {
            format: 'es',
            rollupOptions: {
                output: {
                    entryFileNames: 'assets/worker-[hash].js'
                }
            }
        },
        
        // Additional optimizations
        json: {
            stringify: true
        },
        
        esbuild: {
            legalComments: 'none',
            treeShaking: true
        }
    };
});