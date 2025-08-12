# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CoinPass is a cryptocurrency exchange comparison platform built with TypeScript, Vite, and Supabase. The application provides exchange fee comparisons, real-time price comparisons, and an admin panel for content management.

## Essential Commands

```bash
# Development
npm install          # Install dependencies
npm run dev          # Start dev server on http://localhost:3000

# Production
npm run build        # Build for production
npm run preview      # Preview production build on http://localhost:8080
npm run start        # Start production server (used by Render)

# Code Quality
npm run lint         # TypeScript type checking (tsc --noEmit)
```

## Environment Setup

Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

Required environment variables:
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

For production deployment on Render, these must be set in the Environment Variables section of the Render dashboard.

## Architecture

### Multi-Page Application Structure
The app consists of 4 main HTML entry points defined in `vite.config.ts`:
- `index.html` - Main landing page with hero section and benefits
- `exchange.html` - Exchange comparison and referral links
- `compare.html` - Real-time price comparison across exchanges
- `admin.html` - Admin panel for content management

### Key Services and Utilities

**Authentication (`auth-service.ts`)**
- Handles admin authentication via Supabase Auth
- Password validation requires 12+ characters with complexity
- Session management with automatic refresh

**Supabase Integration (`supabaseClient.ts`)**
- Main database client with session persistence
- Uses sessionStorage for admin sessions
- Connection pooling and retry logic

**Security Layer (`security-middleware.ts`, `security-utils.ts`)**
- HTTPS enforcement in production
- CSP headers configuration
- XSS protection and input sanitization
- Rate limiting implementation

### Database Schema (Supabase)

Key tables:
- `exchanges` - Exchange information and referral links
- `faqs` - FAQ content
- `site_data` - Dynamic content (hero, about, popup sections)
- `admin_sessions` - Session management

### Page-Specific TypeScript Files

Each HTML page has a corresponding `.tsx` file:
- `index.tsx` - Landing page initialization, popup management, theme handling
- `exchange.tsx` - Exchange list rendering, filtering, benefit display
- `compare.tsx` - Real-time price fetching from multiple exchanges
- `admin.tsx` - Admin panel with CRUD operations for all content

## Deployment

### Render Configuration
- Build command: `npm install && npm run build`
- Start command: `npm run start`
- Static site with Node.js environment
- Auto-deploy from GitHub main branch

### Production Considerations
- Environment variables must be set in Render dashboard
- Favicon and assets hosted on Supabase Storage (`public-assets` bucket)
- Domain: coinpass.kr with SSL enabled

## Security Notes

- API keys should never be committed (check `.gitignore`)
- Admin panel accessible at `/admin.html`
- Rate limiting on login attempts (5 attempts per 15 minutes)
- CSP headers defined in both `vite.config.ts` and meta tags

## Common Development Tasks

### Adding a New Exchange
1. Add entry to `exchanges` table in Supabase
2. Include all required fields: name_ko, name_en, link, benefits, etc.
3. Exchange list will auto-update on frontend

### Updating Popup Content
1. Access admin panel
2. Navigate to popup section
3. Update content for 'main' or 'index' popup type
4. Changes apply immediately

### Modifying Theme
- Theme toggle handled by `theme-toggle.js`
- CSS variables defined in `:root` and `[data-theme]` selectors
- Dark theme is default

## TypeScript Configuration

Strict mode enabled with:
- `noUnusedLocals`: true
- `noUnusedParameters`: true
- Target: ES2020
- Module resolution: bundler mode

## Bundle Optimization

Vite configuration includes:
- Code splitting with manual chunks (security, database, utils)
- Asset inlining for files < 4KB
- Console.log removal in production builds
- Source maps only in development