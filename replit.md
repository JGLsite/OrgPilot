# Jewish Gymnastics League (JGL) Management Platform

## Overview

This is a comprehensive web platform for the Jewish Gymnastics League, an inter-gymnastics league connecting independently operated gymnastics centers across 8+ cities. The platform provides membership management, event registration, gamification features, and role-based dashboards for administrators, gym owners, coaches, and gymnasts. The system facilitates competition management while maintaining Jewish values and athletic excellence standards.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Styling**: TailwindCSS with shadcn/ui component library for consistent design
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for client-side routing
- **Theme**: Custom JGL brand colors (magenta/pink and teal) with dark mode support

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript throughout the stack
- **Authentication**: Replit Auth integration with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL storage
- **API Design**: RESTful API with role-based access control

### Database Architecture
- **Database**: PostgreSQL with Neon serverless hosting
- **ORM**: Drizzle ORM for type-safe database queries
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Key Entities**:
  - Users with role-based permissions (admin, gym_admin, coach, gymnast, spectator)
  - Gyms with approval workflow and payment tracking
  - Gymnasts with coach approval requirements
  - Events with sessions and registration management
  - Gamification system with challenges and rewards
  - Score tracking and leaderboards

### Authentication & Authorization
- **Provider**: Replit Auth with OIDC
- **Session Storage**: PostgreSQL-backed sessions with configurable TTL
- **Role-Based Access**: Five distinct user roles with different permissions
- **Security**: HTTP-only cookies, CSRF protection, secure session management

### Payment Processing
- **Provider**: Stripe integration for membership fees and event payments
- **Features**: Subscription management, one-time payments, customer portal access
- **Security**: PCI-compliant payment handling with Stripe Elements

### File Storage
- **Provider**: Google Cloud Storage for file uploads
- **Use Cases**: Gym logos, event images, gymnast photos, documents
- **Integration**: Uppy.js for enhanced file upload experience

### Gamification System
- **Challenges**: Skill-based challenges with point rewards
- **Leaderboards**: Multi-level competition tracking (individual, team, league)
- **Rewards**: Point-based redemption system for prizes and gymnastics gear
- **Progress Tracking**: Real-time updates on challenge completions and rankings

## External Dependencies

### Core Services
- **Neon Database**: Serverless PostgreSQL hosting for primary data storage
- **Replit Auth**: Authentication and user management service
- **Stripe**: Payment processing for memberships and event fees
- **Google Cloud Storage**: File storage and content delivery

### Frontend Libraries
- **shadcn/ui**: Pre-built component library based on Radix UI primitives
- **TailwindCSS**: Utility-first CSS framework for styling
- **TanStack Query**: Server state synchronization and caching
- **React Hook Form**: Form validation and management
- **Zod**: Schema validation for type safety

### Development Tools
- **Vite**: Fast build tool and development server
- **TypeScript**: Static type checking across the entire stack
- **ESBuild**: Fast JavaScript bundler for production builds
- **Drizzle Kit**: Database schema management and migrations

### Third-Party Integrations
- **Uppy**: File upload handling with progress tracking
- **Font Awesome**: Icon library for UI elements
- **Wouter**: Lightweight routing solution for React
- **Memoizee**: Function memoization for performance optimization