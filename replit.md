# Body Butler - Personal Fitness and Nutrition App

## Overview
Body Butler is a full-stack web application designed to provide personalized fitness and nutrition guidance. It features a comprehensive onboarding process to gather user information and preferences, leading to a personalized dashboard experience. The project aims to enhance user engagement ("stickiness") through a polished UI and refined AI interactions. Key capabilities include personalized plan generation via AI, workout tracking, meal logging, and receipt OCR for food analysis.



## User Preferences
Preferred communication style: Simple, everyday language.
Focus areas for improvement: UI polish and master prompt refinement for better user engagement ("stickiness").
Navigation behavior: Navigation bar tabs should always navigate to respective pages, even when pop-ups or modals are open.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter
- **State Management**: TanStack Query (React Query)
- **UI Components**: Radix UI primitives with shadcn/ui components, adapted for iOS Human Interface Guidelines (HIG) compliance (e.g., iOS Dynamic Type, semantic colors, spacing utilities, custom iOS-compliant components).
- **Styling**: Tailwind CSS with CSS variables for theming, premium dark gradient background applied globally.
- **Build Tool**: Vite

### Backend
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL storage

### Database Design
- **Primary Database**: PostgreSQL via Supabase
- **Schema Management**: Drizzle Kit
- **Core Tables**: Users, User Profiles (including a consolidated `onboarding_data` JSON object), Sessions, Food Items, User Food Logs, Meal Summaries.
- **Nutrition Database**: Proprietary database built from USDA FoodData Central, restaurant nutrition guides, and grocery product APIs for comprehensive and flexible nutrition data.

### Key Features & Design Decisions
- **Authentication**: Replit Auth, PostgreSQL-backed sessions, HTTP-only cookies.
- **Onboarding Flow**: Multi-step (6 sections) comprehensive process, saving data to `onboarding_data` in user profiles.
- **UI/UX Design**: Mobile-first, responsive, accessible design system. Consistent card styling (calm-card), horizontal alignment grid system, standardized icon colors and sizing.
- **AI Integration**: OpenAI API (GPT-4) for personalized plan generation (workout, macro targets, meal plans in structured JSON). OpenAI Vision for receipt OCR and instant food nutrition analysis with contextual health scoring.
- **Workout Tracking**: Dynamic exercise population, set/rep/weight tracking, progress monitoring.
- **Food Logging**: Manual meal tracking, smart meal-based add food page with time detection, comprehensive receipt OCR and food logging system.
- **Global Modal Management System**: Context-based system for proper registration and cleanup of popups.

## External Dependencies

- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Replit Auth (OpenID Connect)
- **AI/ML**: OpenAI API (GPT-4, Vision)
- **Frontend Libraries**: `@tanstack/react-query`, `wouter`, `@radix-ui/*`, `tailwindcss`, `react-hook-form`
- **Backend Libraries**: `express`, `drizzle-orm`, `pg`, `passport`
- **Development Tools**: `vite`, `typescript`, `tsx`