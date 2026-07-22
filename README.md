# 🚗 Mekh - Kenya's Premier Automotive Services Marketplace

> **Professional automotive services marketplace connecting car owners with verified technicians across Kenya**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-3ECF8E)](https://supabase.com/)
[![Capacitor](https://img.shields.io/badge/Capacitor-8.3-119EFF)](https://capacitorjs.com/)
[![Vitest](https://img.shields.io/badge/Vitest-4.0-729B1B)](https://vitest.dev/)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Configuration](#-environment-configuration)
- [Development](#-development)
- [Native App Development](#-native-app-development)
- [Deployment](#-deployment)
- [Architecture](#-architecture)
- [Security](#-security)
- [Testing](#-testing)
- [Contributing](#-contributing)

---

## 🎯 Overview

Mekh is a modern cross-platform application (Web + Native Android) that revolutionizes how Kenyans find and book automotive services. The platform connects car owners with verified technicians specializing in:

### Service Categories

#### 🎨 Body & Exterior
- **Window Tinting** - Chameleon, Ceramic, 3M, Llumar, Local tints
- **Car Wrapping** - Full wraps, partial wraps, custom designs
- **PPF Installation** - Paint protection film
- **Ceramic Coating** - Professional ceramic coating services
- **Car Buffing** - Paint correction and polishing
- **Headlight Restoration** - Restore clarity to foggy headlights
- **Chrome Deleting** - Blackout chrome trim
- **Rim Customization** - Custom wheel finishes

#### 🔌 Car Electricals & Security
- **Car Audio Systems** - Premium sound installations
- **Security Systems** - Alarms, immobilizers, tracking
- **Key Programming** - Remote key and transponder programming
- **ECU Tuning** - Engine control unit modifications
- **Lighting Upgrades** - LED, HID, custom lighting

#### ⚙️ Mechanical & Repair
- **Engine Diagnostics** - Computer diagnostics and troubleshooting
- **Brake Services** - Brake pads, rotors, fluid replacement
- **Suspension Work** - Shocks, struts, alignment
- **Tire Services** - Mounting, balancing, rotation
- **Oil Changes & Maintenance** - Regular service intervals

#### ✨ Interior & Detailing
- **Car Detailing** - Interior & exterior deep cleaning
- **Upholstery Work** - Seat repairs and replacements
- **Carpet Cleaning** - Deep cleaning and stain removal
- **Interior Trim** - Dashboard and panel customization

#### 🚛 Towing Services
- **Emergency Towing** - 24/7 roadside assistance
- **Vehicle Recovery** - Accident and breakdown recovery
- **Flatbed Services** - Safe transport for luxury vehicles
- **Jump Start** - Battery assistance

**Live Platform**: [https://mekh.app](https://mekh.app)

---

## ✨ Features

### 🔍 For Clients (Car Owners)

#### Discovery & Search
- **Smart Search** - Search by service, location, or service variants (e.g., "Ceramic Tint in Karen")
- **Location-Based** - Find technicians near you with geolocation
- **Service Variants** - Search specific variants like "3M Tint" or "Full Vehicle Wrap"
- **Category Filters** - Browse by Body & Exterior, Electricals, Mechanical, Interior, Towing
- **Top Rated** - Discover highly-rated technicians
- **Mobile Service** - Filter technicians who come to you
- **Verified Badge System** - Easily identify verified technicians with quality guarantees

#### Emergency Services 🚨
- **Roadside Emergency Page** - Quick access via SOS button in navigation
- **Auto-Location Detection** - GPS-based location with manual fallback
- **Smart Technician Matching** - Server-side filtering by mobility status
  - "Can move" → Mechanical & Repair technicians
  - "Barely/Stuck" → Towing services
- **Pre-Calculated ETA** - Distance and arrival time computed on server
- **Highway Safety Alerts** - Automatic detection and safety warnings
- **Emergency Pricing Guide** - Transparent pricing for common emergencies
- **One-Click Contact** - Call or WhatsApp with pre-filled emergency details
- **Safety Tips** - Stay-safe guidance while waiting for help
- **Tow Truck Verification** - Number plate tracking for towing services

#### Booking & Communication
- **Direct Booking** - Book services through the platform
- **Emergency Booking** - Fast-track booking for roadside emergencies
- **WhatsApp Integration** - Instant contact via WhatsApp with pre-filled messages
- **Booking Management** - Track all your bookings in one place
- **Review System** - Leave reviews after service completion (admin-moderated)
- **Service History** - View past bookings and services
- **Push Notifications** - Real-time updates on booking status (Native app)

#### User Experience
- **Cross-Platform** - Web app + Native Android app with Capacitor
- **Offline Mode** - Graceful offline handling with user-friendly messages
- **Dark Mode** - System-aware theme switching
- **Responsive Design** - Optimized for mobile, tablet, and desktop
- **Fast Loading** - Sub-1-second menu loads with session caching
- **Optimized Images** - Cloudinary CDN with automatic format selection
- **Pull-to-Refresh** - Native-like refresh experience

### 🔧 For Technicians

#### Profile Management
- **Professional Profiles** - Showcase your business with photos and videos
- **Portfolio Gallery** - Upload work samples (photos & TikTok/YouTube/Instagram videos)
- **Service Listings** - Define services with pricing and variants (e.g., "Ceramic Tint - KES 8,000-18,000")
- **Service Categories** - Organize services by Body & Exterior, Electricals, Mechanical, Interior, Towing
- **Business Hours** - Set availability schedule including "Available on Request" for Sundays
- **Location Settings** - Mobile service, fixed location, or both
- **Google Maps Integration** - Link your business location
- **Trusted Brands** - List brands and materials you work with (e.g., "3M, LLumar, Pioneer")
- **Service Guarantee** - Define your service guarantees and warranties
- **Tow Truck Registration** - Number plate verification for towing services

#### Lead Management
- **Lead Dashboard** - Manage incoming booking requests
- **Status Tracking** - Update lead status (pending, job_done, not_converted)
- **Client Communication** - Direct WhatsApp integration with automatic lead tracking
- **Performance Metrics** - Track ratings and reviews
- **Email Notifications** - Receive lead notifications via email
- **Push Notifications** - Real-time lead alerts (Native app)

#### Verification & Trust
- **Verified Badge System** - Earn a verified badge by meeting quality standards:
  - **Gate 1 Requirements**: Account status (live), 5+ completed jobs, 4.0+ rating with 3+ reviews
  - **Gate 2 Profile Score**: 60+ points from profile completeness (bio, Google Maps, portfolio, hours, brands, guarantees)
  - **Bonus Points**: TikTok video link adds +5 bonus points
  - **Real-Time Progress Tracking**: Dashboard shows exactly what's needed to earn the badge
  - **Automatic Badge Display**: Badge appears on profile and search results once earned
- **Profile Verification** - Admin-approved profiles (pending, live, suspended)
- **Review System** - Build reputation through client reviews (admin-moderated)
- **Rating Display** - Showcase your average rating and review count
- **Service Variants** - Offer specific service options with pricing (e.g., "3M Tint", "Full Vehicle Wrap")
- **Job Completion Tracking** - Automatic tracking of completed jobs for badge eligibility

### 👨‍💼 For Administrators

#### Content Management
- **Technician Approval** - Review and approve new technicians (pending → live → suspended)
- **Verified Badge Management** - Monitor technician verification status and progress
  - View real-time verification scores and gate completion
  - Track job completion counts and rating thresholds
  - Review profile completeness breakdown
- **Article Management** - Create SEO-optimized blog articles with:
  - Rich text editor (Quill)
  - Internal links for SEO
  - Author bio sections
  - FAQs with structured data
  - Key takeaways
  - Term definitions
- **Review Moderation** - Approve/decline client reviews with admin notes
- **User Management** - Manage clients and technicians
- **Lead Oversight** - View all booking requests and confirm job completion

#### Platform Oversight
- **Analytics Dashboard** - Monitor platform metrics (technicians, leads, reviews)
- **Lead Management** - Admin confirmation required before review requests sent
- **Content Moderation** - Ensure quality standards
- **System Health** - Monitor platform performance
- **Email Notifications** - Automated review request emails via Supabase Edge Functions
- **Push Notification Management** - Send targeted notifications to users

### 🌐 Platform Features

#### Performance & SEO
- **SEO Optimized** - Meta tags, structured data, sitemap
- **AI Bot Friendly** - Allows GPTBot, Claude, Perplexity, Gemini crawling
- **Fast Loading** - Code splitting, lazy loading, image optimization
- **CDN Delivery** - Cloudinary for images, Supabase for data

#### Security & Privacy
- **Secure Authentication** - Supabase Auth with JWT tokens
- **Row Level Security** - Database-level access control
- **Content Security Policy** - XSS protection
- **Privacy-First** - WhatsApp numbers only for confirmed bookings

#### Developer Experience
- **TypeScript** - Full type safety
- **Modern React** - React 19 with hooks and concurrent features
- **Hot Module Replacement** - Instant dev updates
- **Testing Suite** - Vitest for unit and property-based testing
- **Native Development** - Capacitor for cross-platform mobile apps

---

## 🛠 Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.2.3 | UI framework with concurrent features |
| **TypeScript** | 5.8.2 | Type-safe JavaScript |
| **Vite** | 6.2.0 | Build tool and dev server |
| **React Router** | 7.11.0 | Client-side routing with lazy loading |
| **Tailwind CSS** | 4.1.18 | Utility-first CSS framework |
| **React Helmet Async** | 2.0.5 | SEO meta tag management |
| **React Query** | 5.100.13 | Server state management and caching |
| **Quill** | 2.0.3 | Rich text editor for blog articles |
| **React Quill** | 2.0.0 | React wrapper for Quill editor |
| **Leaflet** | 1.9.4 | Interactive maps for technician locations |
| **DOMPurify** | 3.3.1 | XSS protection for user-generated content |
| **UUID** | 13.0.0 | Unique identifier generation |
| **Cloudinary React** | 1.14.4 | Image upload and optimization |
| **Browser Image Compression** | 2.0.2 | Client-side image compression |

### Native Mobile (Capacitor)

| Plugin | Version | Purpose |
|--------|---------|---------|
| **Capacitor Core** | 8.3.4 | Cross-platform native runtime |
| **Capacitor Android** | 8.3.4 | Android platform integration |
| **App Plugin** | 8.1.0 | App state and deep linking |
| **Browser Plugin** | 8.0.3 | In-app browser for OAuth |
| **Push Notifications** | 8.1.1 | Native push notifications |
| **Status Bar** | 8.0.2 | Status bar styling |
| **Splash Screen** | 8.0.1 | Native splash screen |
| **Haptics** | 8.0.2 | Haptic feedback |
| **Camera** | 8.2.0 | Camera access for photos |
| **Geolocation** | 8.2.0 | GPS location services |

### Backend & Services

| Service | Purpose |
|---------|---------|
| **Supabase** | PostgreSQL database with Row Level Security (RLS) |
| **Supabase Auth** | JWT-based authentication with Google OAuth |
| **Supabase Edge Functions** | Serverless functions for email notifications, push notifications, and TikTok thumbnails |
| **PostgreSQL Functions** | Server-side processing for emergency technician matching |
| **Cloudinary** | Image optimization, transformation, and CDN delivery |
| **Nominatim** | OpenStreetMap geocoding and reverse geocoding for location services |
| **Resend** | Email delivery service for review and lead notifications |
| **Firebase Cloud Messaging** | Push notifications for Android |

### Development Tools

| Tool | Purpose |
|------|---------|
| **Vitest** | Unit testing and property-based testing framework (v4.0.18) |
| **Fast-check** | Property-based testing library for edge case discovery (v4.5.3) |
| **Rollup Visualizer** | Bundle size analysis and optimization (v7.0.1) |
| **CSpell** | Spell checking for code and documentation |
| **Tailwind Typography** | Typography plugin for article content (v0.5.19) |
| **React Snap** | Pre-rendering for SEO optimization |

### Cross-Platform Features

| Feature | Implementation |
|---------|---------------|
| **Offline Support** | Custom offline fallback UI with error boundary |
| **Image Optimization** | Cloudinary automatic format (WebP/AVIF) with responsive sizing |
| **Code Splitting** | Dynamic imports for routes and heavy components |
| **Lazy Loading** | React.lazy for page components and maps |
| **Caching Strategy** | React Query for server state, browser cache for assets |
| **Push Notifications** | Native notifications via Capacitor + FCM |
| **Deep Linking** | Custom URL schemes for OAuth and navigation |

---

## 📁 Project Structure

```
AutoGearKe/
├── 📄 Configuration Files
│   ├── .env                          # Environment variables (Supabase, Cloudinary)
│   ├── .gitignore                    # Git ignore rules
│   ├── package.json                  # Dependencies and scripts
│   ├── tsconfig.json                 # TypeScript configuration
│   ├── vite.config.ts                # Vite build configuration with PWA
│   ├── vitest.config.ts              # Testing configuration
│   └── cspell.json                   # Spell checker config
│
├── 📱 Entry Points
│   ├── index.html                    # HTML template with CSP headers
│   ├── index.tsx                     # React entry point with HelmetProvider
│   └── App.tsx                       # Main app with routing, auth, PWA logic
│
├── 📦 Core Files
│   ├── types.ts                      # TypeScript type definitions (Technician, Lead, Review, etc.)
│   └── constants.ts                  # App constants and config
│
├── 🎨 Assets
│   ├── assets/                       # Static assets (icons, images, logos)
│   └── public/                       # PWA assets
│       ├── manifest.json             # PWA manifest with shortcuts
│       ├── sw.js                     # Service worker
│       ├── robots.txt                # SEO crawler rules (allows AI bots)
│       ├── _headers                  # Netlify headers config (CSP, security)
│       └── _redirects                # Netlify redirects
│
├── 🧩 Components
│   ├── components/                   # Shared components (root)
│   │   ├── ArticleCard.tsx           # Blog article card with SEO
│   │   ├── ErrorBoundary.tsx         # React error boundary with offline detection
│   │   ├── Footer.tsx                # Site footer with links
│   │   ├── Header.tsx                # Navigation header with auth state
│   │   ├── Layout.tsx                # Main layout wrapper with auth listener
│   │   ├── QuillEditor.tsx           # Rich text editor for admin
│   │   ├── ThemeContext.tsx          # Dark mode context provider
│   │   ├── ThemeToggle.tsx           # Dark mode toggle button
│   │   ├── TechnicianSidebar.tsx     # Technician profile sidebar
│   │   ├── GuestBottomNav.tsx        # Guest navigation (mobile)
│   │   ├── ClientBottomNav.tsx       # Client navigation (mobile)
│   │   └── TechnicianBottomNav.tsx   # Technician navigation (mobile)
│   │
│   └── src/components/               # Feature components
│       ├── Avatar.tsx                # User avatar component with Cloudinary
│       ├── BookingModal.tsx          # Booking request modal with geolocation
│       ├── BusinessHoursEditor.tsx   # Business hours manager with "Available on Request"
│       ├── LazyMap.tsx               # Lazy-loaded Leaflet map wrapper
│       ├── LocationBanner.tsx        # Location selection banner
│       ├── OfflineFallback.tsx       # Offline mode UI with retry
│       ├── ProfileCompletionModal.tsx # Profile completion prompt
│       ├── Skeleton.tsx              # Loading skeleton components
│       ├── TechnicianCard.tsx        # Technician listing card with WhatsApp tracking
│       ├── TechnicianMap.tsx         # Interactive map for technician locations
│       ├── UpdatePrompt.tsx          # PWA update notification
│       ├── VerificationProgress.tsx  # Verified badge progress tracker with checklist
│       ├── OptimizedImage.tsx        # Cloudinary image optimization wrapper
│       ├── VideoThumbnail.tsx        # Video thumbnail component
│       └── LoadingProgress.tsx       # Loading progress indicator
│
├── 📄 Pages
│   ├── pages/                        # Page components (lazy-loaded)
│   │   ├── AuthPage.tsx              # Login/Register with Google OAuth
│   │   ├── AuthCallback.tsx          # OAuth callback handler
│   │   ├── JoinPage.tsx              # Technician registration with Cloudinary upload
│   │   ├── RoadsideEmergencyPage.tsx # Emergency booking page with GPS and server-side matching
│   │   ├── EmergencyTechnicianPage.tsx # Emergency technician profile with relevant services
│   │   ├── AdminPage.tsx             # Admin dashboard (technicians, leads, reviews, articles)
│   │   ├── BlogPage.tsx              # Blog listing with SEO
│   │   ├── ArticleDetailPage.tsx     # Article detail view with structured data
│   │   ├── TechnicianProfilePage.tsx # Technician profile with reviews and portfolio
│   │   ├── TechnicianDashboardPage.tsx # Technician dashboard (leads, profile, services)
│   │   ├── NearbyTechniciansPage.tsx # Nearby technicians with geolocation
│   │   ├── ClientProfilePage.tsx     # Client profile management
│   │   ├── ClientOnboardingPage.tsx  # Client setup (name, phone)
│   │   ├── BookingsPage.tsx          # Booking management with soft delete
│   │   ├── ServiceLocationPage.tsx   # Service location pages (SEO)
│   │   ├── ContactPage.tsx           # Contact form
│   │   ├── AboutPage.tsx             # About page
│   │   ├── TermsPage.tsx             # Terms of service
│   │   ├── PrivacyPolicyPage.tsx     # Privacy policy
│   │   ├── MenuPage.tsx              # Menu page (client)
│   │   ├── GuestMenuPage.tsx         # Guest menu
│   │   ├── TechnicianMenuPage.tsx    # Technician menu
│   │   ├── EstimatePage.tsx          # Service estimates
│   │   ├── NotificationsPage.tsx     # User notifications
│   │   ├── DeleteAccountPage.tsx     # Account deletion
│   │   ├── CarMechanicsNearMePage.tsx # SEO landing page for local search
│   │   ├── AppRedirect.tsx           # Mobile app redirect handler
│   │   ├── AuthConfirm.tsx           # Authentication confirmation
│   │   ├── AuthConfirmPage.tsx       # Authentication confirmation page
│   │   └── NotFoundPage.tsx          # 404 page
│   │
│   └── src/page/                     # Additional pages
│       └── HomePage.tsx              # Main landing page with search and filters
│
├── 🪝 Hooks
│   │   └── src/hooks/                # Custom React hooks
│   │       ├── useAuthQuery.ts       # Auth state queries
│   │       ├── useImageUpload.ts     # Cloudinary upload hook
│   │       ├── useIntersectionObserver.ts # Viewport intersection tracking
│   │       ├── useNotifications.ts   # General notifications hook
│   │       ├── useRealtimeNotifications.ts # Supabase realtime notifications
│   │       ├── useServiceManager.ts  # Service management hook
│   │       └── useServiceWorker.ts   # PWA service worker hook
│   │
│   ├── 🔧 Libraries & Utilities
│   └── src/lib/
│       ├── api.ts                    # Backend API calls (1044 lines)
│       │                             # - Client profile management
│       │                             # - Public reads (technicians, articles)
│       │                             # - Client leads/bookings with soft delete
│       │                             # - Technician leads and notifications
│       │                             # - Technician profile updates
│       │                             # - Services and service variants
│       │                             # - Reviews with admin approval workflow
│       │                             # - Cloudinary upload
│       │                             # - Admin functions (leads, reviews)
│       │                             # - TikTok thumbnail fetching
│       │                             # - Verification status retrieval
│       ├── auth.ts                   # Supabase authentication
│       │                             # - Google OAuth (client & technician)
│       │                             # - Email/password auth
│       │                             # - Session management with CORS handling
│       │                             # - Profile completion checks
│       ├── supabase.ts               # Supabase client with CORS error handling
│       ├── verificationEngine.ts     # Verified badge evaluation engine
│       │                             # - Gate 1: Hard requirements (status, jobs, rating)
│       │                             # - Gate 2: Profile completeness scoring (60+ points)
│       │                             # - Progress tracking with actionable hints
│       │                             # - Bonus points for TikTok integration
│       ├── cloudinary.ts             # Image optimization helpers
│       │                             # - profileThumb (120x120 face-cropped)
│       │                             # - cardCover (600x380)
│       │                             # - fullImage (1200x800)
│       ├── cloudinary-advanced.ts    # Advanced Cloudinary transformations
│       ├── imageOptimization.ts      # Image optimization utilities
│       ├── connectionQuality.ts      # Network quality detection
│       ├── pwaDetection.ts           # PWA installation detection
│       └── location.ts               # Geolocation services with Nominatim
│
├── 💾 Database
│   ├── migrations/                   # Database migrations (45 files)
│   │   ├── 001_update_technician_schema.sql # Initial schema
│   │   ├── 015_review_approval_workflow.sql # Review moderation
│   │   ├── 022_add_business_hours.sql       # Business hours
│   │   ├── 023_add_service_variants.sql     # Service variants
│   │   ├── 032_add_rating_columns_to_technicians.sql # Rating system
│   │   ├── 033_add_booking_cleanup_function.sql # Automatic cleanup
│   │   ├── 035_add_article_key_takeaways_definitions.sql # Article enhancements
│   │   ├── 041_add_service_categories.sql   # Service categories
│   │   ├── 042_add_primary_service_to_technicians.sql # Primary service designation
│   │   ├── 043_add_emergency_booking_support.sql # Emergency booking system
│   │   ├── 044_add_trusted_brands_and_service_guarantee.sql # Trust signals
│   │   ├── 045_add_verified_badge_system.sql # Verified badge with job tracking
│   │   └── ... (35 more migrations)
│   │
│   └── supabase/                     # Supabase Edge Functions
│       └── functions/
│           ├── send-lead-notification/      # Email notifications for leads
│           ├── send-review-email/           # Email notifications for reviews
│           └── get-tiktok-thumbnail/        # TikTok thumbnail fetching
│
├── 🎨 Styles
│   └── src/
│       └── index.css                 # Global Tailwind styles with custom utilities
│
├── 🔨 Scripts
│   └── scripts/
│       ├── generate-sitemap.js       # SEO sitemap generator
│       └── verify-rating-trigger.js  # Database trigger verification
│
├── 🌐 Sitemap Worker
│   └── sitemap worker/
│       ├── sitemap-worker.js         # Cloudflare Worker for dynamic sitemap
│       └── wrangler.toml             # Cloudflare Worker config
│
└── 📚 Documentation
    ├── README.md                     # This file
    └── ROADSIDE_EMERGENCY_IMPLEMENTATION.md # Emergency system implementation guide
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm 9+
- **Supabase Account** (free tier available)
- **Cloudinary Account** (free tier available)
- **Git** for version control
- **Google Cloud Project** (for OAuth)

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/autogearke-bader/AutoGear-Ke.git
cd AutoGear-Ke/AutoGearKe

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your Supabase and Cloudinary credentials (see next section)

# 4. Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

### First-Time Setup Checklist

- [ ] Clone repository
- [ ] Install dependencies: `npm install`
- [ ] Create Supabase project
- [ ] Create Cloudinary account
- [ ] Set up Google OAuth credentials
- [ ] Configure `.env` file
- [ ] Run database migrations in Supabase
- [ ] Deploy Edge Functions to Supabase
- [ ] Test local development: `npm run dev`
- [ ] Verify all API calls work
- [ ] Test authentication flow

---

## 🔐 Environment Configuration

### Creating .env File

Create a `.env` file in the `AutoGearKe/` directory with these required variables:

```bash
# Supabase Configuration (REQUIRED)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Cloudinary Configuration (REQUIRED)
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=your-unsigned-upload-preset

# Nominatim (OpenStreetMap) - No API key required
# Used for geocoding and reverse geocoding
VITE_NOMINATIM_URL=https://nominatim.openstreetmap.org
```

### ⚠️ Important Security Notes

- **Never commit `.env` to git** - Add to `.gitignore`
- **VITE_ prefix is public** - These variables are exposed to the client
- **Keep anon key safe** - It has limited permissions via RLS policies
- **Use different keys per environment** - Development, staging, production
- **Rotate keys regularly** - After security incidents or team changes
- **Server-only secrets** - Use environment variables without VITE_ prefix (not exposed)

### Getting Credentials from External Services

#### Supabase Setup (Step-by-Step)

1. **Create Account:**
   - Go to [https://supabase.com](https://supabase.com)
   - Click "Start your project" or sign in

2. **Create New Project:**
   - Click "New Project"
   - Enter project name (e.g., "mekh-development")
   - Create a strong database password
   - Select region closest to you
   - Click "Create new project"
   - Wait 2-5 minutes for project to initialize

3. **Get API Credentials:**
   - Go to **Settings → API**
   - Copy **Project URL** → `VITE_SUPABASE_URL`
   - Copy **anon/public key** → `VITE_SUPABASE_ANON_KEY`
   - (Keep service_role key private - never expose to client)

4. **Enable Authentication Providers:**
   - Go to **Authentication → Providers**
   - Enable **Email** for technician registration
   - Enable **Google** for OAuth sign-in:
     - You'll need Google OAuth credentials (see Google OAuth Setup below)
   - Set **Email Templates** for password reset

5. **Configure Allowed URLs:**
   - Go to **Authentication → URL Configuration**
   - Set **Site URL**: `https://yourdomain.com` (production)
   - Add **Redirect URLs**:
     - `https://yourdomain.com/auth/callback`
     - `http://localhost:3000/auth/callback` (development)
     - `com.mekh.app://auth/callback` (Capacitor/Android)
   - This prevents OAuth redirect errors

6. **Set up RLS (Row Level Security):**
   - Go to **SQL Editor**
   - Run all migrations from `migrations/` folder in order
   - Start with `001_update_technician_schema.sql`
   - End with latest migration
   - Each migration builds on previous ones
   - Verify tables exist: `SELECT * FROM information_schema.tables`

7. **Deploy Edge Functions:**
   - Go to **Edge Functions**
   - Create function: `send-lead-notification`
     - Triggers when new lead is created
     - Sends email to technician
   - Create function: `send-review-email`
     - Triggers when review approved
     - Sends review request email
   - Create function: `get-tiktok-thumbnail`
     - Called when TikTok video URL provided
     - Returns video thumbnail URL

#### Cloudinary Setup (Step-by-Step)

1. **Create Account:**
   - Go to [https://cloudinary.com](https://cloudinary.com)
   - Click "Sign Up" or "Try for Free"
   - Complete email verification

2. **Get Cloud Name:**
   - Go to [Console Dashboard](https://cloudinary.com/console)
   - See **Cloud Name** at top
   - Copy to `VITE_CLOUDINARY_CLOUD_NAME`

3. **Create Upload Preset:**
   - Go to **Settings → Upload**
   - Click **Add upload preset**
   - Configuration:
     - **Name**: `mekh_unsigned` (or your choice)
     - **Unsigned Mode**: `ON` (allows unsigned uploads from browser)
     - **Folder**: `mekh/` (organizes all images)
     - **Allowed formats**: `jpg, png, webp, avif`
     - **Transformation**: (optional - keep empty, handled in code)
   - Click **Save**
   - Copy preset name to `VITE_CLOUDINARY_UPLOAD_PRESET`

4. **Understand Cloudinary Transformations:**
   - Images uploaded to `mekh/` folder can be transformed on-demand
   - Examples:
     - `https://res.cloudinary.com/{cloud}/image/upload/w_120,h_120,c_thumb,g_face/mekh/image.jpg` (avatar)
     - `https://res.cloudinary.com/{cloud}/image/upload/w_600,h_380,c_fill/mekh/image.jpg` (card cover)
   - No additional setup needed - transformations applied in `src/lib/cloudinary.ts`

#### Google OAuth Setup (Step-by-Step)

1. **Create Google Cloud Project:**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Click "New Project"
   - Enter name (e.g., "Mekh")
   - Click "Create"
   - Wait for project initialization

2. **Enable Google+ API:**
   - In sidebar, go to **APIs & Services → Enabled APIs & Services**
   - Click **Enable APIs and Services**
   - Search for "Google+ API"
   - Click on it and press **Enable**

3. **Create OAuth Credentials:**
   - Go to **APIs & Services → Credentials**
   - Click **Create Credentials → OAuth client ID**
   - Choose **Web application**
   - Configuration:
     - **Name**: `Mekh OAuth Client`
     - **Authorized JavaScript origins**: Add your domains
       - `http://localhost:3000` (development)
       - `https://yourdomain.com` (production)
     - **Authorized redirect URIs**: Add callback URLs
       - `https://your-project.supabase.co/auth/v1/callback`
   - Click **Create**
   - Copy **Client ID** and **Client Secret**

4. **Add to Supabase:**
   - Go to Supabase **Authentication → Providers → Google**
   - Enable the provider
   - Paste **Client ID** and **Client Secret** from Google Cloud
   - Click **Save**
   - Test with "Test Google OAuth" button

5. **Verify Setup:**
   - Open `http://localhost:3000`
   - Click "Sign in with Google"
   - You should be redirected to Google login
   - After login, redirected back to app
   - User profile created in Supabase

#### Database Schema & Migrations

**Running Migrations:**

```sql
-- In Supabase SQL Editor, run each file in order:
-- 1. Copy entire contents of 001_update_technician_schema.sql
-- 2. Paste into SQL Editor
-- 3. Click "Run"
-- 4. Verify no errors (check output panel)
-- 5. Repeat for each migration file in order

-- After all migrations:
-- Verify tables exist:
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Verify RLS is enabled:
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

**What Each Migration Does:**

- **001-020**: Core schema, RLS policies, admin functions
- **022**: Business hours scheduling with "Available on Request"
- **023**: Service variants (e.g., "3M Tint", "Ceramic Tint")
- **032**: Rating and review system
- **043**: Emergency booking system
- **045**: Verified badge system with job counting

**Key Tables Created:**
- `technicians` - Business profiles
- `technician_services` - Services offered
- `service_variants` - Service pricing options
- `clients` - Client profiles
- `leads` - Booking requests
- `reviews` - Client feedback
- `articles` - Blog content
- `notifications` - Real-time alerts

---

## 🔧 Setting Up External Services

### Firebase Cloud Messaging (Push Notifications)

1. **Create Firebase Project:**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Click "Add project"
   - Name it "Mekh"
   - Accept terms and click "Create"

2. **Get Server Credentials:**
   - Go to **Project Settings → Service Accounts**
   - Click "Generate New Private Key"
   - Save JSON file securely (never commit to git)

3. **Configure for Mobile:**
   - Go to **Project Settings → Cloud Messaging**
   - Copy **Server API Key**
   - Add to Capacitor config (android/app/google-services.json)

4. **Test Push Notifications:**
   - Use test payload in Firebase console
   - Or via `src/lib/pushNotifications.ts`

### Email Service (Resend)

1. **Create Account:**
   - Go to [Resend](https://resend.com)
   - Sign up with email

2. **Get API Key:**
   - Go to **API Keys**
   - Create new API key
   - Add to Supabase Edge Function environment variables

3. **Configure Email Templates:**
   - Review email functions in `supabase/functions/`
   - Update sender email and template styling
   - Test with dummy email address

---

## 💻 Development

### Available Scripts

```bash
# Development
npm run dev              # Start dev server (localhost:3000)
npm run build            # Production build
npm run preview          # Preview production build

# Testing
npm run test             # Run tests once
npm run test:watch       # Run tests in watch mode
npm run test:ui          # Open Vitest UI

# Utilities
npm run sitemap          # Generate sitemap.xml
npm run clean            # Clean build artifacts
npm run clean:build      # Clean and rebuild
npm run analyze          # Analyze bundle size
```

### Development Workflow

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Follow TypeScript best practices
   - Use existing components when possible
   - Add types for new data structures

3. **Test Changes**
   ```bash
   npm run test
   npm run dev  # Manual testing
   ```

4. **Build & Verify**
   ```bash
   npm run build
   npm run preview
   ```

5. **Commit & Push**
   ```bash
   git add .
   git commit -m "feat: your feature description"
   git push origin feature/your-feature-name
   ```

### Code Style Guidelines

- **TypeScript**: Use strict mode, define interfaces for all data
- **React**: Functional components with hooks
- **Styling**: Tailwind CSS utility classes
- **Naming**: camelCase for variables, PascalCase for components
- **Files**: One component per file, co-locate related files

---

## 🌐 Deployment

### Build for Production

```bash
# Create optimized production build
npm run build

# Output will be in dist/ folder
# dist/
# ├── index.html
# ├── assets/
# │   ├── index-[hash].js          (~60 KB)
# │   ├── vendor-react-[hash].js   (~188 KB)
# │   ├── vendor-supabase-[hash].js (~166 KB)
# │   ├── vendor-router-[hash].js  (~60 KB)
# │   ├── vendor-leaflet-[hash].js (~149 KB - lazy)
# │   ├── AdminPage-[hash].js      (~232 KB - lazy)
# │   └── ...
# ├── manifest.json
# ├── sw.js (service worker)
# └── robots.txt
```

### Deployment Platforms

#### Netlify (Recommended - Currently Used)

The project is configured for Netlify with:
- `_headers` file for security headers (CSP, X-Frame-Options, etc.)
- `_redirects` file for SPA routing
- Automatic HTTPS
- CDN distribution
- Continuous deployment from Git

**Build Settings:**
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Environment Variables to Set:**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_CLOUDINARY_CLOUD_NAME`
- `VITE_CLOUDINARY_UPLOAD_PRESET`
- `VITE_NOMINATIM_URL`

#### Vercel

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

#### Cloudflare Pages

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### Custom Server (VPS/Docker)

```bash
# Build the app
npm run build

# Serve dist/ folder with any static server
# Example with serve:
npx serve -s dist -l 3000

# Or with nginx:
# Copy dist/ to /var/www/html
# Configure nginx to serve index.html for all routes
```

### Post-Deployment Checklist

- [ ] Verify environment variables are set correctly
- [ ] Test Google OAuth login flow
- [ ] Verify Cloudinary image uploads work
- [ ] Test PWA installation on mobile devices
- [ ] Check service worker caching behavior
- [ ] Verify SEO meta tags and structured data
- [ ] Test offline mode functionality
- [ ] Verify Supabase RLS policies are working
- [ ] Check admin dashboard access
- [ ] Test email notifications (lead, review)
- [ ] Verify sitemap generation
- [ ] Test WhatsApp lead tracking
- [ ] Check performance metrics (Lighthouse)

### Monitoring & Analytics

**Recommended Tools:**
- **Sentry**: Error tracking and performance monitoring
- **Google Analytics**: User behavior and traffic analysis
- **Supabase Dashboard**: Database queries and API usage
- **Cloudinary Dashboard**: Image delivery and bandwidth
- **Lighthouse CI**: Automated performance testing

---

## 🏗 Architecture

### Application Flow

```
┌─────────────────────────────────────────────────────────────┐
│                         User Access                          │
│              (Browser / PWA / Mobile Device)                 │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    React Application                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   HomePage   │  │  Auth Pages  │  │ Profile Pages│      │
│  │  (Search &   │  │  (Google     │  │ (Client &    │      │
│  │   Filters)   │  │   OAuth)     │  │  Technician) │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Technician   │  │   Booking    │  │    Admin     │      │
│  │   Profile    │  │  Management  │  │  Dashboard   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Layer (src/lib/)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   api.ts     │  │   auth.ts    │  │ cloudinary.ts│      │
│  │ (1044 lines) │  │ (Session &   │  │ (Image CDN)  │      │
│  │              │  │  OAuth)      │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐                         │
│  │ location.ts  │  │ supabase.ts  │                         │
│  │ (Geocoding)  │  │ (Client)     │                         │
│  └──────────────┘  └──────────────┘                         │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┴───────────────┬──────────────────┐
         ▼                               ▼                  ▼
┌──────────────────┐          ┌──────────────────┐  ┌──────────────┐
│    Supabase      │          │    Cloudinary    │  │  Nominatim   │
│  - PostgreSQL    │          │  - Image CDN     │  │  - Geocoding │
│  - Auth (JWT)    │          │  - Optimization  │  │  - Reverse   │
│  - RLS Policies  │          │  - Transforms    │  │    Lookup    │
│  - Edge Functions│          └──────────────────┘  └──────────────┘
│    * Lead Email  │
│    * Review Email│
│    * TikTok API  │
└──────────────────┘
```

### Database Schema (45 Migrations)

#### Core Tables
- **technicians** - Technician profiles with business info, location, status, tow truck plates, trusted brands, service guarantees, completed jobs count
- **technician_services** - Services offered with pricing, categories, and primary designation
- **service_variants** - Service variants (e.g., "3M Tint", "Full Wrap")
- **technician_photos** - Portfolio photos with captions and alt text
- **technician_videos** - TikTok/YouTube/Instagram videos with thumbnails
- **technician_payments** - Accepted payment methods
- **business_hours** - Weekly schedule with "Available on Request" option

#### User Tables
- **clients** - Client profiles with name, phone, email
- **leads** - Booking requests with status tracking, WhatsApp tracking, and emergency details
  - Emergency fields: situation, transmission, fuel_type, mobility_status, eta_minutes, is_emergency
- **reviews** - Client reviews with admin approvall workflow
- **notifications** - Notifications for technicians and clients

#### Content Tables
- **articles** - Blog articles with SEO metadata, FAQs, key takeaways
- **services** - Global service catalog

#### Key Features
- **Row Level Security (RLS)** - Database-level access control
- **Triggers** - Automatic rating calculation, client profile creation
- **Functions** - Cleanup old bookings, upsert client profiles, find nearby emergency technicians
- **Indexes** - Optimized queries for technician search and geospatial lookups
- **Emergency System** - Server-side processing with `find_nearby_emergency_technicians()` function
  - Haversine distance calculation
  - ETA computation (40 km/h average speed)
  - Category-based filtering (mechanical_repair vs towing)
  - Indexed geospatial queries on latitude/longitude

### Data Flow

1. **User Action** → Component event handler (e.g., search, book, review)
2. **API Call** → `src/lib/api.ts` or `src/lib/auth.ts` with type-safe parameters
3. **Supabase** → Database query with Row Level Security (RLS) enforcement
4. **Response** → Update React state with TypeScript types
5. **Re-render** → UI updates with optimistic updates where appropriate

### State Management

- **Local State**: React useState for component-level state
- **Context**: ThemeContext for dark mode preference
- **Auth State**: Supabase auth state listener in Layout.tsx
- **Server State**: Direct Supabase queries (no Redux/Zustand needed)
- **Form State**: Controlled components with validation
- **Cache**: Service worker caches for offline support

### Routing Strategy

- **Lazy Loading**: All pages loaded on-demand with React.lazy
- **Code Splitting**: Automatic via Vite with manual chunks
  - vendor-react.js (~188 KB)
  - vendor-supabase.js (~166 KB)
  - vendor-router.js (~60 KB)
  - vendor-leaflet.js (~149 KB) - maps only
  - AdminPage.js (~232 KB) - admin only
- **Prefetching**: Service worker caches routes after first visit
- **Protected Routes**: Auth check in Layout component with redirects
- **SEO Routes**: Service location pages for SEO (/services/:service/:location)
- **Emergency Routes**: 
  - `/roadside-emergency` - Emergency booking form
  - `/roadside-emergency/technician/:slug` - Emergency technician profile

---

## 🚨 Emergency System Architecture

### Server-Side Processing Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Emergency Request                  │
│  (Location, Situation, Vehicle Details, Mobility Status)     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              PostgreSQL Function (Server-Side)               │
│         find_nearby_emergency_technicians()                  │
│                                                               │
│  1. Filter by Service Category                               │
│     - mobility='yes' → mechanical_repair                     │
│     - mobility='barely'/'no' → towing                        │
│                                                               │
│  2. Calculate Distance (Haversine Formula)                   │
│     - Uses indexed lat/lng columns                           │
│     - Sorts by proximity                                     │
│                                                               │
│  3. Compute ETA                                              │
│     - distance_km / 40 km/h average speed                    │
│     - Returns pre-calculated minutes                         │
│                                                               │
│  4. Limit Results                                            │
│     - Returns top 4 nearest technicians                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Client Receives Results                   │
│  - Up to 4 technicians with distance_km and eta_minutes     │
│  - No client-side computation required                       │
│  - Optimized for low-bandwidth/low-power devices            │
└─────────────────────────────────────────────────────────────┘
```

### Emergency Booking Flow

```
1. User fills emergency form
   ├─ Auto-detect GPS location (or manual entry)
   ├─ Select situation (Won't start, Tyre puncture, etc.)
   ├─ Enter vehicle details (make, transmission, fuel)
   ├─ Describe problem
   └─ Indicate mobility status

2. Server finds nearby technicians
   ├─ Filter by category based on mobility
   ├─ Calculate distance and ETA
   └─ Return top 4 results

3. User selects technician
   └─ Navigate to emergency technician profile

4. User clicks "Book Now"
   ├─ Check authentication
   ├─ Create emergency booking (atomic transaction)
   │   ├─ Save all emergency details
   │   ├─ Store pre-calculated ETA
   │   └─ Include tow truck plate if applicable
   ├─ Trigger email notification to technician
   └─ Show confirmation with Call/WhatsApp buttons

5. User contacts technician
   ├─ Call: Direct phone dialer
   └─ WhatsApp: Pre-filled message with all details
```

### Database Optimization

**Indexed Columns:**
- `technicians.latitude` + `technicians.longitude` - Geospatial queries
- `technician_services.category` - Fast category filtering
- `leads.is_emergency` - Emergency booking queries

**PostgreSQL Function:**
```sql
find_nearby_emergency_technicians(
  p_lat NUMERIC,
  p_lng NUMERIC,
  p_mobility_status TEXT,
  p_max_results INTEGER DEFAULT 4
)
```

**Performance:**
- All computation on server (distance, ETA, filtering)
- Single database query with indexed lookups
- Results limited to 4 technicians
- Optimized for slow networks and low-end devices

---

## 🔒 Security

### Authentication & Authorization

- **Supabase Auth**: JWT-based authentication with automatic token refresh
- **Google OAuth**: Seamless sign-in with Google accounts
- **Row Level Security (RLS)**: Database-level access control for all tables
- **Role-Based Access**: Client, Technician, Admin roles with distinct permissions
- **Session Management**: Automatic token refresh with CORS error handling
- **Profile Completion**: Enforced onboarding for new users

### Data Protection

- **Input Sanitization**: DOMPurify for user-generated content (reviews, articles)
- **XSS Prevention**: Content Security Policy headers in production
- **SQL Injection**: Parameterized queries via Supabase client
- **CORS**: Configured in Supabase dashboard for allowed origins
- **Environment Variables**: Client-side vars prefixed with VITE_ only
- **Secrets Management**: Server-only secrets never exposed to client

### Privacy

- **WhatsApp Privacy**: Phone numbers only shared after booking confirmation
- **Email Privacy**: Not displayed publicly on profiles
- **Location Privacy**: Approximate location only (area, not exact address)
- **GDPR Compliance**: Data deletion on request via admin
- **Review Moderation**: Admin approval required before reviews go live
- **Soft Deletes**: Bookings hidden from client view after 2 days

### Security Headers

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://esm.sh; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://*.supabase.co https://res.cloudinary.com https://api.cloudinary.com https://nominatim.openstreetmap.org; frame-src 'self' https://www.youtube.com https://www.tiktok.com;
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(self), camera=(), microphone=()
```

### RLS Policies

- **Technicians**: Can view/update own profile, services, photos, videos
- **Clients**: Can view own bookings, submit reviews for completed jobs
- **Admins**: Full access to all tables with is_admin() function
- **Public**: Read-only access to live technicians, approved reviews, published articles

---

## 🧪 Testing

### Test Structure

```
AutoGearKe/
├── vitest.config.ts              # Test configuration
└── src/
    └── __tests__/                # Test files (to be created)
        ├── components/           # Component tests
        ├── lib/                  # API and utility tests
        └── pages/                # Page integration tests
```

### Running Tests

```bash
# Run all tests once
npm run test

# Watch mode for development
npm run test:watch

# UI mode with visual test runner
npm run test:ui

# Coverage report
npm run test -- --coverage
```

### Testing Strategy

#### Unit Tests
- Individual functions and components
- API calls with mocked Supabase client
- Auth flows with session management
- Utility functions (slugify, geocoding)

#### Property-Based Tests (Fast-check)
- Edge case discovery for search filters
- Service variant pricing validation
- Rating calculation accuracy
- Input validation (phone numbers, emails)

#### Integration Tests
- Complete user flows (sign up → profile → booking)
- Admin workflows (approve technician → approve review)
- WhatsApp lead tracking
- Review submission and approval

#### E2E Tests (Planned)
- Critical user journeys
- Payment flows
- Mobile PWA installation
- Offline functionality

### Test Coverage Goals

- **API Layer**: 80%+ coverage for critical paths
- **Auth**: 90%+ coverage for security-critical code
- **Components**: 70%+ coverage for reusable components
- **Pages**: 60%+ coverage for page-level logic

### Example Test

```typescript
import { describe, it, expect, vi } from 'vitest';
import { searchTechnicians } from '@/src/lib/api';
import * as api from '@/src/lib/api';

describe('searchTechnicians', () => {
  it('should return technicians matching service', async () => {
    vi.spyOn(api, 'searchTechnicians').mockResolvedValue([
      { id: '1', business_name: 'Tech 1', profile_status: 'live' }
    ]);
    
    const results = await searchTechnicians('window tint');
    expect(results).toHaveLength(1);
  });
});
```

---

## 🐛 Troubleshooting & Common Issues

### Build & Compilation Issues

#### `npm run build` fails with errors

**Check Node version:**
```bash
node --version  # Should be 18+
npm --version   # Should be 9+
```

**Clear cache and rebuild:**
```bash
npm run clean:build
npm install
npm run build
```

**TypeScript errors:**
```bash
# Restart TypeScript server
# In VS Code: Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"

# Or regenerate build info
rm tsconfig.tsbuildinfo
npm run build
```

### Authentication Issues

#### Google OAuth callback fails
- Check redirect URI in Supabase matches Google Cloud Console
- Verify domain is added to Supabase URL configuration
- Clear browser cookies and try again
- Check browser console for specific error

#### CORS errors during login
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct
- Check that your domain is allowed in Supabase CORS settings
- The app has automatic CORS error detection - should retry automatically
- If persists, try incognito mode to clear cache

#### Session expires immediately
- Check token expiry in Supabase dashboard
- Verify `refreshSessionIfNeeded()` is being called
- Check browser localStorage for supabase session
- May need manual logout/login cycle

### Database & API Issues

#### RLS (Row Level Security) errors
**Error:** `new row violates row-level security policy`

**Solutions:**
1. Verify user is authenticated: `supabase.auth.getSession()`
2. Check RLS policies in Supabase SQL Editor
3. Verify `is_admin()` function works: `SELECT is_admin();`
4. Check user role in auth.users metadata
5. Some operations use server functions to bypass RLS (e.g., `upsert_client_profile`)

#### Missing data after updates
- Check if data is soft-deleted (check `is_archived` column)
- Verify RLS policies allow reading updated data
- Clear React Query cache: `queryClient.invalidateQueries()`
- Check Supabase logs for actual errors

#### Slow database queries
- Check if geospatial indexes are created (for emergency system)
- Verify technician_services.category is indexed
- Use Supabase dashboard to analyze slow queries
- Consider pagination for large lists (avoid SELECT *)

### Image & Media Issues

#### Images not loading
**Solutions:**
1. Verify Cloudinary cloud name: `echo $VITE_CLOUDINARY_CLOUD_NAME`
2. Check upload preset exists in Cloudinary dashboard
3. Verify images folder path is correct
4. Check Cloudinary transformation URLs in dev tools
5. Ensure browser can reach res.cloudinary.com (check firewall)

#### Image uploads fail
- Check browser file size limits (max 100MB recommended)
- Verify upload preset is set to "Unsigned"
- Check Cloudinary bandwidth hasn't been exceeded
- Browser image compression should pre-process files
- Try uploading from different device to isolate issue

#### Video thumbnails not fetching
- Check TikTok/YouTube URL format is correct
- Verify Edge Function `get-tiktok-thumbnail` is deployed
- Check Supabase Edge Function logs for errors
- Some videos have restricted embedding - manual thumbnail may be needed

### Performance & PWA Issues

#### PWA not installing on mobile
**Solutions:**
1. Must be accessed via HTTPS (http://localhost:3000 won't show install prompt)
2. Check manifest.json is accessible and valid
3. Service worker must be registered successfully (DevTools → Application)
4. Add 5+ page views before install prompt shows
5. Device/browser hasn't dismissed prompt (check localStorage)

**For testing locally:**
```bash
npm run build
npm run preview  # Serves on http://localhost:4173
# For HTTPS testing, use ngrok or similar tunnel
```

#### App is slow on mobile
- Check Chrome DevTools → Lighthouse performance score
- Reduce image sizes with Cloudinary parameters
- Enable compression in production
- Check for console errors blocking rendering
- Try clearing service worker cache: DevTools → Application → Clear Storage

#### Offline mode not working
- Verify service worker is registered: `navigator.serviceWorker.ready`
- Check that pages are in service worker precache list
- Manually trigger offline by disabling network in DevTools
- Verify OfflineFallback component is being shown
- Check `isOnline` state vs actual network connectivity

### Development Server Issues

#### Hot Module Replacement (HMR) not working
```bash
# Kill dev server
npm run dev  # Start fresh

# Or clear Vite cache
npm run clean
npm run dev
```

**For remote dev server:**
```typescript
// vite.config.ts
export default defineConfig({
  server: {
    hmr: {
      host: 'your-remote-host.com',
      port: 443,
      protocol: 'wss'
    }
  }
});
```

#### Dependencies not found
```bash
# Reinstall dependencies
rm -rf node_modules
npm cache clean --force
npm install
```

### Deployment Issues

#### Netlify build fails
- Check build logs in Netlify dashboard
- Verify all env vars are set in Netlify settings
- Ensure package.json scripts match Netlify build command
- Check that `dist/` folder is generated correctly

#### Subdomains not working
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### API calls fail on production
- Verify Supabase URL and keys are for production project
- Check that production domain is added to Supabase allowed origins
- Verify CORS headers in Netlify `_headers` file
- Check Network tab in DevTools for actual error details

### Emergency System Specific Issues

#### Emergency technician search returns no results
- Verify technicians have latitude/longitude set
- Check that their service category is set (mechanical_repair vs towing)
- Verify technician profile status is 'live' (not pending)
- Check database function: `SELECT find_nearby_emergency_technicians(...)`
- Increase search radius if no technicians in immediate area

#### ETA calculation seems wrong
- Check that server speed estimate (40 km/h) is reasonable for area
- Verify distance calculation in database function
- Confirm technician coordinates are accurate
- Check for issues with reverse geocoding (may use approximate location)

### WhatsApp Integration Issues

#### WhatsApp messages not arriving
- Verify phone numbers have country code (+254 for Kenya)
- Check that phone number is WhatsApp-enabled
- Verify message content doesn't trigger spam filter
- Check Supabase logs for send failures
- Message may be queued if WhatsApp rate limit hit

#### Lead not tracking from WhatsApp
- Verify `whatsapp_sent` flag is being set when button clicked
- Check that client is authenticated before allowing WhatsApp
- Verify lead is being created in database
- Check for silent errors in browser console

---

## 🔗 Related Documentation

- [PUSH_NOTIFICATIONS.md](PUSH_NOTIFICATIONS.md) - Detailed push notification setup
- [ROADSIDE_EMERGENCY_IMPLEMENTATION.md](ROADSIDE_EMERGENCY_IMPLEMENTATION.md) - Emergency system deep dive
- [Supabase Docs](https://supabase.com/docs) - Database and auth reference
- [Capacitor Docs](https://capacitorjs.com/docs) - Native app development
- [React Router Docs](https://reactrouter.com) - Routing reference
- [Tailwind CSS Docs](https://tailwindcss.com/docs) - CSS utility classes
- [Vite Docs](https://vitejs.dev) - Build tool reference

---

## 🎯 Migration Guide (from Previous Systems)

### If Migrating from PHP/MySQL
- All database operations now use Supabase PostgreSQL
- Use `src/lib/api.ts` for all backend calls instead of direct API endpoints
- User authentication uses Supabase Auth instead of session cookies
- Images are served from Cloudinary instead of local storage
- Row Level Security provides automatic data filtering

### If Migrating from Previous React Version
- Update all API calls to use new `src/lib/api.ts` functions
- Replace old context/Redux state with direct Supabase queries
- Update component imports to use new folder structure
- Run tests to verify functionality
- Update environment variables to match new schema

---



### Image Optimization

```typescript
// Automatic WebP/AVIF conversion with Cloudinary
import { profileThumb, cardCover, fullImage } from './lib/cloudinary';

// 120x120 face-cropped avatar (g_face, c_thumb)
const avatar = profileThumb(user.avatarUrl);

// 600x380 cover image for cards (c_fill)
const cover = cardCover(technician.coverPhoto);

// 1200x800 full-size image for detail pages
const full = fullImage(technician.profileImage);
```

### Code Splitting

- **Route-based**: Each page is a separate chunk loaded on-demand
- **Vendor splitting**: React, Supabase, Router in separate bundles
- **Dynamic imports**: Heavy components (maps, admin) loaded on-demand
- **Lazy components**: React.lazy for all page components

### Caching Strategy

#### Service Worker (Workbox)
- **Static Assets**: NetworkFirst strategy (7 days cache)
- **API Calls**: NetworkOnly (no caching for fresh data)
- **Images**: CacheFirst with Cloudinary CDN (30 days)
- **Fonts**: CacheFirst with Google Fonts (1 year)
- **Auth**: NetworkOnly (bypass service worker for CORS)

#### Browser Cache
- **Immutable Assets**: Long-term caching with content hashes
- **HTML**: No cache (always fresh)
- **Manifest**: No cache (PWA updates)

### Bundle Size

```
vendor-react.js      ~188 KB (React + React DOM)
vendor-supabase.js   ~166 KB (Supabase client)
vendor-router.js     ~60 KB  (React Router)
vendor-leaflet.js    ~149 KB (Leaflet maps - lazy loaded)
AdminPage.js         ~232 KB (Admin dashboard - lazy loaded)
index.js             ~60 KB  (App code)
```

### Performance Metrics

- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **Lighthouse Score**: 90+ (Performance, Accessibility, Best Practices, SEO)

---

---

## 🐛 Troubleshooting

### Common Issues

#### CORS Errors with Supabase

**Symptom**: `Failed to fetch` or CORS errors in console

**Solution**:
1. Add your domain to Supabase **Authentication → URL Configuration**
2. Check that `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct
3. The app includes automatic CORS error detection and session refresh
4. Service worker bypasses auth requests to prevent CORS issues

#### PWA Not Installing

**Symptom**: Install prompt doesn't appear

**Solution**:
1. Ensure you're using HTTPS (required for PWA)
2. Check that `manifest.json` is accessible
3. Verify service worker is registered (check DevTools → Application)
4. Clear browser cache and reload
5. Check that user hasn't dismissed the prompt (stored in localStorage)

#### Images Not Loading

**Symptom**: Broken images or slow loading

**Solution**:
1. Verify `VITE_CLOUDINARY_CLOUD_NAME` is correct
2. Check Cloudinary upload preset is set to "Unsigned"
3. Ensure images are in the correct folder (`mekh/`)
4. Check browser console for 404 errors
5. Verify Cloudinary CDN is not blocked by firewall

#### Google OAuth Not Working

**Symptom**: OAuth redirect fails or shows error

**Solution**:
1. Verify redirect URI in Google Cloud Console matches Supabase callback URL
2. Check that Google OAuth is enabled in Supabase **Authentication → Providers**
3. Ensure Client ID and Secret are correct
4. Add your domain to authorized origins in Google Cloud Console
5. Clear browser cookies and try again

#### Database RLS Errors

**Symptom**: `new row violates row-level security policy` or 401 errors

**Solution**:
1. Verify user is authenticated (check `supabase.auth.getSession()`)
2. Check RLS policies in Supabase dashboard
3. Ensure `is_admin()` function exists for admin access
4. Verify user role in `auth.users` metadata
5. Check that triggers are enabled (e.g., client profile creation)

#### Service Worker Caching Issues

**Symptom**: Old content showing after deployment

**Solution**:
1. Update service worker version in `vite.config.ts`
2. Clear browser cache and service worker
3. Use "Update on reload" in DevTools → Application → Service Workers
4. Check that `skipWaiting` is enabled in Workbox config
5. Verify cache names are unique per version

### Development Issues

#### Hot Module Replacement Not Working

```bash
# Clear Vite cache
npm run clean

# Restart dev server
npm run dev
```

#### TypeScript Errors

```bash
# Regenerate TypeScript build info
rm tsconfig.tsbuildinfo

# Restart TypeScript server in VS Code
# Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"
```

#### Build Failures

```bash
# Clean and rebuild
npm run clean:build

# Check for missing dependencies
npm install

# Verify Node version (18+ required)
node --version
```

### Getting Help

- **GitHub Issues**: Report bugs and feature requests
- **Supabase Discord**: Database and auth questions
- **Stack Overflow**: Tag questions with `react`, `vite`, `supabase`
- **Documentation**: Check official docs for React, Vite, Supabase

---

## 🤝 Contributing

### Development Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/mekh.git`
3. Create a feature branch: `git checkout -b feature/your-feature-name`
4. Install dependencies: `npm install`
5. Set up `.env` file with your credentials
6. Start dev server: `npm run dev`
7. Make your changes
8. Write/update tests: `npm run test`
9. Build and verify: `npm run build && npm run preview`
10. Submit a pull request

### Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: Add new feature
fix: Bug fix
docs: Documentation update
style: Code style changes (formatting, semicolons)
refactor: Code refactoring without behavior change
test: Test updates
chore: Build/config changes
perf: Performance improvements
```

**Examples:**
```bash
git commit -m "feat: add service variant search"
git commit -m "fix: resolve CORS error in auth flow"
git commit -m "docs: update README with deployment guide"
```

### Pull Request Process

1. **Update Documentation**: Update README if needed
2. **Add Tests**: Write tests for new features
3. **Ensure Tests Pass**: Run `npm run test` and fix failures
4. **Check TypeScript**: Run `npm run build` and fix errors
5. **Update CHANGELOG**: Add entry to CHANGELOG.md (if exists)
6. **Request Review**: Tag maintainers for review
7. **Address Feedback**: Make requested changes
8. **Squash Commits**: Clean up commit history before merge

### Code Style Guidelines

- **TypeScript**: Use strict mode, define interfaces for all data
- **React**: Functional components with hooks (no class components)
- **Styling**: Tailwind CSS utility classes (avoid custom CSS)
- **Naming**: 
  - camelCase for variables and functions
  - PascalCase for components and types
  - UPPER_CASE for constants
- **Files**: One component per file, co-locate related files
- **Imports**: Group imports (React, libraries, local)
- **Comments**: Use JSDoc for functions, inline comments for complex logic

### Testing Guidelines

- Write unit tests for new utility functions
- Write property-based tests for edge cases
- Write integration tests for API calls
- Aim for 70%+ code coverage
- Mock external dependencies (Supabase, Cloudinary)

---

---

## 💻 Development Workflow & Best Practices

### Project Structure Best Practices

**Folder Organization:**
```
src/
├── components/          # Reusable UI components (use .tsx extension)
├── contexts/           # React Context providers (currently empty - consider adding)
├── hooks/              # Custom React hooks (useAuthQuery, useImageUpload, etc.)
├── lib/                # Utility functions and API layer
│   ├── api.ts         # Main API functions (1044 lines - the heart of the app)
│   ├── auth.ts        # Authentication flows
│   ├── supabase.ts    # Supabase client config
│   └── ...other utilities
├── page/               # Full page components (HomePage)
└── index.css           # Global styles
pages/                  # Additional full page components (lazy-loaded)
```

### Code Style Guidelines

**TypeScript:**
- Use `strict: true` in tsconfig.json
- Always define interfaces for data structures:
  ```typescript
  interface Technician {
    id: string;
    business_name: string;
    profile_status: 'pending' | 'live' | 'suspended';
    // ... other fields
  }
  ```
- Use type inference where appropriate: `const user = getCurrentUser()` (auto-typed)
- Avoid `any` type - use generics instead

**React Components:**
- Use functional components with hooks (no class components)
- One component per file
- Co-locate related files:
  ```
  src/components/
  ├── BookingModal.tsx
  ├── BookingModal.css (if needed)
  └── bookingModal.test.ts
  ```
- Use descriptive prop names: `isLoading` not `loading`, `onSubmit` not `submit`
- Memoize expensive components: `export default memo(Component);`

**Styling:**
- Use Tailwind CSS utility classes (avoid inline styles)
- Dark mode: Use `dark:` prefix on classes
- Responsive: Use `sm:`, `md:`, `lg:` prefixes
- Custom CSS only when Tailwind doesn't suffice
- Global styles in `src/index.css`

**Naming Conventions:**
```typescript
// Variables and functions: camelCase
const getTechnician = async () => {};
const isOnlineStatus = true;

// Components and types: PascalCase
const BookingModal = () => {};
interface TechnicianProfile {}
type ServiceCategory = 'mechanical' | 'electrical';

// Constants: UPPER_CASE
const MAX_UPLOAD_SIZE = 10_000_000; // 10MB
const CACHE_TTL_MINUTES = 5;
```

**Error Handling:**
```typescript
// Always handle async errors
try {
  const technician = await getTechnicianBySlug(slug);
} catch (error) {
  console.error('Failed to fetch technician:', error);
  setError('Unable to load technician profile');
  // Don't silently fail - show user feedback
}

// For API calls, check error type
if (isCorsError(error)) {
  await refreshSession(); // Auto-retry on CORS
}
```

**Comments & Documentation:**
```typescript
/**
 * Fetch technician profile with all services and reviews.
 * Caches result for 10 minutes to reduce database load.
 * 
 * @param slug - Technician's URL slug (e.g., "john-automotive")
 * @returns Technician profile with services, photos, videos, reviews
 * @throws Error if technician not found or database error
 */
export const getTechnicianBySlug = async (slug: string) => {
  // ... implementation
};

// Use JSDoc comments for public functions
// Use inline comments for complex logic only
```

### Git Workflow

**Commit Messages (Conventional Commits):**
```bash
feat: Add service variant search
fix: Resolve CORS error in auth callback
docs: Update README with deployment guide
style: Format technician profile component
refactor: Extract technician card into component
test: Add tests for verification engine
chore: Update dependencies
perf: Optimize image loading with intersection observer
```

**Branch Naming:**
```bash
feature/service-variant-search
fix/cors-auth-error
docs/deployment-guide
refactor/technician-card
```

**Pull Request Template:**
```markdown
## Description
Briefly describe what this PR does.

## Related Issues
Fixes #123

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation

## Testing
How to test these changes:
1. Go to ...
2. Do ...
3. Verify ...

## Checklist
- [ ] Tests added/updated
- [ ] Docs updated
- [ ] No breaking changes
- [ ] Mobile tested
```

### Performance Guidelines

**Code Splitting:**
- Use `lazy(() => import('./page'))` for all page components
- Heavy components like maps should be lazy-loaded
- Vendor bundles handled automatically by Vite

**Memoization:**
```typescript
// Memoize expensive components
const TechnicianCard = memo(({ tech }: Props) => {
  return <div>{tech.name}</div>;
}, (prev, next) => prev.tech.id === next.tech.id); // Custom comparison
```

**Caching Strategy:**
- Use React Query for server state
- Cache API responses with `apiCache.ts`
- Service worker handles asset caching

**Image Optimization:**
- Always use Cloudinary transformations via helper functions
- Use `<OptimizedImage>` component wrapper
- Lazy-load images with `useIntersectionObserver()`

### Testing Guidelines

**What to Test:**
- API functions (mock Supabase)
- Auth flows (mock supabase.auth)
- Utility functions (pure logic)
- Critical paths (sign up → book → review)
- Edge cases (empty results, network errors)

**What NOT to Test:**
- Third-party libraries (Supabase, Cloudinary)
- UI rendering details (use E2E tests instead)
- Styling (manual testing only)

**Test Example:**
```typescript
import { describe, it, expect, vi } from 'vitest';
import { updateLeadStatus } from '@/src/lib/api';

describe('updateLeadStatus', () => {
  it('should update lead status and trigger notifications', async () => {
    const mockRpc = vi.fn().mockResolvedValue({ error: null });
    vi.spyOn(supabase, 'rpc').mockImplementation(mockRpc);
    
    await updateLeadStatus('lead-id', 'job_done');
    
    expect(mockRpc).toHaveBeenCalledWith('update_lead_status', {
      p_lead_id: 'lead-id',
      p_status: 'job_done'
    });
  });
});
```

### Debugging Tips

**Browser DevTools:**
1. **Network Tab**: Check API calls and response times
2. **Console**: Watch for errors and warnings
3. **Application Tab**: 
   - Check service worker registration
   - View localStorage/sessionStorage
   - Inspect cache storage
4. **React DevTools**: Profile component renders, check prop changes

**Common Issues to Check:**
1. Is user authenticated? Check localStorage for supabase session
2. Are RLS policies allowing the operation? Check Supabase logs
3. Is the service worker interfering? Clear cache in Application tab
4. Are env vars loaded? `console.log(import.meta.env.VITE_SUPABASE_URL)`

**Supabase Debugging:**
```typescript
// Enable logging in development
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(url, key, {
  auth: { debug: true }, // Log auth events
  db: { debug: true },   // Log DB calls (if available)
});

// Check actual SQL being executed
supabase.from('technicians').select('*'); // View in Network tab
```

**Performance Profiling:**
```bash
# Analyze bundle size
npm run analyze

# Measure page performance
lighthouse https://mekh.app
```

---

## 📚 Learning Resources

### For Getting Started
1. [React Docs](https://react.dev) - Modern React with hooks
2. [TypeScript Handbook](https://www.typescriptlang.org/docs/) - Type safety
3. [Tailwind CSS](https://tailwindcss.com/docs) - Utility-first CSS
4. [React Router](https://reactrouter.com/docs/) - Routing

### For Backend
1. [Supabase Docs](https://supabase.com/docs) - Database, auth, functions
2. [PostgreSQL Docs](https://www.postgresql.org/docs/) - SQL reference
3. [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security) - Security policies

### For Deployment
1. [Netlify Deploy](https://docs.netlify.com/) - Web hosting
2. [Vercel Docs](https://vercel.com/docs) - Alternative hosting
3. [Capacitor Docs](https://capacitorjs.com/docs/) - Native apps

### For Native Development
1. [Capacitor Guides](https://capacitorjs.com/docs/getting-started) - Cross-platform runtime
2. [Android Development](https://developer.android.com/docs) - Android specifics
3. [Firebase](https://firebase.google.com/docs) - Push notifications

---

## 🎓 Key Learnings & Lessons

### What Works Well

✅ **Server-Side Processing**: Emergency technician search computed on database saves bandwidth and battery
✅ **RLS Security**: Row-level security prevents data leaks naturally  
✅ **Session Caching**: Sub-1-second menu loads after first visit
✅ **Image Optimization**: Cloudinary CDN auto-formats saves 60% bandwidth
✅ **Code Splitting**: Lazy loading reduces initial JS bundle by 70%
✅ **PWA Support**: Works offline and installable like native app
✅ **Type Safety**: TypeScript catches errors before production

### What to Watch Out For

⚠️ **RLS Recursion**: Technician profile upsert needs server function to avoid infinite loops
⚠️ **CORS Issues**: Certain auth operations trigger CORS - have retry logic ready
⚠️ **Image Quality**: Cloudinary parameter tuning needed per device type
⚠️ **Service Worker Caching**: Old cache can serve stale data after deploy - need cache busting
⚠️ **Geolocation Privacy**: Be careful with GPS data - store approximate location only
⚠️ **Email Deliverability**: FCM/Resend emails may go to spam - test with real addresses
⚠️ **Database Migrations**: Always test migrations in staging before production

### Future Improvements

📋 **Planned Enhancements:**
- [ ] Payment integration (M-Pesa, Stripe)
- [ ] Video chat/screen sharing for support
- [ ] AR features for damage assessment
- [ ] Machine learning for service recommendations
- [ ] Blockchain for service guarantees
- [ ] Advanced analytics dashboard
- [ ] Technician scheduling system
- [ ] Automated dispute resolution

---

## 🤝 Contributing Guidelines

We welcome contributions! Here's how to contribute:

### Before Starting
1. Check GitHub Issues for existing work
2. Discuss major changes in Issues first
3. Fork the repository

### Making Changes
1. Create feature branch: `git checkout -b feature/your-feature`
2. Write clear, commented code
3. Add tests for new functionality
4. Update documentation if needed
5. Test locally: `npm run test && npm run build`

### Submitting Changes
1. Commit with conventional messages
2. Push to your fork
3. Create Pull Request with description
4. Respond to code review feedback
5. Squash commits before merge

### Code Quality Standards
- TypeScript strict mode (no `any`)
- 70%+ test coverage for new code
- ESLint passing (configured in project)
- No console.log in production code
- Comments for complex logic
- Accessibility considerations (WCAG 2.1)

---



### Roadside Emergency System
- **Server-Side Processing**: All filtering, sorting, distance calculation, and ETA computation in PostgreSQL
- **Geospatial Queries**: Haversine formula for accurate distance calculation
- **Smart Matching**: Automatic technician filtering based on vehicle mobility status
  - "Can move" → Mechanical & Repair category
  - "Barely/Stuck" → Towing category
- **Pre-Calculated ETA**: Server computes arrival time (40 km/h average) before sending to client
- **Indexed Lookups**: Fast geospatial queries with indexed latitude/longitude columns
- **Atomic Transactions**: Single database write for all emergency booking data
- **Highway Detection**: Automatic safety alerts for users on major roads
- **Pre-Filled Messages**: Server-assembled WhatsApp messages with all emergency details

### Performance Optimization
- **Sub-1-Second Loads**: Menu pages load in under 1 second with session caching
- **Session Storage**: Profile data cached after login for instant subsequent loads
- **Skeleton Screens**: Instant perceived performance with placeholder UI
- **Optimized Thumbnails**: 100x100px Cloudinary images under 10KB
- **Single-Query Strategy**: All menu data fetched in one database call
- **Smart Caching**: 5-minute cache with background refresh for stale data
- **WebSocket Fallback**: Graceful degradation to polling on slow connections

### Advanced Search & Filtering
- **Service Variant Search**: Search for specific variants like "3M Tint" or "Ceramic Tint"
- **Category Fallback**: If exact matches < 4, show related services from same category
- **Location-Based**: Find technicians in specific areas with fallback to nearby areas
- **Smart Filtering**: Client-side filtering for exact service and variant matching

### Real-Time Features
- **WhatsApp Lead Tracking**: Automatic lead creation when WhatsApp button clicked
- **Live Notifications**: Real-time notifications for technicians and clients
- **Status Updates**: Real-time lead status updates (pending → job_done → review)
- **Rating Calculation**: Automatic rating updates via database triggers

### Admin Workflow
- **Review Moderation**: Three-state workflow (pending → approved/declined)
- **Technician Approval**: Three-state workflow (pending → live/suspended)
- **Lead Confirmation**: Admin must confirm job completion before review request
- **Content Management**: Rich text editor for blog articles with SEO enhancements

### PWA Features
- **Install Prompt**: Custom install banner for mobile devices
- **Offline Support**: Graceful offline handling with retry mechanism
- **Update Notifications**: User-friendly PWA update prompts
- **Orientation Lock**: Portrait mode lock in standalone mode
- **Shortcuts**: Quick actions in PWA manifest (Book, Find, Bookings, SOS)

### SEO Optimization
- **Dynamic Sitemap**: Cloudflare Worker generates sitemap from Supabase
- **Structured Data**: JSON-LD for articles, technicians, reviews
- **Meta Tags**: Dynamic meta tags with React Helmet Async
- **Internal Links**: Article cross-linking for SEO
- **AI Bot Friendly**: Allows GPTBot, Claude, Perplexity, Gemini crawling

### Image Optimization
- **Cloudinary CDN**: Global image delivery with automatic format selection
- **Responsive Images**: Multiple sizes for different viewports
- **Face Detection**: Automatic face-cropped avatars (g_face, c_thumb)
- **Lazy Loading**: Images loaded on-demand with intersection observer
- **WebP/AVIF**: Automatic format conversion for modern browsers

### Security Features
- **Row Level Security**: Database-level access control for all tables
- **CORS Handling**: Automatic CORS error detection and session refresh
- **CSP Headers**: Content Security Policy for XSS protection
- **Input Sanitization**: DOMPurify for user-generated content
- **Soft Deletes**: Bookings hidden from client view after 2 days

### Developer Experience
- **TypeScript**: Full type safety with strict mode
- **Hot Module Replacement**: Instant dev updates with Vite
- **Bundle Analysis**: Rollup visualizer for bundle size optimization
- **Property-Based Testing**: Fast-check for edge case discovery
- **Migration System**: 43 database migrations with version control

---

## 📝 Recent Updates

### May 2026
- ✅ **Roadside Emergency Feature**: Complete emergency booking system with server-side processing
  - Auto-detect location with GPS and reverse geocoding
  - Smart technician matching based on mobility status (mechanical vs towing)
  - Pre-calculated ETA using Haversine formula (40 km/h average)
  - Highway safety alerts for users on major roads
  - Emergency pricing guide and safety tips
  - Single atomic transaction for booking creation
  - Pre-filled WhatsApp messages with all emergency details
  - Dedicated emergency technician profile page with relevant services
  - SOS buttons in navigation for quick access
- ✅ **Menu Performance Optimization**: Sub-1-second load times
  - Session storage caching for profile data
  - Skeleton screens for instant perceived performance
  - Optimized Cloudinary thumbnails (100x100px, <10KB)
  - Single-query data fetching strategy
  - Graceful WebSocket fallback for slow connections
  - User Context provider for centralized state management
- ✅ **Database Enhancements**: Migration 043 adds emergency support
  - New columns: situation, transmission, fuel_type, mobility_status, eta_minutes, is_emergency
  - Tow truck number plate tracking for towing services
  - Service category classification (mechanical_repair, towing)
  - Indexed geospatial queries for fast location-based searches
  - `find_nearby_emergency_technicians()` PostgreSQL function

### January 2026
- ✅ Enhanced search to include service variants (e.g., "3M Tint", "Full Wrap")
- ✅ Added offline mode with user-friendly fallback UI
- ✅ Updated robots.txt to allow AI bot crawling (GPTBot, Claude, Perplexity, Gemini)
- ✅ Fixed TypeScript errors in HomePage and App.tsx
- ✅ Improved error boundary for offline detection and chunk loading errors
- ✅ Added automatic booking cleanup (2-day soft delete)
- ✅ Implemented review approval workflow with admin moderation
- ✅ Added business hours with "Available on Request" for Sundays
- ✅ Enhanced article management with FAQs, key takeaways, and definitions

### December 2025
- ✅ Migrated from PHP/MySQL to Supabase (PostgreSQL)
- ✅ Implemented PWA with service worker and offline support
- ✅ Added Cloudinary image optimization with responsive transforms
- ✅ Enhanced SEO with structured data and dynamic sitemap
- ✅ Added dark mode support with system preference detection
- ✅ Implemented Google OAuth for seamless sign-in
- ✅ Added service categories (Body & Exterior, Electricals, Mechanical, Interior)
- ✅ Implemented WhatsApp lead tracking
- ✅ Added TikTok video thumbnail fetching via Edge Function

### November 2025
- ✅ Initial React + TypeScript migration
- ✅ Set up Vite build system
- ✅ Implemented Tailwind CSS styling
- ✅ Created component library
- ✅ Set up Supabase authentication

---

## 🪝 Hooks & Utilities

### Custom Hooks

#### `useAuthQuery()`
Server-side query hook that handles authentication context:
- Automatically includes auth state in API queries
- Handles token refresh on authentication changes
- Returns loading/error states with type safety
- Used for: profile fetches, lead management, review operations

#### `useImageUpload()`
Image upload and compression utility:
- Browser-based image compression before upload
- Progress tracking for large files
- Cloudinary integration with error handling
- Retry logic for failed uploads
- Used for: profile photos, portfolio uploads, thumbnails

#### `useNotifications()`
Real-time notification management:
- Subscribes to Supabase realtime notifications
- Handles notification dismissal and archiving
- Updates notification badge count
- Supports multiple notification types (lead, review, booking)
- Used for: dashboard notifications, status updates

#### `useRealtimeNotifications()`
WebSocket fallback for real-time features:
- Automatic polling if WebSocket unavailable
- Configurable polling intervals for slow networks
- Graceful degradation on poor connections
- Used for: live lead status, rating updates

#### `useServiceManager()`
Service and variant management:
- CRUD operations for technician services
- Service variant management (pricing, negotiable status)
- Service category filtering
- Primary service designation
- Used for: technician profile editing, service administration

#### `useServiceWorker()`
Service worker registration and lifecycle:
- PWA update detection and notification
- Service worker skip waiting for updates
- Cache invalidation on new deployments
- Used for: PWA updates, offline support

#### `useIntersectionObserver()`
Lazy loading utility:
- Detect when elements enter viewport
- Trigger image/component loading on-demand
- Configurable thresholds and margins
- Used for: lazy image loading, infinite scroll

### Core Utilities

#### `src/lib/api.ts` (1044 lines)
Central API layer for all backend communication:

**Client Profile Management:**
- `updateMyClientProfile()` - Update client name/phone (with RLS bypass)
- `isClientOnboardingComplete()` - Check onboarding status
- `getMyClientProfile()` - Fetch authenticated client profile

**Public Data (Cached):**
- `getAllTechnicians()` - Get all live technicians with pagination
- `getTechnicianBySlug()` - Fetch individual technician with services/reviews
- `getApprovedReviews()` - Get published reviews with author info
- `searchTechnicians()` - Smart search with service variants and location filtering
- `getNearbyTechnicians()` - Location-based technician discovery with distance
- `getArticles()` - Published blog articles with pagination
- `getArticleBySlug()` - Individual article with SEO metadata

**Booking & Leads:**
- `createLead()` - Submit booking request (client → technician)
- `getMyLeads()` - Client view of their bookings
- `getTechnicianLeads()` - Technician view of incoming requests
- `updateLeadStatus()` - Update booking status (pending → contacted → job_done)
- `hideLead()` - Soft delete booking from client view (2-day auto-cleanup)
- `createEmergencyLead()` - Emergency booking with GPS details

**Technician Profile:**
- `getTechnicianProfile()` - Get technician dashboard data
- `updateTechnicianProfile()` - Update business info, services, hours
- `addTechnicianService()` - Add new service offering
- `updateServiceVariants()` - Add/edit service variants (pricing)
- `uploadTechnicianPhoto()` - Add portfolio photo via Cloudinary
- `addTechnicianVideo()` - Add TikTok/YouTube/Instagram video

**Reviews & Ratings:**
- `submitReview()` - Submit client review (pending admin approval)
- `getReviewsByTechnician()` - Get approved reviews for technician
- `getMyReviews()` - Get all reviews left by authenticated client

**Admin Functions:**
- `getAllLeads()` - View all platform bookings (admin only)
- `approveOrDeclineReview()` - Admin moderation workflow
- `updateTechnicianApprovalStatus()` - Approve/suspend technician (admin only)
- `createOrUpdateArticle()` - Create/edit blog posts with Quill editor (admin only)
- `deleteTechnicianPhoto()` - Remove portfolio photo (admin only)
- `approveOrDeclineLead()` - Confirm job completion for review requests (admin only)

**Verification System:**
- `getVerificationStatus()` - Get technician's verified badge progress
- `getTechnicianStats()` - Get job count, rating, profile completeness score

**Media:**
- `uploadPhotoToCloudinary()` - Upload image with optimization
- `getTikTokThumbnail()` - Fetch video thumbnail from Edge Function

#### `src/lib/auth.ts`
Authentication and session management:

**Google OAuth:**
- `signInWithGoogle()` - Initiate Google OAuth flow (web + native)
- Automatic redirect handling for native apps (Capacitor)
- Browser plugin integration for OAuth on Capacitor

**Email/Password Auth:**
- `signUpWithEmail()` - Register with email and password
- `signInWithEmail()` - Login with credentials
- `signOut()` - Logout and clear session

**Session Management:**
- `getCurrentUser()` - Get authenticated user (with CORS error retry)
- `getUserIdFromSession()` - Extract user ID from JWT token
- `getMyClientProfile()` - Get client profile data
- `refreshSessionIfNeeded()` - Manual session refresh (auto-triggered on CORS errors)
- CORS error detection and automatic session refresh

#### `src/lib/supabase.ts`
Supabase client configuration:
- Error handling for CORS issues
- Automatic session refresh on authentication errors
- TypeScript types for all tables
- Custom error detection for row-level security violations

#### `src/lib/verificationEngine.ts`
Verified badge evaluation system:

**Gate 1 - Hard Requirements:**
- Account status = 'live'
- 5+ completed jobs
- Rating ≥ 4.0 with 3+ reviews

**Gate 2 - Profile Completeness (60+ points needed):**
- Biography (10 points)
- Google Maps location (10 points)
- Portfolio photos (20 points)
- Business hours (10 points)
- Trusted brands list (10 points)
- Service guarantees (10 points)
- TikTok video link (bonus +5 points)

**Functions:**
- `evaluateVerificationProgress()` - Calculate current score and progress
- `getVerificationGaps()` - Identify missing requirements with actionable hints

#### `src/lib/location.ts`
Geolocation services:
- `getCurrentCoordinates()` - Get user's GPS location using Capacitor Geolocation
- `reverseGeocodeCoordinates()` - Convert lat/lng to address via Nominatim
- `geocodeAddress()` - Convert address to coordinates
- Highway detection for safety alerts in emergency system
- Privacy-preserving approximate location for searches

#### `src/lib/cloudinary.ts`
Image optimization helpers:
- `profileThumb()` - 120x120px face-cropped avatar (g_face, c_thumb)
- `cardCover()` - 600x380px card image (c_fill, gravity=auto)
- `fullImage()` - 1200x800px full-size image
- Automatic WebP/AVIF conversion for modern browsers
- Quality optimization (q_auto) for different viewport sizes

#### `src/lib/cloudinary-advanced.ts`
Advanced image transformations:
- Custom focal point specification
- Aspect ratio optimization for responsive designs
- Responsive image srcset generation
- Video thumbnail extraction from TikTok/YouTube URLs

#### `src/lib/connectionQuality.ts`
Network quality detection:
- Detects slow 3G, 4G, 5G connections
- Returns connection type and effective type
- Used to trigger alternative UI (slower pagination, smaller images)

#### `src/lib/pwaDetection.ts`
Progressive Web App detection:
- Detects if app is running as installed PWA
- Detects browser capabilities (offline, installation)
- Enables PWA-specific features (like app-like navigation)

#### `src/lib/backgroundSync.ts`
Background sync for offline-first features:
- Queue actions when offline
- Sync on reconnection
- Retry logic for failed syncs

#### `src/lib/memoryOptimization.ts`
Memory management for long-lived sessions:
- Unload heavy resources when not in use
- Clear caches periodically
- Prevents memory leaks in long-running sessions

#### `src/lib/pushNotifications.ts`
Push notification setup:
- FCM registration for Android
- Token refresh and management
- Deep link handling from notifications

#### `src/lib/nativeAuth.ts`
Native app authentication:
- Deep link listener for OAuth callbacks
- Email confirmation link handling
- Native to web session bridging

#### `src/lib/apiCache.ts`
API response caching:
- In-memory cache for frequently accessed data
- Configurable TTL per endpoint
- Manual cache invalidation
- Used for: technician lists, service data, articles

### Key Styling Files

#### `src/index.css`
Global Tailwind styles with custom utilities:
- Custom color palette (mekh theme)
- Responsive typography
- Dark mode variables
- Custom animations (fade-in, slide-in)
- Print styles for receipts/confirmations

---

## 🔧 Configuration Files

### `vite.config.ts`
Build configuration:
- React plugin for JSX
- Tailwind CSS integration via @tailwindcss/vite
- Rollup visualizer for bundle analysis
- PWA plugin configuration
- Environment variable filtering (VITE_ prefix only)
- Code splitting strategy:
  - Manual vendor chunks (react, supabase, router, leaflet)
  - Dynamic imports for routes and heavy components
  - Admin page separate chunk (lazy loaded)

### `vitest.config.ts`
Testing configuration:
- Node environment for API testing
- Global test functions (describe, it, expect)
- Property-based testing with fast-check

### `tsconfig.json`
TypeScript strict mode with:
- Path aliases: `@/` → `src/`
- Module resolution for absolute imports
- DOM types for browser APIs
- Lib: ES2020 + DOM

### `.env.example`
Template for required environment variables:
```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_CLOUDINARY_CLOUD_NAME=
VITE_CLOUDINARY_UPLOAD_PRESET=
VITE_NOMINATIM_URL=https://nominatim.openstreetmap.org
```

### `manifest.json`
PWA configuration:
- Standalone display mode (full-screen)
- Theme colors (matching design system)
- Icons for different device sizes
- App shortcuts for quick actions:
  - Book Service → Search page
  - Find Technician → Nearby page
  - My Bookings → Bookings page
  - SOS → Emergency page
- Start URL and scope

### `public/_headers` (Netlify)
Security headers:
- Content-Security-Policy (XSS protection)
- X-Frame-Options: DENY (clickjacking protection)
- X-Content-Type-Options: nosniff (MIME sniffing protection)
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: geolocation, camera restrictions

### `public/_redirects` (Netlify)
SPA routing configuration:
- All unknown routes → index.html (200 status)
- OAuth callback handling
- Preserves query parameters

### `robots.txt`
SEO crawler configuration:
- Allows all major crawlers (Googlebot, Bingbot, etc.)
- Explicitly allows AI bots (GPTBot, Claude, Perplexity, Gemini)
- Disallows admin routes and auth pages
- Sitemap reference to dynamic sitemap

### `public/sw.js`
Service worker configuration:
- Workbox precache manifest (auto-generated)
- Cache strategies per asset type:
  - Static assets: NetworkFirst (7-day cache)
  - API calls: NetworkOnly
  - Images: CacheFirst (30-day cache)
  - Fonts: CacheFirst (1-year cache)
- Background sync for offline actions
- Push notification handling

---

## 🛡️ Native App Setup (Android)

### Prerequisites
- Android Studio 2021.3+
- JDK 11+
- Capacitor CLI: `npm install -g @capacitor/cli`

### Building Native App

```bash
# Add Android platform
npx cap add android

# Build web assets
npm run build

# Copy web assets to Android
npx cap copy android

# Open Android Studio
npx cap open android
```

### Android Configuration

**capacitor.config.ts:**
```typescript
{
  appId: 'com.mekh.app',
  appName: 'Mekh',
  webDir: 'dist',
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    Geolocation: {},
    Camera: {},
  }
}
```

**Key Capacitor Plugins Used:**
- @capacitor/geolocation - GPS location services
- @capacitor/camera - Photo capture
- @capacitor/push-notifications - FCM integration
- @capacitor/app - Deep linking and lifecycle
- @capacitor/browser - In-app browser for OAuth

### Android Build Settings

**android/local.properties:**
```properties
sdk.dir=/path/to/Android/sdk
ndk.dir=/path/to/Android/ndk
```

**Build Command:**
```bash
# Development build
./gradlew assembleDebug

# Release build (requires keystore)
./gradlew assembleRelease
```

### Push Notifications Setup

1. Set up Firebase Cloud Messaging (FCM)
2. Add google-services.json to android/app/
3. Configure FCM credentials in Capacitor
4. Listen for notifications in app:

```typescript
import { PushNotifications } from '@capacitor/push-notifications';

PushNotifications.addListener('pushNotificationReceived', notification => {
  // Handle notification
});
```

---

## 📱 PWA Setup & Features

### Installation

**Mobile (iOS/Android):**
1. Open in Safari or Chrome
2. Tap Share → Add to Home Screen (iOS)
3. Tap Menu → Install app (Android)

**Desktop:**
1. Open in Chrome/Edge
2. Click install icon in address bar
3. Or use hamburger menu → Install

### Features

**Manifest Features (manifest.json):**
- Display: Standalone (full-screen, no browser UI)
- Orientation: Portrait (mobile optimization)
- Theme color: #10b981 (Mekh green)
- Icons: 192x192, 512x512 (with maskable versions)
- Shortcuts: Quick access to key pages (Book, Find, Bookings, SOS)

**Service Worker Features:**
- Offline mode with custom fallback UI
- Background sync for queued actions
- Push notifications via FCM
- Cache management with cache-busting

**Update Flow:**
1. SW detects new version in background
2. Shows non-intrusive update prompt
3. User can click "Update & Reload"
4. Clear cache and reload new version

### Development Mode

```bash
# Enable PWA features in dev
npm run dev

# Test PWA locally (requires HTTPS)
npm run build
npm run preview

# Test on device (use ngrok for HTTPS tunnel)
```

---

## 🗄️ Database Schema Overview

### Core Tables

#### `auth.users` (Supabase)
- id (UUID, primary key)
- email (string)
- encrypted_password (if email auth)
- email_confirmed_at (timestamp)
- raw_user_meta_data (JSON - role: 'client'|'technician'|'admin')
- created_at (timestamp)

#### `technicians`
- id (UUID, PK, references auth.users)
- profile_status ('pending'|'live'|'suspended')
- business_name (string)
- bio (text)
- county (string, optional)
- latitude (numeric)
- longitude (numeric)
- google_maps_url (URL, optional)
- profile_photo_url (Cloudinary URL)
- cover_photo_url (Cloudinary URL)
- mobile_service (boolean)
- fixed_location (boolean)
- tow_truck_plate (string, optional - for towing services)
- trusted_brands (text - comma-separated)
- service_guarantee (text)
- completed_jobs (integer - auto-updated via trigger)
- rating (numeric - auto-calculated from reviews)
- review_count (integer - auto-updated)
- verified (boolean - auto-updated based on verification gates)
- created_at (timestamp)
- updated_at (timestamp)

#### `technician_services`
- id (UUID, PK)
- technician_id (UUID, FK to technicians)
- service_name (string)
- category ('body_exterior'|'electricals'|'mechanical_repair'|'interior'|'towing')
- price (numeric, nullable - can be negotiable)
- negotiable (boolean)
- notes (text, optional)
- is_primary (boolean - shows on profile banner)
- created_at (timestamp)

#### `service_variants`
- id (UUID, PK)
- service_id (UUID, FK to technician_services)
- variant_name (string - e.g., "3M Tint", "Ceramic Tint")
- price (numeric, nullable)
- is_negotiable (boolean)

#### `technician_photos`
- id (UUID, PK)
- technician_id (UUID, FK)
- photo_url (Cloudinary URL)
- service (string - category of work shown)
- caption (text)
- alt_text (string - for accessibility)
- sort_order (integer - for ordering in gallery)
- created_at (timestamp)

#### `technician_videos`
- id (UUID, PK)
- technician_id (UUID, FK)
- platform ('tiktok'|'youtube'|'instagram')
- video_url (string - full URL)
- video_id (string - for thumbnail extraction)
- thumbnail_url (Cloudinary URL)
- service (string)
- alt_text (string)
- sort_order (integer)
- created_at (timestamp)

#### `business_hours`
- id (UUID, PK)
- technician_id (UUID, FK)
- day_of_week (0-6, Sunday=0)
- opens_at (time)
- closes_at (time)
- available_on_request (boolean - for Sunday flexibility)
- created_at (timestamp)

#### `clients`
- id (UUID, PK, references auth.users)
- name (string)
- phone (string)
- email (string)
- county (string, optional)
- latitude (numeric, optional - last known location)
- longitude (numeric, optional)
- created_at (timestamp)
- updated_at (timestamp)

#### `leads`
- id (UUID, PK)
- client_id (UUID, FK to clients)
- technician_id (UUID, FK to technicians)
- description (text)
- status ('pending'|'contacted'|'job_done'|'no_response')
- client_email (string - captured at booking)
- whatsapp_sent (boolean - tracks if lead came from WhatsApp button)
- is_archived (boolean - soft delete after 2 days)
- is_emergency (boolean)
- situation (string - e.g., "Won't start", "Tyre puncture")
- transmission (string - 'manual'|'automatic')
- fuel_type (string - 'petrol'|'diesel'|'hybrid'|'electric')
- mobility_status (string - 'can_move'|'barely_stuck'|'completely_stuck')
- eta_minutes (integer - pre-calculated from distance)
- created_at (timestamp)
- updated_at (timestamp)

#### `reviews`
- id (UUID, PK)
- technician_id (UUID, FK)
- client_id (UUID, FK)
- lead_id (UUID, FK - which booking this review is for)
- rating (1-5)
- comment (text)
- status ('pending'|'approved'|'declined')
- admin_notes (text - reason for approval/decline)
- visible (boolean - published for public view)
- created_at (timestamp)
- updated_at (timestamp)

#### `articles`
- id (UUID, PK)
- title (string)
- slug (string - unique, for URL)
- content (HTML from Quill editor)
- excerpt (text - for preview)
- author_name (string)
- author_bio (text)
- featured_image_url (Cloudinary URL)
- internal_links (text[] - for SEO cross-linking)
- faqs (JSONB - FAQ structure)
- key_takeaways (text[] - bullet points)
- definitions (JSONB - term definitions)
- published (boolean)
- view_count (integer)
- created_at (timestamp)
- updated_at (timestamp)

#### `notifications`
- id (UUID, PK)
- recipient_id (UUID, FK to auth.users)
- type ('lead'|'review'|'booking'|'system')
- title (string)
- message (text)
- related_id (UUID - FK to leads/reviews/etc.)
- read (boolean)
- created_at (timestamp)

#### `push_notifications`
- id (UUID, PK)
- user_id (UUID, FK)
- token (string - FCM token)
- platform ('android'|'ios'|'web')
- created_at (timestamp)
- updated_at (timestamp)

#### `app_versions`
- id (UUID, PK)
- version (string - semantic versioning)
- platform ('web'|'android'|'ios')
- release_notes (text)
- minimum_required (boolean)
- created_at (timestamp)

### Key Functions

#### PostgreSQL Functions
- `upsert_client_profile()` - Create/update client (called from API to avoid RLS issues)
- `find_nearby_emergency_technicians()` - Find technicians by location + category + distance
- `cleanup_old_bookings()` - Auto-hide bookings after 2 days (cron job)
- `get_technician_stats()` - Calculate technician stats (jobs, rating, profile score)

### Key Triggers
- `update_rating_on_review_change` - Recalculate technician rating when review added/updated
- `update_job_count_on_lead_status` - Increment completed_jobs when lead marked job_done
- `auto_create_client_profile` - Create client profile when user signs up (via trigger)

### Key Indexes
- `idx_technicians_location` (latitude, longitude) - Geospatial queries
- `idx_technician_services_category` (category) - Fast category filtering
- `idx_leads_technician_id` - Technician lead lookups
- `idx_leads_client_id` - Client booking lookups
- `idx_reviews_technician_id` - Technician review lookups
- `idx_articles_slug` (UNIQUE) - Article URL lookups

---

## 🔄 API Rate Limiting & Caching Strategy

### Cache Layers

**Browser Cache (Service Worker):**
- Static assets: 7 days
- Images: 30 days
- Fonts: 1 year
- HTML: No cache (always fresh)

**API Cache (apiCache.ts):**
- Technician list: 5 minutes
- Single technician: 10 minutes
- Articles: 1 hour
- Services: 5 minutes
- Reviews: 10 minutes
- User profile: 2 minutes

**Cache Keys:**
```typescript
// In apiCache.ts
ALL_TECHNICIANS
TECHNICIAN_BY_SLUG(slug)
ALL_ARTICLES
ARTICLE_BY_SLUG(slug)
MY_PROFILE
VERIFICATION_STATUS
```

### Background Refresh
- Stale data can be used while fetching fresh data
- Non-blocking refresh in background
- Toast notification if stale data is older than 1 hour

---

## 📊 Admin Dashboard Features

### Technician Management
- **List View**: All technicians with status (pending/live/suspended)
- **Approval Workflow**: Review profiles and approve/suspend
- **Verification Monitoring**: Track which technicians are close to verified badge
- **Bulk Actions**: Change status, send notifications

### Lead Management
- **Leads View**: All booking requests across platform
- **Status Tracking**: See which leads are pending, contacted, completed
- **Job Completion**: Admin must confirm job before review request sent
- **Analytics**: Conversion rates, response times, top technicians

### Review Moderation
- **Pending Reviews**: Queue of reviews awaiting approval
- **Approve/Decline**: Accept with notes or decline with reason
- **Published Reviews**: View live reviews on platform
- **Report Handling**: Flag inappropriate reviews

### Article Management
- **WYSIWYG Editor**: Quill rich text editor with formatting
- **SEO Optimization**: Meta descriptions, internal links
- **FAQs Section**: Structure FAQ pairs with auto-formatting
- **Key Takeaways**: Bullet points for quick reference
- **Author Info**: Author bio section for credibility
- **Image Management**: Upload featured images to Cloudinary
- **Publish Control**: Draft/publish workflow with timestamps

### Content Moderation
- **User-Generated Content**: Review photos, videos, descriptions
- **Reporting Tools**: Flag inappropriate content
- **Automatic Filters**: Detect spam, profanity

---

## 🚀 Advanced Deployment Topics

### CI/CD Setup Recommendations

**GitHub Actions Example:**
```yaml
name: Deploy to Netlify
on:
  push:
    branches: [master]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test
      - run: npm run build
      - uses: nwtgck/actions-netlify@v2
        with:
          publish-dir: './dist'
```

### Database Backups
- **Supabase**: Automatic daily backups (included in paid plans)
- **Manual Backups**: Use Supabase dashboard to export
- **Backup Frequency**: Weekly backup to S3 recommended for production

### Monitoring & Logging
- **Error Tracking**: Sentry for exception monitoring
- **Analytics**: Google Analytics for user behavior
- **Performance**: Lighthouse CI for automated testing
- **Uptime**: StatusPage.io for incident communication

### Scaling Considerations
- **Database**: Supabase handles auto-scaling
- **Images**: Cloudinary CDN auto-scales
- **Functions**: Edge Functions scale automatically
- **Frontend**: Netlify/Vercel auto-scales static hosting

---

## 📞 Support & Contact

- **Website**: [https://mekh.app](https://mekh.app)
- **Location**: Nairobi, Kenya
- **Email**: Available on website contact page
- **WhatsApp**: Contact via platform

---

## 📜 License

**Proprietary** - All rights reserved © 2026 Mekh

This software and associated documentation files are proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.

---

## 🙏 Acknowledgments

- **Supabase** - Backend infrastructure and authentication
- **Cloudinary** - Image optimization and CDN
- **Tailwind CSS** - Utility-first CSS framework
- **React Team** - Frontend framework
- **Vite Team** - Build tooling and dev server
- **Vitest Team** - Testing framework
- **OpenStreetMap** - Geocoding services via Nominatim
- **Fast-check** - Property-based testing library

---

## 🗺️ Roadmap

### Q1 2026
- [x] **Roadside Emergency System** - Complete emergency booking with GPS and server-side matching
- [x] **Menu Performance Optimization** - Sub-1-second load times with session caching
- [ ] Mobile app (React Native)
- [ ] Push notifications for leads and reviews
- [ ] In-app messaging between clients and technicians
- [ ] Payment integration (M-Pesa, card payments)
- [ ] Advanced analytics dashboard for technicians

### Q2 2026
- [ ] Multi-language support (Swahili, English)
- [ ] Video consultations
- [ ] Service packages and bundles
- [ ] Loyalty program for repeat clients
- [ ] Technician certification badges

### Q3 2026
- [ ] Franchise management system
- [ ] API for third-party integrations
- [ ] Mobile app for technicians
- [ ] Advanced search filters (price range, availability)
- [ ] Service booking calendar

### Future
- [ ] AI-powered service recommendations
- [ ] Augmented reality for car visualization
- [ ] Blockchain-based review verification
- [ ] Integration with car dealerships
- [ ] Expansion to other East African countries

---

<div align="center">

**Built with ❤️ in Nairobi, Kenya**

*Connecting car owners with professional automotive technicians*

[Website](https://mekh.app) • [Blog](https://mekh.app/blogs) • [Contact](https://mekh.app/contact)

</div>
