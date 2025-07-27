# Body Butler - Personal Fitness and Nutrition App

## Overview

Body Butler is a full-stack web application that provides personalized fitness and nutrition guidance. The application features a comprehensive onboarding process to gather user information and preferences, followed by a personalized dashboard experience. Built with modern web technologies including React, Express, and Drizzle ORM with PostgreSQL.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: Radix UI primitives with shadcn/ui components
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL storage

### Database Design
- **Primary Database**: PostgreSQL via Supabase
- **Connection**: Standard pg driver with SSL support
- **Schema Management**: Drizzle Kit for migrations and schema management

## Key Components

### Authentication System
- **Provider**: Replit Auth with OIDC integration
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **Security**: HTTP-only cookies, secure session management
- **User Management**: Automatic user creation and profile management

### Database Schema
- **Users Table**: Core user identity and profile information
- **User Profiles Table**: Detailed onboarding data including fitness goals, dietary preferences, equipment access, and coaching style preferences
- **Sessions Table**: Secure session storage for authentication

### Onboarding Flow
- **Multi-step Process**: 6-section comprehensive onboarding
- **Data Collection**: Personal information, activity levels, equipment access, dietary preferences, goals, availability, and coaching style
- **Progress Tracking**: Visual progress indicator with step navigation
- **Data Persistence**: Real-time saving and updating of user profiles

### UI/UX Design
- **Design System**: shadcn/ui with Radix UI primitives
- **Responsive Design**: Mobile-first approach with responsive breakpoints
- **Theme System**: CSS variables for consistent theming
- **Accessibility**: Built-in accessibility features via Radix UI

## Data Flow

1. **Authentication Flow**: User authentication via Replit Auth → Session creation → User profile lookup/creation
2. **Onboarding Flow**: Welcome page → Multi-step form → Profile creation/update → Home dashboard
3. **Data Persistence**: Form submissions → API validation → Database storage via Drizzle ORM
4. **State Management**: Server state via React Query → Optimistic updates → Background synchronization

## External Dependencies

### Core Dependencies
- **pg**: PostgreSQL client for Supabase connection
- **@tanstack/react-query**: Server state management
- **drizzle-orm**: Type-safe database operations
- **express**: Web server framework
- **passport**: Authentication middleware

### UI Dependencies
- **@radix-ui/***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **wouter**: Lightweight React router
- **react-hook-form**: Form state management

### Development Dependencies
- **vite**: Build tool and dev server
- **typescript**: Static type checking
- **tsx**: TypeScript execution for development

## Deployment Strategy

### Development Environment
- **Dev Server**: Vite development server with HMR
- **Backend**: tsx for TypeScript execution
- **Database**: Supabase PostgreSQL with development connection string

### Production Build
- **Frontend**: Vite production build to `dist/public`
- **Backend**: ESBuild bundling to `dist/index.js`
- **Static Assets**: Served via Express static middleware
- **Database**: Supabase PostgreSQL with production connection string

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string
- **SESSION_SECRET**: Session encryption key
- **REPL_ID**: Replit environment identifier
- **NODE_ENV**: Environment mode (development/production)

## Changelog

```
Changelog:
- July 08, 2025. Initial setup with comprehensive onboarding flow and authentication
- July 08, 2025. Updated kettlebell logo to match brand design with transparent background
- July 08, 2025. Created dedicated login page with multiple authentication options (Email, Phone, Google, Apple)
- July 08, 2025. Updated navigation flow: Get Started → Onboarding, Log In → Login Options
- July 08, 2025. Enhanced voice parsing with zero-friction requirements: smart 3-digit height parsing (511=5'11"), improved name/gender parsing with exclusion lists, natural date parsing, and context-aware weight detection
- July 08, 2025. Updated sleep scale to sliding 5-option scale: less than 5, 6, 7, 8, more than 8 hours
- July 08, 2025. Changed equipment access to text input with voice support and helpful examples (full gym access, home gym with only dumbbells, no weights, resistance bands, etc.)
- July 08, 2025. Removed mic input and example box from basics page per user request
- July 08, 2025. Removed subtext "Please fill out your basic information" from basics page
- July 08, 2025. Updated screen 6/6: Changed "How do you like to be coached?" to "Anything else you'd like to add?"
- July 08, 2025. Updated screen 5/6: Changed subtext to "Help us customize your plan"
- July 08, 2025. Updated screen 2/6: Fixed microphone button styling to match other forms (added variant="ghost")
- July 08, 2025. Reordered screen 6/6: Moved "Anything else you'd like to add?" section below the coaching personality questionnaire
- July 08, 2025. Migrated from Neon to Supabase PostgreSQL for enhanced features (real-time, storage, edge functions)
- July 13, 2025. Restructured database schema: consolidated all onboarding fields into single JSON object (onboarding_data column) for better flexibility and easier data management
- July 13, 2025. Updated onboarding flow: users complete 6-step onboarding first, then create account, then data is saved and sent to ChatGPT for personalized plan generation
- July 13, 2025. Implemented ChatGPT integration: OpenAI API key configured and personalized plan generation service created using GPT-4 model
- July 13, 2025. Updated ChatGPT integration with master prompt: now generates structured JSON responses with workoutPlan, macroTargets, and mealPlan sections
- July 13, 2025. Added personalized plan storage: ChatGPT-generated plans are now saved to Supabase user_profiles table in personalizedPlan column with API endpoint for retrieval
- July 13, 2025. Created comprehensive dashboard system with workout logging, meal tracking, and rolling macro count functionality
- July 13, 2025. Fixed critical onboarding completion flow: resolved data structure mismatches, authentication logic, and ChatGPT integration - complete end-to-end flow now working
- July 17, 2025. Enhanced navigation behavior: navigation tabs now properly close modals/popups and navigate to respective pages regardless of current state
- July 17, 2025. Created global modal management system: added modal context for proper registration and cleanup of popups during navigation
- July 17, 2025. Implemented comprehensive iOS Human Interface Guidelines (HIG) compliance: added iOS Dynamic Type system with proper text styles (Title 1, Title 2, Body, Caption, etc.), iOS semantic colors alongside existing custom scheme, iOS-standard spacing utilities (16pt margins, 8pt spacing, 44pt touch targets)
- July 17, 2025. Created complete iOS-compliant component library: IOSNavHeader for navigation headers, IOSButton for iOS-style buttons, IOSList/IOSListItem for grouped lists, IOSSwitch for toggles, all following iOS design patterns and accessibility standards
- July 17, 2025. Updated all main pages (Dashboard, Progress, Settings, AI Chat) to use new iOS components and styling patterns: proper spacing, typography, navigation, and interaction patterns for native iOS experience
- July 17, 2025. Enhanced workout card with dynamic workout type display: added visual indicator arrow for clickable workout types, navigation header now stretches full width to top, BB AI icon changed to MessageCircle for better consistency
- July 23, 2025. Removed neon/glow effects from all progress bars and trackers: eliminated glowing box-shadows from circular calorie tracker, macro progress bars, and gradient buttons while preserving clean animations and glassmorphism card shadows
- July 24, 2025. Implemented centered plus icon navigation with elevated design: reorganized tab order to Home | Progress | Add Food | BB AI | Settings, created smart meal-based add food page with time detection, unified theme consistency between dashboard and add food pages with matching gradient backgrounds and calm-card styling
- July 24, 2025. Applied comprehensive UI design guidelines: reduced macro progress bar saturation for professional polish, implemented horizontal alignment grid system (form-grid, form-field, form-row CSS classes), added descriptive options with helpful context text and better placeholders, implemented icon consistency with meaningful icons for each form section, improved content organization with clear section breaks and visual hierarchy, enhanced menu representation with icon + label combinations for better user comprehension
- July 24, 2025. Established consistent card styling across entire app: changed onboarding screens from ios-card to calm-card styling, maintained form-grid guidance system for onboarding while keeping dashboard's clean data-focused design for all other pages, fixed progress page icon inconsistency by replacing emoji achievements with proper Lucide React icons (Trophy, Target, Zap, TrendingDown, Star, Flame) for complete visual consistency
- July 24, 2025. Standardized all icon colors and styles across entire application: unified all icons to use consistent `text-white/80` color and `w-5 h-5` sizing throughout onboarding screens, dashboard, progress page, settings page, AI chat, and add food page, eliminating previous inconsistencies (ios-blue, ios-yellow, ios-green, text-yellow-400, text-blue-400, etc.) for complete visual harmony and professional polish
- July 24, 2025. Implemented complete workout tracking system: updated workout card CTA from "Start" to "Let's go!" with enabled blue button styling, created new workout page with dashboard UI consistency, dynamic exercise population from master prompt data, form-grid layout for set/rep/weight tracking, suggested targets highlighting, and comprehensive progress monitoring with completion status
- July 24, 2025. Applied premium dark gradient background globally across entire application: updated login page from pure black to UX-compliant dark gray gradient (18% to 3% lightness), extended consistent background to dashboard, onboarding, AI chat, progress, settings, add food, and workout pages, removed redundant gradient overlays, unified visual experience following 160-degree slanted gradient for sophisticated premium aesthetic
- July 26, 2025. Completed implementation of comprehensive receipt OCR and food logging system with OpenAI Vision integration: created complete database schema with new tables (foodItems, userFoodLogs, mealSummaries), built full frontend receipt scanning workflow including photo upload, item confirmation, quantity adjustment, and nutrition logging, integrated USDA FDC API service with fuzzy matching for nutritional data extraction and health scoring algorithm
- July 26, 2025. Enhanced UI layout and navigation consistency: moved "Today's Progress" above meal selection tabs in add food page, ensured bottom navigation included on all pages including scan receipt page, fixed missing useEffect import causing receipt scanning crashes
- July 27, 2025. Successfully migrated from USDA API to FatSecret API integration: implemented complete OAuth authentication, updated all receipt processing endpoints, created enhanced mock data system for development (while IP whitelist propagates), maintained full backward compatibility with existing food logs, added realistic nutrition data generation based on food item context
- July 27, 2025. Implemented comprehensive dual-storage nutrition database system: receipt parsing data now saves to both individual user food logs (personal tracking) and anonymized global nutrition database (cross-user analytics and insights), enabling powerful nutrition trend analysis while preserving user privacy
- July 27, 2025. Enhanced global nutrition database with rich demographic insights: captures anonymized age ranges, gender, fitness goals, activity levels, meal types, temporal patterns (weekday/weekend), and establishment analytics while maintaining complete user privacy for comprehensive nutrition trend analysis
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
Focus areas for improvement: UI polish and master prompt refinement for better user engagement ("stickiness").
Navigation behavior: Navigation bar tabs should always navigate to respective pages, even when pop-ups or modals are open.
```