# Body Butler - Personal Fitness and Nutrition App

## Overview
Body Butler is a full-stack web application designed to provide personalized fitness and nutrition guidance. It features a comprehensive onboarding process to gather user information and preferences, leading to a tailored dashboard experience. The project aims to enhance user engagement and provide intelligent, AI-powered insights for health and wellness.

## User Preferences
Preferred communication style: Simple, everyday language.
Focus areas for improvement: UI polish and master prompt refinement for better user engagement ("stickiness").
Navigation behavior: Navigation bar tabs should always navigate to respective pages, even when pop-ups or modals are open.
Peak Score Implementation: Single circular tracker with three weighted segments (Trail Fuel, Climb, Base Camp) that dynamically adjust based on user goals. Goal-specific weightings (e.g., Cut: 50/30/20, Lean Bulk: 35/45/20) with current/max point display format (e.g., "32/50") for clearer user understanding. Uses authentic data integration with exact formulas for all levers. Trek badge (hiking boot icon) appears only when users achieve 70+ daily points and maintains streak, following same logic as consistency bonus system.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter
- **State Management**: TanStack Query
- **UI Components**: Radix UI primitives with shadcn/ui
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite
- **UI/UX Decisions**: Mobile-first responsive design, consistent card styling (calm-card), premium dark gradient background, iOS Human Interface Guidelines (HIG) compliance for components and typography, standardized icon colors and sizes, horizontal alignment grid system.

### Backend
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM
- **Authentication**: Replit Auth with OpenID Connect, PostgreSQL-backed session management.

### Database
- **Primary Database**: PostgreSQL via Supabase
- **Schema Management**: Drizzle Kit
- **Schema Design**: `users` table for identity, `user_profiles` for detailed onboarding data (including a consolidated `onboarding_data` JSON object), and `sessions` for authentication. Includes tables for `foodItems`, `userFoodLogs`, and `mealSummaries` for nutrition tracking.

### Core Features
- **Comprehensive Onboarding**: Multi-step process (6 sections) collecting personal, activity, equipment, dietary, goal, availability, and coaching style information. Data is consolidated into a single JSON object for flexibility.
- **Personalized Plan Generation**: Integrates with OpenAI API (GPT-4) to generate structured JSON responses for `workoutPlan`, `macroTargets`, and `mealPlan` based on user data.
- **Peak Score System**: Advanced circular tracker with three weighted levers (Trail Fuel, Climb, Base Camp) using goal-specific weightings and exact mathematical formulas. All sublever algorithms implemented with confidence mechanisms: Trail Fuel (calorie window, protein, fiber/veg, hydration + anti-cheat penalty), Climb (goal-aware completion 40pts, dynamic intensity bonus 10pts with base credit, progression 40pts with modality-specific rules, warmup 10pts + rest day override + sublever completeness confidence), Base Camp (wearable-agnostic sleep 60pts + personalized NEAT steps 40pts with goal/size/activity adjustments), and consistency bonus system.
- **Dashboard System**: Comprehensive dashboard with workout logging, meal tracking, and rolling macro count functionality.
- **Workout Tracking**: Dynamic exercise population, set/rep/weight tracking with suggested targets, and progress monitoring.
- **Receipt OCR & Food Logging**: Utilizes OpenAI Vision for photo-first food analysis, contextual health scoring, and nutrition logging. Integrates with USDA FoodData Central and other sources for nutritional data.
- **Global Nutrition Database**: Anonymized demographic and food consumption insights for trend analysis.

## External Dependencies

- **Database**: PostgreSQL (Supabase)
- **Authentication**: Replit Auth (OpenID Connect)
- **AI/ML**: OpenAI API (GPT-4, Vision)
- **Core Libraries**: `pg`, `@tanstack/react-query`, `drizzle-orm`, `express`, `passport`
- **UI Libraries**: `@radix-ui/*`, `tailwindcss`, `wouter`, `react-hook-form`
- **Nutrition Data**: USDA FoodData Central, restaurant nutrition guides, grocery product APIs (custom integration)