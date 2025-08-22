const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

// Load environment variables
dotenv.config({ path: '.env.server' });
dotenv.config(); // Also try regular .env

const app = express();
const PORT = process.env.API_PORT || 3001;

// Server-only Supabase client with service role key
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const jwtSecret = process.env.JWT_SECRET || 'your-secure-jwt-secret-change-this';

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing required environment variables');
    console.error('SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
    console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'Set' : 'Missing');
    process.exit(1);
}

// Create Supabase admin client with service role key (server-side only)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
    }
});

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
}));

// CORS configuration
const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:8080',
            'https://coinpass.kr',
            'https://www.coinpass.kr',
            'https://coinpass.onrender.com'
        ];
        
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 auth requests per windowMs
    message: 'Too many authentication attempts, please try again later.',
    skipSuccessfulRequests: true
});

app.use('/api/', generalLimiter);
app.use('/api/auth/', authLimiter);

// JWT Authentication Middleware
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    try {
        const decoded = jwt.verify(token, jwtSecret);
        
        // Verify user still exists and is active in database
        const { data: user, error } = await supabaseAdmin
            .from('admin_users')
            .select('id, email, role, is_active')
            .eq('id', decoded.id)
            .single();

        if (error || !user || !user.is_active) {
            return res.status(403).json({ error: 'Invalid or inactive user' });
        }

        req.user = {
            id: user.id,
            email: user.email,
            role: user.role,
            isAdmin: user.role === 'admin'
        };

        next();
    } catch (error) {
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
};

// Admin-only middleware
const requireAdmin = (req, res, next) => {
    if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};

// ============= AUTH ENDPOINTS =============

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
    }

    try {
        // Use Supabase Auth for authentication
        const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
            email,
            password
        });

        if (authError || !authData.user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check if user is admin
        const { data: userData, error: userError } = await supabaseAdmin
            .from('admin_users')
            .select('role, is_active')
            .eq('id', authData.user.id)
            .single();

        if (userError || !userData || !userData.is_active) {
            return res.status(403).json({ error: 'Account inactive or not found' });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                id: authData.user.id,
                email: authData.user.email,
                role: userData.role
            },
            jwtSecret,
            { expiresIn: '24h' }
        );

        // Log admin session
        if (userData.role === 'admin') {
            await supabaseAdmin
                .from('login_logs')
                .insert({
                    user_id: authData.user.id,
                    ip_address: req.ip,
                    user_agent: req.headers['user-agent'],
                    timestamp: new Date().toISOString()
                });
        }

        res.json({
            token,
            user: {
                id: authData.user.id,
                email: authData.user.email,
                role: userData.role,
                isAdmin: userData.role === 'admin'
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Logout endpoint
app.post('/api/auth/logout', authenticateToken, async (req, res) => {
    try {
        // Update admin session if admin
        if (req.user?.isAdmin) {
            // Login logs는 종료 시간 업데이트 불필요
            // 로그아웃 기록만 추가
            await supabaseAdmin
                .from('login_logs')
                .insert({
                    user_id: req.user.id,
                    action: 'logout',
                    timestamp: new Date().toISOString()
                });
        }

        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Verify session endpoint
app.get('/api/auth/verify', authenticateToken, (req, res) => {
    res.json({ 
        valid: true, 
        user: req.user 
    });
});

// ============= DATA ENDPOINTS =============

// Get exchanges (public)
app.get('/api/exchanges', async (_req, res) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('exchanges_exchanges')
            .select('*')
            .order('name_ko', { ascending: true });

        if (error) throw error;
        res.json({ data });
    } catch (error) {
        console.error('Error fetching exchanges:', error);
        res.status(500).json({ error: 'Failed to fetch exchanges' });
    }
});

// Get FAQs (public)
app.get('/api/faqs', async (_req, res) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('exchange_faqs')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) throw error;
        res.json({ data });
    } catch (error) {
        console.error('Error fetching FAQs:', error);
        res.status(500).json({ error: 'Failed to fetch FAQs' });
    }
});

// Get site data (public)
app.get('/api/site-data/:section', async (req, res) => {
    const { section } = req.params;
    
    const allowedSections = ['hero', 'about', 'popup', 'benefits'];
    if (!allowedSections.includes(section)) {
        return res.status(400).json({ error: 'Invalid section' });
    }

    try {
        const { data, error } = await supabaseAdmin
            .from('page_contents')
            .select('*')
            .eq('page_type', section === 'hero' ? 'main' : section)
            .single();

        if (error) throw error;
        res.json({ data });
    } catch (error) {
        console.error(`Error fetching ${section} data:`, error);
        res.status(500).json({ error: `Failed to fetch ${section} data` });
    }
});

// ============= ADMIN ENDPOINTS =============

// Create/Update exchange (admin only)
app.post('/api/admin/exchanges', authenticateToken, requireAdmin, async (req, res) => {
    const exchangeData = req.body;

    try {
        // Validate required fields
        if (!exchangeData.name_ko || !exchangeData.name_en || !exchangeData.link) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Sanitize input data
        const sanitizedData = {
            ...exchangeData,
            updated_by: req.user?.id,
            updated_at: new Date().toISOString()
        };

        const { data, error } = await supabaseAdmin
            .from('exchanges_exchanges')
            .upsert(sanitizedData)
            .select()
            .single();

        if (error) throw error;

        // Log admin action
        await supabaseAdmin
            .from('admin_logs')
            .insert({
                user_id: req.user?.id,
                action: exchangeData.id ? 'update_exchange' : 'create_exchange',
                details: { exchange_id: data.id },
                ip_address: req.ip
            });

        res.json({ data });
    } catch (error) {
        console.error('Error saving exchange:', error);
        res.status(500).json({ error: 'Failed to save exchange' });
    }
});

// Delete exchange (admin only)
app.delete('/api/admin/exchanges/:id', authenticateToken, requireAdmin, async (req, res) => {
    const { id } = req.params;

    try {
        const { error } = await supabaseAdmin
            .from('exchanges_exchanges')
            .delete()
            .eq('id', id);

        if (error) throw error;

        // Log admin action
        await supabaseAdmin
            .from('admin_logs')
            .insert({
                user_id: req.user?.id,
                action: 'delete_exchange',
                details: { exchange_id: id },
                ip_address: req.ip
            });

        res.json({ message: 'Exchange deleted successfully' });
    } catch (error) {
        console.error('Error deleting exchange:', error);
        res.status(500).json({ error: 'Failed to delete exchange' });
    }
});

// Update site data (admin only)
app.post('/api/admin/site-data', authenticateToken, requireAdmin, async (req, res) => {
    const { section, data: siteData } = req.body;

    const allowedSections = ['hero', 'about', 'popup', 'benefits'];
    if (!allowedSections.includes(section)) {
        return res.status(400).json({ error: 'Invalid section' });
    }

    try {
        const { data, error } = await supabaseAdmin
            .from('page_contents')
            .upsert({
                page_type: section === 'hero' ? 'main' : section,
                content: siteData,
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;

        // Log admin action
        await supabaseAdmin
            .from('admin_logs')
            .insert({
                user_id: req.user?.id,
                action: 'update_site_data',
                details: { section },
                ip_address: req.ip
            });

        res.json({ data });
    } catch (error) {
        console.error('Error updating site data:', error);
        res.status(500).json({ error: 'Failed to update site data' });
    }
});

// Get admin logs (admin only)
app.get('/api/admin/logs', authenticateToken, requireAdmin, async (_req, res) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('admin_logs')
            .select(`
                *,
                users:user_id (email)
            `)
            .order('created_at', { ascending: false })
            .limit(100);

        if (error) throw error;
        res.json({ data });
    } catch (error) {
        console.error('Error fetching admin logs:', error);
        res.status(500).json({ error: 'Failed to fetch admin logs' });
    }
});

// Error handling middleware
app.use((err, _req, res, _next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 handler
app.use((_req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
    console.log(`API Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;