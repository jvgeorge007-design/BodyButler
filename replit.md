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
- **Primary Database**: PostgreSQL via Neon serverless
- **Connection**: @neondatabase/serverless with connection pooling
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
- **@neondatabase/serverless**: PostgreSQL serverless connection
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
- **Database**: Neon PostgreSQL with development connection string

### Production Build
- **Frontend**: Vite production build to `dist/public`
- **Backend**: ESBuild bundling to `dist/index.js`
- **Static Assets**: Served via Express static middleware
- **Database**: Neon PostgreSQL with production connection string

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
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```